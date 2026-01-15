<?php

namespace App\Http\Controllers\Programs;

use App\Http\Controllers\Controller;
use App\Models\AssignedCourse;
use App\Models\Course;
use App\Models\Program;
use App\Models\Programs\Grade;
use App\Services\Programs\GradeService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GradeController extends Controller
{
    protected GradeService $gradeService;

    public function __construct(GradeService $gradeService)
    {
        $this->gradeService = $gradeService;
    }

    public function gradeStudent(Request $request, Program $program, Course $course, AssignedCourse $assignedCourse)
    {

        $validatedData = $request->validate([
            'grade' => 'required|numeric|min:0|max:999.99',
        ]);

        $this->gradeService->createUpdateStudentGrade($validatedData['grade'], $course, $assignedCourse, $request->user()->user_id);
    }

    public function returnStudentGrade(Request $request, Program $program, Course $course)
    {
        $validated = $request->validate([
            'selectAll' => 'required|boolean',
            'selectedStudentGrades' => 'array',
            'unselectedStudentGrades' => 'array',
        ]);

        $this->gradeService->returnGrades($validated, $course);
    }

    public function getStudentGrades(Request $request)
    {
        $grades = Grade::where('status', 'returned')
            ->whereHas('student.member.user', function ($query) use ($request) {
                $query->where('user_id', $request->user()->user_id);
            })
            ->with('course.program')
            ->get();

        return Inertia::render('Student_Grades/StudentGrades', [
            'grades' => $grades,
            'studentData' => $request->user()->only(['user_id', 'first_name', 'last_name', 'profile_image', 'role'])
        ]);
    }

    public function exportStudentGradesToPdf(Request $request, Program $program, Course $course)
    {
        $students = $this->gradeService->getStudentsToBeGraded($request, $course, false);
        $pdf = Pdf::loadView('programs.studentGradesPdf', compact('students', 'program'));
        return $pdf->download($program->program_name . ' grades.pdf');
    }

    public function exportActivityResponsesToCsv(Request $request, Program $program, Course $course)
    {
        $students = $this->gradeService->getStudentsToBeGraded($request, $course, false);

        $fileName = $program->program_name . ' grades.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = $this->gradeService->handleExportStudentGradesToCsv($students);

        return response()->stream($callback, 200, $headers);
    }
}
