<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnvironmentalNews extends Model
{
    protected $table = 'environment_news';

    protected $fillable = [
        'title',
        'summary',
        'type',
        'region',
        'source',
        'source_url',
        'published_at',
        'priority',
        'tags',
        'is_published',
    ];

    protected $casts = [
        'published_at' => 'date',
        'tags' => 'array',
        'is_published' => 'boolean',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
