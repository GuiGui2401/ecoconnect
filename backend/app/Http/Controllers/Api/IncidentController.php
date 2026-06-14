<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Services\BadgeService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class IncidentController extends Controller
{
    public function __construct(
        private BadgeService       $badgeService,
        private NotificationService $notificationService,
    ) {}

    /**
     * GET /api/v1/incidents/public  — public, no auth
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $incidents = Incident::validated()
            ->select(['id', 'type', 'description', 'latitude', 'longitude', 'location_name', 'risk_level', 'status', 'created_at'])
            ->latest()
            ->limit(100)
            ->get();

        return response()->json($incidents);
    }

    /**
     * GET /api/v1/incidents — liste paginée (auth)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $canReviewAll = in_array($user->profile_type, ['admin', 'moderator', 'expert', 'ngo'], true);

        $incidents = Incident::with('user:id,name,avatar')
            ->when(! $canReviewAll, function ($query) use ($user) {
                $query->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                        ->orWhere('status', 'validated');
                });
            })
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->risk_level, fn($q) => $q->where('risk_level', $request->risk_level))
            ->latest()
            ->paginate(15);

        return response()->json($incidents);
    }

    /**
     * POST /api/v1/incidents — créer un signalement
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type'          => ['required', 'in:pollution,fire,deforestation,poaching,waste,other'],
            'description'   => ['required', 'string', 'min:20', 'max:2000'],
            'latitude'      => ['required', 'numeric', 'between:-90,90'],
            'longitude'     => ['required', 'numeric', 'between:-180,180'],
            'location_name' => ['nullable', 'string', 'max:255'],
            'risk_level'    => ['nullable', 'in:low,medium,high,critical'],
            'media'         => ['nullable', 'array', 'max:5'],
            'media.*'       => ['file', 'mimes:jpg,jpeg,png,mp4,mov', 'max:20480'],
        ]);

        // Upload des médias
        $mediaUrls = [];
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $path = $file->store('incidents/media', 'public');
                $mediaUrls[] = Storage::url($path);
            }
        }

        $incident = Incident::create([
            ...$validated,
            'user_id'    => $request->user()->id,
            'media_urls' => $mediaUrls,
            'status'     => 'pending',
        ]);

        // Points + badges
        $user = $request->user();
        $user->increment('points', 50);
        $this->badgeService->checkAndAward($user, 'incident_reported');

        // Notifier les admins
        $this->notificationService->notifyAdmins('new_incident', $incident);

        return response()->json([
            'message'  => 'Incident reported successfully',
            'incident' => $incident->load('user:id,name,avatar'),
            'points_earned' => 50,
        ], 201);
    }

    /**
     * GET /api/v1/incidents/{incident}
     */
    public function show(Incident $incident): JsonResponse
    {
        return response()->json(
            $incident->load('user:id,name,avatar,level')
        );
    }

    /**
     * PUT /api/v1/incidents/{incident}
     */
    public function update(Request $request, Incident $incident): JsonResponse
    {
        abort_unless(
            $incident->user_id === $request->user()->id || $request->user()->profile_type === 'admin',
            403
        );

        $validated = $request->validate([
            'description'   => ['sometimes', 'string', 'min:20'],
            'risk_level'    => ['sometimes', 'in:low,medium,high,critical'],
            'location_name' => ['sometimes', 'string', 'max:255'],
        ]);

        $incident->update($validated);

        return response()->json($incident);
    }

    /**
     * DELETE /api/v1/incidents/{incident}
     */
    public function destroy(Request $request, Incident $incident): JsonResponse
    {
        abort_unless(
            $incident->user_id === $request->user()->id || $request->user()->profile_type === 'admin',
            403
        );
        $incident->delete();

        return response()->json(['message' => 'Incident deleted']);
    }

    /**
     * POST /api/v1/incidents/{incident}/validate — admin/moderator
     */
    public function validate(Request $request, Incident $incident): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:validated,rejected,resolved'],
        ]);

        $incident->update([
            'status'       => $request->status,
            'validated_at' => now(),
            'validated_by' => $request->user()->id,
        ]);

        // Notifier le rapporteur
        if ($request->status === 'validated') {
            $this->notificationService->notify(
                $incident->user,
                'incident_validated',
                ['incident_id' => $incident->id, 'type' => $incident->type]
            );
            // Bonus de points pour validation
            $incident->user->increment('points', 30);
        }

        return response()->json([
            'message'  => "Incident {$request->status}",
            'incident' => $incident,
        ]);
    }

    /**
     * GET /api/v1/incidents/nearby?lat=&lng=&radius=50
     */
    public function nearby(Request $request): JsonResponse
    {
        $request->validate([
            'lat'    => ['required', 'numeric'],
            'lng'    => ['required', 'numeric'],
            'radius' => ['nullable', 'numeric', 'max:500'],
        ]);

        $lat    = $request->lat;
        $lng    = $request->lng;
        $radius = $request->radius ?? 50; // km

        $incidents = Incident::validated()
            ->selectRaw("*, 
                (6371 * acos(cos(radians(?)) * cos(radians(latitude))
                * cos(radians(longitude) - radians(?))
                + sin(radians(?)) * sin(radians(latitude)))) AS distance",
                [$lat, $lng, $lat])
            ->having('distance', '<', $radius)
            ->orderBy('distance')
            ->limit(50)
            ->get();

        return response()->json($incidents);
    }
}
