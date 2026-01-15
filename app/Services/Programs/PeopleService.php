<?php

namespace App\Services\Programs;

use App\Models\Course;
use App\Models\LearningMember;
use App\Models\Program;
use App\Models\Role;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class PeopleService
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService  = $notificationService;
    }

    public function getUsersToList(Program $program, Request $request)
    {
        $programId = $program->program_id;

        // Inital query without filter or search
        // Get users that is not an admin and not a member of the program
        $result = User::with('role')->select('user_id', 'first_name', 'last_name', 'email', 'profile_image', 'role_id')->whereHas('role', function ($query) {
            $query->where('role_name', '!=', 'admin'); // Filter out admin users
        })->whereNotNull('email_verified_at')->whereNotIn('user_id', function ($query) use ($programId) {
            $query->select('user_id')
                ->from('learning_members')
                ->where('program_id', $programId)
                ->whereNull('deleted_at'); // Select users that is not a member of the current program
        })->where(function ($query) {
            $query->whereHas('student', function ($q) {
                $q->whereNotNull('approved_at'); // Filter users that has student relationship and not approved
            })
                ->orWhereDoesntHave('student'); // Include users with no student relationship specifically faculty
        });

        if ($role = $request->input('role')) {
            $filteredRoleId = Role::where('role_name', $role)->value('role_id'); // Get the filtered role from the request query

            $result->where('role_id', '=', $filteredRoleId); // Filter based on the role
        }
        // Searching is after filtering role to ensure that the user that will be search is only based on the role
        if ($search = $request->input('search')) {

            // Filter based on the search value from 3 columns
            $result->where(function ($query) use ($search) {
                $query->whereLike('first_name', "%$search%")
                    ->orWhereLike('last_name', "%$search%")
                    ->orWhereLike('email', "%$search%")
                    ->orwhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]); // Allows searching for both first and last name
            });
        }

        // Sort and paginate by 10
        return $result->orderBy('created_at', 'desc')->orderBy('user_id', 'desc')->paginate(10);
    }


    public function getUsersToAdd(Program $program, Request $request)
    {
        $programId = $program->program_id;

        if ($request->is_select_all) {
            $users = User::query();

            // Retrieve users that not is a member of the current program and not an admin
            $users->whereHas('role', function ($q) {
                $q->where('role_name', '!=', 'admin');
            })->whereDoesntHave('programs', function ($query) use ($programId) {
                $query->where('program_id', $programId);
            });

            if (!empty($req->unselected_users)) {
                // Rerieve users that are not unselected and not an admin
                $users->whereHas('role', function ($q) {
                    $q->where('role_name', '!=', 'admin');
                })->whereNotIn('user_id', $req->unselected_users);
            }

            // Select all users similar to the search
            if ($search = $request->search) {
                $users->where(function ($query) use ($search) {
                    $query->whereLike('first_name', "%$search%")
                        ->orWhereLike('last_name', "%$search%")
                        ->orWhereLike('email', "%$search%")
                        ->orwhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]); // Allows searching for both first and last name
                });
            }

            // Select all users similar to the filter
            if ($filter = $request->filter) {
                $users->whereHas('role', function ($query) use ($filter) {
                    $query->where('role_name', $filter);
                });
            }

            $users = $users->pluck('user_id')->toArray();
        } else {
            $users = User::whereIn('user_id', $request->selected_users)
                ->whereDoesntHave('programs', function ($query) use ($programId) { // Filter out users that already member 
                    $query->where('program_id', $programId);
                })
                ->pluck('user_id')->toArray(); // Retrieve users based on the selected IDs
        }

        return $users;
    }

    public function sendNewCourseNotifcation(array $courses, Program $program, LearningMember $member)
    {
        if (count($courses) === 1) {
            $course = Course::where('course_id', $courses[0])
                ->select('course_name')
                ->first();

            $title = "New Course Assigned";
            $body = "The course \"" . $course->course_name . "\" has been assigned to you.";
        } else {
            $title = "New Courses Assigned";
            $body = count($courses) . " new courses have been assigned to you.";
        }

        // Creates url where user can navigate the notification
        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/programs/{$program->program_id}/members/{$member->learning_member_id}";

        // Notify the user
        $this->notificationService->notifyUser($member->user->user_id, $title,  $body, $actionUrl);
    }

    public function sendAddedProgramNotifcation(array $users, Program $program)
    {
        $title = "You’ve Been Added to a Program";
        $body = "You’ve been successfully added to the program {$program->program_name}. Start exploring your courses anytime.";

        // Creates url where user can navigate the notification
        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/programs/{$program->program_id}";

        // Notify the user
        $this->notificationService->notifyUsers($users, $title,  $body, $actionUrl);
    }
}
