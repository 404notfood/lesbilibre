<?php

namespace App\Http\Controllers;

use App\Models\GalleryAccessRequest;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GalleryAccessController extends Controller
{
    public function __construct(protected NotificationService $notificationService) {}

    /**
     * Display a listing of gallery access requests received.
     */
    public function index(Request $request): Response
    {
        $requests = $request->user()
            ->galleryAccessRequestsReceived()
            ->with(['requester.photos' => fn ($query) => $query->where('is_primary', true)])
            ->where('status', 'pending')
            ->latest()
            ->get();

        return Inertia::render('GalleryAccess/Index', [
            'requests' => $requests,
        ]);
    }

    /**
     * Request access to a user's private gallery.
     */
    public function request(Request $request, int $userId): RedirectResponse
    {
        $user = $request->user();
        $gemsCost = 50; // Default cost, could be configurable

        abort_if($user->id === $userId, 422, 'Vous ne pouvez pas demander l’accès à votre propre galerie.');
        abort_unless(\App\Models\User::whereKey($userId)->exists(), 404);

        // Check if user has enough gems
        if ($user->gems < $gemsCost) {
            return back()->with('error', 'Vous n\'avez pas assez de gemmes.');
        }

        // Check if request already exists
        $existingRequest = GalleryAccessRequest::where('requester_user_id', $user->id)
            ->where('owner_user_id', $userId)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return back()->with('error', 'Vous avez déjà une demande en attente.');
        }

        DB::transaction(function () use ($user, $userId, $gemsCost): void {
            app(\App\Services\GemService::class)->deductGems(
                $user,
                $gemsCost,
                'spend',
                'gallery_access_request',
                "Demande d'accès à la galerie privée",
                ['owner_user_id' => $userId]
            );

            GalleryAccessRequest::create([
                'requester_user_id' => $user->id,
                'owner_user_id' => $userId,
                'gems_cost' => $gemsCost,
                'status' => 'pending',
            ]);

            $this->notificationService->notifyGalleryAccessRequest($userId, $user->id);
        });

        return back()->with('success', 'Demande d\'accès envoyée avec succès.');
    }

    /**
     * Accept a gallery access request.
     */
    public function accept(Request $request, int $requestId): RedirectResponse
    {
        $accessRequest = GalleryAccessRequest::where('id', $requestId)
            ->where('owner_user_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $accessRequest->accept();

        // Send notification to the requester
        $this->notificationService->notifyGalleryAccessAccepted(
            $accessRequest->requester_user_id,
            $request->user()->id
        );

        return back()->with('success', 'Demande acceptée avec succès.');
    }

    /**
     * Reject a gallery access request.
     */
    public function reject(Request $request, int $requestId): RedirectResponse
    {
        $accessRequest = GalleryAccessRequest::where('id', $requestId)
            ->where('owner_user_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $accessRequest->reject();

        // Send notification to the requester
        $this->notificationService->notifyGalleryAccessRejected(
            $accessRequest->requester_user_id,
            $request->user()->id
        );

        return back()->with('success', 'Demande refusée. Les gemmes ont été remboursées.');
    }

    /**
     * Display all gallery access (granted and received).
     */
    public function manage(Request $request): Response
    {
        $user = $request->user();

        // Access granted by me (people who can see my gallery)
        $accessGranted = GalleryAccessRequest::where('owner_user_id', $user->id)
            ->where('status', 'accepted')
            ->whereNull('revoked_at')
            ->with('requester')
            ->latest()
            ->get();

        // Access received by me (galleries I can see)
        $accessReceived = GalleryAccessRequest::where('requester_user_id', $user->id)
            ->where('status', 'accepted')
            ->whereNull('revoked_at')
            ->with('owner')
            ->latest()
            ->get();

        return Inertia::render('GalleryAccess/Manage', [
            'accessGranted' => $accessGranted,
            'accessReceived' => $accessReceived,
        ]);
    }

    /**
     * Grant direct access to gallery without request.
     */
    public function grant(Request $request, int $userId): RedirectResponse
    {
        $user = $request->user();

        abort_if($user->id === $userId, 422, 'Vous ne pouvez pas vous accorder l’accès à vous-même.');
        abort_unless(\App\Models\User::whereKey($userId)->exists(), 404);

        // Check if access already exists
        $existingAccess = GalleryAccessRequest::where('requester_user_id', $userId)
            ->where('owner_user_id', $user->id)
            ->where('status', 'accepted')
            ->whereNull('revoked_at')
            ->first();

        if ($existingAccess) {
            return back()->with('error', 'Cet utilisateur a déjà accès à votre galerie.');
        }

        // Create gallery access directly (no gems cost, no pending status)
        GalleryAccessRequest::create([
            'requester_user_id' => $userId,
            'owner_user_id' => $user->id,
            'gems_cost' => 0,
            'status' => 'accepted',
        ]);

        // Send notification to the user
        $this->notificationService->notifyGalleryAccessAccepted($userId, $user->id);

        return back()->with('success', 'Accès galerie accordé avec succès.');
    }

    /**
     * Revoke gallery access.
     */
    public function revoke(Request $request, int $requestId): RedirectResponse
    {
        $user = $request->user();

        // Find access where user is either owner or requester
        $accessRequest = GalleryAccessRequest::where('id', $requestId)
            ->where(function ($query) use ($user) {
                $query->where('owner_user_id', $user->id)
                    ->orWhere('requester_user_id', $user->id);
            })
            ->where('status', 'accepted')
            ->whereNull('revoked_at')
            ->firstOrFail();

        // Determine who revoked
        $revokedBy = $accessRequest->owner_user_id === $user->id ? 'owner' : 'requester';

        // Revoke access
        $accessRequest->update([
            'revoked_at' => now(),
            'revoked_by' => $revokedBy,
        ]);

        return back()->with('success', 'Accès galerie révoqué avec succès.');
    }
}
