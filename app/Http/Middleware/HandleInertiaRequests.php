<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request)
    {
        return [
            ...parent::share($request),
            'auth' => [
                // Verify first user exists
                'user' => $request->user() ? [
                    ...$request->user()->only(['role_id', 'user_id', 'profile_image', 'first_name']),
                    'role_name' => $request->user()->role->role_name ?? null,
                    'enrollment_status' => optional($request->user()->student)->enrollment_status, // New field added 
                    'unread_notifications' => $request->user()->notifications()->where('read_at', null)->count()
                ] : null,
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'message' => fn() => $request->session()->get('message'),
                'error' => fn() => $request->session()->get('error'),
            ],
        ];
    }
}
