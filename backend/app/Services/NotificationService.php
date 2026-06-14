<?php

namespace App\Services;

use App\Models\Incident;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationService
{
    public function notify(User $user, string $type, array $data = []): void
    {
        DB::table('notifications')->insert([
            'id' => (string) Str::uuid(),
            'type' => 'App\\Notifications\\'.Str::studly($type),
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => json_encode(['type' => $type, ...$data]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function notifyAdmins(string $type, Incident $incident): void
    {
        $admins = User::where('profile_type', 'admin')->get();

        foreach ($admins as $admin) {
            $this->notify($admin, $type, [
                'incident_id' => $incident->id,
                'incident_type' => $incident->type,
                'location' => $incident->location_name,
            ]);
        }
    }
}

