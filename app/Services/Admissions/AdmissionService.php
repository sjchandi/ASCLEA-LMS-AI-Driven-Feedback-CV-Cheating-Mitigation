<?php

namespace App\Services\Admissions;

use App\Models\Student;
use App\Models\User;
use App\Services\NotificationService;

class AdmissionService
{
    protected NotificationService  $notificationService;

    public function __construct(NotificationService  $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function getAdmins()
    {
        $admins = User::whereHas('role', function ($q) {
            $q->where('role_name',  'admin');
        })
            ->pluck('user_id')
            ->toArray();

        return $admins;
    }

    // Send notifcation  to addmins when student submit  files for admission
    public function  sendAdmissionNotification(Student $student)
    {
        $admins = $this->getAdmins();

        // Create title and body for notification
        $title = "New Admission Pending";
        $body = "{$student->user->first_name} {$student->user->last_name} has a new admission that requires approval. Please review it.";

        // Creates url where user can navigate the notification
        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/admission/pending/{$student->student_id}";

        // Notify the user
        $this->notificationService->notifyUsers($admins, $title,  $body, $actionUrl);
    }
}
