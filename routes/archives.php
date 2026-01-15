<?php

use App\Http\Controllers\Archives\ArchiveController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('archives')
    ->middleware(['auth', 'verified', 'preventBack'])
    ->group(function () {

        // Route for viewing archive page
        Route::get('/', [ArchiveController::class, 'showArchives'])->name('archives.index');
    });
