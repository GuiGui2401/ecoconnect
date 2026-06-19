<?php

use App\Models\EnvironmentalLegalGuide;
use App\Models\EnvironmentalNews;
use App\Models\EnvironmentalOrganization;
use App\Support\HubTranslations;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['environment_news', 'environment_organizations', 'environment_legal_guides'] as $table) {
            Schema::table($table, function (Blueprint $table): void {
                $table->json('translations')->nullable()->after('tags');
            });
        }

        // Backfill English translations for the existing seeded rows.
        foreach (EnvironmentalNews::all() as $item) {
            $en = HubTranslations::news()[$item->title] ?? null;
            if ($en) {
                $item->update(['translations' => ['en' => $en]]);
            }
        }

        foreach (EnvironmentalOrganization::all() as $item) {
            $en = HubTranslations::organizations()[$item->name] ?? null;
            if ($en) {
                $item->update(['translations' => ['en' => $en]]);
            }
        }

        foreach (EnvironmentalLegalGuide::all() as $item) {
            $en = HubTranslations::legalGuides()[$item->title] ?? null;
            if ($en) {
                $item->update(['translations' => ['en' => $en]]);
            }
        }
    }

    public function down(): void
    {
        foreach (['environment_news', 'environment_organizations', 'environment_legal_guides'] as $table) {
            Schema::table($table, function (Blueprint $table): void {
                $table->dropColumn('translations');
            });
        }
    }
};
