<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Services\BadgeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    public function __construct(private BadgeService $badgeService) {}

    public function index(Request $request): JsonResponse
    {
        $type = $request->query('type');
        $user = $request->user();

        $challenges = Challenge::active()
            ->when($type, fn ($query) => $query->byType($type))
            ->get()
            ->map(function (Challenge $challenge) use ($user) {
                $pivot = $user->challenges()->where('challenge_id', $challenge->id)->first()?->pivot;

                return [
                    ...$challenge->toArray(),
                    'joined' => (bool) $pivot,
                    'progress' => $pivot?->progress ?? 0,
                    'completed' => (bool) ($pivot?->completed ?? false),
                    'pct' => $challenge->getProgressPercentageForUser($user),
                ];
            });

        return response()->json($challenges);
    }

    public function show(Challenge $challenge): JsonResponse
    {
        return response()->json($challenge);
    }

    public function join(Request $request, Challenge $challenge): JsonResponse
    {
        $user = $request->user();

        if ($user->challenges()->where('challenge_id', $challenge->id)->exists()) {
            return response()->json(['message' => 'Already joined'], 409);
        }

        $user->challenges()->attach($challenge->id, ['progress' => 0, 'completed' => false]);

        return response()->json(['message' => 'Challenge joined']);
    }

    public function updateProgress(Request $request, Challenge $challenge): JsonResponse
    {
        $request->validate(['progress' => ['required', 'integer', 'min:0']]);

        $user = $request->user();
        $pivot = $user->challenges()->where('challenge_id', $challenge->id)->firstOrFail()->pivot;
        $newProgress = max($pivot->progress, $request->integer('progress'));
        $completed = $newProgress >= $challenge->goal_value;

        $user->challenges()->updateExistingPivot($challenge->id, [
            'progress' => $newProgress,
            'completed' => $completed,
            'completed_at' => $completed ? now() : null,
        ]);

        if ($completed && ! $pivot->completed) {
            $user->increment('points', $challenge->points_reward);
            $this->badgeService->auditUser($user);
        }

        return response()->json([
            'progress' => $newProgress,
            'completed' => $completed,
            'pct' => $challenge->getProgressPercentageForUser($user->fresh()),
        ]);
    }

    public function myChapters(Request $request): JsonResponse
    {
        return response()->json($request->user()->challenges()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string'],
            'description' => ['required', 'string'],
            'icon' => ['nullable', 'string'],
            'type' => ['required', 'in:daily,weekly,community,special'],
            'goal_value' => ['required', 'integer', 'min:1'],
            'goal_unit' => ['required', 'string'],
            'points_reward' => ['required', 'integer'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
        ]);

        return response()->json(Challenge::create($validated), 201);
    }

    public function update(Request $request, Challenge $challenge): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string'],
            'description' => ['sometimes', 'string'],
            'icon' => ['sometimes', 'nullable', 'string'],
            'type' => ['sometimes', 'in:daily,weekly,community,special'],
            'goal_value' => ['sometimes', 'integer', 'min:1'],
            'goal_unit' => ['sometimes', 'string'],
            'points_reward' => ['sometimes', 'integer'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $challenge->update($validated);

        return response()->json($challenge);
    }
}

