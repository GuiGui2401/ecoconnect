<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnvironmentalLegalGuide extends Model
{
    protected $table = 'environment_legal_guides';

    protected $fillable = [
        'title',
        'summary',
        'jurisdiction',
        'topic',
        'official_url',
        'duties',
        'tags',
        'is_published',
    ];

    protected $casts = [
        'duties' => 'array',
        'tags' => 'array',
        'is_published' => 'boolean',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
