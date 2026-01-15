<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function getNotifications(Request $request)
    {
        $notifcations = $this->notificationService->getNotifications($request->user());

        return response()->json(['notifications' => $notifcations]);
    }

    public function readNotification(Notification  $notification)
    {
        $redNotification = $this->notificationService->readNotification($notification);

        return response()->json(['notification' => $redNotification]);
    }

    public function readAllNotifications(Request $request)
    {
        $this->notificationService->markAllAsRead($request->user());

        $redNotifications = $this->notificationService->getNotifications($request->user());

        return response()->json(['redNotifications' => $redNotifications]);
    }

    public function clearAllNotifications(Request $request)
    {
        $request->user()->notifications()->delete();
    }
}
