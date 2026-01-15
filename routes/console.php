<?php

use Illuminate\Support\Facades\Schedule;

Schedule::daily()
    ->group(function () {
        Schedule::command('app:delete-old-rejected-students');
        Schedule::command('app:create-backup');
    });

Schedule::everyMinute()
    ->group(function () {
        Schedule::command('app:auto-submit-abandoned-quiz');
    });
