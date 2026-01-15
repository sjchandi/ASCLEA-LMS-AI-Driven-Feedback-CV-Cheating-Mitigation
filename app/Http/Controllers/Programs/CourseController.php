<?php

namespace App\Http\Controllers\Programs;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Program;
use App\Services\Programs\CourseService;
use App\Services\Programs\GradeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CourseController extends Controller
{

    protected GradeService $gradeService;
    protected CourseService $courseService;

    public function __construct(GradeService $gradeService, CourseService $courseService)
    {
        $this->gradeService = $gradeService;
        $this->courseService = $courseService;
    }

    // Create a course
    public function store(Program $program, Request $request)
    {

        // Validate user input
        $validated = $this->validateCourse($request->all());

        // Add the foreign key
        $validated['program_id'] = $program->program_id;

        $course = Course::create($validated);

        // Send  Noification
        $title = "New Course Created";
        $body = "The course {$course->course_name} has been successfully created by {$request->user()->first_name} {$request->user()->last_name} in the program {$program->program_name}.";

        // Creates url where user can navigate the notification
        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/programs/{$program->program_id}";

        $this->courseService->sendCourseNotification($request, $title, $body, $actionUrl);

        return back()->with('success', 'Course created successfully.');
    }

    // Update course
    public function update(Program $program, Course $course, Request $req)
    {

        // Validate user input
        $validated = $this->validateCourse($req->all());

        $course->update($validated);

        return back()->with('success', 'Course updated successfully.');
    }

    // Archive course
    public function archive(Request $request, Program $program, Course $course)
    {
        $course->update([
            'archived_by' => $request->user()->user_id
        ]);

        $course->delete();

        // Send  Noification
        $title = "Course Archived";
        $body = "The course {$course->course_name} has been archived by {$request->user()->first_name} {$request->user()->last_name} and is no longer active in the system.";

        // Creates url where user can navigate the notification
        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/archives";

        $this->courseService->sendCourseNotification($request, $title, $body, $actionUrl);

        return to_route('program.show', $course->program)->with('success', 'Course archived successfully.');
    }

    public function restoreCourse($programId, $courseId)
    {
        $course = Course::withTrashed()->findOrFail($courseId);
        $program = Program::withTrashed()->findOrFail($programId);

        // If program was archived restore it first
        if (!is_null($program->deleted_at)) {
            $program->restore();
            $program->update([
                'archived_by' => null
            ]);
        }

        $course->restore();
        $course->update([
            'archived_by' => null
        ]);

        return redirect()->back()->with('success', 'Course restored successfully.');
    }

    // Show selected course
    public function showCourse(Request $request, Program $program, Course $course)
    {

        return Inertia::render(
            'Programs/ProgramComponent/CourseComponent/CourseContent',
            [
                'program' => fn() => $program->only(['program_id']),
                'course' => fn() => $course->only(['course_id', 'course_code', 'course_name', 'course_description', 'course_day', 'start_time', 'end_time']),
                'students' => fn()  =>  $this->gradeService->getStudentsToBeGraded($request, $course)
            ]
        );
    }

    public function validateCourse($data)
    {
        $validator = Validator::make($data, [
            'course_code' => "string|nullable",
            'course_name' => "required|string|max:255",
            'course_description' => "string|nullable",
            'course_day' => "string|nullable|required_with:start_time,end_time",
            'start_time' => "string|nullable|date_format:H:i|required_with:end_time",
            'end_time' => "string|nullable|date_format:H:i|after:start_time|required_with:start_time",
        ]);

        // Send an error message to front end
        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        return $validator->validated();
    }
}
