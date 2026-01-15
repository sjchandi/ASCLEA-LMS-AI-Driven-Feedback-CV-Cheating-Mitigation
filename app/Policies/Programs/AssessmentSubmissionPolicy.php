<?php

namespace App\Policies\Programs;

use App\Models\Course;
use App\Models\Programs\Assessment;
use App\Models\Programs\AssessmentSubmission;
use App\Models\Programs\Quiz;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Access\Response;

class AssessmentSubmissionPolicy
{
    public function viewQuizInstruction(User $user, Assessment $assessment, Course $course): bool
    {
        // User is student
        // User was assigned in course
        // Assessment was published

        $isStudent = $user->role->role_name === "student";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();
        $isPublished = $assessment->status === "published";

        $isAuthorized = $isCourseAssigned && $isPublished && $isStudent;

        return $isAuthorized;
    }

    public function viewQuizAnswerForm(User $user, Assessment $assessment, Course $course): bool
    {
        $isStudent = $user->role->role_name === "student";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();
        $isPublished = $assessment->status === "published";


        $isAuthorized = $isCourseAssigned && $isPublished && $isStudent;

        return $isAuthorized;
    }

    public function validateRequiredQuestion(User $user, AssessmentSubmission $assessmentSubmission, Assessment $assessment, Course $course): bool
    {
        // User is student
        // Course is assigned
        // Assessment submission is not yet submitted
        // Assessment is not past due date

        $isStudent = $user->role->role_name === "student";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();
        $isNotSubmitted = $assessmentSubmission->submitted_at === null;
        // If assessment is has no due date return true, if not check if its past due data
        $isNotPastDueDate = !is_null($assessment->due_datetime) ? $assessment->due_datetime > Carbon::now() : true;
        $isPublished = $assessment->status === "published";
        $isAssessmentSubmissionAuthor = $assessmentSubmission->submittedBy->member->user->user_id === $user->user_id;

        $isAuthorized = $isStudent && $isCourseAssigned && $isNotSubmitted && $isNotPastDueDate && $isPublished &&  $isAssessmentSubmissionAuthor;

        return $isAuthorized;
    }

    public function viewSubmittedPage(User $user, Assessment $assessment, Course $course): bool
    {
        $isStudent = $user->role->role_name === "student";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();
        $isPublished = $assessment->status === "published";

        $isAuthorized = $isCourseAssigned && $isPublished && $isStudent;

        return $isAuthorized;
    }

    public function submitQuiz(User $user, AssessmentSubmission $assessmentSubmission, Assessment $assessment): bool
    {
        $isAssessmentSubmissionAuthor = $assessmentSubmission->submittedBy->member->user->user_id === $user->user_id;
        $isAssessmentSubmissionNotYetSubmitted = is_null($assessmentSubmission->submitted_at);
        $isPublished = $assessment->status === "published";

        $isAuthorized = $isAssessmentSubmissionAuthor && $isAssessmentSubmissionNotYetSubmitted && $isPublished;

        return $isAuthorized;
    }

    public function viewQuizResult(User $user, AssessmentSubmission $assessmentSubmission, Assessment $assessment, Quiz $quiz): bool
    {
        $isAssessmentAuthor = $assessment->author->user_id === $user->user_id;
        $isAssessmentSubmissionAuthor = $assessmentSubmission->submittedBy->member->user->user_id === $user->user_id;
        $isPublished = $assessment->status === "published";
        $isAllowedToShow = $quiz->show_answers_after;
        $isAuthorized = false;

        // Admin and faculty author of the assessment can only view the quiz result if its submitted
        if ($user->role->role_name !== 'student' && $isAssessmentAuthor) {
            $isAuthorized = !is_null($assessmentSubmission->submitted_at);
        }
        // Other admin that is not the author of the assessment can view quiz result only if its published and already submitted
        else if ($user->role->role_name === 'admin' && !$isAssessmentAuthor) {
            $isAuthorized = $isPublished && !is_null($assessmentSubmission->submitted_at);
        }
        // Students can view their result only if its published and ther're the one submitted 
        else if ($user->role->role_name == 'student') {
            $isAuthorized = $isPublished && $isAssessmentSubmissionAuthor && $isAllowedToShow;
        }

        return $isAuthorized;
    }

    public function generateQuizResultFeedback(User $user, AssessmentSubmission $assessmentSubmission)
    {
        $isAssessmentSubmissionAuthor = $assessmentSubmission->submittedBy->member->user->user_id === $user->user_id;

        return $isAssessmentSubmissionAuthor;
    }

    public function uploadActivityFile(User $user, Course $course)
    {
        $isStudent = $user->role->role_name === "student";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();

        $isAuthorized = $isStudent && $isCourseAssigned;

        return $isAuthorized;
    }

    public function viewActivityFile(User $user, AssessmentSubmission $assessmentSubmission, Assessment $assessment)
    {
        $isAdmin = $user->role->role_name === "admin";
        $isAssessmentSubmissionAuthor = $assessmentSubmission->submittedBy->member->user->user_id === $user->user_id;
        $isAssessmentAuthor = $assessment->author->user_id === $user->user_id;

        $isAuthorized = $isAdmin || $isAssessmentSubmissionAuthor || $isAssessmentAuthor;

        return $isAuthorized;
    }

    public function removeActivityFile(User $user, AssessmentSubmission $assessmentSubmission)
    {
        $isAssessmentSubmissionAuthor = $assessmentSubmission->submittedBy->member->user->user_id === $user->user_id;

        return $isAssessmentSubmissionAuthor;
    }

    public function submitActivity(User $user, Course $course)
    {
        $isStudent = $user->role->role_name === "student";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();

        $isAuthorized = $isStudent && $isCourseAssigned;

        return $isAuthorized;
    }

    public function gradeActivity(User $user, Assessment $assessment)
    {
        $isAssessmentAuthor = $assessment->author->user_id === $user->user_id;

        return $isAssessmentAuthor;
    }

    public function returnGradedActivity(User $user, Assessment $assessment)
    {
        $isAssessmentAuthor = $assessment->author->user_id === $user->user_id;

        return $isAssessmentAuthor;
    }

    public function resetStudentAssessmentSubmission(User $user, Assessment $assessment)
    {
        $isAdmin = $user->role->role_name === "admin";
        $isAssessmentAuthor = $assessment->author->user_id === $user->user_id;

        return $isAssessmentAuthor || $isAdmin;
    }
}
