<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Challenge;
use App\Models\Incident;
use App\Models\LearningResource;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin EcoConnect',
            'email' => 'admin@ecoconnect.cm',
            'password' => Hash::make('Admin@2025!'),
            'profile_type' => 'admin',
            'country' => 'CM',
            'points' => 9999,
        ]);

        $emma = User::create([
            'name' => 'Emma Ngono',
            'email' => 'emma@ecoconnect.cm',
            'password' => Hash::make('Demo@2025!'),
            'profile_type' => 'citizen',
            'country' => 'CM',
            'region' => 'Centre',
            'points' => 1250,
        ]);

        $badges = [
            ['name' => 'Welcome', 'slug' => 'welcome', 'description' => 'Bienvenue sur EcoConnect', 'icon' => 'seedling', 'condition' => 'welcome', 'condition_value' => 1, 'points_reward' => 50],
            ['name' => 'First Report', 'slug' => 'first_report', 'description' => 'Premier signalement', 'icon' => 'map-pin', 'condition' => 'incident_reported', 'condition_value' => 1, 'points_reward' => 100],
            ['name' => 'Reporter', 'slug' => 'reporter', 'description' => '5 signalements valides', 'icon' => 'flame', 'condition' => 'reports_5', 'condition_value' => 5, 'points_reward' => 200],
            ['name' => 'Water Guard', 'slug' => 'water_guard', 'description' => 'Gardien des eaux', 'icon' => 'waves', 'condition' => 'reports_10', 'condition_value' => 10, 'points_reward' => 300],
            ['name' => 'Tree Hero', 'slug' => 'tree_hero', 'description' => 'Heros des forets', 'icon' => 'tree-pine', 'condition' => 'challenges_5', 'condition_value' => 5, 'points_reward' => 250],
            ['name' => 'Eco Champion', 'slug' => 'eco_champion', 'description' => 'Champion ecologique', 'icon' => 'trophy', 'condition' => 'points_5000', 'condition_value' => 5000, 'points_reward' => 500],
        ];

        foreach ($badges as $badge) {
            Badge::create($badge);
        }

        $emma->badges()->attach(Badge::where('slug', 'welcome')->first()->id, ['earned_at' => now()]);
        $admin->badges()->attach(Badge::where('slug', 'welcome')->first()->id, ['earned_at' => now()]);

        $challenges = [
            ['title' => 'Reduce Plastic', 'description' => 'Avoid plastic for 3 days', 'icon' => 'recycle', 'type' => 'daily', 'goal_value' => 3, 'goal_unit' => 'days', 'points_reward' => 70, 'starts_at' => now(), 'ends_at' => now()->addDays(7)],
            ['title' => 'Recycle Challenge', 'description' => 'Recycle 5 items this week', 'icon' => 'trash-2', 'type' => 'weekly', 'goal_value' => 5, 'goal_unit' => 'items', 'points_reward' => 50, 'starts_at' => now(), 'ends_at' => now()->addDays(7)],
            ['title' => 'Plant a Tree', 'description' => 'Plant a tree this week', 'icon' => 'tree-pine', 'type' => 'weekly', 'goal_value' => 1, 'goal_unit' => 'trees', 'points_reward' => 120, 'starts_at' => now(), 'ends_at' => now()->addDays(7)],
            ['title' => 'Community Clean', 'description' => 'Organize a community cleaning', 'icon' => 'users', 'type' => 'community', 'goal_value' => 1, 'goal_unit' => 'events', 'points_reward' => 200, 'starts_at' => now(), 'ends_at' => now()->addDays(30)],
        ];

        foreach ($challenges as $challenge) {
            Challenge::create($challenge);
        }

        $incidents = [
            ['type' => 'fire', 'description' => 'Forest fire detected near Bafoussam area', 'latitude' => 5.48, 'longitude' => 10.42, 'location_name' => 'Bafoussam, West Region', 'risk_level' => 'high', 'status' => 'validated'],
            ['type' => 'pollution', 'description' => 'Water pollution in Wouri river, oil spill visible', 'latitude' => 4.05, 'longitude' => 9.70, 'location_name' => 'Douala, Littoral', 'risk_level' => 'medium', 'status' => 'validated'],
            ['type' => 'deforestation', 'description' => 'Illegal logging near Dja Reserve', 'latitude' => 3.10, 'longitude' => 12.80, 'location_name' => 'Dja, South Region', 'risk_level' => 'critical', 'status' => 'validated'],
        ];

        foreach ($incidents as $incident) {
            Incident::create([...$incident, 'user_id' => $emma->id, 'country' => 'CM']);
        }

        $resources = [
            ['title' => 'Biodiversity: The richness of our planet', 'description' => 'Learn about African biodiversity', 'type' => 'article', 'category' => 'biodiversity', 'level' => 'beginner', 'duration_minutes' => 15],
            ['title' => 'Practical Guide to Zero Waste', 'description' => 'Reduce your waste step by step', 'type' => 'guide', 'category' => 'waste', 'level' => 'intermediate', 'duration_minutes' => 30],
            ['title' => 'Understanding Climate Change', 'description' => 'Climate science explained simply', 'type' => 'video', 'category' => 'climate', 'level' => 'beginner', 'duration_minutes' => 20],
            ['title' => 'EcoPodcast: Weekly debates', 'description' => 'Environmental discussions in Africa', 'type' => 'podcast', 'category' => 'general', 'level' => 'intermediate', 'duration_minutes' => 45],
        ];

        foreach ($resources as $resource) {
            LearningResource::create([...$resource, 'is_published' => true]);
        }
    }
}

