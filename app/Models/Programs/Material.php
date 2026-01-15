<?php

namespace App\Models\Programs;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Material extends Model
{
    use HasUuids, HasFactory, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'material_id';

    protected $fillable = [
        'course_id',
        'material_title',
        'material_description',
        'status',
        'created_by',
    ];

    public function materialFiles(): HasMany
    {
        return $this->hasMany(MaterialFile::class, 'material_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id')->withTrashed();
    }

    public function sectionItem(): MorphOne
    {
        return $this->morphOne(SectionItem::class, 'item')->withTrashed();
    }
}
