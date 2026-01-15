<?php

namespace App\Http\Controllers\Programs;

use App\Http\Controllers\Controller;
use App\Http\Requests\Programs\SaveAssessmentRequest;
use App\Models\Course;
use App\Models\Program;
use App\Models\Programs\Assessment;
use App\Models\Programs\AssessmentFile;
use App\Services\HandlingPrivateFileService;
use App\Services\NotificationService;
use App\Services\Programs\AssessmentResponseService;
use App\Services\Programs\AssessmentService;
use App\Services\Programs\AssessmentSubmissionService;
use App\Services\Programs\SectionItemService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;


class AssessmentController extends Controller
{
    protected AssessmentService $assessmentService;
    protected AssessmentResponseService $assessmentResponseService;
    protected AssessmentSubmissionService $assessmentSubmissionService;
    protected SectionItemService $sectionItemService;

    public function __construct(AssessmentService $assessmentService, AssessmentResponseService $assessmentResponseService, AssessmentSubmissionService $assessmentSubmissionService, SectionItemService $sectionItemService)
    {
        $this->assessmentService = $assessmentService;
        $this->assessmentResponseService = $assessmentResponseService;
        $this->assessmentSubmissionService = $assessmentSubmissionService;
        $this->sectionItemService = $sectionItemService;
    }

    public function createAssessment(SaveAssessmentRequest $req, Program $program, Course $course)
    {
        $validatedAssessment = $req->validated();

        return DB::transaction(function () use ($req, $validatedAssessment, $course, $program) {
            $assessment = $this->assessmentService->saveAssessment($validatedAssessment, $course->course_id);

            // Call 2 different methods for handling each assessment type
            if ($req->hasFile("assessment_files")) {
                $this->assessmentService->saveAssessmentFiles($req->assessment_files, $assessment);
            }

            if ($req->assessment_type === "quiz") {
                $this->assessmentService->createInitialQuizForm($assessment);
            }

            // If assesssment was created through section, crerate a data for section item tables
            if (array_key_exists('section_id', $validatedAssessment) && !is_null($validatedAssessment['section_id'])) {

                $sectionItem = $this->sectionItemService->createSectionItem($validatedAssessment['section_id'], $assessment->assessment_id, Assessment::class);

                // Return the section item with material details
                return response()->json(['success' => "Assessment added in section successfully.", 'data' => $sectionItem]);
            }

            // Send notifications
            if ($assessment->status === "published") {
                $this->assessmentService->sendAssessmentNotification($assessment, $course, $program);
            }

            $assessmentCompleteDetails = $this->assessmentService->getAssessmentCompleteDetails($assessment);

            return response()->json(['success' => "Assessment created successfully.", 'data' => $assessmentCompleteDetails]);
        });
    }

    public function listAssessments($program, $course)
    {
        $assessments = $this->assessmentService->getAssessments($course);

        return response()->json($assessments);
    }

    public function updateAssessment(SaveAssessmentRequest $req, Program $program, Course $course, Assessment $assessment)
    {
        $validatedUpdatedAssessment = $req->validated();
        return DB::transaction(function () use ($req, $validatedUpdatedAssessment, $course, $program, $assessment) {
            $updatedAssessment = $this->assessmentService->updateAssessment($assessment, $validatedUpdatedAssessment);

            if (!empty($req->removed_files)) {
                $this->assessmentService->removeAssessmentFiiles($req->removed_files);
            }

            if ($req->hasFile("assessment_files")) {
                $this->assessmentService->saveAssessmentFiles($req->assessment_files, $updatedAssessment);
            }

            if ($req->assessment_type === "quiz") {
                $this->assessmentService->createInitialQuizForm($updatedAssessment);
            }

            if (array_key_exists('section_id', $validatedUpdatedAssessment) && !is_null($validatedUpdatedAssessment['section_id'])) {
                $sectionItem = $this->sectionItemService->updateSectionItem($updatedAssessment->sectionItem);

                // Return the section item with material details
                return response()->json(['success' => "Material added in section successfully.", 'data' => $sectionItem]);
            }

            // Send notifications
            if ($assessment->status === "published") {
                $this->assessmentService->sendAssessmentNotification($assessment, $course, $program);
            }

            $updatedAssessmentData = $this->assessmentService->getAssessmentCompleteDetails($updatedAssessment);

            return response()->json(['success' => "Assessment updated sucessfully.", 'data' => $updatedAssessmentData]);
        });
    }

