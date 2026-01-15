<?php

namespace App\Models;

use App\Models\Administration\Staff;
use App\Models\PaymentHistory\Payment;
use App\Models\PaymentHistory\PaymentFile;
use App\Models\Programs\Assessment;
use App\Models\Programs\Grade;
use App\Models\Programs\Material;
use App\Models\Programs\Post;
use App\Models\Programs\Section;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasUuids, SoftDeletes;

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The "type" of the auto-incrementing ID (UUID).
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'user_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'birthdate',
        'gender',
        'contact_number',
        'email',
        'house_no',
        'region',
        'province',
        'city',
        'barangay',
        'password',
        'role_id',
        'profile_image', //added profile image
    ];

    /**
     * The attributes that should be hidden for arrays and JSON.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relationship to roles table
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function programs(): HasMany
    {
        return $this->hasMany(LearningMember::class, 'user_id');
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class, 'user_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'user_id', 'user_id');
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class, 'created_by', 'user_id');
    }

    public function uploadedPaymentFiles()
    {
        return $this->hasMany(PaymentFile::class, 'uploaded_by', 'user_id');
    }

    public function logins()
    {
        return $this->hasMany(UserLogin::class, 'user_id', 'user_id');
    }

    public function lastLogin()
    {
        return $this->hasOne(UserLogin::class, 'user_id', 'user_id')->latestOfMany('login_at');
    }

    public function lastLogout()
    {
        return $this->hasOne(UserLogin::class, 'user_id', 'user_id')->latestOfMany('logout_at');
    }

    public function materials(): HasMany
    {
        return $this->hasMany(Material::class, 'created_by', 'user_id');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class, 'created_by', 'user_id');
    }

    public function gradedStudents(): HasMany
    {
        return $this->hasMany(Grade::class, 'graded_by', 'user_id');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'graded_by', 'user_id');
    }

    public function archivedPrograms(): HasMany
    {
        return $this->hasMany(Program::class, 'archived_by', 'user_id');
    }

    public function archivedCourses(): HasMany
    {
        return $this->hasMany(Course::class, 'archived_by', 'user_id');
    }

    public function archivedStaff(): HasMany
    {
        return $this->hasMany(Staff::class, 'archived_by', 'user_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'notifiable_id', 'user_id');
    }
}
