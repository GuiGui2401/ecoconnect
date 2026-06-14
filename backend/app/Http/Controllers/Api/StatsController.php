<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function publicStats(): JsonResponse
    {
        return response()->json([
            'total_incidents' => Incident::validated()->count(),
            'total_users' => User::active()->count(),
            'total_actions' => DB::table('user_challenges')->where('completed', true)->count(),
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user_points' => $user->points,
            'user_level' => $user->level,
            'incidents_count' => $user->incidents()->count(),
            'badges_count' => $user->badges()->count(),
            'challenges_done' => $user->challenges()->wherePivot('completed', true)->count(),
            'global_incidents' => Incident::validated()->count(),
            'this_month' => Incident::validated()->whereMonth('created_at', now()->month)->count(),
        ]);
    }

    public function reportsByType(): JsonResponse
    {
        $data = Incident::validated()
            ->select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->type => $row->count]);

        return response()->json($data);
    }

    public function leaderboard(): JsonResponse
    {
        $leaders = User::active()
            ->select(['id', 'name', 'avatar', 'points', 'country'])
            ->topRanked(10)
            ->get()
            ->map(fn (User $user) => [
                ...$user->toArray(),
                'level' => $user->level,
                'avatar_url' => $user->avatar_url,
            ]);

        return response()->json($leaders);
    }

    public function riskPrediction(): JsonResponse
    {
        $recentFires = Incident::where('type', 'fire')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $riskScore = min(99, 40 + ($recentFires * 8));

        return response()->json([
            'risk_type' => 'fire',
            'risk_score' => $riskScore,
            'risk_level' => $riskScore >= 70 ? 'high' : ($riskScore >= 40 ? 'medium' : 'low'),
            'message' => 'High risk of fire in your area in the next 5 days',
            'computed_at' => now()->toIso8601String(),
        ]);
    }
}

