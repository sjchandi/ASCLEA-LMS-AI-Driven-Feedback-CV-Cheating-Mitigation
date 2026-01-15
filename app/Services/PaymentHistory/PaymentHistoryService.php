<?php

namespace App\Services\PaymentHistory;

use App\Models\PaymentHistory\Payment;
use App\Services\NotificationService;

class PaymentHistoryService
{
    protected NotificationService  $notificationService;

    public function __construct(NotificationService  $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function sendPaymentHistoryNotification(Payment $payment)
    {
        // Create title and body for notification
        $title = "Payment History Available";
        $body = "The payment history has been updated and is now accessible. You may review the information at your convenience.";

        // Creates url where user can navigate the notification
        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/student-payment-history/payment-info/{$payment->payment_id}";

        // Notify the user
        $this->notificationService->notifyUser($payment->user_id, $title,  $body, $actionUrl);
    }
}
