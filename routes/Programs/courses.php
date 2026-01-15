<?php

use App\Http\Controllers\Programs\CourseController;
use App\Models\Course;
use Illuminate\Support\Facades\Route;

Route::prefix('programs/{program}')
    ->middleware(['auth', 'verified', 'preventBack'])
    ->scopeBindings()
    ->group(function () {

        // Create a course
        Route::post('/course/create', [CourseController::class, 'store'])->can('create', Course::class)->name('course.create');

        // Update course
        Route::put('/courses/{course}/update',  [CourseController::class, 'update'])->can('update', Course::class)->name('course.update');

        // Archive course
        Route::delete('/courses/{course}/delete',  [CourseController::class, 'archive'])->can('delete', Course::class)->name('course.archive');

        // Route for showing selected course in the program
        Route::get('/courses/{course}',  [CourseController::class, 'showCourse'])->can('viewCourse', 'course')->name('program.course.show');

        // Route for restoring the course
        Route::put('/courses/{course}/restore',  [CourseController::class, 'restoreCourse'])->can('restoreCourse', Course::class)->name('program.course.restore');
    });
