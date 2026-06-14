<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use Illuminate\Http\JsonResponse;

class MapController extends Controller
{
    public function incidents(): JsonResponse
    {
        return response()->json(
            Incident::validated()
                ->select(['id', 'type', 'description', 'latitude', 'longitude', 'location_name', 'risk_level', 'created_at'])
                ->latest()
                ->limit(300)
                ->get()
        );
    }

    public function heatmap(): JsonResponse
    {
        $points = Incident::validated()
            ->select(['latitude', 'longitude', 'risk_level'])
            ->get()
            ->map(fn (Incident $incident) => [
                'lat' => (float) $incident->latitude,
                'lng' => (float) $incident->longitude,
                'weight' => match ($incident->risk_level) {
                    'critical' => 1.0,
                    'high' => 0.8,
                    'medium' => 0.5,
                    default => 0.25,
                },
            ]);

        return response()->json($points);
    }
}

