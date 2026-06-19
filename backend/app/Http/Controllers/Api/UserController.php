<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->load(['badges', 'activeChallenges'])
        );
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'country' => ['sometimes', 'string', 'size:2'],
            'region' => ['sometimes', 'string', 'max:100'],
        ]);

        $request->user()->update($validated);

        return response()->json($request->user()->fresh());
    }

    public function updatePrivacy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'profile_public'      => ['required', 'boolean'],
            'show_on_leaderboard' => ['required', 'boolean'],
            'show_location'       => ['required', 'boolean'],
        ]);

        $request->user()->update(['privacy_settings' => $validated]);

        return response()->json($request->user()->fresh());
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update(['password' => $validated['password']]);

        // Révoquer toutes les autres sessions, conserver celle en cours.
        $current = $user->currentAccessToken();
        $user->tokens()->where('id', '!=', $current?->id)->delete();

        return response()->json(['message' => 'Mot de passe mis à jour']);
    }

    public function logoutOthers(Request $request): JsonResponse
    {
        $user    = $request->user();
        $current = $user->currentAccessToken();
        $count   = $user->tokens()->where('id', '!=', $current?->id)->delete();

        return response()->json([
            'message'        => 'Autres sessions déconnectées',
            'revoked_count'  => $count,
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate(['avatar' => ['required', 'image', 'max:2048']]);

        $path = $request->file('avatar')->store('avatars', 'public');
        $request->user()->update(['avatar' => $path]);

        return response()->json(['avatar_url' => Storage::url($path)]);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'points' => $user->points,
            'level' => $user->level,
            'incidents' => $user->incidents()->count(),
            'validated_incidents' => $user->incidents()->validated()->count(),
            'badges' => $user->badges()->count(),
            'challenges_done' => $user->challenges()->wherePivot('completed', true)->count(),
            'posts' => $user->posts()->count(),
        ]);
    }

    public function badges(Request $request): JsonResponse
    {
        return response()->json($request->user()->badges()->withPivot('earned_at')->get());
    }

    public function leaderboard(): JsonResponse
    {
        return response()->json(
            User::active()->visibleOnLeaderboard()->topRanked(10)->select(['id', 'name', 'avatar', 'points'])->get()
        );
    }

    public function index(): JsonResponse
    {
        return response()->json(User::withTrashed()->paginate(20));
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(['message' => 'User deactivated']);
    }
}

