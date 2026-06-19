<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('environment_news', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->text('summary');
            $table->string('type');
            $table->string('region')->default('International');
            $table->string('source');
            $table->string('source_url');
            $table->date('published_at');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->json('tags')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->index(['type', 'priority', 'is_published']);
            $table->index('published_at');
        });

        Schema::create('environment_organizations', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('scope');
            $table->string('region');
            $table->text('focus');
            $table->text('project');
            $table->string('website_url');
            $table->string('donate_url')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['scope', 'region', 'is_active']);
            $table->index(['latitude', 'longitude']);
        });

        Schema::create('environment_legal_guides', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->text('summary');
            $table->string('jurisdiction');
            $table->string('topic');
            $table->string('official_url');
            $table->json('duties');
            $table->json('tags')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->index(['jurisdiction', 'topic', 'is_published']);
        });

        Schema::create('user_saved_hub_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('item_type', ['news', 'organization', 'legal_guide']);
            $table->unsignedBigInteger('item_id');
            $table->timestamps();

            $table->unique(['user_id', 'item_type', 'item_id']);
            $table->index(['item_type', 'item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_saved_hub_items');
        Schema::dropIfExists('environment_legal_guides');
        Schema::dropIfExists('environment_organizations');
        Schema::dropIfExists('environment_news');
    }
};
