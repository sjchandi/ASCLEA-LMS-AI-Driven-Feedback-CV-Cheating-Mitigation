<?php

namespace App\Policies\Backups;

use App\Models\Backups\Backup;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class BackupPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        $isAdmin = $user->role->role_name == "admin";

        return $isAdmin;
    }

    /**
     * Determine whether the user can create models.
     */
    public function generate(User $user): bool
    {
        $isAdmin = $user->role->role_name == "admin";

        return $isAdmin;
    }


    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user): bool
    {
        $isAdmin = $user->role->role_name == "admin";

        return $isAdmin;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user): bool
    {
        $isAdmin = $user->role->role_name == "admin";

        return $isAdmin;
    }
}
