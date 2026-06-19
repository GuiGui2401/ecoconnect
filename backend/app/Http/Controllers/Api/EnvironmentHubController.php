<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EnvironmentalLegalGuide;
use App\Models\EnvironmentalNews;
use App\Models\EnvironmentalOrganization;
use App\Models\UserSavedHubItem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EnvironmentHubController extends Controller
{
    private const TYPE_MODELS = [
        'news' => EnvironmentalNews::class,
        'organization' => EnvironmentalOrganization::class,
        'legal_guide' => EnvironmentalLegalGuide::class,
    ];

    public function index(Request $request): JsonResponse
    {
        $locale = $this->locale($request);

        return response()->json([
            'news' => EnvironmentalNews::published()
                ->latest('published_at')
                ->get()
                ->map(fn (EnvironmentalNews $item) => $this->formatNews($item, $locale)),
            'organizations' => EnvironmentalOrganization::active()
                ->orderBy('scope')
                ->orderBy('name')
                ->get()
                ->map(fn (EnvironmentalOrganization $item) => $this->formatOrganization($item, $locale)),
            'legal_guides' => EnvironmentalLegalGuide::published()
                ->orderBy('jurisdiction')
                ->orderBy('topic')
                ->get()
                ->map(fn (EnvironmentalLegalGuide $item) => $this->formatLegalGuide($item, $locale)),
        ]);
    }

    public function favorites(Request $request): JsonResponse
    {
        $locale = $this->locale($request);

        $favorites = UserSavedHubItem::where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (UserSavedHubItem $favorite) => $this->formatFavorite($favorite, $locale))
            ->filter()
            ->values();

        return response()->json($favorites);
    }

    private function locale(Request $request): string
    {
        return in_array($request->query('lang'), ['fr', 'en'], true)
            ? $request->query('lang')
            : 'fr';
    }

    public function toggleFavorite(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_type' => ['required', Rule::in(array_keys(self::TYPE_MODELS))],
            'item_id' => ['required', 'integer', 'min:1'],
        ]);

        $item = $this->resolveItem($validated['item_type'], (int) $validated['item_id']);

        abort_unless($item, 404, 'Item not found');

        $favorite = UserSavedHubItem::where('user_id', $request->user()->id)
            ->where('item_type', $validated['item_type'])
            ->where('item_id', $validated['item_id'])
            ->first();

        if ($favorite) {
            $favorite->delete();
            $saved = false;
        } else {
            $favorite = UserSavedHubItem::create([
                'user_id' => $request->user()->id,
                'item_type' => $validated['item_type'],
                'item_id' => $validated['item_id'],
            ]);
            $saved = true;
        }

        return response()->json([
            'saved' => $saved,
            'favorite' => $saved ? $this->formatFavorite($favorite, $this->locale($request)) : null,
        ]);
    }

    private function resolveItem(string $type, int $id): ?Model
    {
        $model = self::TYPE_MODELS[$type] ?? null;

        return $model ? $model::query()->find($id) : null;
    }

    private function formatFavorite(UserSavedHubItem $favorite, string $locale = 'fr'): ?array
    {
        $item = $this->resolveItem($favorite->item_type, $favorite->item_id);

        if (! $item) {
            return null;
        }

        return [
            'id' => $favorite->id,
            'item_type' => $favorite->item_type,
            'item_id' => $favorite->item_id,
            'created_at' => $favorite->created_at,
            'item' => $this->formatItem($favorite->item_type, $item, $locale),
        ];
    }

    private function formatItem(string $type, Model $item, string $locale = 'fr'): array
    {
        return match ($type) {
            'news' => $this->formatNews($item, $locale),
            'organization' => $this->formatOrganization($item, $locale),
            'legal_guide' => $this->formatLegalGuide($item, $locale),
        };
    }

    private function formatNews(EnvironmentalNews $item, string $locale = 'fr'): array
    {
        return [
            'id' => $item->id,
            'item_type' => 'news',
            'type' => $item->translated('type', $locale),
            'region' => $item->translated('region', $locale),
            'date' => $item->published_at?->toDateString(),
            'title' => $item->translated('title', $locale),
            'summary' => $item->translated('summary', $locale),
            'source' => $item->source,
            'url' => $item->source_url,
            'priority' => $item->priority,
            'tags' => $item->tags ?? [],
        ];
    }

    private function formatOrganization(EnvironmentalOrganization $item, string $locale = 'fr'): array
    {
        return [
            'id' => $item->id,
            'item_type' => 'organization',
            'name' => $item->name,
            'scope' => $item->translated('scope', $locale),
            'region' => $item->translated('region', $locale),
            'focus' => $item->translated('focus', $locale),
            'project' => $item->translated('project', $locale),
            'website' => $item->website_url,
            'donateUrl' => $item->donate_url,
            'latitude' => $item->latitude,
            'longitude' => $item->longitude,
            'tags' => $item->tags ?? [],
        ];
    }

    private function formatLegalGuide(EnvironmentalLegalGuide $item, string $locale = 'fr'): array
    {
        return [
            'id' => $item->id,
            'item_type' => 'legal_guide',
            'jurisdiction' => $item->translated('jurisdiction', $locale),
            'topic' => $item->translated('topic', $locale),
            'title' => $item->translated('title', $locale),
            'summary' => $item->translated('summary', $locale),
            'duties' => $item->translated('duties', $locale) ?? [],
            'url' => $item->official_url,
            'tags' => $item->tags ?? [],
        ];
    }
}
