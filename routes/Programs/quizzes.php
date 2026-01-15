<?php

use App\Http\Controllers\Programs\QuizController;
use App\Models\Programs\Quiz;
use Illuminate\Support\Facades\Route;

Route::prefix('assessments/{assessment}/quiz-form/')
    ->middleware(['auth', 'verified', 'preventBack'])
    ->group(function () {

        // Route to display the edit page of quiz
        Route::get('{quiz}/edit', [QuizController::class, 'showEditQuizForm'])->can('viewEditQuizForm', [Quiz::class, 'assessment'])->name('assessment.quiz-form.edit');

        // Route for updating quiz details
        Route::put('{quiz}/update', [QuizController::class, 'updateQuizDetails'])->can('updateQuiz', [Quiz::class, 'assessment'])->name('assessment.quiz-form.update');
    });
