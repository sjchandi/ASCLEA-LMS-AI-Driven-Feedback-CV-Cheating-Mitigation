<?php

namespace App\Console\Commands;

use App\Services\BackupAndRestore\BackupService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;


class CreateBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-backup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    protected BackupService $backupService;

    public function __construct(BackupService $backupService)
    {
        parent::__construct();
        $this->backupService = $backupService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {

        $this->info('Starting backup...');

        // Call the backup:run command
        $exitCode = Artisan::call('backup:run');

        // Check if successful
        if ($exitCode === 0) {
            $this->info('Backup completed successfully!');

            $backupInfo = $this->backupService->getBackupFileInfo();

            $this->backupService->saveBackupFileInfo($backupInfo);
        } else {
            $this->error('Backup failed!');
        }

        // You can also get the output
        $output = Artisan::output();
        $this->line($output);

        return $exitCode;
    }
}
