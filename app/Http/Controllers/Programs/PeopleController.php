<?php

namespace App\Http\Controllers\Programs;

use App\Http\Controllers\Controller;
use App\Models\AssignedCourse;
use App\Models\Course;
use App\Models\LearningMember;
use App\Models\Program;
use App\Models\Role;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\Programs\PeopleService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PeopleController extends Controller
{
    protected NotificationService $notificationService;
    protected PeopleService $peopleService;

    public function __construct(NotificationService $notificationService, PeopleService $peopleService)
    {
        $this->notificationService  = $notificationService;
        $this->peopleService  = $peopleService;
    }

    public function listUsers(Program $program, Request $request)
    {
        $users = $this->peopleService->getUsersToList($program, $request);

        return response()->json($users);
    }

    public function addMember(Program $program, Request $request)
    {

        $users = $this->peopleService->getUsersToAdd($program, $request);

        $now = Carbon::now();

        $data = array_map(function ($userId) use ($program, $now) {
            return   [
                'program_id' => $program->program_id,
                'user_id' => $userId,
                'learning_member_id' => (string) Str::uuid(),
                'updated_at' => $now,
                'created_at' => $now,
                'deleted_at' => null,
            ];
        }, $users);

        // Data should not have duplicate in the table before inserting
        // Update deleted_at  is userr was previously added in the program
        LearningMember::upsert($data, uniqueBy: ['program_id', 'user_id'], update: ['deleted_at']);

        // Send notification to added users
        $this->peopleService->sendAddedProgramNotifcation($users, $program);

        $label = count($data) > 1 ? "Users" : "User";

        return back()->with('success', "$label added successfully.");
    }

    public function removeMember($programId, LearningMember $member)
    {
        $member->delete();

        return back()->with('success', 'Member removed successfully.');
    }

    public function viewMember(Program $program, LearningMember $member)
    {

        return Inertia::render('Programs/ProgramComponent/PeopleComponent/ViewMember', [

            // Check first if user is not soft deleted or exists else abort
            'member_data' => fn() => $member->user()->exists()
                ? $member->load([
                    'user' => function ($query) {
                        $query->select('user_id', 'role_id', 'first_name', 'last_name', 'profile_image')
                            ->with(['role' => function ($query) {
                                $query->select('role_id', 'role_name');
                            }]);
                    }
                ])
                : abort(404),

            'assigned_courses' => fn() => $member->courses()
                ->with([
                    'course' => function ($query) {
                        $query->select(
                            'course_id',
                            'course_code',
                            'course_name',
                            'course_day',
                            'start_time',
                            'end_time'
                        );
                    }
                ])
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }

    public function listCourses(Program $program, LearningMember $member)
    {
        $courses = $program->courses()
            ->whereDoesntHave('assignedTo',  function ($query) use ($member) {
                $query->where('learning_member_id', $member->learning_member_id);
            })
            ->select('course_id', 'course_code', 'course_name', 'course_day', 'start_time', 'end_time')
            ->orderBy('created_at', 'desc')->get();

        return response()->json($courses);
    }

    public function assignCourses(Program $program, LearningMember $member, Request $req)
    {
        $courses = $req->courses_to_assign;

        if (!empty($courses)) {
            $validCourses = $program->courses() // Get the courses of the program
                ->whereIn('course_id', $courses) // Get courses that is in the selected courses
                ->whereDoesntHave('assignedTo', function ($query) use ($member) { // Filter out courses that alreading assigned
                    $query->where('learning_member_id', $member->learning_member_id);
                })
                ->pluck('course_id')
                ->toArray();

            $now = Carbon::now();

            $data = array_map(function ($validCourseId) use ($member, $now) {
                return   [
                    'assigned_course_id' => (string) Str::uuid(),
                    'learning_member_id' => $member->learning_member_id,
                    'course_id' => $validCourseId,
                    'updated_at' => $now,
                    'created_at' => $now,
                    'deleted_at' => null,
                ];
            }, $validCourses);


            // Update assigned course deleted_at if user was previously added
            AssignedCourse::upsert($data, uniqueBy: ['learning_member_id', 'course_id'], update: ['deleted_at']);

            // Send notifcation
            $this->peopleService->sendNewCourseNotifcation($courses, $program, $member);

            $label = count($data) > 1 ? "Courses" : "Course";
        }

        return back()->with('success', "$label assigned successfully.");
    }

    public function removeAssignedCourse($programId, $memberId, AssignedCourse $assignedCourse)
    {

        if ($assignedCourse) {
            $assignedCourse->delete();
        }

        return back()->with('success', 'Course removed successfully.');
    }
}
