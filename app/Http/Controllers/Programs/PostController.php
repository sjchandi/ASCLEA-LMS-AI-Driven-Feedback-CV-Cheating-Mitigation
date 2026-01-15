<?php

namespace App\Http\Controllers\Programs;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Program;
use App\Models\Programs\Post;
use App\Services\Programs\PostService;
use Illuminate\Http\Request;

class PostController extends Controller
{
    protected PostService $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function createPost(Request $request, Program $program, Course $course)
    {
        $validatedData = $request->validate([
            'post_title' => 'required|string|max:255',
            'post_description' => 'required|string',
            'status' => 'required|in:published,draft',
        ]);

        $newPost = $this->postService->savePost($validatedData, $course->course_id, $request->user()->user_id);

        // Send notification
        if ($newPost->status === 'published') {
            $this->postService->sendNewPostNotification($newPost, $course, $program);
        }

        return response()->json(['success' => "Post created successfully.", 'data' => $newPost]);
    }

    public function getPosts(Request $request, Program $program, Course $course)
    {
        $postList = $this->postService->listPosts($course->course_id, $request->user());

        return response()->json($postList);
    }

    public function updatePost(Request $request, Program $program, Course $course, Post $post)
    {
        $validatedData = $request->validate([
            'post_title' => 'required|string|max:255',
            'post_description' => 'required|string',
            'status' => 'required|in:published,draft',
        ]);

        $updatedPost = $this->postService->updatePost($post, $validatedData);

        // Send notification
        if ($updatedPost->status === 'published') {
            $this->postService->sendNewPostNotification($updatedPost, $course, $program);
        }

        return response()->json(['success' => "Post updated successfully.", 'data' => $updatedPost]);
    }

    public function unpublishPost(Request $request, Program $program, Course $course, Post $post)
    {
        $unpublishedPost = $this->postService->updatePost($post, [], true);

        return response()->json(['success' => "Post unpublished successfully.", 'data' => $unpublishedPost]);
    }

    public function archivePost(Program $program, Course $course, Post $post)
    {
        $archivedPost = $this->postService->archivePost($post);

        return response()->json(["success" => "Post archived successfully.", "data" => $archivedPost]);
    }

    public function restorePost(Program $program, Course $course,  $post)
    {
        $restoredPost = $this->postService->restorePost($post);

        return response()->json(["success" => "Post restored successfully.", "data" => $restoredPost]);
    }
}
