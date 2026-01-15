<?php

namespace App\Models\Programs;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\CV\DetectedCheating;


class Quiz extends Model
{
    use HasUuids, HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'quiz_id';

    protected $fillable = [
        'assessment_id',
        'quiz_title',
        'quiz_description',
        'quiz_total_points',
        'duration',
        'created_by',
        'cheating_mitigation',
        'randomize',
        'show_answers_after',
    ];

    protected function casts(): array
    {
        return [
            'cheating_mitigation' => 'boolean',
            'show_answers_after' => 'boolean',
            'randomize' => 'boolean',
        ];
    }

    public function assessment(): BelongsTo
    {
        return  $this->belongsTo(Assessment::class, 'assessment_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(CvOption::class, 'quiz_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'quiz_id');
    }
}
