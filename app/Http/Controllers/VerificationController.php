<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadVerificationPhotoRequest;
use App\Models\Message;
use App\Models\VerificationPhoto;
use App\Services\ModerationAuditService;
use App\Services\PhotoProcessingService;
use App\Services\ReferralService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private ReferralService $referralService) {}

    /**
     * Show the verification upload form.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $latestVerification = $user->verificationPhotos()->latest()->first();

        return Inertia::render('Verification/create', [
            'status' => [
                'is_verified' => (bool) $user->is_verified,
                'has_pending' => $latestVerification?->status === 'pending',
                'rejected_reason' => $latestVerification?->status === 'rejected'
                    ? Message::maskEmails($latestVerification->rejection_reason ?? '')
                    : null,
            ],
            // Le code doit être connu avant la prise de vue et rester identique
            // jusqu'à l'envoi, sinon la membre photographie un code périmé.
            'challengeCode' => $this->currentChallengeCode($request),
        ]);
    }

    /**
     * Upload a verification photo.
     */
    public function store(UploadVerificationPhotoRequest $request): RedirectResponse
    {
        $user = $request->user();
        if (! $request->session()->has('verification_challenge_code') || $request->session()->get('verification_challenge_expires_at', 0) < time()) {
            return back()->withErrors(['photo' => 'Le défi a expiré. Rechargez la page et prenez un nouveau selfie avec le nouveau code.']);
        }

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
            'challenge_code' => $this->currentChallengeCode($request),
            'status' => 'pending',
        ]);

        // Le code est consommé : une nouvelle demande en exigera un nouveau.
        $request->session()->forget('verification_challenge_code');

        return redirect()->route('verification.create')
            ->with('success', 'Votre photo de vérification a été envoyée. Elle sera examinée par la modération.');
    }

    /**
     * The code the member must write on a sheet of paper held in the selfie.
     *
     * Kept in the session so it survives the page reloads between reading the
     * code, taking the photo and uploading it. Ambiguous characters are left
     * out: a moderator comparing a handwritten O against a 0 would reject
     * honest submissions.
     */
    private function currentChallengeCode(Request $request): string
    {
        if ($request->session()->get('verification_challenge_expires_at', 0) < time()) {
            $request->session()->forget('verification_challenge_code');
        }

        return $request->session()->remember('verification_challenge_code', function (): string {
            // Chiffres uniquement : rien à interpréter entre une lettre écrite
            // à la main et son sosie typographique. Longueur variable pour
            // qu'un code ne soit pas devinable à partir d'un autre.
            $length = random_int(5, 9);
            request()->session()->put('verification_challenge_expires_at', time() + 1800);
            $code = '';

            for ($i = 0; $i < $length; $i++) {
                $code .= (string) random_int(0, 9);
            }

            return $code;
        });
    }

    /**
     * Admin: List all pending verifications.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', VerificationPhoto::class);

        $verifications = VerificationPhoto::with(['user:id,pseudo,is_verified', 'user.photos'])
            ->whereHas('user')
            ->where('status', 'pending')
            ->latest()
            ->paginate(20)
            ->through(fn (VerificationPhoto $verification) => [
                'id' => $verification->id,
                'image_url' => route('admin.verifications.image', $verification),
                'challenge_code' => $verification->challenge_code,
                'created_at' => $verification->created_at->toISOString(),
                'user' => $verification->user?->only(['id', 'pseudo', 'is_verified']),
                'primary_photo_url' => ($photo = $verification->user?->photos->firstWhere('is_primary', true)) ? route('admin.users.photos.file', [$verification->user, $photo]) : null,
            ]);

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

        abort_unless($verification->user !== null, 404);

        abort_unless(filled($verification->path) && Storage::disk('local')->exists($verification->path), 404);

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
        abort_unless($verification->user !== null, 409, 'Ce compte est fermé. Le selfie est conservé pour le traitement de la demande de suppression.');
        abort_unless($verification->status === 'pending', 409);
        $request->validate(['photos_match_confirmed' => ['accepted']]);
        abort_unless($verification->user->photos()->where('is_primary', true)->where('moderation_status', 'approved')->exists(), 422, 'Validez une photo principale avant de comparer le selfie.');

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
        $this->referralService->rewardVerifiedUser($verification->user);

        return redirect()->back()->with('success', 'Vérification approuvée avec succès.');
    }

    /**
     * Admin: Reject a verification photo.
     */
    public function reject(Request $request, VerificationPhoto $verification): RedirectResponse
    {
        $this->authorize('update', $verification);
        abort_unless($verification->user !== null, 409, 'Ce compte est fermé. Le selfie est conservé pour le traitement de la demande de suppression.');
        abort_unless($verification->status === 'pending', 409);

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
