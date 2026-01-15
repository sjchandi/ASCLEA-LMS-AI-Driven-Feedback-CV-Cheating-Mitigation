<?php

namespace App\Http\Controllers\Admission;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Models\Admission\AdmissionFile;
use App\Models\Student;
use App\Models\LearningMember;
use App\Models\AssignedCourse;
use App\Models\Programs\Grade;
use App\Services\Admissions\AdmissionService;
use App\Services\NotificationService;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;


class AdmissionFileController extends Controller
{

    protected AdmissionService $admissionService;

    public function __construct(AdmissionService $admissionService)
    {
        $this->admissionService = $admissionService;
    }

    public function index(Request $request)
    {
        $user = auth()->user();

        if ($user->role->role_name === 'admin') {
            $pendingStudents = Student::with('user')
                ->where('enrollment_status', 'pending')
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            $enrolledStudents = Student::with('user')
                ->whereIn('enrollment_status', ['enrolled', 'dropout', 'withdrawn'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return Inertia::render('Admission/AdmissionPage', [
                'pendingStudents' => $pendingStudents,
                'enrolledStudents' => $enrolledStudents,
                'activeTab' => 0,
            ]);
        } elseif ($user->role->role_name === 'faculty') {

            $facultyLearningMemberIds = LearningMember::where('user_id', $user->user_id)
                ->pluck('learning_member_id');

            $facultyCoursesIds = AssignedCourse::whereIn('learning_member_id', $facultyLearningMemberIds)
                ->pluck('course_id');

            $studentLearningMemberIds = AssignedCourse::whereIn('course_id', $facultyCoursesIds)
                ->pluck('learning_member_id');

            $enrolledStudents = Student::with('user')
                ->whereIn('user_id', function ($query) use ($studentLearningMemberIds) {
                    $query->select('user_id')
                        ->from('learning_members')
                        ->whereIn('learning_member_id', $studentLearningMemberIds);
                })
                ->whereIn('enrollment_status', ['enrolled', 'dropout', 'withdrawn'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return Inertia::render('Admission/AdmissionPage', [
                'enrolledStudents' => $enrolledStudents,
            ]);

            return Inertia::render('Admission/AdmissionPage', [
                'enrolledStudents' => $enrolledStudents,
            ]);
        } else {
            $student = Student::where('user_id', $user->user_id)->first();
            return Inertia::render('Admission/AdmissionPage', [
                'student' => $student,
            ]);
        }
    }

    //==================== STORE STUDENT SUBMITTED DOCUMENTS/FILES ====================//
    public function store(Request $request)
    {
        $user = auth()->user();
        $student = Student::where('user_id', $user->user_id)->firstOrFail();

        $request->validate([
            'files.*' => 'required|file|max:5120', // 5MB max each
        ]);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $extension = strtolower($file->getClientOriginalExtension());

                $allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
                if (!in_array($extension, $allowedExtensions)) {
                    return back()->with('error', 'Only JPG, JPEG, PNG, or PDF files are allowed.');
                }

                $path = $file->store('admission', 'public');

                AdmissionFile::create([
                    'admission_file_id' => Str::uuid(),
                    'student_id' => $student->student_id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_type' => $file->getClientMimeType(),
                    'uploaded_at' => now(),
                ]);
            }

            $student->update(['admission_status' => 'Pending']);

            // Send notification
            $this->admissionService->sendAdmissionNotification($student);

            return back()->with('success', 'Files uploaded successfully!');
        }

        return back()->with('error', 'No files were uploaded.');
    }

    //==================== GET ALL PENDING STUDENTS ====================//
    public function getPendingStudents(Request $request)
    {
        // Fetch all students whose enrollment_status is 'pending'
        // and eager load their related user details
        $query = Student::with(['user', 'admissionFiles'])
            ->where('enrollment_status', 'pending');

        if ($search = $request->input('search')) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $pendingStudents = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admission/AdmissionPage', [
            'pendingStudents' => $pendingStudents,
        ]);
    }

    //==================== VIEW THE CORRESPONDING INFO RELATED TO PENDING STUDENTS ====================//
    public function viewPendingStudent(Student $student)
    {
        $student->load(['user', 'admissionFiles']);

        return Inertia::render('Admission/PendingPage/EnrollmentRequest', [
            'student' => $student,
        ]);
    }

