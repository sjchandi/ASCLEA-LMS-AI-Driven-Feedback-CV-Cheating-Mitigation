<?php

namespace App\Policies\Programs;

use App\Models\Course;
use App\Models\Programs\Section;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SectionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewSetionList(User $user, Course $course): bool
    {
        // Check if user is an admin
        $isAdmin = $user->role->role_name == "admin";
        // If not check whether the user was assigned to the course
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();

        $isAuthorized = $isAdmin || $isCourseAssigned;

        return $isAuthorized;
    }

    /**
     * Determine whether the user can create models.
     */
    public function createSection(User $user): bool
    {
        // Check if user is an admin
        $isAdmin = $user->role->role_name == "admin";

        return $isAdmin;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function updateSection(User $user, Section $section): bool
    {
        // Check if user is an admin
        $isAdmin = $user->role->role_name == "admin";

        return $isAdmin;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function archiveSection(User $user, Section $section): bool
    {
        // Check if user is an admin
        $isAdmin = $user->role->role_name == "admin";

        return $isAdmin;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restoreSection(User $user, string $sectionId): bool
    {
        // Check if user is an admin
        $isAdmin = $user->role->role_name == "admin";

        return $isAdmin;
    }
}
