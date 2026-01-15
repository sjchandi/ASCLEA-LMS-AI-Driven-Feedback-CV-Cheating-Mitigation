<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    // Show profile page
    public function edit()
    {
        $user = Auth::user()->load('role');
        return Inertia::render('Profile/Profile', [
            'user' => [
                'profile_image' => $user->profile_image,
                'userId'       => $user->user_id,
                'firstName'    => $user->first_name,
                'lastName'     => $user->last_name,
                'middleName'   => $user->middle_name,
                'profileImage' => $user->profile_image,
                'birthday'     => $user->birthdate,
                'gender'       => $user->gender,
                'phone'        => $user->contact_number,
                'email'        => $user->email,
                'houseNoSt'    => $user->house_no,
                'region'       => $user->region,
                'province'     => $user->province,
                'city'         => $user->city,
                'barangay'     => $user->barangay,
                'role'         => $user->role->role_name ?? 'No Role',
            ]
        ]);
    }

    // Update user profile with role-based restrictions
    public function update(Request $request)
    {
        $user = Auth::user();
        $role = $user->role->role_name ?? '';

        // Base fields everyone can update
        $validated = $request->validate([
            'houseNoSt'  => 'nullable|string|max:255',
            'region'     => 'nullable|string|max:255',
            'province'   => 'nullable|string|max:255',
            'city'       => 'nullable|string|max:255',
            'barangay'   => 'nullable|string|max:255',
        ]);

        // Only admins can update restricted fields
        if (strtolower($role) === 'admin') {
            $adminValidated = $request->validate([
                'firstName'  => 'required|string|max:255',
                'lastName'   => 'required|string|max:255',
                'middleName' => 'nullable|string|max:255',
                'birthday'   => 'nullable|date',
                'gender'     => 'required|in:male,female',
                'phone'      => 'nullable|string|max:20',
                'email'      => 'required|email|unique:users,email,' . $user->user_id . ',user_id',
            ]);
            $validated = array_merge($validated, $adminValidated);
        }

        // Update user
        $user->update([
            'first_name'     => $validated['firstName'] ?? $user->first_name,
            'last_name'      => $validated['lastName'] ?? $user->last_name,
            'middle_name'    => $validated['middleName'] ?? $user->middle_name,
            'birthdate'      => $validated['birthday'] ?? $user->birthdate,
            'gender'         => $validated['gender'] ?? $user->gender,
            'contact_number' => $validated['phone'] ?? $user->contact_number,
            'email'          => $validated['email'] ?? $user->email,
            'house_no'       => $validated['houseNoSt'] ?? $user->house_no,
            'region'         => $validated['region'] ?? $user->region,
            'province'       => $validated['province'] ?? $user->province,
            'city'           => $validated['city'] ?? $user->city,
            'barangay'       => $validated['barangay'] ?? $user->barangay,
        ]);
        return back()->with('success', 'Profile updated successfully.');
    }

    // Update profile image
    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('profile_images', 'public');
            $user->update([
                'profile_image' => $path,
            ]);
        }
        return back()->with('success', 'Profile image updated successfully.');
    }
}
