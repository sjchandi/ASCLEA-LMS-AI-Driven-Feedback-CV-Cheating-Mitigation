<?php

namespace App\Services\Programs;

use App\Models\Course;
use App\Models\Program;
use App\Models\Programs\Assessment;
use App\Models\Programs\AssessmentFile;
use App\Models\Programs\AssessmentType;
use App\Models\Programs\Quiz;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\PdfConverter;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class AssessmentService
{

    protected SectionService $sectionService;
    protected SectionItemService $sectionItemService;
    protected NotificationService $notificationService;

    public function __construct(SectionService $sectionService, SectionItemService $sectionItemService, NotificationService $notificationService)
    {
        $this->sectionService = $sectionService;
        $this->sectionItemService = $sectionItemService;
        $this->notificationService = $notificationService;
    }

    public function saveAssessment(array $validatedAssessment, string $courseId)
    {

        // Get the id of assessment types
        $typeId = AssessmentType::where('assessment_type', $validatedAssessment['assessment_type'])->value('assessment_type_id');

        // Set value of other columns
        $validatedAssessment['course_id'] = $courseId;
        $validatedAssessment['created_by'] = Auth::user()->user_id;
        $validatedAssessment['assessment_type_id'] = $typeId;
        $validatedAssessment['total_points'] = empty($validatedAssessment['total_points'])  ? 0 : $validatedAssessment['total_points'];

        $assessment = Assessment::create($validatedAssessment);

        return $assessment;
    }

    public function saveAssessmentFiles(array $assessmentFiles, Assessment $assessment)
    {
        $uploadedFiles = [];
        $now = Carbon::now(); // Get current to use for timesptamps

        foreach ($assessmentFiles as $index => $file) {

            // Store the files in private storage
            $originalFilePath = $file->store('assessmentFiles');

            $mimeType = $file->getMimeType();
            $newFilePath = null;

            // Check if the file is pptx or docx type
            if (in_array($mimeType, [
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ])) {

                $inputFile = storage_path('app/private/' . $originalFilePath); // Get the complete file path
                $fileName = pathinfo($originalFilePath, PATHINFO_FILENAME); // Get the file name
                $outputFile = storage_path('app/private/assessmentFiles/' . $fileName); // Set the file path and file name of the converted file

                // Custom fucntion that handle pdf conversion
                PdfConverter::convertToPdf($inputFile, $outputFile);

                // Set the new file path for the converted file
                $newFilePath = "assessmentFiles/" . $fileName . ".pdf";
            }

            $data = [
                'assessment_file_id' => (string) Str::uuid(),
                'assessment_id' => $assessment->assessment_id,
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
        AssessmentFile::insert($uploadedFiles);
    }

    // Quiz form will only be created when the user creates an assessment with a type of quiz,
    // since we need the id of the created assessment to use it as reference in the quiz table
    // other opretaions related to quiz will be handled in the QuizService
    public function createInitialQuizForm(Assessment $assessment)
    {
        // Create the inital quiz that will be used to start form editing with initial quiz title
        $initialQuizDta = [
            'assessment_id' => $assessment->assessment_id,
            'quiz_title' => "Edit Quiz"
        ];

        Quiz::create($initialQuizDta);
    }

    public function getAssessments(string $courseId)
    {
        $user = Auth::user();

        // Query for getting all related data of the assessment
        // also get soft deleted assessment but with conditon
        // that it only displays assessment deleted by the user
        $assessmentList = Assessment::where('course_id', $courseId)
            ->with([
                'assessmentType',
                'author:user_id,first_name,last_name',
                'quiz:assessment_id,quiz_id,quiz_title',
                'files:assessment_id,assessment_file_id,file_name,file_path'
            ])
            ->withTrashed()
            ->when($user->role->role_name === 'student', function ($q) {
                $q->where('status', 'published')
                    ->whereNull('deleted_at');
            })
            ->whereDoesntHave('sectionItem') // Only gets assessments not created in section
            ->select(
                'assessment_id',
                'assessment_type_id',
                'created_by',
                'assessment_title',
                'assessment_description',
                'status',
                'course_id',
                'due_datetime',
                'total_points',
                'created_at',
                'updated_at',
                'deleted_at'
            )
            ->orderBy('created_at', 'desc')
            ->orderBy('assessment_id', 'desc')
            ->paginate(5);


        return $assessmentList;
    }

    public function updateAssessment(Assessment $assessment, array $updatedData, bool $isUnpublish = false)
    {
        // Check if the request is inly forn unplishin the assessment
        if ($isUnpublish) {
            $assessment->update(['status' => 'draft']);
        } else {
            $assessment->update($updatedData);
        }

        return $assessment->refresh();
    }


    public function getAssessmentCompleteDetails(Assessment $assessment)
    {
        // Return all relevant data of assessment and hide unecessary data
        return $assessment->makeHidden(
            [
                'feedback'
            ]
        )->load([
            'assessmentType',
            'author:user_id,first_name,last_name',
            'quiz:assessment_id,quiz_id,quiz_title',
            'files:assessment_id,assessment_file_id,file_name,file_path',
        ]);
    }

    public function removeAssessmentFiiles(array $removedFiles)
    {
        // Loop through each file and remove it
        foreach ($removedFiles as $removedFileId) {
            $file = AssessmentFile::find($removedFileId);

            if (Storage::disk('local')->exists($file->file_path)) {
                // Check if file is not equal to original
                // If not it means the files was converted and it also has to deleted the original file
                if ($file->file_path !== $file->original_file_path) {
                    // Remove the two files
                    Storage::delete([$file->file_path, $file->original_file_path]);
                } else {
                    Storage::delete($file->file_path);
                }
            }

            $file->delete();
        }
    }

    public function archiveAssessment(Assessment $assessment)
    {
        $assessment->delete(); // Soft delete the assessment

        return  $this->getAssessmentCompleteDetails($assessment);
    }

    public function restoreAssessment(string $assessmentId)
    {
        // Get the instace of model since model binding
        // is not working for soft deleted data
        $assessment = Assessment::withTrashed()->findOrFail($assessmentId);

        $assessment->restore();

        return  $this->getAssessmentCompleteDetails($assessment);
    }

    public function getUsersToNotify($courseId)
    {
        $users = User::where(function ($query) use ($courseId) {
            $query->whereHas('programs.courses', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })
                ->orWhereHas('role', function ($q) {
                    $q->where('role_name', 'admin');
                });
        })
            ->where('user_id', '!=', request()->user()->user_id)
            ->pluck('user_id')
            ->toArray();

        return $users;
    }

    public function sendAssessmentNotification(Assessment $assessment, Course $course, Program $program)
    {
        $users = $this->getUsersToNotify($course->course_id);

        $title = "New assessment available";
        $body = "A new assessment {$assessment->assessment_title} is now available in {$course->course_name}.";

        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/programs/{$program->program_id}/courses/{$course->course_id}/assessments/{$assessment->assessment_id}";

        $this->notificationService->notifyUsers($users, $title, $body, $actionUrl);
    }
}
