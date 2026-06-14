<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $posts = Post::with('user:id,name,avatar')
            ->withCount(['likes', 'comments'])
            ->latest()
            ->paginate(15);

        $userId = $request->user()->id;

        $posts->getCollection()->transform(function (Post $post) use ($userId) {
            $post->is_liked = $post->likes()->where('user_id', $userId)->exists();

            return $post;
        });

        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
            'hashtags' => ['nullable', 'array'],
            'media' => ['nullable', 'array', 'max:4'],
            'media.*' => ['file', 'mimes:jpg,jpeg,png,gif,mp4', 'max:10240'],
        ]);

        $mediaUrls = [];

        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $path = $file->store('posts/media', 'public');
                $mediaUrls[] = Storage::url($path);
            }
        }

        preg_match_all('/#(\w+)/', $validated['content'], $matches);
        $hashtags = array_unique(array_merge($validated['hashtags'] ?? [], $matches[1]));

        $post = Post::create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'hashtags' => $hashtags,
            'media_urls' => $mediaUrls,
        ]);

        $request->user()->increment('points', 10);

        return response()->json($post->load('user:id,name,avatar'), 201);
    }

    public function toggleLike(Request $request, Post $post): JsonResponse
    {
        $userId = $request->user()->id;
        $existing = PostLike::where('user_id', $userId)->where('post_id', $post->id)->first();

        if ($existing) {
            $existing->delete();
            $post->decrement('likes_count');
            $liked = false;
        } else {
            PostLike::create(['user_id' => $userId, 'post_id' => $post->id]);
            $post->increment('likes_count');
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $post->fresh()->likes_count,
        ]);
    }

    public function comment(Request $request, Post $post): JsonResponse
    {
        $request->validate(['content' => ['required', 'string', 'max:500']]);

        $comment = $post->comments()->create([
            'user_id' => $request->user()->id,
            'content' => $request->string('content')->toString(),
        ]);

        $post->increment('comments_count');

        return response()->json($comment->load('user:id,name,avatar'), 201);
    }

    public function comments(Post $post): JsonResponse
    {
        return response()->json(
            $post->comments()->with('user:id,name,avatar')->paginate(20)
        );
    }

    public function show(Post $post): JsonResponse
    {
        return response()->json($post->load('user:id,name,avatar'));
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        abort_unless($post->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'content' => ['sometimes', 'string', 'max:2000'],
            'hashtags' => ['sometimes', 'array'],
        ]);

        $post->update($validated);

        return response()->json($post);
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        abort_unless($post->user_id === $request->user()->id, 403);

        $post->delete();

        return response()->json(['message' => 'Post deleted']);
    }
}