    //==================== GET ALL PENDING STUDENTS ====================//
    public function getEnrolledStudents(Request $request)
    {
        $user = auth()->user();
        $query = Student::with(['user', 'admissionFiles'])
            ->whereIn('enrollment_status', ['enrolled', 'dropout', 'withdrawn']);

        // If Faculty, filter students who are in courses assigned to this faculty
        if ($user->role->role_name === 'faculty') {
            $query->whereHas('user.learningMembers.courses', function ($q) use ($user) {
                $q->where('learning_member_id', function ($sub) use ($user) {
                    $sub->select('learning_member_id')
                        ->from('learning_members')
                        ->where('user_id', $user->user_id);
                });
            });
        }

        if ($search = $request->input('search')) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        $enrolledStudents = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Admission/AdmissionPage', [
            'enrolledStudents' => $enrolledStudents,
            'role' => $user->role->role_name,
        ]);
    }

    //==================== VIEW THE CORRESPONDING INFO RELATED TO ENROLLED STUDENTS ====================//
    public function viewEnrolledStudent(Student $student)
    {
        $user = auth()->user();
        $student->load(['user', 'admissionFiles', 'approver']);

        // 1. Get the Faculty's own Learning Member ID (to find their courses)
        $facultyMemberIds = \App\Models\LearningMember::where('user_id', $user->user_id)
            ->pluck('learning_member_id');

        // 2. Get the IDs of courses this faculty teaches
        $facultyCourseIds = \App\Models\AssignedCourse::whereIn('learning_member_id', $facultyMemberIds)
            ->pluck('course_id');

        // 3. Load Learning Members (Programs) but filter the nested courses
        $learningMembers = \App\Models\LearningMember::with([
            'program',
            'courses' => function ($query) use ($facultyCourseIds, $user) {
                // ONLY show courses taught by this faculty
                if ($user->role->role_name === 'faculty') {
                    $query->whereIn('course_id', $facultyCourseIds);
                }
            },
            'courses.course',
            'courses.assessmentSubmissions.assessment'
        ])
            ->where('user_id', $student->user_id)
            ->get()
            // Filter out programs that now have 0 visible courses for this faculty
            ->filter(function ($lm) use ($user) {
                return $user->role->role_name !== 'faculty' || $lm->courses->count() > 0;
            });

        // 4. Flatten only the relevant assessments
        $completedAssessments = $learningMembers->flatMap(function ($lm) {
            return $lm->courses->flatMap(function ($assignedCourse) {
                return $assignedCourse->assessmentSubmissions
                    ->whereIn('submission_status', ['submitted', 'returned', 'graded', 'not_submitted'])
                    ->map(fn($submission) => [
                        'assessment_name' => $submission->assessment->assessment_title ?? 'N/A',
                        'course_name' => $assignedCourse->course->course_name ?? 'N/A',
                        'score' => $submission->score,
                        'status' => $submission->submission_status,
                        'submitted_at' => $submission->submitted_at,
                    ]);
            });
        });

        // 5. Prepare Grades data dito lalagay
        $GradesQuery = \App\Models\Programs\Grade::where('status', 'returned')
            ->whereHas('student.member', function ($query) use ($student) {
                $query->where('user_id', $student->user_id);
            });

        // Apply course restriction ONLY for faculty
        if ($user->role->role_name === 'faculty') {
            $GradesQuery->whereHas('course', function ($query) use ($facultyCourseIds) {
                $query->whereIn('course_id', $facultyCourseIds);
            });
        }

        $Grades = $GradesQuery
            ->with('course.program')
            ->get()
            ->map(fn($grade) => [
                'course_name'  => $grade->course->course_name ?? 'N/A',
                'program_name' => $grade->course->program->program_name ?? 'N/A',
                'grade'        => $grade->grade,
            ]);

        return Inertia::render('Admission/EnrolledPage/StudentInfo', [
            'student' => $student,
            'learningMembers' => $learningMembers->values(),
            'completedAssessments' => $completedAssessments,
            'Grades' => $Grades,
            'role' => $user->role->role_name,
        ]);
    }

    //==================== FUNCTION OF UPDATING THE INFORMATION OF ACCEPTED/ENROLLED STUDENTS ====================//
    public function updateStudent(Request $request, Student $student)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email,' . $student->user->user_id . ',user_id',
            'contact_number' => 'nullable|string|max:20',
            'birthdate' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'program' => 'nullable|string|max:255',
            'enrollment_status' => 'nullable|in:enrolled,pending,dropout,withdrawn', //Withdrawn enrollment status do not exist yet in the model
            'admission_status' => 'nullable|in:Not Submitted,Pending,Accepted,Rejected',
            'house_no' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'barangay' => 'nullable|string|max:255',
        ]);

        $student->user->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'middle_name' => $request->middle_name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'birthdate' => $request->birthdate,
            'gender' => $request->gender,
            'house_no' => $request->house_no,
            'region' => $request->region,
            'province' => $request->province,
            'city' => $request->city,
            'barangay' => $request->barangay,
        ]);

        $student->update([
            'enrollment_status' => $request->enrollment_status,
            'admission_status' => $request->admission_status ?? $student->admission_status,
        ]);
        return redirect()->back()->with('success', 'Student updated successfully.');
    }

    //==================== LOGIC FOR UPDATING THE ENROLLMENT STATUS BASED ON THE STUDENT'S ADMISSION STATUS ====================//
    public function EnrollmentStatus($admission_status)
    {
        return $admission_status === 'Accepted' ? 'enrolled' : 'pending';
    }

    //==================== UPDATE STATUS FUNCTION TO UPDATE THE ADMISSION STATUS OF STUDENTS ====================//
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'admission_status' => 'required|in:Not Submitted,Pending,Accepted,Rejected',
            'admission_message' => 'nullable|string|max:500|',
        ]);

        $student = Student::findOrFail($id);

        // Update admission details
        $student->admission_status = $validated['admission_status'];
        $student->admission_message = $validated['admission_message'] ?? null;
        $student->approved_by = auth()->id();

        // Automatically update enrollment_status based on admission_status
        $student->enrollment_status = $this->EnrollmentStatus($student->admission_status);

        // If the student is accepted and enrolled, update payment to "paid"
        if ($student->admission_status === 'Accepted' && $student->enrollment_status === 'enrolled') {
            $student->payment = 'paid';
            $student->approved_at = now();
        } else {
            $student->payment = 'unpaid';
            $student->approved_at = null;
        }

        $student->save();

        // Soft-delete uploaded files if rejected
        if ($student->admission_status === 'Rejected') {
            $student->admissionFiles()->update(['deleted_at' => now()]);
        }

        // If the Student has been approved, the toast status is success and will direct the admin to the admission page
        if ($student->admission_status === 'Accepted' && $student->enrollment_status === 'enrolled') {
            return redirect()->route('admission.index')->with('success', 'Student approved successfully!');
        }

        // If the Student is pending and updated as rejected, the toast status is error and will stay on the view enrollment request page
        return redirect()->back()->with('error', 'Student Enrollment Request has been ' . strtolower($student->admission_status) . '.');
        //return redirect()->route('admission.index')->with('success', 'Status updated successfully.');
    }

    //==================== ARCHIVE ENROLLED STUDENTS ====================//
    public function archive(Request $request, Student $student)
    {
        $student->update([
            'archived_by' => $request->user()->user_id
        ]);

        // Soft delete the enrolled student
        $student->delete();

        // Soft delete the related user
        if ($student->user) {
            $student->user->delete();
        }
        return redirect()->route('admission.index')->with('success', 'Student archived successfully.');
    }

    public function restoreStudent($studentId)
    {
        $student = Student::withTrashed()->findOrFail($studentId);

        // Restore the student and user data
        $student->restore();
        $student->user->restore();

        // Remove the archived_by   
        $student->update([
            'archived_by' => null
        ]);

        return redirect()->back()->with('success', 'Student restored successfully.');
    }

    public function updateProfile(Request $request, $id)
    {
        $request->validate([
            'profile_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $student = Student::findOrFail($id);
        $user = $student->user;

        if ($request->hasFile('profile_image')) {
            $file = $request->file('profile_image');
            $filePath = $file->store('profile_images', 'public');

            // Delete old photo if exists
            if ($user->profile_image && \Storage::disk('public')->exists($user->profile_image)) {
                \Storage::disk('public')->delete($user->profile_image);
            }

            $user->profile_image = $filePath;
            $user->save();
        }

        return back()->with('success', 'Profile photo updated successfully.');
    }

    //==================== VIEW ADMISSION FILES OF PENDING STUDENT ====================//
    public function streamAdmissionFile(Student $student, AdmissionFile $file)
    {
        // Ensure the file belongs to the student
        abort_if($file->student_id !== $student->student_id, 403, 'Unauthorized');

        // Stream the file from storage
        return response()->file(storage_path('app/public/' . $file->file_path));
    }

    //==================== DOWNLOAD ADMISSION FILES OF PENDING STUDENTS ====================//
    public function downloadAdmissionFile(Student $student, AdmissionFile $file)
    {
        // Ensure the file belongs to the student
        abort_if($file->student_id !== $student->student_id, 403, 'Unauthorized');

        // Force file download
        return response()->download(storage_path('app/public/' . $file->file_path), $file->file_name);
    }

    //==================== EXPORT PENDING STUDENTS AS CSV ====================//
    public function exportCsv()
    {
        $fileName = 'pending_students.csv';

        // Fetch all pending students with student enrollment status of pending
        $students = Student::with('user')
            ->where('enrollment_status', 'pending')
            ->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['Name', 'Email', 'Enrollment Status', 'Admission Status', 'Date Applied'];

        $callback = function () use ($students, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($students as $student) {
                fputcsv($file, [
                    $student->user ? $student->user->first_name . ' ' . $student->user->last_name : 'N/A',
                    $student->user->email ?? 'N/A',
                    $student->enrollment_status ?? 'N/A',
                    $student->admission_status ?? 'N/A',
                    $student->created_at ? $student->created_at->format('m/d/Y') : 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    //==================== EXPORT PENDING STUDENTS AS PDF ====================//
    public function exportPdf()
    {
        // Fetch all pending students with student enrollment status of pending
        $students = Student::with('user')->where('enrollment_status', 'pending')->get();

        $pdf = Pdf::setOptions(['defaultFont' => 'DejaVu Sans'])
            ->loadView('admission.pending-students-pdf', compact('students'));

        return $pdf->download('pending_students.pdf');
    }


    //==================== EXPORT ENROLLED STUDENTS AS CSV ====================//
    public function exportEnrolledCsv()
    {
        $fileName = 'enrolled_students.csv';

        // Fetch all enrolled students with student enrollment status of enrolled/dropout/withdrawn
        $students = Student::with('user')
            ->whereIn('enrollment_status', ['enrolled', 'dropout', 'withdrawn'])
            ->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['Name', 'Email', 'Enrollment Status', 'Admission Status', 'Date Approved'];

        $callback = function () use ($students, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($students as $student) {
                fputcsv($file, [
                    $student->user ? $student->user->first_name . ' ' . $student->user->last_name : 'N/A',
                    $student->user->email ?? 'N/A',
                    $student->enrollment_status ?? 'N/A',
                    $student->admission_status ?? 'N/A',
                    $student->approved_at ? $student->approved_at->format('m/d/Y') : 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    //==================== EXPORT ENROLLED STUDENTS AS PDF ====================//
    public function exportEnrolledPdf()
    {
        $students = Student::with('user')
            ->where('enrollment_status', 'enrolled')
            ->get();

        $pdf = Pdf::setOptions(['defaultFont' => 'DejaVu Sans'])
            ->loadView('admission.enrolled-students-pdf', compact('students'));

        return $pdf->download('enrolled_students.pdf');
    }

    public function exportStudentData(Request $request, Student $student, string $format)
    {
        $user = auth()->user();

        // Define the dynamic filename based on the student's last name
        $lastName = $student->user->last_name ?? 'Student';
        $baseFilename = "{$lastName}_Student_Record";

        // Determine Faculty Restrictions
        $facultyCourseIds = [];
        if ($user->role->role_name === 'faculty') {
            $facultyMemberIds = \App\Models\LearningMember::where('user_id', $user->user_id)
                ->pluck('learning_member_id');

            $facultyCourseIds = \App\Models\AssignedCourse::whereIn('learning_member_id', $facultyMemberIds)
                ->pluck('course_id');
        }

        // Fetch Programs & Courses (Filtered)
        $learningMembers = LearningMember::with(['program', 'courses' => function ($q) use ($user, $facultyCourseIds) {
            if ($user->role->role_name === 'faculty') {
                $q->whereIn('course_id', $facultyCourseIds);
            }
        }, 'courses.course', 'courses.assessmentSubmissions.assessment'])
            ->where('user_id', $student->user_id)
            ->get()
            ->filter(function ($lm) use ($user) {
                return $user->role->role_name !== 'faculty' || $lm->courses->count() > 0;
            });

        // Flatten Assessments (Filtered)
        $assessments = $learningMembers->flatMap(function ($lm) {
            return $lm->courses->flatMap(function ($course) {
                return $course->assessmentSubmissions
                    ->whereIn('submission_status', ['submitted', 'returned', 'graded'])
                    ->map(function ($s) use ($course) {
                        $submittedAt = $s->submitted_at ? \Carbon\Carbon::parse($s->submitted_at) : null;
                        return [
                            'assessment'   => $s->assessment->assessment_title ?? 'N/A',
                            'course'       => $course->course->course_name ?? 'N/A',
                            'score'        => $s->score ?? 'Not Graded',
                            'submitted_at' => $submittedAt ? $submittedAt->format('Y-m-d h:i A') : 'N/A',
                        ];
                    });
            });
        });

        // Fetch Final Grades (Filtered)
        $gradesQuery = Grade::where('status', 'returned')
            ->whereHas('student.member', fn($q) => $q->where('user_id', $student->user_id));

        if ($user->role->role_name === 'faculty') {
            $gradesQuery->whereHas('course', fn($q) => $q->whereIn('course_id', $facultyCourseIds));
        }
        $grades = $gradesQuery->with(['course.program'])->get();

        // ================== EXPORT LOGIC ==================
        if (strtolower($format) === 'pdf') {
            $pdf = Pdf::loadView('admission.student-full-pdf', [
                'student'         => $student->load('user'),
                'learningMembers' => $learningMembers,
                'assessments'     => $assessments,
                'grades'          => $grades,
                'exportedBy'      => $user->role->role_name
            ]);

            // Uses dynamic [LastName]_Student_Record.pdf
            return $pdf->download("{$baseFilename}.pdf");
        }

        // CSV Export
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename={$baseFilename}.csv", // Uses dynamic [LastName]_Student_Record.csv
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function () use ($student, $learningMembers, $assessments, $grades) {
            $file = fopen('php://output', 'w');

            fputcsv($file, ['STUDENT RECORD EXPORT']);
            fputcsv($file, ['Name', $student->user->first_name . ' ' . $student->user->last_name]);
            fputcsv($file, ['Email', $student->user->email]);
            fputcsv($file, []);

            fputcsv($file, ['--- PROGRAMS & COURSES ---']);
            fputcsv($file, ['Program Name', 'Course Code', 'Course Name']);
            foreach ($learningMembers as $lm) {
                foreach ($lm->courses as $c) {
                    fputcsv($file, [
                        $lm->program->program_name ?? 'N/A',
                        $c->course->course_code ?? 'N/A',
                        $c->course->course_name ?? 'N/A'
                    ]);
                }
            }
            fputcsv($file, []);

            fputcsv($file, ['--- COMPLETED ASSESSMENTS ---']);
            fputcsv($file, ['Assessment Name', 'Course Name', 'Score/Status', 'Date Submitted']);
            foreach ($assessments as $a) {
                fputcsv($file, [$a['assessment'], $a['course'], $a['score'], $a['submitted_at']]);
            }
            fputcsv($file, []);

            fputcsv($file, ['--- FINAL GRADES ---']);
            fputcsv($file, ['Program', 'Course', 'Grade']);
            foreach ($grades as $g) {
                fputcsv($file, [
                    $g->course->program->program_name ?? 'N/A',
                    $g->course->course_name ?? 'N/A',
                    $g->grade
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }
}
