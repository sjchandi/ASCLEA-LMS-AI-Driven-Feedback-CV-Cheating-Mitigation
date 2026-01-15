<?php

namespace App\Models\Programs;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assessment extends Model
{
    use HasUuids, HasFactory, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'assessment_id';

    protected $fillable = [
        'assessment_title',
        'assessment_description',
        'due_datetime',
        'total_points',
        'status',
        'created_by',
        'assessment_type_id',
        'course_id',
        'feedback',
    ];

    public function assessmentType(): BelongsTo
    {
        return $this->belongsTo(AssessmentType::class, 'assessment_type_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id')->withTrashed();
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function quiz(): HasOne
    {
        return $this->hasOne(Quiz::class, 'assessment_id');
    }

    public function files(): HasMany
    {
        return $this->hasMany(AssessmentFile::class, 'assessment_id');
    }

    public function assessmentSubmissions(): HasMany
    {
        return $this->hasMany(AssessmentSubmission::class, 'assessment_id');
    }

    public function sectionItem(): MorphOne
    {
        return $this->morphOne(SectionItem::class, 'item')->withTrashed();
    }
}
