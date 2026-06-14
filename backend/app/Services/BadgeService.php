<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\User;

class BadgeService
{
    public function checkAndAward(User $user, string $condition): ?Badge
    {
        $badge = Badge::where('condition', $condition)->first();

        if (! $badge || $user->badges()->where('badge_id', $badge->id)->exists()) {
            return null;
        }

        if ($badge->condition_value > 1) {
            $currentValue = $this->resolveConditionValue($user, $condition);

            if ($currentValue < $badge->condition_value) {
                return null;
            }
        }

        $user->badges()->attach($badge->id, ['earned_at' => now()]);
        $user->increment('points', $badge->points_reward);

        return $badge;
    }

    public function auditUser(User $user): array
    {
        $awarded = [];

        foreach (Badge::all() as $badge) {
            if ($user->badges()->where('badge_id', $badge->id)->exists()) {
                continue;
            }

            $value = $this->resolveConditionValue($user, $badge->condition);

            if ($value >= $badge->condition_value) {
                $user->badges()->attach($badge->id, ['earned_at' => now()]);
                $user->increment('points', $badge->points_reward);
                $awarded[] = $badge;
            }
        }

        return $awarded;
    }

    private function resolveConditionValue(User $user, string $condition): int
    {
        return match (true) {
            str_starts_with($condition, 'reports_') => $user->incidents()->validated()->count(),
            str_starts_with($condition, 'points_') => $user->points,
            str_starts_with($condition, 'challenges_') => $user->challenges()->wherePivot('completed', true)->count(),
            str_starts_with($condition, 'posts_') => $user->posts()->count(),
            default => 1,
        };
    }
}

