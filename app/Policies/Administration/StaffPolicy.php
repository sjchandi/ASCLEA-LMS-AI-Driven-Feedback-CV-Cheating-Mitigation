<?php

namespace App\Policies\Administration;

use App\Models\Administration\Staff;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class StaffPolicy
{
    /**
     * Determine whether the user can restore the model.
     */
    public function restoreStaff(User $user): bool
    {
        // Check if the auth user has a role admin
        return $user->role->role_name === 'admin';
    }
}
