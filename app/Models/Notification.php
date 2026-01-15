<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends Model
{
    use HasUuids, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'notification_id';

    protected $fillable = [
        'notifiable_id',
        'notification_title',
        'notification_body',
        'read_at',
        'action_url'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'notifiable_id', 'user_id');
    }
}
