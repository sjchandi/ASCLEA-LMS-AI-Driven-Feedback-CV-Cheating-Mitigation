<?php

use App\Http\Controllers\Notification\NotificationController;
use Illuminate\Support\Facades\Route;

Route::prefix('notifications')
    ->middleware(['auth', 'verified'])
    ->group(function () {

        Route::get('/', [NotificationController::class, 'getNotifications'])->name('get.notifications');

        Route::put('/read-all', [NotificationController::class, 'readAllNotifications'])->name('read.all.notifications');

        Route::put('/{notification}', [NotificationController::class, 'readNotification'])->name('read.notification');

        Route::delete('/clear-all', [NotificationController::class, 'clearAllNotifications'])->name('clear.all.notifications');
    });
