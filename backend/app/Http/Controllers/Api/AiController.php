<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    private const MODEL   = 'claude-sonnet-4-20250514';
    private const MAX_TOKENS = 1024;
    private const SYSTEM  = <<<PROMPT
        Tu es l'Eco Assistant d'EcoConnect, un guide intelligent spécialisé en écologie,
        biodiversité et protection de la nature en Afrique centrale et au Cameroun.
        Tu aides les citoyens à comprendre les enjeux environnementaux, à agir
        concrètement et à signaler les incidents écologiques.

        Directives :
        - Réponds toujours dans la langue de l'utilisateur (français ou anglais)
        - Sois chaleureux, pédagogique et concis (max 4 paragraphes)
        - Donne des conseils pratiques et locaux adaptés au contexte camerounais/africain
        - Utilise des emojis naturellement pour rendre le texte vivant
        - Si tu ne sais pas quelque chose, dis-le honnêtement
        - Ne dépasse jamais le cadre de l'écologie et de la protection de la nature
        PROMPT;

    /**
     * POST /api/v1/ai/chat
     * Body: { message: string, conversation_id?: int }
     */
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message'         => ['required', 'string', 'max:1000'],
            'conversation_id' => ['nullable', 'integer'],
        ]);

        $user    = $request->user();
        $message = $request->message;

        // Récupérer ou créer la conversation
        $conversation = $request->conversation_id
            ? AiConversation::where('id', $request->conversation_id)
                            ->where('user_id', $user->id)
                            ->firstOrFail()
            : AiConversation::create(['user_id' => $user->id, 'messages' => []]);

        $history  = $conversation->messages;
        $history[] = ['role' => 'user', 'content' => $message, 'timestamp' => now()->toIso8601String()];

        // Construire les messages pour l'API (sans timestamps)
        $apiMessages = collect($history)
            ->map(fn($m) => ['role' => $m['role'], 'content' => $m['content']])
            ->values()
            ->toArray();

        try {
            $response = Http::withHeaders([
                'x-api-key'         => config('services.anthropic.key'),
                'anthropic-version' => '2023-06-01',
                'Content-Type'      => 'application/json',
            ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
                'model'      => self::MODEL,
                'max_tokens' => self::MAX_TOKENS,
                'system'     => self::SYSTEM,
                'messages'   => $apiMessages,
            ]);

            if (! $response->successful()) {
                Log::error('Claude API error', ['status' => $response->status(), 'body' => $response->body()]);
                return response()->json(['error' => 'AI service unavailable'], 503);
            }

            $reply = $response->json('content.0.text', 'Je n\'ai pas pu répondre. Réessaie! 🌿');

            // Sauvegarder la réponse
            $history[] = ['role' => 'assistant', 'content' => $reply, 'timestamp' => now()->toIso8601String()];
            $conversation->update(['messages' => array_slice($history, -20)]); // garder les 20 derniers

            return response()->json([
                'reply'           => $reply,
                'conversation_id' => $conversation->id,
            ]);

        } catch (\Exception $e) {
            Log::error('AI chat exception', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Internal error'], 500);
        }
    }

    /**
     * GET /api/v1/ai/history
     */
    public function history(Request $request): JsonResponse
    {
        $conversations = AiConversation::where('user_id', $request->user()->id)
            ->select(['id', 'created_at'])
            ->latest()
            ->limit(20)
            ->get();

        return response()->json($conversations);
    }
}
