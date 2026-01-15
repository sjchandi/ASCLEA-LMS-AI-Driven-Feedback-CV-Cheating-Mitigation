<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PaymentHistory\PaymentHistoryController;

Route::prefix('payment-history')
    ->middleware(['auth', 'verified', 'preventBack'])
    ->group(function () {

        // Admin: list of paid students
        Route::get('/', [PaymentHistoryController::class, 'paidStudents'])
            ->name('paymenthistory.index');

        // Other payment-related routes (store, update, archive, files...)
        Route::post('/payments', [PaymentHistoryController::class, 'storePayment'])
            ->name('paymenthistory.payment.store');

        Route::get('/payments/{userId}/export-csv', [PaymentHistoryController::class, 'exportCsv'])
            ->name('paymenthistory.export.csv');

        Route::get('/payments/{userId}/export-pdf', [PaymentHistoryController::class, 'exportPdf'])
            ->name('paymenthistory.export.pdf');

        Route::get('/payment-info/{paymentId}', [PaymentHistoryController::class, 'viewPaymentInfo'])
            ->name('paymenthistory.paymentInfo.view');

        Route::put('/payments-info/{paymentId}', [PaymentHistoryController::class, 'updatePayment'])
            ->name('paymenthistory.payment.update');

        Route::delete('/payment-info/{paymentId}', [PaymentHistoryController::class, 'archivePayment'])
            ->name('paymenthistory.payment.archive');

        Route::patch('/payment-info/{paymentId}', [PaymentHistoryController::class, 'restorePayment'])
            ->name('paymenthistory.payment.restore');

        Route::get('/payment-info/{paymentId}/files/{fileId}', [PaymentHistoryController::class, 'viewPaymentFile'])
            ->name('paymenthistory.payment.file.view');

        Route::get('/payment-info/{paymentId}/files/{fileId}/stream', [PaymentHistoryController::class, 'streamPaymentFile'])
            ->name('paymenthistory.payment.file.stream');

        Route::get('/payment-info/{paymentId}/files/{fileId}/download', [PaymentHistoryController::class, 'downloadPaymentFile'])
            ->name('paymenthistory.payment.file.download');

        Route::put('/payment-info/{paymentId}/files/{fileId}/restore', [PaymentHistoryController::class, 'restoreFile'])
            ->name('paymenthistory.payment.file.restore');

        // Payment history for any user (admin or student)
        Route::get('/user/{userId}', [PaymentHistoryController::class, 'paymentHistory'])
            ->name('paymenthistory.payment.history');
    });

    Route::prefix('student-payment-history')
        ->middleware(['auth', 'verified', 'preventBack'])
        ->group(function () {

            Route::get('/', [PaymentHistoryController::class, 'myPaymentHistory'])
                ->name('student.paymenthistory.me');

            Route::get('/payment-info/{paymentId}', [PaymentHistoryController::class, 'viewPaymentInfo'])
                ->name('student.paymenthistory.paymentInfo.view');

            Route::get('/payment-info/{paymentId}/files/{fileId}', [PaymentHistoryController::class, 'viewPaymentFile'])
                ->name('student.paymenthistory.payment.file.view');

            Route::get('/payment-info/{paymentId}/files/{fileId}/stream', [PaymentHistoryController::class, 'streamPaymentFile'])
                ->name('student.paymenthistory.payment.file.stream');
        });


    








