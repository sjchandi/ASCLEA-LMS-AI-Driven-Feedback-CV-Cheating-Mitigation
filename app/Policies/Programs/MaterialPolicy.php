<?php

namespace App\Policies\Programs;

use App\Models\Course;
use App\Models\Programs\Material;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class MaterialPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewMaterialList(User $user, Course $course): bool
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
     * Determine whether the user can view the model.
     */
    public function viewMaterial(User $user, Material $material, Course $course): bool
    {
        // User can view the material if they are admin 
        // A faculty assigned to the course
        // A student assigned  to the course and course was published
        $isAdmin = $user->role->role_name == "admin";
        $isFaculty = $user->role->role_name == "faculty";
        $isPublished = $material->status === "published";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();

        $isAuthorized = $isAdmin || ($isCourseAssigned && ($isFaculty || $isPublished));

        return $isAuthorized;
    }

    /**
     * Determine whether the user can create models.
     */
    public function createMaterial(User $user, Course $course): bool
    {
        $isAdmin = $user->role->role_name == "admin";
        $isFaculty = $user->role->role_name === 'faculty';
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();

        $isAuthorized = $isAdmin  || ($isFaculty && $isCourseAssigned);
        return  $isAuthorized;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function updateMaterial(User $user, Material $material): bool
    {
        $isAuthor = $material->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return  $isAuthorized;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function archiveMaterial(User $user, Material $material): bool
    {
        $isAuthor = $material->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return  $isAuthorized;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restoreMaterial(User $user, string $materialId): bool
    {
        // Get the instace of model since model binding
        // is not working for soft deleted data
        $material = Material::withTrashed()->findOrFail($materialId);

        $isAuthor = $material->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return  $isAuthorized;
    }

    /**
     * Determine whether the user can view material file.
     */
    public function viewMaterialFile(User $user, Material $material, Course $course): bool
    {
        // User can view the material  file if they are admin 
        // A faculty assigned to the course
        // A student assigned  to the course and course was published
        $isAdmin = $user->role->role_name == "admin";
        $isFaculty = $user->role->role_name == "faculty";
        $isPublished = $material->status === "published";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();

        $isAuthorized = $isAdmin || ($isCourseAssigned && ($isFaculty || $isPublished));

        return $isAuthorized;
    }

    public function downloadMaterialFile(User $user, Material $material, Course $course): bool
    {
        // User can download material file if user is an admin
        //  Or user is a faculty and course was assigned 

        $isAdmin = $user->role->role_name == "admin";
        $isFaculty = $user->role->role_name == "faculty";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();

        $isAuthorized = $isAdmin || ($isFaculty && $isCourseAssigned);

        return $isAuthorized;
    }
}