    // Independent controller that handle unpublishing of assessment
    public function unPublishAssessment($program, $course, Assessment $assessment)
    {
        // Update the status of assessment
        // With true parameter indicating that the function was called for updating assessment status to draft
        $udpatedAssessment = $this->assessmentService->updateAssessment($assessment, [], true);

        // Get the updated data what will be returned in reponse
        $updatedAssessmentData = $this->assessmentService->getAssessmentCompleteDetails($udpatedAssessment);

        return response()->json(['success' => "Assessment unpublished sucessfully.", 'data' => $updatedAssessmentData]);
    }

    public function archiveAssessment($program, $course, Assessment $assessment)
    {
        $archivedAssessment = $this->assessmentService->archiveAssessment($assessment);

        return response()->json(["success" => "Assessment " .  ($assessment->sectionItem ? "deleted" : "archived") .  " successfully.", "data" => $archivedAssessment]);
    }

    public function restoreAssessment($program, $course,  $assessment)
    {
        $restoredAssessment = $this->assessmentService->restoreAssessment($assessment);

        return response()->json(["success" => "Assessment restored successfully.", "restoredAssessment" => $restoredAssessment]);
    }

    public function showAssessment(Request $request, $program, $course, Assessment $assessment)
    {
        $assessmentType = $assessment->assessmentType->assessment_type;
        $assignedCourseId =  $this->assessmentSubmissionService->getAssignedCourseId($request->user(), $course);

        // Finds the assessmentSubmission
        if ($assessmentType === "activity" && $request->user()->role->role_name === "student") {
            $assessmentSubmission = $this->assessmentSubmissionService->getAssessmentSubmission($assignedCourseId, $assessment->assessment_id);
        }

        return Inertia::render('Programs/ProgramComponent/CourseComponent/CourseContentTab/AssessmentsComponents/ViewAssessment', [
            "programId" => $program,
            "courseId" => $course,
            "assessment" => fn() => $this->assessmentService->getAssessmentCompleteDetails($assessment)->load([
                'sectionItem.studentProgress' => function ($q) use ($assignedCourseId) {
                    $q->where('assigned_course_id', $assignedCourseId);
                },
            ]),
            // Return the uploaded file for the student null if assessmentSubmission dont exist
            "assessmentSubmission" => fn() => $assessmentType === "activity" && $request->user()->role->role_name === "student" ? $assessmentSubmission?->load('activityFiles') : null
        ]);
    }

    public function viewFile($program, $course, Assessment $assessment, AssessmentFile $file)
    {
        return Inertia::render('Programs/ProgramComponent/CourseComponent/CourseContentTab/MaterialsComponents/ViewFile', [
            'fileName' => $file->file_name,
            'programId' => $program,
            'courseId' =>  $course,
            'assessmentId' => $assessment->assessment_id,
            'fileId' => $file->assessment_file_id
        ]);
    }

    public function streamAssessmentFile($program, $course, Assessment $assessment, AssessmentFile $file)
    {
        // Use a service classs that returns the path of the private file            
        return HandlingPrivateFileService::retrieveFile($file->file_path);
    }

    public function downloadAssessmentFile($program, $course, Assessment $assessment, AssessmentFile $file)
    {
        // Use a service class that returns the file to be download
        return HandlingPrivateFileService::downloadFile($file->original_file_path, $file->file_name);
    }

