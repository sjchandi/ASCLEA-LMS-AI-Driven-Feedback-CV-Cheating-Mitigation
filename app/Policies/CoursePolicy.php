<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        $role = $user->role?->role_name;
        return in_array($role, ['admin', 'faculty', 'student'], true);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function viewCourse(User $user, Course $course): bool
    {
        if ($user->role->role_name === 'admin') {
            return true;
        } else {

            $programId = $course->program->program_id;

            // Check if the user is member of the program
            $learningMember = $user->programs->where('program_id', $programId)->first();

            if ($learningMember) {
                $learningMemberId = $learningMember->learning_member_id; // Get the learning member id

                // Check if course was assigned to the user
                return $course->assignedTo()->where('learning_member_id',  $learningMemberId)->exists();
            }

            // If user is not a member of the profram return false
            return false;
        }
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Check if the auth user has a role admin
        return $user->role->role_name === 'admin';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user): bool
    {
        // Check if the auth user has a role admin
        return $user->role->role_name === 'admin';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user): bool
    {
        // Check if the auth user has a role admin
        return $user->role->role_name === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restoreCourse(User $user): bool
    {
        // Check if the auth user has a role admin
        return $user->role->role_name === 'admin';
    }
}
