<?php

namespace App\Models\CV;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Programs\AssessmentSubmission; 

class tabDetect extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tab_detected';
    protected $primaryKey = 'tabdetect_id';
    public $incrementing = false;
    protected $keyType = 'string';  

    protected $fillable = [
        'assessment_submission_id',
        'message',
    ];


    public function assessmentSubmission(): BelongsTo
    {
        return $this->belongsTo(AssessmentSubmission::class, 'assessment_submission_id', 'assessment_submission_id');
    }
}
