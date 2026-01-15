<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class NotificationService
{
    private string $notificationRoute;

    public function __construct()
    {
        // Set the url where the nootification will be sent real time
        $baseUrl = config('app.vite_main_url');
        $port = config('app.vite_socket_io_port');

        // If port is empty, use base URL (for HTTPS proxy)
        $this->notificationRoute = $port
            ? "{$baseUrl}:{$port}/notify"
            : "{$baseUrl}/notify";
    }

    public function notifyUser(string $userId, string $title, string $body, ?string $actionUrl = null)
    {
        // Creates notification in database
        $newNotification = Notification::create([
            'notifiable_id' => $userId,
            'notification_title' => $title,
            'notification_body' => $body,
            'action_url' => $actionUrl,
            'read_at' => null,
        ]);

        // Send notification in the socket server
        Http::post($this->notificationRoute, [
            'notifications' => [$newNotification]
        ]);
    }

    public function notifyUsers(array $userIds, string $title, string $body, ?string $actionUrl = null)
    {
        $notifications = [];

        foreach ($userIds as $userId) {
            $notifications[]  = [
                'notification_id' => Str::uuid(),
                'notifiable_id' => $userId,
                'notification_title' => $title,
                'notification_body' => $body,
                'read_at' =>  null,
                'action_url' => $actionUrl,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Save notifcation to database
        Notification::insert($notifications);

        // Send notification in the socket server
        Http::post($this->notificationRoute, [
            'notifications' =>  $notifications
        ]);
    }

    public function getNotifications(User $user)
    {
        $notifcations = $user
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->get();

        return $notifcations;
    }

    public function readNotification(Notification $notification)
    {
        $notification->update(['read_at' => now()]);

        return $notification->refresh();
    }

    public function markAllAsRead(User $user)
    {
        $user->notifications()
            ->whereNull('read_at')
            ->update(['read_at' =>  now()]);
    }
}