    public function showAssessmentResponse(Request $request, Program $program, Course $course, Assessment $assessment)
    {
        $assessmentType = $assessment->assessmentType->assessment_type;

        return Inertia::render(
            'Programs/ProgramComponent/CourseComponent/CourseContentTab/AssessmentsComponents/Features/Response/ViewResponses',
            [
                'programId' => $program->program_id,
                'courseId' => $course->course_id,
                'assessment' => fn() => $assessment->load('assessmentType')->load('quiz')->loadCount(['assessmentSubmissions' => function ($query) {
                    $query->whereNotNull('submitted_at');
                }]),
                'responses' => fn() =>  $this->assessmentResponseService->getAssessmentResponses($request, $assessment),
                'summary' => fn() => $assessmentType === "quiz" ? $this->assessmentResponseService->getAssessmentResponsesSummary($assessment) : null,
                'frequentlyMissedQuestions' => fn() =>  $assessmentType === "quiz" ? $this->assessmentResponseService->getFrequentlyMissedQuestion($assessment) : null,
                'responsesCount' => fn() => $assessment->assessmentSubmissions()->count(),
                'gradedResponsesCount' => fn() => $assessmentType === "activity" ? $assessment->assessmentSubmissions()->where('submission_status', 'graded')->count() : null,
                'returnedResponsesCount' => fn() => $assessmentType === "activity" ? $assessment->assessmentSubmissions()->where('submission_status', 'returned')->count() : null
            ]
        );
    }

    public function quizResponsesFeedback(Request $request, Program $program, Course $course, Assessment $assessment)
    {
        $summary = $this->assessmentResponseService->getAssessmentResponsesSummary($assessment);
        $frequentlyMissedQuestions = $this->assessmentResponseService->getFrequentlyMissedQuestion($assessment)->toArray();

        $inputData = $this->assessmentResponseService->formatInputData($assessment, $summary, $frequentlyMissedQuestions);

        $feedback = $this->assessmentResponseService->generateAndSaveFeedback($inputData, $assessment);

        return response()->json($feedback);
    }

    public function exportActivityResponsesToPdf(Request $request, Program $program, Course $course, Assessment $assessment)
    {
        $responses = $this->assessmentResponseService->getAssessmentResponses($request, $assessment, false);
        $pdf = Pdf::loadView('programs.activityResponsesPdf', compact('responses', 'assessment'));
        return $pdf->download($assessment->assessment_title . ' responses.pdf');
    }

    public function exportActivityResponsesToCsv(Request $request, Program $program, Course $course, Assessment $assessment)
    {
        $responses = $this->assessmentResponseService->getAssessmentResponses($request, $assessment, false);

        $fileName = $assessment->assessment_title . ' responses.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];


        $callback = $this->assessmentResponseService->handleExportActivityResponsesToCsv($responses, $assessment);

        return response()->stream($callback, 200, $headers);
    }

    public function exportQuizResponsesToPdf(Request $request, Program $program, Course $course, Assessment $assessment)
    {
        $summary =  $this->assessmentResponseService->getAssessmentResponsesSummary($assessment);
        $frequentlyMissedQuestions = $this->assessmentResponseService->getFrequentlyMissedQuestion($assessment, null);
        $feedback = json_decode($assessment->feedback);
        $responses = $this->assessmentResponseService->getAssessmentResponses($request, $assessment, false);

        $pdf = Pdf::loadView('programs.quizResponsesPdf', compact('assessment', 'summary', 'frequentlyMissedQuestions', 'feedback', 'responses'));
        return $pdf->download($assessment->assessment_title . ' responses.pdf');
    }

    public function exportQuizResponsesToCsv(Request $request, Program $program, Course $course, Assessment $assessment)
    {
        $summary = $this->assessmentResponseService->getAssessmentResponsesSummary($assessment);
        $frequentlyMissedQuestions = $this->assessmentResponseService->getFrequentlyMissedQuestion($assessment, null);
        $feedback = json_decode($assessment->feedback);
        $responses = $this->assessmentResponseService->getAssessmentResponses($request, $assessment, false);

        $fileName = $assessment->assessment_title . ' responses.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = $this->assessmentResponseService->handleExportQuizResponsesToCsv($responses, $assessment, $summary, $frequentlyMissedQuestions, $feedback);

        return response()->stream($callback, 200, $headers);
    }

    public function resetAssessment(Program $program, Course $course, Assessment $assessment)
    {
        $this->assessmentResponseService->deleteAssessmentSubmissions($assessment);

        return back()->with('success', "Assessment reset sucessfully.");
    }
}
