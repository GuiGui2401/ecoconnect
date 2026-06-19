<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnvironmentalOrganization extends Model
{
    protected $table = 'environment_organizations';

    protected $fillable = [
        'name',
        'scope',
        'region',
        'focus',
        'project',
        'website_url',
        'donate_url',
        'latitude',
        'longitude',
        'tags',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'tags' => 'array',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
