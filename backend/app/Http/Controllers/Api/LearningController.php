<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LearningController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $resources = LearningResource::published()
            ->when($request->query('category'), fn ($query, $category) => $query->byCategory($category))
            ->when($request->query('type'), fn ($query, $type) => $query->byType($type))
            ->latest()
            ->paginate(20);

        return response()->json($resources);
    }

    public function show(LearningResource $resource): JsonResponse
    {
        abort_unless($resource->is_published, 404);

        $resource->increment('views_count');

        return response()->json($resource->fresh());
    }

    public function markComplete(Request $request, LearningResource $resource): JsonResponse
    {
        DB::table('user_learning_progress')->updateOrInsert(
            [
                'user_id' => $request->user()->id,
                'learning_resource_id' => $resource->id,
            ],
            [
                'completed' => true,
                'completed_at' => now(),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $request->user()->increment('points', 15);

        return response()->json(['message' => 'Resource completed']);
    }
}

