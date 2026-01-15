<?php

namespace App\Http\Controllers\BackupAndRestore;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Jobs\GenerateBackup;
use App\Jobs\RestoreBackup;
use App\Models\Backups\Backup;
use App\Services\BackupAndRestore\BackupService;
use App\Services\BackupAndRestore\RestoreService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BackupRestoreController extends Controller
{
    protected BackupService $backupService;
    protected RestoreService $restoreService;

    public function __construct(BackupService $backupService, RestoreService $restoreService)
    {
        $this->backupService  = $backupService;
        $this->restoreService  = $restoreService;
    }

    public function index()
    {
        return Inertia::render('BackupAndRestore/BackupAndRestore', [
            'backups' => $this->backupService->getBackups()
        ]);
    }

    public function backup(Request $request)
    {
        // $this->backupService->sendBackupData("This is backup  data", $request->user()->user_id);
        // Run a job that will create bakup in the background

        GenerateBackup::dispatch($request->user()->user_id);

        return back()->with([
            'message' => 'Backup is currently in progress. Please wait.'
        ]);
    }

    public function restore(Backup $backup)
    {
        set_time_limit(600);
        ini_set('memory_limit', '512M');

        try {
            $restoreService = app(RestoreService::class);

            $extractPath = $restoreService->extractFile($backup->file_path);
            $restoreService->restoreDatabase($extractPath);
            $restoreService->restoreFiles($extractPath);
            $restoreService->cleanupExtractedFiles($extractPath);

            // Logout all users
            DB::table(config('session.table', 'sessions'))->truncate();

            Auth::logout();
            request()->session()->invalidate();
            request()->session()->regenerateToken();

            return redirect()->route('login')
                ->with('success', 'Database restored successfully!');
        } catch (\Exception $e) {

            return back()->withErrors([
                'error' => 'Unable to restore backup. Please try again.'
            ]);
        }
    }

    public function delete(Backup $backup)
    {
        try {
            $backup->delete();

            return back()->with('success', "Backup deleted successfully.");
        } catch (\Exception $e) {

            return back()->withErrors([
                'error' => 'Unable to delete backup. Please try again.'
            ]);
        }
    }
}
