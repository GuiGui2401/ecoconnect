<?php

namespace App\Models;

use App\Models\Concerns\HasHubTranslations;
use Illuminate\Database\Eloquent\Model;

class EnvironmentalLegalGuide extends Model
{
    use HasHubTranslations;

    protected $table = 'environment_legal_guides';

    protected $fillable = [
        'title',
        'summary',
        'jurisdiction',
        'topic',
        'official_url',
        'duties',
        'tags',
        'translations',
        'is_published',
    ];

    protected $casts = [
        'duties' => 'array',
        'tags' => 'array',
        'translations' => 'array',
        'is_published' => 'boolean',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
