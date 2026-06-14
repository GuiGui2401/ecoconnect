<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'icon',
        'type',
        'goal_value',
        'goal_unit',
        'points_reward',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function participants()
    {
        return $this->belongsToMany(User::class, 'user_challenges')
            ->withPivot('progress', 'completed', 'completed_at');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('ends_at', '>', now());
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function getProgressPercentageForUser(User $user): int
    {
        $pivot = $this->participants()->where('user_id', $user->id)->first()?->pivot;

        if (! $pivot) {
            return 0;
        }

        return min(100, (int) round(($pivot->progress / $this->goal_value) * 100));
    }
}

