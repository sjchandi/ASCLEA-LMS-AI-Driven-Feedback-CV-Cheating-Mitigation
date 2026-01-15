<?php

namespace App\Http\Controllers\Programs;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Program;
use App\Services\Programs\ProgramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ProgramController extends Controller
{
    protected ProgramService $programService;

    public function __construct(ProgramService $programService)
    {
        $this->programService = $programService;
    }

    public function listPrograms()
    {

        $query = Program::select('program_id', 'program_name', 'program_description', 'background_image');

        // Check is user is not admin
        if (Auth::user()->role->role_name !== 'admin') {
            // Get the programs where the user is a member of
            $query->whereHas('learningMembers', function ($query) {
                $query->where('user_id', Auth::id());
            })
                ->latest()
                ->get();
        }

        return  $query->latest()->get();
    }

    // Display the program page
    public function index()
    {
        // Program::select('program_id', 'program_name', 'background_image')->latest()->get()
        return Inertia::render('Programs/Programs', [
            'program_list' => fn() => $this->listPrograms()
        ]);
    }

    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'program_name' => 'required|max:255',
            'program_description' => 'string|nullable',
        ]);

        // Create program
        $program = Program::create($validated);

        $course_list = $request->all()['course_list'];

        // Check if course_list is array and has value
        if (is_array($course_list) && !empty($course_list)) {
            foreach ($course_list as $key => $course) {
                $course['program_id'] = $program->program_id; // Add program_id FK
                Course::create($course); // Store course in courses table
            }
        }

        // Send notification
        $title = "New Program Created";
        $body = "The program {$program->program_name} has been successfully created by {$request->user()->first_name} {$request->user()->last_name} and added to the system.";

        // Creates url where user can navigate the notification
        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/programs";

        $this->programService->sendProgramNotification($request, $title, $body, $actionUrl);

        // Return a flash success 
        return back()->with('success', 'Program created successfully.');
    }

    // Handle updating the program details
    public function update(Request $req, Program $program)
    {

        $validated = $req->validate([
            'program_name'  => [
                'required',
                'max:255',
                Rule::unique('programs')->ignore($program->program_id, 'program_id'), // Ignore unique validation for current program that is updating
            ],
            'program_description' => 'string|nullable',
        ]);

        $program->update($validated);

        // Return a flash success 
        return back()->with('success', 'Program updated successfully.');
    }

    // Handle archiving program through soft delete
    public function archive(Request $request, Program $program)
    {

        // Check of program has no courses, if tru delete it permanently
        if ($program->courses->isEmpty()) {
            $program->forceDelete();

            return to_route('programs.index')->with('success', 'Program deleted successfully.');
        }

        $program->update([
            'archived_by' => $request->user()->user_id
        ]);
        $program->delete();

        // Send notification
        $title = "Program Archived";
        $body = "The program {$program->program_name} has been archived by {$request->user()->first_name} {$request->user()->last_name} and is no longer active in the system.";

        // Creates url where user can navigate the notification
        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/archives";

        $this->programService->sendProgramNotification($request, $title, $body, $actionUrl);

        return to_route('programs.index')->with('success', 'Program archived successfully.');
    }

    public function listCourses($program)
    {

        $query = $program->courses();

        // Check if user is not admin return, get only courses assigned to the user
        if (Auth::user()->role->role_name !== 'admin') {
            // Check if the course is assigned to the suer
            $query->whereHas('assignedTo', function ($query) use ($program) {
                $memberId = Auth::user()->programs->where('program_id', $program->program_id)
                    ->first()->learning_member_id;  // Get the learning member id

                $query->where('learning_member_id', $memberId); // Check if the course was assigned to the users learning member id
            });
        }

        return $query->latest()
            ->select([
                'course_id',
                'course_code',
                'course_name',
                'course_description',
                'updated_at'
            ])
            ->get();
    }

    // Show the selected program
    public function showProgram(Program $program, Request $req)
    {
        // Return a prop containing the program data
        return Inertia::render('Programs/ProgramComponent/ProgramContent', [
            // Program data
            'program' => fn() => $program->only(['program_id', 'program_name', 'program_description', 'background_image']),

            // List of courses
            'courses' => fn() => $this->listCourses($program),

            // Members of the program
            // Return only if specifically requested / when people was rendered
            'members' => Inertia::optional(fn() => $this->getLearningMembers($program, $req->input('role'), $req->input('search'))),
        ]);
    }



    public function getLearningMembers($program, $role, $search)
    {

        // Query for listing the users in the learning members table
        $members = $program->learningMembers()
            ->whereHas('user', function ($query) {
                $query->whereNull('deleted_at'); // Exclude soft-deleted users
            })
            // Get user data from users table
            ->with([
                'user' => fn($query) => $query
                    ->select('user_id', 'role_id', 'first_name', 'last_name', 'email', 'profile_image')
                    ->with([
                        'role' => fn($query) => $query->select('role_id', 'role_name') // Get the user role
                    ])
            ]);

        // FIlter based on roles
        if ($role) {
            $members->whereHas('user.role', function ($query) use ($role) {
                $query->where('role_name', $role); // Get users based on the role
            });
        }

        // FIlter based on search
        if ($search) {

            // Get suers based on search query
            $members->whereHas('user', function ($query) use ($search) {
                $query->whereLike('first_name', "%$search%")
                    ->orWhereLike('last_name', "%$search%")
                    ->orWhereLike('email', "%$search%")
                    ->orwhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]); // Allows searching for both first and last name
            });
        }

        return $members->orderBy('created_at', 'desc')->orderBy('learning_member_id', 'desc')->paginate(10, ['*'], 'members')->withQueryString();
    }

    // This function validates the added course in the program form
    public function validateAddedCourse(Request $req)
    {
        $req->validate([
            'course_code' => "string|nullable",
            'course_name' => "required|string|max:255",
            'course_description' => "string|nullable",
            'course_day' => "string|nullable|required_with:start_time,end_time",
            'start_time' => "string|nullable|date_format:H:i|required_with:end_time",
            'end_time' => "string|nullable|date_format:H:i|after:start_time|required_with:start_time",
        ]);

        return back()->with('message', "Course validated successfully.");
    }

    public function updateBackground(Program $program, Request $req)
    {

        if ($req->hasFile('background_image')) {
            $image = $req->background_image;
            $path = $image->store('programBackgroundImages', 'public');

            if ($program->background_image) {
                Storage::disk('public')->delete($program->background_image);
            }

            $program->background_image = $path;
            $program->save();

            return back()->with(['success' => 'Backgroung image updated successfully.']);
        }

        return back()->withErrors(['background_image' => 'No file uploaded.']);
    }
}
