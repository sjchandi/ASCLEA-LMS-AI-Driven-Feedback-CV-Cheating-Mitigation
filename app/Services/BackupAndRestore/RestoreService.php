<?php

namespace App\Services\BackupAndRestore;

use App\Models\Backups\Backup;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use ZipArchive;
use Illuminate\Support\Facades\File;

class RestoreService
{
    public function extractFile($zipFilePath)
    {
        $zip = new ZipArchive;

        if ($zip->open(storage_path('app/backups/' . $zipFilePath)) === TRUE) {

            // Extract to temp folder
            $extractPath = storage_path('app/backups/temp_restore');
            $zip->extractTo($extractPath);
            $zip->close();

            return $extractPath;
        } else {
            throw new \Exception('Could not open backup zip file.');
        }
    }

    public function restoreDatabase(string $extractPath)
    {
        $sqlFile = $extractPath . DIRECTORY_SEPARATOR . 'db-dumps' . DIRECTORY_SEPARATOR . 'mysql-asclea_lms.sql';

        // Check if the SQL file exists
        if (!file_exists($sqlFile)) {
            throw new \Exception("SQL file not found: {$sqlFile}");
        }

        // Read the SQL file content
        $sql = file_get_contents($sqlFile);

        if ($sql === false) {
            throw new \Exception("Failed to read SQL file: {$sqlFile}");
        }

        // Use Laravel's DB connection to execute the SQL
        try {
            DB::unprepared($sql);
        } catch (\Exception $e) {
            throw new \Exception('Database restore failed: ' . $e->getMessage());
        }
    }

    public function restoreFiles(string $extractPath): array
    {
        $restored = [];

        // Restore public files
        $publicSource = $extractPath . '/storage/app/public';

        // Check if the public folder  exist
        if (File::exists($publicSource)) {
            $destination = storage_path('app/public');

            // Check if destination exist
            // We delete it, make new directory then copy the files from the backup

            if (File::exists($destination)) {
                File::deleteDirectory($destination);
            }
            File::makeDirectory($destination, 0755, true);

            File::copyDirectory($publicSource, $destination);
            $restored['public'] = count(File::allFiles($destination));
        }

        // Restore private files
        $privateSource = $extractPath . '/storage/app/private';
        if (File::exists($privateSource)) {
            $destination = storage_path('app/private');

            if (File::exists($destination)) {
                File::deleteDirectory($destination);
            }
            File::makeDirectory($destination, 0755, true);

            File::copyDirectory($privateSource, $destination);
            $restored['private'] = count(File::allFiles($destination));
        }

        return $restored;
    }

    public function cleanupExtractedFiles($extractPath)
    {
        if (!$extractPath || !File::exists($extractPath)) {
            return;
        }

        try {
            File::deleteDirectory($extractPath);
        } catch (\Exception $e) {
        }
    }
}
