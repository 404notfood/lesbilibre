<?php

namespace App\Http\Controllers\Settings;

use App\Enums\NotificationFrequency;
use App\Enums\NotificationType;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateNotificationPreferencesRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPreferenceController extends Controller
{
    /**
     * Show the notification preferences screen.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('notificationPreferences');

        $types = collect(NotificationType::cases())->map(fn (NotificationType $type) => [
            'value' => $type->value,
            'label' => $type->label(),
            'description' => $type->description(),
            'frequency' => $user->notificationFrequency($type)->value,
            'available_frequencies' => collect($type->availableFrequencies())
                ->map(fn (NotificationFrequency $frequency) => [
                    'value' => $frequency->value,
                    'label' => $frequency->label(),
                ])
                ->values()
                ->all(),
        ])->values()->all();

        return Inertia::render('settings/notifications', [
            'notificationTypes' => $types,
        ]);
    }

    /**
     * Persist the notification preferences.
     */
    public function update(UpdateNotificationPreferencesRequest $request): RedirectResponse
    {
        $user = $request->user();

        foreach ($request->validated('preferences') as $type => $frequency) {
            $user->notificationPreferences()->updateOrCreate(
                ['type' => $type],
                ['frequency' => $frequency],
            );
        }

        return redirect()
            ->route('settings.notifications.edit')
            ->with('success', 'Préférences de notification enregistrées.');
    }
}
