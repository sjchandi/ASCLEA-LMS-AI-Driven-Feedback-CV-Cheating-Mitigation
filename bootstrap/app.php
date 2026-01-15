<?php

use App\Http\Middleware\CheckUserRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PreventBack;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')->group(function () {
                require base_path('routes/auth.php');
                require base_path('routes/admission.php');
                require base_path('routes/dashboard.php');
                require base_path('routes/Grades/grades.php');
                require base_path('routes/paymentHistory.php');
                require base_path('routes/administration.php');
                require base_path('routes/archives.php');
                require base_path('routes/profile.php');
                // Program related routes
                require base_path('routes/Programs/programs.php');
                require base_path('routes/Programs/courses.php');
                require base_path('routes/Programs/people.php');
                require base_path('routes/Programs/assessments.php');
                require base_path('routes/Programs/quizzes.php');
                require base_path('routes/Programs/questions.php');
                require base_path('routes/Programs/options.php');
                require base_path('routes/Programs/assessmentSubmisisons.php');
                require base_path('routes/Programs/studentQuizAnswer.php');
                require base_path('routes/Programs/modules.php');
                require base_path('routes/Programs/grades.php');
                require base_path('routes/Programs/posts.php');

                // Notification
                require base_path('routes/notifications.php');

                // Backup and Restore
                require base_path('routes/BackupAndRestore/backupAndRestore.php');
            });
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);
        $middleware->alias([
            'preventBack' => PreventBack::class,
            'checkRole' => CheckUserRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            // Reverse the condition to ! in prod
            if (!app()->environment(['local', 'testing']) && in_array($response->getStatusCode(), [500, 503, 404, 403])) {
                return Inertia::render('Error/ErrorPage', ['status' => $response->getStatusCode()])
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
            } elseif ($response->getStatusCode() === 419) {
                return back()->with([
                    'message' => 'The page expired, please try again.',
                ]);
            }

            return $response;
        });
    })->create();
