<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Student;
use App\Models\Admission\AdmissionFile;
use App\Http\Controllers\Admission\AdmissionFileController;

// Admission Page
Route::get('/admission', [AdmissionFileController::class, 'index'])
    ->middleware(['auth', 'verified', 'preventBack', 'checkRole:admin,student,faculty,skipvalidation'])
    ->name('admission.index');

// Admin Routes
Route::prefix('admission')
    ->middleware(['auth', 'verified', 'preventBack', 'checkRole:admin'])
    ->group(function () {

        // List pending students
        Route::get('/pending', [AdmissionFileController::class, 'getPendingStudents'])
            ->name('pending.students');

        // View specific pending student
        Route::get('/pending/{student}', [AdmissionFileController::class, 'viewPendingStudent'])
            ->name('pending.student.view');

        // Update student info
        Route::put('/enrolled/{student}', [AdmissionFileController::class, 'updateStudent'])
            ->name('admission.updateStudent');

        // Update admission/enrollment status
        Route::put('/update-status/{id}', [AdmissionFileController::class, 'updateStatus'])
            ->name('admission.updateStatus');

        // Archive student
        Route::delete('/students/{student}/archive', [AdmissionFileController::class, 'archive'])
            ->name('students.archive');

        // Restore student
        Route::put('/students/{student}/restore', [AdmissionFileController::class, 'restoreStudent'])
            ->name('student.restore');

        // Update profile photo
        Route::put('/students/{student}/update-profile', [AdmissionFileController::class, 'updateProfile'])
            ->name('student.profile.update');

        // Export Pending Students
        Route::get('/admissions/pending/export-csv', [AdmissionFileController::class, 'exportCsv'])
            ->name('admissions.pending.exportCsv');

        Route::get('/admissions/pending/export-pdf', [AdmissionFileController::class, 'exportPdf'])
            ->name('admissions.pending.exportPdf');

        // Export Enrolled Students
        Route::get('/admissions/enrolled/export-csv', [AdmissionFileController::class, 'exportEnrolledCsv'])
            ->name('admissions.enrolled.exportCsv');

        Route::get('/admissions/enrolled/export-pdf', [AdmissionFileController::class, 'exportEnrolledPdf'])
            ->name('admissions.enrolled.exportPdf');

        // Stream admission file
        Route::get('/admission/{student}/admission-files/{file}/stream', [AdmissionFileController::class, 'streamAdmissionFile'])
            ->name('admission.file.stream');

        // Download admission file
        Route::get('/admission/{student}/admission-files/{file}/download', [AdmissionFileController::class, 'downloadAdmissionFile'])
            ->name('admission.file.download');
    });

//Admin and Faculty Routes
Route::prefix('admission')
    ->middleware(['auth', 'verified', 'preventBack', 'checkRole:admin,faculty'])
    ->group(function () {

        // Enrolled list
        Route::get('/enrolled', [AdmissionFileController::class, 'getEnrolledStudents'])
            ->name('enrolled.students');

        // View specific enrolled student
        Route::get('/enrolled/{student}', [AdmissionFileController::class, 'viewEnrolledStudent'])
            ->name('enrolled.student.view');

        Route::get('/admission/{student}/export/{format}', [AdmissionFileController::class, 'exportStudentData'])
            ->name('admission.export.student');
    });


//student Routes
Route::prefix('admission')
    ->middleware(['auth', 'verified', 'preventBack', 'checkRole:student,skipvalidation'])
    ->group(function () {

        // Route to upload admission files
        Route::post('/upload-admission-files', [AdmissionFileController::class, 'store'])
            ->name('admissionfiles.upload');
    });
