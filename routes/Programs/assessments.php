<?php

use App\Http\Controllers\Programs\AssessmentController;
use App\Models\Programs\Assessment;
use Illuminate\Support\Facades\Route;

Route::prefix('programs/{program}/courses/{course}')
    ->middleware(['auth', 'verified', 'preventBack'])
    ->group(function () {

        // Create assesmsent
        Route::post('/assessments/create', [AssessmentController::class, 'createAssessment'])->can('createAssessment', [Assessment::class, 'course'])->name('assessment.create');

        // Get assessments
        Route::get('/assessments', [AssessmentController::class, 'listAssessments'])->can('getAssessments', [Assessment::class, 'course'])->name('program.course.assessments');

        // Route for viewing assessment
        Route::get('/assessments/{assessment}', [AssessmentController::class, 'showAssessment'])->can('viewAssessment', ['assessment', 'course'])->name('program.course.assessment.view');

        // Update assessment
        Route::put('/assessments/{assessment}/update', [AssessmentController::class, 'updateAssessment'])->can('updateAssessment', 'assessment')->name('assessment.update');

        // Unppulsh assessment
        Route::put('/assessments/{assessment}/unpublish', [AssessmentController::class, 'unPublishAssessment'])->can('updateAssessment', 'assessment')->name('assessment.unpublish');

        // Archive assessment
        Route::delete('/assessments/{assessment}/archive', [AssessmentController::class, 'archiveAssessment'])->can('archiveAssessment', 'assessment')->name('assessment.archive');

        // Restore assessment
        Route::put('/assessments/{assessment}/restore', [AssessmentController::class, 'restoreAssessment'])->can('restoreAssessment', [Assessment::class, 'assessment'])->name('assessment.restore');

        // Route for viewing file page
        Route::get('/assessments/{assessment}/files/{file}', [AssessmentController::class, "viewFile"])->can('viewAssessmentFile', ['assessment', 'course'])->name('program.course.file.view');

        // Route for displaying the file
        Route::get('/assessments/{assessment}/assessment-files/{file}/stream', [AssessmentController::class, "streamAssessmentFile"])->can('viewAssessmentFile', ['assessment', 'course'])->name('program.course.file.stream');

        // ROute for downloading the file
        Route::get('/assessments/{assessment}/assessment-files/{file}/download', [AssessmentController::class, "downloadAssessmentFile"])->can('downloadAssessmentFile', ['assessment', 'course'])->name('program.course.file.download');

        // Route for viewing assessment responses
        Route::get('/assessments/{assessment}/responses', [AssessmentController::class, 'showAssessmentResponse'])->can('viewAssessmentResponses', 'assessment')->name('assessment.responses.view');

        // Route for geferating student analytics feedback
        Route::post('/assessments/{assessment}/responses/ai/feedback', [AssessmentController::class, 'quizResponsesFeedback'])->can('generateQuizResponsesFeedback', 'assessment')->name('generate.quiz.responses.feedback');

        // Route for exporting activity reponses to pdf
        Route::get('/assessments/{assessment}/activity/export/pdf', [AssessmentController::class, 'exportActivityResponsesToPdf'])->can('downloadAssessmentResponsesData', 'assessment')->name('activity.responses.export.pdf');

        // Route for exporting activity reponses to csv
        Route::get('/assessments/{assessment}/activity/export/csv', [AssessmentController::class, 'exportActivityResponsesToCsv'])->can('downloadAssessmentResponsesData', 'assessment')->name('activity.responses.export.csv');

        // Route for exporting quiz reponses to pdf
        Route::get('/assessments/{assessment}/quiz/export/pdf', [AssessmentController::class, 'exportQuizResponsesToPdf'])->can('downloadAssessmentResponsesData', 'assessment')->name('quiz.responses.export.pdf');

        // Route for exporting quiz reponses to csv
        Route::get('/assessments/{assessment}/quiz/export/csv', [AssessmentController::class, 'exportQuizResponsesToCsv'])->can('downloadAssessmentResponsesData', 'assessment')->name('quiz.responses.export.csv');

        // Reset the the responses of assessment
        Route::delete('/assessments/{assessment}/reset', [AssessmentController::class, 'resetAssessment'])->can('resetAssessment', 'assessment')->name('assessment.reset');
    });
