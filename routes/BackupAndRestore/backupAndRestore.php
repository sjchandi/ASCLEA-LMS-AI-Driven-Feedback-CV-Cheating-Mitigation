<?php

use App\Http\Controllers\BackupAndRestore\BackupRestoreController;
use App\Models\Backups\Backup;
use Illuminate\Support\Facades\Route;

Route::prefix('backup-and-restore')
    ->middleware(['auth', 'verified', 'preventBack'])
    ->group(function () {

        Route::get('/', [BackupRestoreController::class, 'index'])->can('viewAny', Backup::class)->name('backupRestore.index');

        Route::post('/backup', [BackupRestoreController::class, 'backup'])->can('generate', Backup::class)->name('backup');

        Route::put('/{backup}/restore', [BackupRestoreController::class, 'restore'])->can('restore', Backup::class)->name('restore');

        Route::delete('/{backup}/delete', [BackupRestoreController::class, 'delete'])->can('delete', Backup::class)->name('backup.delete');
    });
