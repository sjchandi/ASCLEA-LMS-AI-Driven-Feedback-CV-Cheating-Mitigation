<?php

namespace App\Http\Controllers\Archives;

use App\Http\Controllers\Controller;
use App\Services\Archives\ArchiveService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class ArchiveController extends Controller
{
    protected ArchiveService $archiveService;

    public function __construct(ArchiveService $archiveService)
    {
        $this->archiveService = $archiveService;
    }
    public function showArchives(Request $request)
    {

        Gate::authorize('view-archives');

        return Inertia::render('Archives/Archives', [
            'archivedCourses' => fn() => $this->archiveService->getArchivedCourses(),
            'archivedStaff' => fn() => $this->archiveService->getArchivedStaff($request),
            'archivedStudents' => fn() => $this->archiveService->getArchivedStudents($request)
        ]);
    }
}
