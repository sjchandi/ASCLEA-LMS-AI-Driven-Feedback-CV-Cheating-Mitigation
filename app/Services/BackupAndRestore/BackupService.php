<?php

namespace App\Services\BackupAndRestore;

use App\Models\Backups\Backup;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\get;

class BackupService
{
    protected NotificationService $notificationService;
    private string $backupRoute;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;

        $this->backupRoute = config('app.vite_main_url') . ':' . config('app.vite_socket_io_port') . '/backup';
    }

    public function getBackups()
    {
        return Backup::select(['backup_id', 'file_name', 'file_size', 'created_at'])
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->through(function ($backup) {
                $backup->file_size = $backup->file_size_human;

                return $backup;
            });
    }

    public function getBackupFileInfo()
    {
        $backupDisk = Storage::disk('backups'); // Make sure 'backups' disk is configured
        $files = $backupDisk->files(config('app.name')); // get all files in the backup folde

        // Filter only ZIP files
        $zipFiles = array_filter($files, fn($file) => str_ends_with($file, '.zip'));

        // Get the latest backup
        $latestBackup = collect($zipFiles)->sortByDesc(fn($file) => $backupDisk->lastModified($file))->first();

        if ($latestBackup) {
            $backupInfo = [
                'name' => basename($latestBackup),
                'path' => $latestBackup,
                'size' => $backupDisk->size($latestBackup),
                'lastModified' => date('Y-m-d H:i:s', $backupDisk->lastModified($latestBackup)),
            ];

            return $backupInfo;
        }

        return [];
    }

    public function saveBackupFileInfo(array $backupInfo)
    {
        if (!empty($backupInfo)) {
            $newBackupData = Backup::create([
                'file_name' => $backupInfo['name'],
                'file_path' => $backupInfo['path'],
                'file_size' => $backupInfo['size'],
            ]);

            $newBackupData->file_size = $newBackupData->file_size_human;

            return $newBackupData;
        }
    }

    public function sendBackupNotification(string $userId)
    {
        $title = "Backup Complete";
        $body = "Backup complete! Your data has been successfully backed up.";

        $baseUrl = config('app.app_base_url');
        $actionUrl = "{$baseUrl}/backup-and-restore";

        $this->notificationService->notifyUser($userId, $title, $body, $actionUrl);
    }

    public function sendBackupData(Backup $backup, string $userId)
    {
        $payload = $backup->only(['backup_id', 'file_size', 'file_name', 'created_at']);

        $payload['user_id']  = $userId;

        // Send notification in the socket server
        Http::post($this->backupRoute, [
            'backup' => $payload
        ]);
    }
}
