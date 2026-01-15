<?php

namespace App\Services\Programs;

use App\Models\Course;
use App\Models\Program;
use App\Models\Programs\Post;
use App\Models\User;
use App\Services\NotificationService;

class PostService
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function savePost(array $validatedData, string $courseId, string $userId)
    {
        $validatedData['course_id'] = $courseId;
        $validatedData['created_by'] = $userId;

        $post = Post::create($validatedData);

        return $this->getPostCompleteDetails($post);
    }

    public function listPosts(string $courseId, User $user)
    {
        $postList = Post::where('course_id', $courseId)
            ->with(['author:user_id,first_name,last_name'])
            ->withTrashed()
            ->when($user->role->role_name === 'student', function ($q) {
                $q->where('status', 'published')
                    ->whereNull('deleted_at');
            })
            ->orderBy('created_at', 'desc')
            ->orderBy('Post_id', 'desc')
            ->paginate(5);


        return $postList;
    }

    public function updatePost(Post $post, array $updatedData, bool $isUnpublish = false)
    {
        // Check if the request is only for unpublishing the post
        if ($isUnpublish) {
            // Only udpates the post status
            $post->update(['status' => 'draft']);
        } else {
            $post->update($updatedData);
        }

        $post->refresh();

        return $this->getPostCompleteDetails($post);
    }

    public function archivePost(Post $post)
    {
        $post->delete(); // Soft delete the post

        return  $this->getPostCompleteDetails($post);
    }

    public function restorePost(string $postId)
    {
        // Get the instace of model since model binding
        // is not working for soft deleted data
        $post = Post::withTrashed()->findOrFail($postId);

        $post->restore();

        return  $this->getPostCompleteDetails($post);
    }

    public function getPostCompleteDetails(Post $post)
    {
        return $post->load('author:user_id,first_name,last_name');
    }

    public function getUsersToNotify($courseId)
    {
        $users = User::where(function ($query) use ($courseId) {
            $query->whereHas('programs.courses', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })
                ->orWhereHas('role', function ($q) {
                    $q->where('role_name', 'admin');
                });
        })
            ->where('user_id', '!=', request()->user()->user_id)
            ->pluck('user_id')
            ->toArray();

        return $users;
    }

    public function sendNewPostNotification(Post $newPost, Course $course, Program $program)
    {
        $users = $this->getUsersToNotify($course->course_id);

        $title = "New post available";
        $body = "A new post {$newPost->post_title} is now available in {$course->course_name}.";

        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/programs/{$program->program_id}/courses/{$course->course_id}";

        $this->notificationService->notifyUsers($users, $title, $body, $actionUrl);
    }
}
