<?php

use App\Http\Controllers\Programs\AssessmentSubmissionController;
use App\Http\Controllers\CV\DetectedCheatingController;
use App\Http\Middleware\EnsureValidChildParentModel;
use App\Models\Programs\AssessmentSubmission;
use Illuminate\Support\Facades\Route;

Route::prefix('courses/{course}/assessments/{assessment}/')
    ->middleware(['auth', 'verified', 'preventBack', EnsureValidChildParentModel::class])
    ->group(function () {

        // Route for displaying the quiz instructions page
        Route::get('quizzes/{quiz}/instruction', [AssessmentSubmissionController::class, 'showQuizInstruction'])->can('viewQuizInstruction', [AssessmentSubmission::class, 'assessment', 'course'])->name('assessment.quiz.instruction');

        // Route to display the quiz asnwer form for student
        Route::get('quizzes/{quiz}/response', [AssessmentSubmissionController::class, 'showQuizAnswerForm'])->can('viewQuizAnswerForm', [AssessmentSubmission::class, 'assessment', 'course'])->name('assessment.quizzes.quiz');

        // Route for validating if required questions was completed
        Route::post('quizzes/{quiz}/assessment-submissions/{assessmentSubmission}/validate', [AssessmentSubmissionController::class, 'validateRequiredQuestions'])->can('validateRequiredQuestion', ['assessmentSubmission', 'assessment', 'course'])->name('assessment.quiz.validate');

        // Route for displaying the submitted page
        Route::get('quizzes/{quiz}/submitted', [AssessmentSubmissionController::class, 'showSubmittedPage'])->can('viewSubmittedPage', [AssessmentSubmission::class, 'assessment', 'course'])->name('quizzes.quiz.submitted.page');

        // Route for submitting the quiz
        Route::post('quizzes/{quiz}/assessment-submissions/{assessmentSubmission}', [AssessmentSubmissionController::class, 'submitQuiz'])->can('submitQuiz', ['assessmentSubmission', 'assessment'])->name('quizzes.quiz.submit');

        // Route for showing the quiz result 
        Route::get('quizzes/{quiz}/assessment-submissions/{assessmentSubmission}/result', [AssessmentSubmissionController::class, 'showQuizResult'])->can('viewQuizResult', ['assessmentSubmission', 'assessment', 'quiz'])->name('quizzes.quiz.result');

        // Route for showing the quiz result 
        Route::post('quizzes/{quiz}/assessment-submissions/{assessmentSubmission}/result/ai/feedback', [AssessmentSubmissionController::class, 'quizResultFeedback'])->can('generateQuizResultFeedback', 'assessmentSubmission')->name('generate.quiz.result.feedback');

        // Reset student assessment submission
        Route::delete('quizzes/{quiz}/assessment-submissions/{assessmentSubmission}', [AssessmentSubmissionController::class, 'resetStudentSubmission'])->can('resetStudentAssessmentSubmission', [AssessmentSubmission::class, 'assessment'])->name('reset.student.assessment.submission');

        // Route for uploading activity files
        Route::put('activity/files', [AssessmentSubmissionController::class, 'uploadActivityFiles'])->can('uploadActivityFile', [AssessmentSubmission::class, 'course'])->name('upload.activity.files');

        // Route for displaying the activity files
        Route::get('assessment-submissions/{assessmentSubmission}/activity-files/{file}/stream', [AssessmentSubmissionController::class, "streamAcitvityFiles"])->can('viewActivityFile', ['assessmentSubmission', 'assessment'])->name('activity.file.stream');

        // Route for deleting the uploaded activity files
        Route::delete('assessment-submissions/{assessmentSubmission}/activity-files/{file}', [AssessmentSubmissionController::class, "removeUploadedFile"])->can('removeActivityFile', 'assessmentSubmission')->name('activity.file.remove');

        // Route for submitting the activity
        Route::put('activity/submit', [AssessmentSubmissionController::class, 'submitActivity'])->can('submitActivity', [AssessmentSubmission::class, 'course'])->name('activity.submit');

        // Route for grading activity
        Route::put('assessment-submissions/{assessmentSubmission}/activity/grade', [AssessmentSubmissionController::class, 'gradeActivity'])->can('gradeActivity', [AssessmentSubmission::class, 'assessment'])->name('grade.activity');

        // Route for returning graded activity
        Route::put('/activity/return', [AssessmentSubmissionController::class, 'returnActivity'])->can('returnGradedActivity', [AssessmentSubmission::class, 'assessment'])->name('return.activity');
    });

Route::post('/detected-cheatings', [DetectedCheatingController::class, 'store'])
    ->name('detected-cheatings.store')
    ->middleware(['auth', 'verified']);

Route::get('/detected-cheatings/{assessment_submission_id}', [DetectedCheatingController::class, 'fetchBySubmission'])
    ->name('detected-cheatings.fetch')
    ->middleware(['auth', 'verified']);

Route::post('/tab-switching', [DetectedCheatingController::class, 'storeTabDetect'])
    ->name('tab-switching.store')
    ->middleware(['auth', 'verified']);

Route::get('/tab-switching/{assessment_submission_id}', [DetectedCheatingController::class, 'fetchTabDetectBySubmission'])
    ->name('tab-switching.fetch')
    ->middleware(['auth', 'verified']);
