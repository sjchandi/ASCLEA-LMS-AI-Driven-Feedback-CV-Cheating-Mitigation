<?php

namespace App\Services\Programs;

use App\Models\Program;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class ProgramService
{

    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function getAdmins(Request $request)
    {
        $admins = User::whereHas('role', function ($q) {
            $q->where('role_name',  'admin');
        })
            ->where('user_id', '!=', $request->user()->user_id)
            ->pluck('user_id')
            ->toArray();

        return $admins;
    }

    public function sendProgramNotification(Request $request, string $title, string $body, string $actionUrl)
    {
        $admins = $this->getAdmins($request);

        // Notify the user
        $this->notificationService->notifyUsers($admins, $title,  $body, $actionUrl);
    }
}
