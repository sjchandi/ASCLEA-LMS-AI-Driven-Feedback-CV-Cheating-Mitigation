<?php

namespace App\Policies\Programs;

use App\Models\Course;
use App\Models\programs\Assessment;
use App\Models\User;

class AssessmentPolicy
{

    public function getAssessments(User $user, string $courseId): bool
    {
        // Check if user is an admin
        // If not check whether the user was assigned to the course
        $isAuthorized = $user->role->role_name == "admin" || $user->programs()->whereHas('courses', function ($query) use ($courseId) {
            $query->where('course_id', $courseId);
        })->exists();

        return $isAuthorized;
    }

    public function viewAssessment(User $user, Assessment $assessment, string $courseId): bool
    {
        // User can view the assessment if they are admin 
        // A faculty assigned to the course
        // A student assigned  to the course and course was published
        $isAdmin = $user->role->role_name == "admin";
        $isFaculty = $user->role->role_name == "faculty";
        $isPublished = $assessment->status === "published";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($courseId) {
            $query->where('course_id', $courseId);
        })->exists();

        $isAuthorized = $isAdmin || ($isCourseAssigned && ($isFaculty || $isPublished));

        return $isAuthorized;
    }

    public function createAssessment(User $user, Course $course): bool
    {

        // Check if user is an admin
        // If not check whether the user is faculty and the course was assigned
        $isAdmin = $user->role->role_name == "admin";
        $isFaculty = $user->role->role_name === 'faculty';
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();

        $isAuthorized = $isAdmin  || ($isFaculty && $isCourseAssigned);

        return  $isAuthorized;
    }

    public function updateAssessment(User $user, Assessment $assessment): bool
    {
        $isAuthor = $assessment->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return  $isAuthorized;
    }

    public function archiveAssessment(User $user, Assessment $assessment): bool
    {
        $isAuthor = $assessment->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return  $isAuthorized;
    }

    public function restoreAssessment(User $user, string $assessmentId): bool
    {
        // Get the instace of model since model binding
        // is not working for soft deleted data
        $assessment = Assessment::withTrashed()->findOrFail($assessmentId);

        $isAuthor = $assessment->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return  $isAuthorized;
    }

    public function accessEditQuizForm(User $user, Assessment $assessment): bool
    {
        $isAuthor = $assessment->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return  $isAuthorized;
    }

    public function viewAssessmentFile(User $user, Assessment $assessment, string $courseId): bool
    {
        // User can view the assessment if they are admin 
        // A faculty assigned to the course
        // A student assigned  to the course and course was published
        $isAdmin = $user->role->role_name == "admin";
        $isFaculty = $user->role->role_name == "faculty";
        $isPublished = $assessment->status === "published";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($courseId) {
            $query->where('course_id', $courseId);
        })->exists();

        $isAuthorized = $isAdmin || ($isCourseAssigned && ($isFaculty || $isPublished));

        return $isAuthorized;
    }

    public function downloadAssessmentFile(User $user, Assessment $assessment, string $courseId): bool
    {
        // User can download assessment file if user is an admin
        //  Or user is a faculty and course was assigned

        $isAdmin = $user->role->role_name == "admin";
        $isFaculty = $user->role->role_name == "faculty";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($courseId) {
            $query->where('course_id', $courseId);
        })->exists();

        $isAuthorized = $isAdmin || ($isFaculty && $isCourseAssigned);

        return $isAuthorized;
    }

    public function viewAssessmentResponses(User $user, Assessment $assessment,): bool
    {
        $isAuthor = $assessment->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return $isAuthorized;
    }

    public function generateQuizResponsesFeedback(User $user, Assessment $assessment,): bool
    {
        $isAuthor = $assessment->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return $isAuthorized;
    }

    public function downloadAssessmentResponsesData(User $user, Assessment $assessment): bool
    {
        $isAdmin = $user->role->role_name == "admin";
        $isAuthor = $assessment->created_by === $user->user_id;

        $isAuthorized = $isAdmin || $isAuthor;

        return $isAuthorized;
    }

    public function  resetAssessment(User $user, Assessment $assessment): bool
    {
        $isAdmin = $user->role->role_name == "admin";
        $isAuthor = $assessment->created_by === $user->user_id;

        $isAuthorized = $isAdmin || $isAuthor;

        return $isAuthorized;
    }
}
