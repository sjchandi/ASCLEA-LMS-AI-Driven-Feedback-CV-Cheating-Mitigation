<?php

namespace App\Models\Programs;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SectionItem extends Model
{
    use HasUuids, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'section_item_id';

    protected $fillable = [
        'section_id',
        'item_type',
        'item_id',
        'order',
    ];

    public function item(): MorphTo
    {
        return $this->morphTo()->withTrashed();
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    public function studentProgress(): HasOne
    {
        return $this->hasOne(StudentProgress::class, 'section_item_id');
    }
}
