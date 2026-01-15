<?php

namespace App\Http\Controllers\Programs;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Programs\SaveQuizRequest;
use App\Models\Programs\Assessment;
use App\Models\Programs\Quiz;
use App\Services\Programs\QuestionService;
use App\Services\Programs\QuizService;
use Inertia\Inertia;

class QuizController extends Controller
{
    protected QuizService $quizService;

    // protected QuestionService $questionService;

    public function __construct(QuizService $quizService, QuestionService $questionService)
    {
        $this->quizService = $quizService;
        // $this->questionService = $questionService;
    }

    public function showEditQuizForm(Assessment $assessment, Quiz $quiz)
    {

        return Inertia::render('Programs/ProgramComponent/CourseComponent/CourseContentTab/AssessmentsComponents/Features/QuizForm/QuizForm', [
            'courseId' => $assessment->course_id,
            'assessmentId' => $assessment->assessment_id,
            'quiz' => $this->quizService->getQuizCompleteDetails($quiz),
        ]);
    }

    public function updateQuizDetails(SaveQuizRequest $req, Assessment $assessment, Quiz $quiz)
    {

        $validatedQuizDetails = $req->validated();

        $this->quizService->saveUpdatedQuizDetails($validatedQuizDetails, $quiz);

        return response()->json('Quiz changes was successfully saved.');
    }
}
