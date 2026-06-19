<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ChallengeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\LearningController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\MapController;
use App\Http\Controllers\Api\EnvironmentHubController;

/*
|--------------------------------------------------------------------------
| EcoConnect API Routes
|--------------------------------------------------------------------------
*/

// ── PUBLIC ────────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('register',       [AuthController::class, 'register']);
        Route::post('login',          [AuthController::class, 'login']);
        Route::post('forgot-password',[AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    // Public map data
    Route::get('incidents/public',    [IncidentController::class, 'publicIndex']);
    Route::get('stats/public',        [StatsController::class,    'publicStats']);
    Route::get('environment-hub',      [EnvironmentHubController::class, 'index']);

    // ── AUTHENTICATED ──────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('auth/logout',    [AuthController::class, 'logout']);
        Route::post('auth/refresh',   [AuthController::class, 'refresh']);

        // Profile
        Route::prefix('user')->group(function () {
            Route::get('/',           [UserController::class, 'me']);
            Route::put('/',           [UserController::class, 'update']);
            Route::post('avatar',     [UserController::class, 'uploadAvatar']);
            Route::put('privacy',     [UserController::class, 'updatePrivacy']);
            Route::post('password',   [UserController::class, 'changePassword']);
            Route::post('logout-others', [UserController::class, 'logoutOthers']);
            Route::get('stats',       [UserController::class, 'stats']);
            Route::get('badges',      [UserController::class, 'badges']);
            Route::get('leaderboard', [UserController::class, 'leaderboard']);
        });

        // Incidents (Reports)
        Route::get('incidents/nearby',  [IncidentController::class, 'nearby']);
        Route::apiResource('incidents', IncidentController::class);
        Route::post('incidents/{incident}/validate', [IncidentController::class, 'validate'])
             ->middleware('role:admin|moderator|expert');

        // Social Feed
        Route::apiResource('posts', PostController::class);
        Route::post('posts/{post}/like',    [PostController::class, 'toggleLike']);
        Route::post('posts/{post}/comment', [PostController::class, 'comment']);
        Route::get('posts/{post}/comments', [PostController::class, 'comments']);

        // Challenges
        Route::get('challenges',                         [ChallengeController::class, 'index']);
        Route::get('challenges/{challenge}',             [ChallengeController::class, 'show']);
        Route::post('challenges/{challenge}/join',       [ChallengeController::class, 'join']);
        Route::post('challenges/{challenge}/progress',   [ChallengeController::class, 'updateProgress']);
        Route::get('challenges/my',                      [ChallengeController::class, 'myChapters']);

        // Learning Library
        Route::get('learning',              [LearningController::class, 'index']);
        Route::get('learning/{resource}',   [LearningController::class, 'show']);
        Route::post('learning/{resource}/complete', [LearningController::class, 'markComplete']);

        // Environmental Hub
        Route::get('environment-hub/favorites', [EnvironmentHubController::class, 'favorites']);
        Route::post('environment-hub/favorites', [EnvironmentHubController::class, 'toggleFavorite']);

        // Notifications
        Route::get('notifications',             [NotificationController::class, 'index']);
        Route::post('notifications/{id}/read',  [NotificationController::class, 'markRead']);
        Route::post('notifications/read-all',   [NotificationController::class, 'markAllRead']);

        // Stats & Analytics
        Route::get('stats/dashboard',   [StatsController::class, 'dashboard']);
        Route::get('stats/reports',     [StatsController::class, 'reportsByType']);
        Route::get('stats/leaderboard', [StatsController::class, 'leaderboard']);
        Route::get('stats/prediction',  [StatsController::class, 'riskPrediction']);

        // Map
        Route::get('map/incidents',     [MapController::class, 'incidents']);
        Route::get('map/heatmap',       [MapController::class, 'heatmap']);

        // AI Assistant
        Route::post('ai/chat',          [AiController::class, 'chat']);
        Route::get('ai/history',        [AiController::class, 'history']);

        // Admin only
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('users',                [UserController::class,    'index']);
            Route::delete('users/{user}',      [UserController::class,    'destroy']);
            Route::post('challenges',          [ChallengeController::class, 'store']);
            Route::put('challenges/{challenge}',[ChallengeController::class, 'update']);
        });
    });
});
