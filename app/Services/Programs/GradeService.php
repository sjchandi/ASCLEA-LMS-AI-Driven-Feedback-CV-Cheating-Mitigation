<?php

namespace App\Services\Programs;

use App\Models\AssignedCourse;
use App\Models\Course;
use App\Models\Programs\Grade;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class GradeService
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function getStudentsToBeGraded(Request $request, Course $course,  bool $isPaginated = true)
    {
        $students = $course->assignedTo()
            ->select(
                'assigned_courses.*',
                'users.first_name',
                'users.last_name',
                'users.email',
                'grades.status as grade_status'
            )
            ->join('learning_members', 'assigned_courses.learning_member_id', '=', 'learning_members.learning_member_id')
            ->join('users', 'learning_members.user_id', '=', 'users.user_id')
            ->join('roles', 'users.role_id', '=', 'roles.role_id')
            ->leftJoin('grades', 'assigned_courses.assigned_course_id', '=', 'grades.assigned_course_id')
            ->where('roles.role_name', 'student')
            ->with('grade');

        // Search by first or last name
        if ($search = $request->input('search')) {
            $students->where(function ($query) use ($search) {
                $query->where('users.first_name', 'like', "%{$search}%")
                    ->orWhere('users.last_name', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(users.first_name, ' ', users.last_name) LIKE ?", ["%{$search}%"]);
            });
        }

        // Filter by grade status
        if ($status = $request->input('status')) {
            if ($status === 'no_grade') {
                $students->whereNull('grades.status');
            } elseif ($status === 'graded' || $status === 'returned') {
                $students->where('grades.status', $status);
            }
        }

        // Sort by last name, first name, or fallback
        if ($sortLastName = $request->input('lastName')) {
            $students->orderBy('users.last_name', $sortLastName);
        } elseif ($sortFirstName = $request->input('firstName')) {
            $students->orderBy('users.first_name', $sortFirstName);
        } else {
            $students->orderBy('assigned_courses.created_at', 'asc')
                ->orderBy('assigned_courses.assigned_course_id', 'asc');
        }

        if ($isPaginated) {
            return $students->paginate(10)->withQueryString();
        }

        return $students->get();
    }


    public function createUpdateStudentGrade($grade, Course $course, AssignedCourse $assignedCourse, string $userId)
    {
        $grade = Grade::updateOrCreate(
            ['course_id' => $course->course_id, 'assigned_course_id' => $assignedCourse->assigned_course_id],
            ['course_id' => $course->course_id, 'assigned_course_id' => $assignedCourse->assigned_course_id, 'grade' => $grade, 'status' => 'graded', 'graded_by' => $userId]
        );

        return $grade;
    }

    public function returnGrades(array $validatedData, Course $course)
    {
        $grades = Grade::where('course_id', $course->course_id);

        if ($validatedData['selectAll']) {
            if (!empty($validatedData['unselectedStudentGrades'])) {
                $grades->whereNotIn('grade_id', $validatedData['unselectedStudentGrades']);
            }
        } else {
            if (!empty($validatedData['selectedStudentGrades'])) {
                $grades->whereIn('grade_id', $validatedData['selectedStudentGrades']);
            }
        }

        $grades->update([
            'status' => 'returned',
        ]);

        $userIds = $grades->get()->pluck('student.member.user.user_id')->toArray();

        $this->sendGradeNotification($userIds, $course);
    }

    public function handleExportStudentGradesToCsv($students)
    {
        $columns = ['Last Name', 'First Name', 'Status', 'Email', 'Grade'];

        $callback = function () use ($students, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($students as $student) {
                fputcsv($file, [
                    $student->last_name ?? 'N/A',
                    $student->first_name ?? 'N/A',
                    $student->grade->status ?? 'no grade',
                    $student->email ?? 'N/A',
                    $student->grade->grade ?? '',
                ]);
            }
            fclose($file);
        };

        return $callback;
    }

    public function sendGradeNotification(array $users, Course $course)
    {
        $title = "Course Grades Available";
        $body = "Grades for your course {$course->course_name} are now available. Check your results!";

        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/grades";

        $this->notificationService->notifyUsers($users, $title, $body, $actionUrl);
    }
}
