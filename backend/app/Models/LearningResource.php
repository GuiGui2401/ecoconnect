<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningResource extends Model
{
    protected $fillable = [
        'title',
        'description',
        'type',
        'category',
        'level',
        'thumbnail',
        'content_url',
        'content',
        'duration_minutes',
        'author',
        'views_count',
        'is_published',
    ];

    protected $casts = ['is_published' => 'boolean'];

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }
}

