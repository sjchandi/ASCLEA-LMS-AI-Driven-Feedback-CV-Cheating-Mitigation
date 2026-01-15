<?php

namespace App\Policies\Programs;

use App\Models\Programs\Assessment;
use App\Models\User;

class QuizPolicy
{
    // Determine wether the user can access the edit quiz form of the assessment
    public function viewEditQuizForm(User $user, Assessment $assessment): bool
    {
        // Admin and author can view the quiz edit form
        $isAuthor = $assessment->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return $isAuthorized;
    }

    // Determine wether use can update the quiz details
    public function updateQuiz(User $user, Assessment $assessment): bool
    {
        // Admin and author can edit the quiz form
        $isAuthor = $assessment->created_by === $user->user_id;
        $isAdmin = $user->role->role_name == "admin";

        $isAuthorized = $isAuthor || $isAdmin;

        return $isAuthorized;
    }
}
