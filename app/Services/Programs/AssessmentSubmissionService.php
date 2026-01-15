<?php

namespace App\Services\Programs;

use App\Models\Course;
use App\Models\Programs\ActivityFile;
use App\Models\Programs\Assessment;
use App\Models\Programs\AssessmentSubmission;
use App\Models\Programs\Quiz;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\PdfConverter;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class AssessmentSubmissionService
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function getAssignedCourseId(User $user, string $courseId,)
    {
        // Get the assigned course id of the user
        // It will be used for getting record in the assessmnt submisisons
        $assignedCourseId = $user
            ->programs()
            ->with(['courses' => function ($query) use ($courseId) {
                $query->where('course_id', $courseId);
            }])
            ->get()
            ->pluck('courses.*.assigned_course_id')
            ->flatten()
            ->first();

        return $assignedCourseId;
    }

    public function getAssessmentSubmission(string $assignedCourseId, string $assesmentId)
    {
        $assessmentSubmission = AssessmentSubmission::where('assessment_id', $assesmentId)->where('submitted_by', $assignedCourseId)->first();

        return $assessmentSubmission;
    }

    // This create the initial data of the assessment submission when the user start answering the quiz
    public function createQuizAssessmentSubmission(string $assignedCourseId, string $assessmentId, Quiz $quiz)
    {

        $endAt = null;

        // Check if quiz has a timer then set the end time
        if ($quiz->duration > 0 && $quiz->cheating_mitigation == 0) {
            $endAt = Carbon::now()->addMinutes($quiz->duration);
        }

        if ($quiz->duration > 0 && $quiz->cheating_mitigation == 1) {
            $endAt = Carbon::now()->addMinutes($quiz->duration + 1);
        }

        $questionIds = $quiz->questions()->pluck('question_id');
        // Check if randomize qquestion is enabled
        if ($quiz->randomize) {
            // Get the questions idd and shuffle it
            // This will be used to fetcch the quesstions in  random order
            $questionIds = $questionIds->shuffle();
        }

        $assessmentSubmission =  AssessmentSubmission::create(
            [
                'assessment_id' => $assessmentId,
                'submitted_by' => $assignedCourseId,
                'end_at' => $endAt,
                'question_order' => $questionIds->values()
            ]
        );

        return $assessmentSubmission;
    }

    public function getTotalScore(AssessmentSubmission $assessmentSubmission)
    {
        $answers = $assessmentSubmission->quizAnswers()->with('question')->get();

        $totalScore = 0;

        foreach ($answers as $answer) {
            if ($answer->is_correct) {
                $totalScore += $answer->question->question_points;
            }
        }

        return $totalScore;
    }

    // This is use for updating the assessment submission of the quiz when the quiz was actually submitted
    public function updateQuizAssessmentSubmission(AssessmentSubmission $assessmentSubmission, int $totalScore, ?string $submittedAt = null)
    {
        $now = Carbon::now();
        $timeSpent = null;

        // Only runs quiz has set duration
        if ($assessmentSubmission->assessment->quiz && $assessmentSubmission->assessment->quiz->duration > 0) {

            // Calculate the time spent of the user in answering the quiz
            $start = Carbon::parse($assessmentSubmission->created_at)->timestamp;
            $submitTime = Carbon::parse($submittedAt ?? $now)->timestamp;

            $timeSpent = (int)(($submitTime - $start) / 60); // This is in minutes
        }

        // Parameter $submittedAt is use to specify the time submitted for auto submitting in AutoSubmitAbandonedQuiz scheduled task
        $assessmentSubmission->update([
            'score' => $totalScore,
            'submitted_at' => $submittedAt ?? $now,
            'time_spent' => $timeSpent
        ]);
    }

    public function getPrevQuizAssessmentSubmitted(User $user, AssessmentSubmission $assessmentSubmission)
    {
        if ($user->role->role_name !== "student") {

            // Get the first submitted assessment of the student based on the current assessmentSubmission
            // Check if the assessment was also submitted by the same user
            // The id used in submitted_by was assigned_course_id it's a unique identification for each user assigned to the course
            // It also ensure that the assessment that will be fetched is in the same course
            // Last condition makes sure the the assessment is a type of quiz
            return AssessmentSubmission::where('created_at', '<', $assessmentSubmission->created_at)->where('submitted_by', $assessmentSubmission->submitted_by)->whereHas('assessment.assessmentType', function ($query) {
                $query->where('assessment_type', 'quiz');
            })->with('assessment.quiz')->orderBy('created_at', 'desc')
                ->first();
        } else {
            return null;
        }
    }

    public function updateQuizAssessmentSubmissionScore(AssessmentSubmission $assessmentSubmission, int $totalScore)
    {
        $assessmentSubmission->update(["score" => $totalScore]);
    }

    public function formatInputData(Collection $questions)
    {

        $data = $questions->map(
            function ($question) {

                if (!is_null($question->studentAnswer)) {
                    $correctAnswers = $question->options->where('is_correct', true)->pluck('option_text')->map(function ($option) {
                        return Str::squish($option); // Str::squish() removes whites spaces and tabs 
                    });

                    return [
                        "question" => $question->question,
                        "correct_answers" => $correctAnswers,
                        "student_answer" => Str::squish($question->studentAnswer->answer_text)
                    ];
                }
            }
        )->filter()->values();

        return $data;
    }

    public function generateAndSaveStudentQuizResultFeedback(array $inputData, AssessmentSubmission $assessmentSubmission)
    {
        // Content that will be used to make request 
        $userContent = [
            "responses" => $inputData
        ];
        $systemContent = "You are a teaching assistant that gives personalized feedback based on student quiz performance. Return the feedback in this structure:\n\n\"feedback\": {\n  \"strengths\": [\"string\", \"string\", ...],\n  \"weaknesses\": [\"string\", \"string\", ...],\n  \"suggestions\": [\"string\", \"string\", ...]\n}";
        $model = "ft:gpt-4.1-mini-2025-04-14:asclea:student-quiz-result-feedback:CLgTtEyF";

        $data = AIFeedbackService::getFeedback($userContent, $systemContent, $model);

        // Save the feedback in the assessment submission data
        $assessmentSubmission->update(['feedback' => $data]);
    }

    public function saveActivityFiles(array $activityFiles, AssessmentSubmission $assessmentSubmission)
    {
        $uploadedFiles = [];
        $now = Carbon::now(); // Get current to use for timesptamps

        foreach ($activityFiles as $index => $file) {

            // Store the files in private storage
            $originalFilePath = $file->store('activityFiles');

            $mimeType = $file->getMimeType();
            $newFilePath = null;

            // Check if the file is pptx or docx type
            if (in_array($mimeType, [
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ])) {

                $inputFile = storage_path('app/private/' . $originalFilePath); // Get the complete file path
                $fileName = pathinfo($originalFilePath, PATHINFO_FILENAME); // Get the file name
                $outputFile = storage_path('app/private/activityFiles/' . $fileName); // Set the file path and file name of the converted file

                // Custom fucntion that handle pdf conversion
                PdfConverter::convertToPdf($inputFile, $outputFile);

                // Set the new file path for the converted file
                $newFilePath = "activityFiles/" . $fileName . ".pdf";
            }

            $data = [
                'activity_file_id' => (string) Str::uuid(),
                'assessment_submission_id' => $assessmentSubmission->assessment_submission_id,
                'file_path' => $newFilePath ?? $originalFilePath, // Check for new file path, indicates the files was converted to pdf
                'original_file_path' => $originalFilePath, // Always save the original file path
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'created_at' => $now,
                'updated_at' => $now,
            ];

            // Add the file data inside this array
            $uploadedFiles[$index] = $data;
        }

        // Save the files data in the table
        ActivityFile::insert($uploadedFiles);
    }

    public function removeActivityFile(ActivityFile $file)
    {
        // If file_path is not equal to original_file_path, it means it was converted to pdf
        // And we have to delete the original file
        if ($file->file_path !== $file->original_file_path) {
            // Remove the two files
            Storage::delete($file->original_file_path);
        }

        Storage::delete($file->file_path);

        $file->delete();
    }

    // Delete the assesmsent submission when the user remove all the uploaded activity files
    public function removeAssessmentSubmission(AssessmentSubmission $assessmentSubmission)
    {
        if ($assessmentSubmission->activityFiles->count() === 0) {
            $assessmentSubmission->delete();
        }
    }

    public function submitActivity(string $assignedCourseId, string $assessmentId)
    {
        // Find or Create assessment submission when thse user submit the activity
        // In this way we can allow activity submission even the student has no uploaded file
        $assessmentSubmission = AssessmentSubmission::firstOrCreate(
            [
                'assessment_id' => $assessmentId,
                'submitted_by' => $assignedCourseId,
            ],
            ['submission_status' => 'not_submitted']
        );

        if ($assessmentSubmission->submission_status === "not_submitted") {
            // Then we updated the submisison status and set the submitted time
            $assessmentSubmission->update(['submission_status' => 'submitted', 'submitted_at' => Carbon::now()]);
        } else if ($assessmentSubmission->submission_status === "submitted") {
            // For unsubmititng
            $assessmentSubmission->update(['submission_status' => 'not_submitted', 'submitted_at' => null, 'score' => 0]);
        }
    }

    public function returnSubmittedActivities(
        bool $selectAll,
        array $selectedSubmittedActivities,
        array $unselectedSubmittedActivities,
        string $assessmentId,
        Course $course,
        Assessment $assessment
    ) {
        $assessmentSubmissions = AssessmentSubmission::where('assessment_id', $assessmentId)
            ->where('submission_status', '!=', 'not_submitted');

        if ($selectAll) {
            if (!empty($unselectedSubmittedActivities)) {
                $assessmentSubmissions->whereNotIn('assessment_submission_id', $unselectedSubmittedActivities);
            }
        } else {
            if (!empty($selectedSubmittedActivities)) {
                $assessmentSubmissions->whereIn('assessment_submission_id', $selectedSubmittedActivities);
            }
        }

        $assessmentSubmissions->update([
            'submission_status' => 'returned',
        ]);

        // Get the user ids of students with returned activity grade
        $userIds = $assessmentSubmissions->get()->pluck('submittedBy.member.user.user_id')->toArray();

        // Send notifcation
        $this->sendActivityGradeNotification($course,  $assessment, $userIds);
    }

    public function sendActivityGradeNotification(Course $course, Assessment $assessment, array $userIds)
    {
        // Send notification
        $title = "Activity Graded";
        $body = "The activity {$assessment->assessment_title} has been graded. Check your results now.";

        // Creates url where user can navigate the notification
        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/programs/{$course->program->program_id}/courses/{$course->course_id}/assessments/{$assessment->assessment_id}";

        // Notify the user
        $this->notificationService->notifyUsers($userIds, $title,  $body, $actionUrl);
    }
}
