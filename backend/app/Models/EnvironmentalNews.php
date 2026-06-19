<?php

namespace App\Models;

use App\Models\Concerns\HasHubTranslations;
use Illuminate\Database\Eloquent\Model;

class EnvironmentalNews extends Model
{
    use HasHubTranslations;

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
        'translations',
        'is_published',
    ];

    protected $casts = [
        'published_at' => 'date',
        'tags' => 'array',
        'translations' => 'array',
        'is_published' => 'boolean',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
