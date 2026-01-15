<?php

namespace App\Http\Controllers\Dashboard;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Role;
use App\Models\Student;
use App\Models\Program;
use App\Models\LearningMember;
use App\Models\Programs\Assessment;
use App\Models\Programs\AssessmentSubmission;
use App\Models\Administration\Staff;
use App\Models\UserLogin;
use App\Models\AssignedCourse; // Added for cleaner usage
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $authUser = auth()->user();
        $roleName = Role::where('role_id', $authUser->role_id)->value('role_name');

        $stats = $this->getDashboardStats();

        $studentsPerProgram = $this->getStudentsPerProgram();

        // Default Admin View (All Enrolled Students)
        [$dailyLoginDates, $dailyLoginCounts, $avgTimePerDay] = $this->getDailyLoginsAndAverageTime(null);

        $assessments = $accomplishedAssessments = $pendingAssessments = [];
        $totalLearningHours = $totalAssignedCourses = $totalSubmitted = $averageQuizScore = 0;
        $courseImprovementRates = [];
        $dailyTimeSpent = [];

        if ($roleName === 'faculty') {
            // Faculty View (Overwrites the variables above)
            [$stats, $assessments, $dailyLoginDates, $dailyLoginCounts, $avgTimePerDay, $staffDailyTimeSpent, $totalTimeSpent] =
                $this->getFacultyData($authUser, $stats);
        } elseif ($roleName === 'student') {
            [
                $dailyTimeSpent,
                $totalLearningHours,
                $totalAssignedCourses,
                $accomplishedAssessments,
                $pendingAssessments,
                $totalSubmitted,
                $averageQuizScore,
                $courseImprovementRates
            ] = $this->getStudentData($authUser);
        }

        return Inertia::render('Dashboard/Dashboard', [
            'authUser' => [
                'user_id'    => $authUser->id,
                'role'       => $roleName,
                'first_name' => $authUser->first_name,
            ],
            'stats' => $stats,
            'studentsPerProgram' => $studentsPerProgram,
            'dailyLogins' => [
                'dates' => $dailyLoginDates,
                'counts' => $dailyLoginCounts,
            ],
            'avgTimePerDay' => $avgTimePerDay,
            'dailyTimeSpent' => $dailyTimeSpent,
            'staffDailyTimeSpent' => $staffDailyTimeSpent ?? [],
            'totalTimeSpent' => $totalTimeSpent ?? 0,
            'total_assigned_courses' => $totalAssignedCourses,
            'assessments' => $assessments,
            'accomplished_assessments' => $accomplishedAssessments,
            'pending_assessments' => $pendingAssessments,
            'total_submitted_assessments' => $totalSubmitted,
            'average_quiz_score' => $averageQuizScore,
            'courseImprovementRates' => $courseImprovementRates,
            'total_learning_hours' => $totalLearningHours,
        ]);
    }

    // ... [getDashboardStats and getStudentsPerProgram remain unchanged] ...

    private function getDashboardStats()
    {
        return [
            'total_students'    => Student::where('enrollment_status', 'enrolled')->count(),
            'total_educators'   => User::join('roles', 'users.role_id', '=', 'roles.role_id')
                                     ->where('roles.role_name', 'faculty')->count(),
            'pending_enrollees' => Student::where('enrollment_status', 'pending')->count(),
            'online_students'   => 0,
        ];
    }

    private function getStudentsPerProgram()
    {
        return Program::select('program_id', 'program_name')
            ->withCount(['learningMembers as total_students' => function ($query) {
                $query->join('users', 'learning_members.user_id', '=', 'users.user_id')
                    ->join('roles', 'users.role_id', '=', 'roles.role_id')
                    ->where('roles.role_name', 'student');
            }])
            ->get();
    }

    /**
     * Calculates logins and average time.
     * If $studentIds is NULL, it fetches for ALL enrolled students (Admin view).
     * If $studentIds is an ARRAY (even empty), it fetches ONLY for those IDs (Faculty view).
     */
    private function getDailyLoginsAndAverageTime($studentIds = null)
    {
        $query = DB::table('user_logins')
            ->join('users', 'user_logins.user_id', '=', 'users.user_id')
            ->join('roles', 'users.role_id', '=', 'roles.role_id')
            ->join('students', 'users.user_id', '=', 'students.user_id')
            ->where('roles.role_name', 'student')
            ->where('students.enrollment_status', 'enrolled');

        // STRICT CHECK: Use !is_null.
        // This ensures that if a faculty has an empty array of students [],
        // we apply the filter (returning 0 results) rather than defaulting to 'All Users'.
        if (!is_null($studentIds)) {
            $query->whereIn('user_logins.user_id', $studentIds);
        }

        $logins = $query
            ->where('login_at', '>=', Carbon::now()->subDays(6)->startOfDay())
            ->select('user_logins.user_id', 'login_at', 'logout_at')
            ->get();

        $dates = [];
        $dailyCounts = [];
        $avgTimePerDay = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $dates[] = $date;

            $dailyLogins = $logins->filter(fn($l) => Carbon::parse($l->login_at)->format('Y-m-d') === $date);
            $dailyCounts[] = $dailyLogins->unique('user_id')->count();

            $times = $dailyLogins->filter(fn($l) => $l->logout_at)
                                ->map(fn($l) => Carbon::parse($l->login_at)
                                ->diffInMinutes(Carbon::parse($l->logout_at)) / 60);
            $avgTimePerDay[$date] = $times->count() ? round($times->avg(), 2) : 0;
        }

        return [$dates, $dailyCounts, $avgTimePerDay];
    }

    private function getFacultyData($authUser, $stats)
    {
        // 1. Staff Login Data
        $staffLogins = UserLogin::join('staff', 'user_logins.user_id', '=', 'staff.user_id')
            ->where('user_logins.user_id', $authUser->user_id)
            ->whereNotNull('logout_at')
            ->select('user_logins.*')
            ->get();

        $staffDailyTimeSpent = $this->computeDailyTimeSpent($staffLogins);

        $totalTimeSpent = round($staffLogins->sum(fn($login) =>
            Carbon::parse($login->login_at)->diffInMinutes(Carbon::parse($login->logout_at)) / 60
        ), 2);
        
        // 2. Staff Course Data
        $staff = Staff::where('user_id', $authUser->user_id)
            ->withCount('assignedCourses')
            ->with('assignedCourses')
            ->first();

        $programCount = LearningMember::where('user_id', $authUser->user_id)
            ->distinct('program_id')
            ->count('program_id');

        $stats['assigned_programs'] = $programCount;
        $stats['assigned_courses'] = $staff?->assigned_courses_count ?? 0;

        // 3. Get Students SPECIFICALLY assigned to this Faculty
        $assignedCourseIds = $staff?->assignedCourses->pluck('course_id') ?? [];

        $studentIds = AssignedCourse::whereIn('course_id', $assignedCourseIds)
            ->join('learning_members', 'assigned_courses.learning_member_id', '=', 'learning_members.learning_member_id')
            ->join('users', 'learning_members.user_id', '=', 'users.user_id')
            ->join('roles', 'users.role_id', '=', 'roles.role_id')
            ->where('roles.role_name', 'student')
            ->distinct()
            ->pluck('learning_members.user_id')
            ->toArray();
        
        // Update Stats to reflect only this faculty's students
        $stats['total_students'] = count($studentIds);

        // 4. Get Logins/Avg Time ONLY for these students
        // This relies on the 'enrolled' check inside the function + the ID list here
        [$dailyLoginDates, $dailyLoginCounts, $avgTimePerDay] = $this->getDailyLoginsAndAverageTime($studentIds);

        // 5. Assessment Data
        $assessments = Assessment::select('assessment_id', 'assessment_title')
            ->whereIn('course_id', $assignedCourseIds)
            ->withCount([
                'assessmentSubmissions as submitted_count' => fn($q) => $q->where('submission_status', 'submitted'),
                'assessmentSubmissions as returned_count'  => fn($q) => $q->where('submission_status', 'returned'),
                'assessmentSubmissions as not_submitted_count' => fn($q) => $q->where('submission_status', 'not_submitted'),
            ])
            ->get();

        return [$stats, $assessments, $dailyLoginDates, $dailyLoginCounts, $avgTimePerDay, $staffDailyTimeSpent, $totalTimeSpent];
    }

    // ... [getStudentData, computeDailyTimeSpent, etc., remain unchanged] ...
    
    private function getStudentData($authUser)
    {
        $studentLogins = UserLogin::join('students', 'user_logins.user_id', '=', 'students.user_id')
            ->where('user_logins.user_id', $authUser->user_id)
            ->where('students.enrollment_status', 'enrolled')
            ->whereNotNull('logout_at')
            ->select('user_logins.*')
            ->get();

        $dailyTimeSpent = $this->computeDailyTimeSpent($studentLogins);

        $totalLearningHours = round($studentLogins->sum(fn($login) =>
            Carbon::parse($login->login_at)->diffInMinutes(Carbon::parse($login->logout_at)) / 60, 2), 2);

        $totalAssignedCourses = LearningMember::where('user_id', $authUser->user_id)
            ->withCount('courses')->get()->sum('courses_count');

        $assignedCourseIds = LearningMember::where('user_id', $authUser->user_id)
            ->with('courses')->get()->pluck('courses')->flatten()->pluck('assigned_course_id')->toArray();

        $totalSubmitted = AssessmentSubmission::whereIn('submitted_by', $assignedCourseIds)
            ->whereIn('submission_status', ['submitted', 'returned'])->count();

        [$accomplishedAssessments, $pendingAssessments] = $this->getStudentAssessments($assignedCourseIds);

        $averageQuizScore = $this->computeAverageQuizScore($assignedCourseIds);

        $courseImprovementRates = $this->computeCourseImprovementRates($assignedCourseIds);

        return [
            $dailyTimeSpent,
            $totalLearningHours,
            $totalAssignedCourses,
            $accomplishedAssessments,
            $pendingAssessments,
            $totalSubmitted,
            $averageQuizScore,
            $courseImprovementRates
        ];
    }

    private function computeDailyTimeSpent($studentLogins)
    {
        $dailyTimeSpent = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');

            $loginsForDate = $studentLogins->filter(fn($login) =>
                Carbon::parse($login->login_at)->isSameDay($date));

            $totalHours = $loginsForDate->sum(fn($login) =>
                Carbon::parse($login->login_at)->diffInMinutes(Carbon::parse($login->logout_at)) / 60);

            $dailyTimeSpent[] = ['date' => $date, 'hours' => round($totalHours, 2)];
        }

        return $dailyTimeSpent;
    }

    private function getStudentAssessments($assignedCourseIds)
    {
        // ACCOMPLISHED: Any assessment where the student has a recorded submission date
        $accomplished = AssessmentSubmission::whereIn('submitted_by', $assignedCourseIds)
            ->whereNotNull('submitted_at') 
            ->with([
                'assessment' => function ($q) {
                    // Ensure due_datetime is selected here
                    $q->select('assessment_id', 'assessment_title', 'due_datetime', 'course_id', 'total_points')
                    ->with(['course:course_id,course_name,course_code', 'quiz:quiz_id,assessment_id,quiz_total_points']);
                }
            ])
            ->select('assessment_submission_id', 'assessment_id', 'score', 'submitted_at')
            ->latest('submitted_at')
            ->paginate(5)
            ->through(function ($submission) {
                $assessment = $submission->assessment;
                $maxPoints = $assessment->quiz->quiz_total_points ?? $assessment->total_points ?? 0;

                return [
                    'assessment_title' => $assessment->assessment_title ?? 'Untitled',
                    'course_name'      => $assessment->course?->course_name ?? 'Unknown Course',
                    'course_code'      => $assessment->course?->course_code ?? '-',
                    'score'            => $submission->score ?? 0,
                    'max_points'       => $maxPoints,
                    'submitted_at'     => Carbon::parse($submission->submitted_at)->format('M d, Y h:i A'),
                    'due_date'         => $assessment->due_datetime 
                                            ? Carbon::parse($assessment->due_datetime)->format('M d, Y') 
                                            : 'No deadline',
                ];
            });

        // PENDING: Published assessments that HAVE NOT been submitted by this student
            $pending = Assessment::whereIn('course_id', function ($query) use ($assignedCourseIds) {
                        $query->select('course_id')
                            ->from('assigned_courses')
                            ->whereIn('assigned_course_id', $assignedCourseIds);
                    })
                    ->where('status', 'published')
                    ->whereDoesntHave('assessmentSubmissions', function ($query) use ($assignedCourseIds) {
                        $query->whereIn('submitted_by', $assignedCourseIds)
                            ->whereNotNull('submitted_at');
                    })
                    // 1. Eager load the quiz relationship
                    ->with(['course:course_id,course_name,course_code', 'quiz:quiz_id,assessment_id,quiz_total_points'])
                    ->select('assessment_id', 'assessment_title', 'due_datetime', 'total_points', 'course_id')
                    ->orderBy('due_datetime', 'asc')
                    ->paginate(5)
                    ->through(function ($assessment) {
                        // 2. Determine which point value to use
                        // If the quiz relationship exists, use quiz_total_points, otherwise use assessment total_points
                        $maxPoints = $assessment->quiz->quiz_total_points ?? $assessment->total_points ?? 0;

                        return [
                            'assessment_title' => $assessment->assessment_title ?? 'Untitled',
                            'course_name'      => $assessment->course?->course_name ?? 'Unknown Course',
                            'course_code'      => $assessment->course?->course_code ?? '-',
                            'due_date'         => $assessment->due_datetime 
                                                    ? Carbon::parse($assessment->due_datetime)->format('M d, Y') 
                                                    : 'No deadline',
                            'possible_score'   => $maxPoints, // This now reflects the Quiz points specifically
                        ];
                    });

                return [$accomplished, $pending];
            }

    private function computeAverageQuizScore($assignedCourseIds)
    {
        $submissions = AssessmentSubmission::whereIn('submitted_by', $assignedCourseIds)
            ->whereHas('assessment.assessmentType', fn($q) => $q->where('assessment_type', 'quiz'))
            ->whereNotNull('score')->with('assessment.quiz:quiz_id,assessment_id,quiz_total_points')
            ->get();

        $totalPercent = 0;
        $count = 0;

        foreach ($submissions as $submission) {
            $totalPoints = $submission->assessment->quiz->quiz_total_points ?? 0;
            if ($totalPoints > 0) {
                $totalPercent += ($submission->score / $totalPoints) * 100;
                $count++;
            }
        }

        return $count ? round($totalPercent / $count) : 0;
    }

    private function computeCourseImprovementRates($assignedCourseIds)
    {
        $submissions = AssessmentSubmission::whereIn('submitted_by', $assignedCourseIds)
            ->whereHas('assessment.assessmentType', fn($q) => $q->where('assessment_type', 'quiz'))
            ->whereNotNull('score')
            ->with(['assessment.quiz:quiz_id,assessment_id,quiz_total_points', 'assessment.course:course_id,course_name'])
            ->get()
            ->groupBy('assessment.course.course_name');

        $rates = [];

        foreach ($submissions as $courseName => $courseSubmissions) {
            $sorted = $courseSubmissions->sortBy('submitted_at');
            $totalCount = $sorted->count();
            $half = ceil($totalCount / 2);
            
            $previous = $sorted->take($half);
            $current = $sorted->slice($half);

            $computeAvg = fn($set) => $set->reduce(function ($carry, $s) {
                $points = $s->assessment->quiz->quiz_total_points ?? 0;
                return $points > 0 ? $carry + ($s->score / $points) * 100 : $carry;
            }, 0) / max($set->count(), 1);

            $prevAvg = $previous->count() ? round($computeAvg($previous), 2) : 0;
            $currAvg = $current->count() ? round($computeAvg($current), 2) : 0;

            if ($current->count() > 0 && $prevAvg > 0) {
                $improvement = round((($currAvg - $prevAvg) / $prevAvg) * 100, 2);
            } else {
                $improvement = 0;
            }

            $rates[] = [
                'course_name' => $courseName,
                'previous_avg' => $prevAvg,
                'current_avg' => $currAvg,
                'improvement_rate' => $improvement,
            ];
        }

        return $rates;
    }
}