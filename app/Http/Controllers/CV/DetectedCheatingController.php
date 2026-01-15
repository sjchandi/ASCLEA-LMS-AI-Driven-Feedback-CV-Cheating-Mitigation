<?php

namespace App\Http\Controllers\CV;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CV\DetectedCheating;
use App\Models\Programs\AssessmentSubmission;
use App\Models\CV\DetectedCheatingFile;
use App\Models\CV\tabDetect;

class DetectedCheatingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'assessment_submission_id' => 'required|uuid|exists:assessment_submissions,assessment_submission_id',
            'message' => 'required|string|max:255',
            'file_name' => 'required|string|max:255',
            'file_path' => 'required|string|max:1024',
            'file_type' => 'required|string|max:50',
        ]);


        $cheating = DetectedCheating::create([
            'assessment_submission_id' => $validated['assessment_submission_id'],
            'message' => $validated['message'],
        ]);

        DetectedCheatingFile::create([
            'detected_cheating_id' => $cheating->cheating_id,
            'file_name' => $validated['file_name'],
            'file_path' => $validated['file_path'],
            'file_type' => $validated['file_type'],
            'uploaded_at' => now(),
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'cheating_id' => $cheating->cheating_id,
            ]);
        }

        return back()->with('success', 'Cheating log recorded successfully.');
    }

public function fetchBySubmission($assessment_submission_id)
{
    $cheatings = DetectedCheating::with(['files'])
        ->where('assessment_submission_id', $assessment_submission_id)
        ->get();

    $submission = \DB::table('assessment_submissions')
        ->join('assigned_courses', 'assessment_submissions.submitted_by', '=', 'assigned_courses.assigned_course_id')
        ->join('learning_members', 'assigned_courses.learning_member_id', '=', 'learning_members.learning_member_id')
        ->join('users', 'learning_members.user_id', '=', 'users.user_id')
        ->where('assessment_submissions.assessment_submission_id', $assessment_submission_id)
        ->first();

    if ($cheatings->isEmpty()) {
        return response()->json([
            'message' => 'No cheating records found.',
        ], 404);
    }

    return response()->json([
        'cheatings' => $cheatings,
    ]);
}

public function storeTabDetect(Request $request)
{
    $validated = $request->validate([
        'assessment_submission_id' => 'required|uuid|exists:assessment_submissions,assessment_submission_id',
        'message' => 'required|string|max:255',
    ]);

    $tabDetect = tabDetect::create([
        'assessment_submission_id' => $validated['assessment_submission_id'],
        'message' => $validated['message'],
    ]);

    if ($request->expectsJson()) {
        return response()->json([
            'success' => true,
            'tabdetect_id' => $tabDetect->tabdetect_id,
        ]);
    }

    return back()->with('success', 'Tab detect log recorded successfully.');
}

public function fetchTabDetectBySubmission($assessment_submission_id)
{
    // Fetch tab detect records
    $tabDetects = TabDetect::where('assessment_submission_id', $assessment_submission_id)->get();

    $submission = \DB::table('assessment_submissions')
        ->where('assessment_submissions.assessment_submission_id', $assessment_submission_id)
        ->first();

    if ($tabDetects->isEmpty()) {
        return response()->json([
            'message' => 'No tab detect records found.',
        ], 404);
    }

    return response()->json([
        'tab_detects' => $tabDetects,
    ]);
}
}


