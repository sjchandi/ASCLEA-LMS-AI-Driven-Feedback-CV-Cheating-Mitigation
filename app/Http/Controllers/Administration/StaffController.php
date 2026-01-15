<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Models\Administration\Staff;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

class StaffController extends Controller
{

    protected function checkAdmin()
    {
        if (!Auth::check() || Auth::user()->role->role_name !== 'admin') {
            abort(403, 'Unauthorized'); // stops execution and returns 403
        }
    }

    /**
     * Display a listing of the resource.
     * Show the administration dashboard
     */

    public function administrationIndex(Request $request)
    {
        $this->checkAdmin();

        // Fetch role IDs for 'admin' and 'faculty'
        $roleIds = Role::whereIn('role_name', ['admin', 'faculty'])->pluck('role_id')->toArray();

        // Query Staff with related user, filtered by role, lastlogin, and lastlogout
        $query = Staff::with(['user.role', 'user.lastLogin', 'user.lastLogout']) // load the user and their role
            ->whereHas('user', function ($q) use ($roleIds) {
                $q->whereIn('role_id', $roleIds);
            });

        // Search filter by first name, last name, middle name, and email
        if ($search = $request->input('search')) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('users.first_name', 'like', "%{$search}%")
                    ->orWhere('users.last_name', 'like', "%{$search}%")
                    ->orWhere('users.middle_name', 'like', "%{$search}%")
                    ->orWhere('users.email', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        //Display 10 staff per page
        $staffs = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Administration/Administration', [
            'staffs' => $staffs,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    // Load and Display Staff Displays and AssignedCourses
    public function administrationView($staffId)
    {
        $this->checkAdmin();

        $staff = Staff::with(['user.role', 'createdBy', 'assignedCourses.course.program'])
            ->findOrFail($staffId);

        // Only load assigned courses if faculty
        $assignedCourses = [];
        if ($staff->user->role->role_name === 'faculty') {
            $assignedCourses = $staff->assignedCourses()
                ->with('course.program')
                ->paginate(10)
                ->through(function ($assignedCourse) {
                    $course = $assignedCourse->course;
                    return [
                        'program_id' => optional($course->program)->program_id,
                        'program_name' => optional($course->program)->program_name,
                        'course_id' => $course->course_id ?? null,
                        'course_code' => $course->course_code ?? null,
                        'course_name' => $course->course_name ?? null,
                        'course_day' => $course->course_day ?? null,
                        'start_time' => $course->start_time ?? null,
                        'end_time' => $course->end_time ?? null,
                    ];
                });
        }

        return Inertia::render('Administration/AdministrationComponents/ViewStaff', [
            'staffDetails' => $staff,
            'assignedCourses' => $assignedCourses,
        ]);
    }

    // Export list of Staff through CSV using exportCsv() function 
    public function exportCsv()
    {
        $this->checkAdmin();

        $fileName = 'staffs.csv';

        $staffs = Staff::with('user.role')->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['Name', 'Email', 'Role', 'Status'];

        $callback = function () use ($staffs, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($staffs as $staff) {
                fputcsv($file, [
                    $staff->user ? $staff->user->first_name . ' ' . $staff->user->last_name : 'N/A',
                    $staff->user->email ?? 'N/A',
                    $staff->user && $staff->user->role ? ucfirst($staff->user->role->role_name) : 'N/A',
                    $staff->status ? ucfirst($staff->status) : 'N/A',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // Export list of Staff through pdf using exportPdf() function 
    public function exportPdf()
    {
        $this->checkAdmin();

        $staffs = Staff::with('user.role')->get();
        $pdf = Pdf::loadView('administration.staffs-pdf', compact('staffs'));
        return $pdf->download('staffs.pdf');
    }


    /**
     * Show the add staff form for creating a new resource.
     */
    public function create()
    {
        $this->checkAdmin();

        $users = User::whereNotIn('user_id', Staff::pluck('user_id'))->get();

        return Inertia::render('Staff/Create', [
            'users' => $users
        ]);
    }


    /**
     * Store a newly created resource or user in storage.
     */
    public function store(Request $request)
    {
        $this->checkAdmin();

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role_name' => 'required|in:admin,faculty',
        ]);

        $role = Role::where('role_name', $request->role_name)->firstOrFail();

        // Generate randomizes password
        $plainPassword = Str::random(12);

        // create staff user
        $user = User::create([
            'user_id' => Str::uuid(),
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'middle_name' => $request->middle_name,
            'email' => $request->email,
            'role_id' => $role->role_id,
            'password' => bcrypt($plainPassword), // temporary password
        ]);

        // Generate verification URL
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->getKey(), 'hash' => sha1($user->email)]
        );

        // Send verification email using existing verification file
        Mail::send('emails.emailVerification', [
            'url' => $verificationUrl,
            'password' => $plainPassword,  // pass the password to Blade file
        ], function ($message) use ($user) {
            $message->to($user->email);
            $message->subject('Verify Email Address');
        });

        // create staff
        Staff::create([
            'staff_id' => Str::uuid(),
            'user_id' => $user->user_id,
            'status' => 'active',
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Staff added successfully.');
    }


    /**
     * Display the specified resource or staff details.
     */
    public function show($id)
    {
        $this->checkAdmin();

        // Load the staff along with the related user info
        $staff = Staff::with('user')->findOrFail($id);

        return Inertia::render('Staff/Show', [
            'staff' => $staff,
        ]);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $this->checkAdmin();

        $staff = Staff::with(['user.role', 'createdBy'])->findOrFail($id);

        return Inertia::render('Staff/Edit', [
            'staff' => $staff
        ]);
    }


    /**
     * Update the specified resource or staff details in storage.
     */
    public function update(Request $request, $id)
    {
        $this->checkAdmin();

        $staff = Staff::with('user')->findOrFail($id);

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email,' . $staff->user->user_id . ',user_id',
            'contact_number' => 'nullable|string|max:20',
            'birthdate' => 'nullable|date',
            'gender' => 'required|in:male,female,other',
            'house_no' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'barangay' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive'
        ]);

        // Update all user info (all fields in $fillable)
        $staff->user->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'middle_name' => $request->middle_name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'birthdate' => $request->birthdate,
            'gender' => $request->gender,
        ]);

        $staff->user->update([
            'house_no' => $request->house_no,
            'region' => $request->region,
            'province' => $request->province,
            'city' => $request->city,
            'barangay' => $request->barangay,
        ]);

        $staff->update([
            'status' => $request->status,
        ]);


        return redirect()->back()->with('success', 'Staff updated successfully.');
    }


    /**
     * Remove the specified resource or staff user from storage.
     */
    public function destroy(Request $request, $id)
    {
        $this->checkAdmin();
        $staff = Staff::with('user')->findOrFail($id);

        $staff->update([
            'archived_by' => $request->user()->user_id
        ]);

        // Soft delete the staff
        $staff->delete();

        // Soft delete the user
        if ($staff->user) {
            $staff->user->delete();
        }
        return redirect()->route('administration.index')->with('success', 'Staff archived successfully.');
    }

    public function restoreStaff($staffId)
    {
        $staff = Staff::withTrashed()->findOrFail($staffId);

        // Restore the staff and user data
        $staff->restore();
        $staff->user->restore();

        // Remove the archived_by   
        $staff->update([
            'archived_by' => null
        ]);

        return redirect()->back()->with('success', 'Staff restored successfully.');
    }

    public function updateProfile(Request $request, $id)
    {
        $this->checkAdmin();

        $staff = Staff::with('user')->findOrFail($id);

        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('profile_images', 'public');

            // update profile_image on the related user
            $staff->user->update([
                'profile_image' => $path,
            ]);
        }

        return back()->with('success', 'Profile updated successfully.');
    }
}
