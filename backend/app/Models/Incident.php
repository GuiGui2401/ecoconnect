<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Incident extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'type',
        'description',
        'latitude',
        'longitude',
        'location_name',
        'country',
        'risk_level',
        'status',
        'validated_at',
        'validated_by',
        'media_urls',
    ];

    protected $casts = [
        'media_urls' => 'array',
        'validated_at' => 'datetime',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function scopeValidated($query)
    {
        return $query->where('status', 'validated');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeHighRisk($query)
    {
        return $query->whereIn('risk_level', ['high', 'critical']);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function getTypeIconAttribute(): string
    {
        return match ($this->type) {
            'pollution' => 'water',
            'fire' => 'fire',
            'deforestation' => 'forest',
            'poaching' => 'wildlife',
            'waste' => 'waste',
            default => 'alert',
        };
    }

    public function getRiskColorAttribute(): string
    {
        return match ($this->risk_level) {
            'low' => '#27ae60',
            'medium' => '#e67e22',
            'high' => '#e74c3c',
            'critical' => '#8e44ad',
            default => '#7f8c8d',
        };
    }
}

