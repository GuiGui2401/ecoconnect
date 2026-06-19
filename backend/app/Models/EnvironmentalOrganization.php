<?php

namespace App\Models;

use App\Models\Concerns\HasHubTranslations;
use Illuminate\Database\Eloquent\Model;

class EnvironmentalOrganization extends Model
{
    use HasHubTranslations;

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
        'translations',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'tags' => 'array',
        'translations' => 'array',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
