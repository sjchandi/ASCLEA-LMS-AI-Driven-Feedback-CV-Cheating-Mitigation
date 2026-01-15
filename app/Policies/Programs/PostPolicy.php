<?php

namespace App\Policies\Programs;

use App\Models\Course;
use App\Models\Programs\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PostPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function viewPosts(User $user, Course $course): bool
    {
        // Can view the list of posts if user is an admin or course was assigned
        $isAdmin = $user->role->role_name == "admin";
        $isCourseAssigned = $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();

        return $isAdmin || $isCourseAssigned;
    }

    /**
     * Determine whether the user can create models.
     */
    public function createPost(User $user, Course $course): bool
    {
        // Check if user is an admin
        $isAdmin =  $user->role->role_name === 'admin';

        // If not check whether the user is faculty and the course was assigned
        $isFacultyAndAssigned =  $user->role->role_name === 'faculty' && $user->programs()->whereHas('courses', function ($query) use ($course) {
            $query->where('course_id', $course->course_id);
        })->exists();

        return $isAdmin || $isFacultyAndAssigned;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function updatePost(User $user, Post $post): bool
    {
        $isAuthor = $post->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return  $isAuthorized;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function archivePost(User $user, Post $post): bool
    {
        $isAuthor = $post->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return  $isAuthorized;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restorePost(User $user, string $postId): bool
    {
        // Manually find the post since model binding dont work on soft deleted  model
        $post = Post::withTrashed()->findOrFail($postId);

        $isAuthor = $post->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return  $isAuthorized;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Post $post): bool
    {
        return false;
    }
}
