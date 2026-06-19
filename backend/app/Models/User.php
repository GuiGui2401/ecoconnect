<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'profile_type',
        'country',
        'region',
        'latitude',
        'longitude',
        'points',
        'level',
        'is_active',
        'privacy_settings',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $appends = ['avatar_url'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'privacy_settings' => 'array',
    ];

    public function incidents()
    {
        return $this->hasMany(Incident::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'user_badges')->withPivot('earned_at');
    }

    public function challenges()
    {
        return $this->belongsToMany(Challenge::class, 'user_challenges')
            ->withPivot('progress', 'completed', 'completed_at');
    }

    public function activeChallenges()
    {
        return $this->challenges()->wherePivot('completed', false);
    }

    public function aiConversations()
    {
        return $this->hasMany(AiConversation::class);
    }

    public function savedHubItems()
    {
        return $this->hasMany(UserSavedHubItem::class);
    }

    public function getAvatarUrlAttribute(): string
    {
        return $this->avatar
            ? asset('storage/'.$this->avatar)
            : 'https://ui-avatars.com/api/?name='.urlencode($this->name).'&background=1a7a3c&color=fff';
    }

    public function getLevelAttribute(): string
    {
        return match (true) {
            $this->points >= 5000 => 'Eco Champion',
            $this->points >= 2000 => 'Forest Guardian',
            $this->points >= 1000 => 'Green Protector',
            $this->points >= 500 => 'Eco Citizen',
            default => 'Eco Starter',
        };
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeTopRanked($query, int $limit)
    {
        return $query->orderByDesc('points')->limit($limit);
    }

    /**
     * Exclure les utilisateurs ayant désactivé leur présence au classement.
     * (privacy_settings null ou clé absente = visible par défaut).
     */
    public function scopeVisibleOnLeaderboard($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('privacy_settings')
                ->orWhereRaw("JSON_EXTRACT(privacy_settings, '$.show_on_leaderboard') IS NULL")
                ->orWhere('privacy_settings->show_on_leaderboard', true);
        });
    }
}
