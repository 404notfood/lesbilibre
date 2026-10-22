<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\ModerationAction;
use App\Models\Photo;
use App\Models\Report;
use App\Models\VerificationPhoto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModerationController extends Controller
{
    /**
     * Display the moderation dashboard.
     */
    public function index(Request $request): Response
    {
        // Pending photos
        $pendingPhotos = Photo::with('user')
            ->whereHas('user')
            ->whereIn('moderation_status', ['pending', 'quarantined'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($photo) => [
                'id' => $photo->id,
                'path' => route('admin.users.photos.file', [$photo->user_id, $photo->id]),
                'user' => [
                    'id' => $photo->user->id,
                    'name' => $photo->user->pseudo,
                ],
                'created_at' => $photo->created_at->diffForHumans(),
                'is_naughty' => $photo->is_naughty,
            ]);

        // Pending verifications
        $pendingVerifications = VerificationPhoto::with('user')
            ->whereHas('user')
            ->where('status', 'pending')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($verification) => [
                'id' => $verification->id,
                'path' => route('admin.verifications.image', $verification),
                'user' => [
                    'id' => $verification->user->id,
                    'name' => $verification->user->pseudo,
                ],
                'created_at' => $verification->created_at->diffForHumans(),
            ]);

        // Open reports
        $openReports = Report::with(['reporter', 'reportedUser'])
            ->where('status', 'pending')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($report) => [
                'id' => $report->id,
                'reporter' => [
                    'id' => $report->reporter->id,
                    'name' => $report->reporter->pseudo,
                ],
                'reported' => [
                    'id' => $report->reportedUser->id,
                    'name' => $report->reportedUser->pseudo,
                ],
                'reason' => Message::maskEmails($report->reason),
                'description' => $report->description ? Message::maskEmails($report->description) : null,
                'created_at' => $report->created_at->diffForHumans(),
            ]);

        // Statistics
        $stats = [
            'pending_photos' => Photo::whereHas('user')->whereIn('moderation_status', ['pending', 'quarantined'])->count(),
            'pending_verifications' => VerificationPhoto::whereHas('user')->where('status', 'pending')->count(),
            'open_reports' => Report::where('status', 'pending')->count(),
            'resolved_reports_today' => Report::where('status', '!=', 'pending')->whereDate('updated_at', today())->count(),
        ];

        return Inertia::render('Admin/Moderation/Index', [
            'pendingPhotos' => $pendingPhotos,
            'pendingVerifications' => $pendingVerifications,
            'openReports' => $openReports,
            'stats' => $stats,
            'operations' => app(\App\Services\OperationalHealthService::class)->snapshot(),
        ]);
    }

    /** Display the immutable moderation decision history. */
    public function audit(Request $request): Response
    {
        $actions = ModerationAction::with(['moderator:id,pseudo', 'subjectUser:id,pseudo'])
            ->latest()
            ->paginate(50)
            ->through(fn (ModerationAction $action) => [
                'id' => $action->id,
                'action' => $action->action,
                'reason' => $action->reason ? Message::maskEmails($action->reason) : null,
                'notes' => $action->notes ? Message::maskEmails($action->notes) : null,
                'moderator' => $action->moderator ? ['id' => $action->moderator->id, 'pseudo' => $action->moderator->pseudo, 'name' => $action->moderator->pseudo] : null,
                'subject_user' => $action->subjectUser ? ['id' => $action->subjectUser->id, 'pseudo' => $action->subjectUser->pseudo, 'name' => $action->subjectUser->pseudo] : null,
                'created_at' => $action->created_at->toISOString(),
            ]);

        return Inertia::render('Admin/Moderation/Audit', ['actions' => $actions]);
    }
}
