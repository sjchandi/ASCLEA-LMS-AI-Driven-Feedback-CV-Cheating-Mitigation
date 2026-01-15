<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\BackupAndRestore\BackupService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateBackup implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $userId;
    /**
     * Create a new job instance.
     */
    public function __construct(string $userId)
    {
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $backupService = app(BackupService::class);

        // Run Spatie backup    
        $exitCode = Artisan::call('backup:run');

        if ($exitCode === 0) {
            $backupInfo = $backupService->getBackupFileInfo();

            $newbackupData = $backupService->saveBackupFileInfo($backupInfo);

            // Send notification after finishing the job
            $backupService->sendBackupNotification($this->userId);

            $backupService->sendBackupData($newbackupData, $this->userId);
        }
    }
}
