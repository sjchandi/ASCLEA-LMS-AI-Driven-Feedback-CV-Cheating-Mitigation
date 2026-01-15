<?php

namespace App\Services\Archives;

use App\Models\Administration\Staff;
use App\Models\Course;
use App\Models\Student;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ArchiveService
{
    public function getArchivedCourses()
    {
        return Course::onlyTrashed()
            ->with([
                'program.archivedBy:user_id,first_name,last_name',
                'archivedBy:user_id,first_name,last_name',
            ])
            ->orderBy('deleted_at', 'desc')
            ->get();
    }

    public function getArchivedStaff(Request $request)
    {

        $result = Staff::onlyTrashed()
            ->with([
                'user:user_id,first_name,last_name,profile_image',
                'archivedBy:user_id,first_name,last_name'
            ]);


        if ($search = $request->input('search')) {
            $result->whereHas('user', function ($query) use ($search) {
                $query->whereLike('first_name', "%$search%")
                    ->orWhereLike('last_name', "%$search%")
                    ->orWhereLike('email', "%$search%")
                    ->orwhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]); // Allows searching for both first and last name
            });
        }

        return $result
            ->orderBy('deleted_at', 'desc')
            ->paginate(10);
    }

    public function getArchivedStudents(Request $request)
    {
        $result  = Student::onlyTrashed()
            ->with([
                'user:user_id,first_name,last_name,profile_image',
                'archivedBy:user_id,first_name,last_name'
            ]);

        if ($search = $request->input('search')) {
            $result->whereHas('user', function ($query) use ($search) {
                $query->whereLike('first_name', "%$search%")
                    ->orWhereLike('last_name', "%$search%")
                    ->orWhereLike('email', "%$search%")
                    ->orwhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]); // Allows searching for both first and last name
            });
        }

        return $result
            ->orderBy('deleted_at', 'desc')
            ->paginate(10);
    }
}
