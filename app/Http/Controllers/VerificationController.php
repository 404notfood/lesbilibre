<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadVerificationPhotoRequest;
use App\Models\VerificationPhoto;
use App\Services\ModerationAuditService;
use App\Services\PhotoProcessingService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    use AuthorizesRequests;

    /**
     * Show the verification upload form.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $latestVerification = $user->verificationPhotos()->latest()->first();

        return Inertia::render('Verification/Create', [
            'latestVerification' => $latestVerification,
            'isVerified' => $user->is_verified,
        ]);
    }

    /**
     * Upload a verification photo.
     */
    public function store(UploadVerificationPhotoRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Check if user already has a pending verification
        $hasPending = $user->verificationPhotos()
            ->where('status', 'pending')
            ->exists();

        if ($hasPending) {
            return redirect()->back()->with('error', 'Vous avez déjà une demande de vérification en attente.');
        }

        // Store the photo
        // Verification selfies are sensitive identity data. Keep them outside
        // the public storage symlink and serve them only after an admin policy
        // check (see image()).
        $path = app(PhotoProcessingService::class)->storePrivateVerification($request->file('photo'));

        // Create verification record
        VerificationPhoto::create([
            'user_id' => $user->id,
            'path' => $path,
            'status' => 'pending',
        ]);

        return redirect()->route('verification.create')
            ->with('success', 'Votre photo de vérification a été envoyée. Elle sera examinée sous 48h.');
    }

    /**
     * Admin: List all pending verifications.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', VerificationPhoto::class);

        $verifications = VerificationPhoto::with('user')
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Verification/Index', [
            'verifications' => $verifications,
        ]);
    }

    /**
     * Stream a verification photo to an authorized moderator only.
     */
    public function image(VerificationPhoto $verification)
    {
        $this->authorize('view', $verification);

        abort_unless(Storage::disk('local')->exists($verification->path), 404);

        return Storage::disk('local')->response($verification->path, null, [
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /**
     * Admin: Approve a verification photo.
     */
    public function approve(Request $request, VerificationPhoto $verification): RedirectResponse
    {
        $this->authorize('update', $verification);

        $verification->update([
            'status' => 'approved',
            'verified_at' => now(),
        ]);

        $verification->user->is_verified = true;
        $verification->user->save();

        app(ModerationAuditService::class)->record(
            $request->user(),
            $verification,
            'verification_approved',
            $verification->user
        );

        // Trigger badge check
        \App\Events\UserVerified::dispatch($verification->user);

        return redirect()->back()->with('success', 'Vérification approuvée avec succès.');
    }

    /**
     * Admin: Reject a verification photo.
     */
    public function reject(Request $request, VerificationPhoto $verification): RedirectResponse
    {
        $this->authorize('update', $verification);

        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        $verification->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
        ]);

        app(ModerationAuditService::class)->record(
            $request->user(),
            $verification,
            'verification_rejected',
            $verification->user,
            'verification_rejected',
            $request->rejection_reason
        );

        return redirect()->back()->with('success', 'Vérification rejetée.');
    }
}
