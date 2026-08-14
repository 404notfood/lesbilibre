<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
            ->where('is_approved', false)
            ->whereNull('rejection_reason')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($photo) => [
                'id' => $photo->id,
                'path' => asset('storage/'.$photo->path),
                'user' => [
                    'id' => $photo->user->id,
                    'name' => $photo->user->name,
                    'email' => $photo->user->email,
                ],
                'created_at' => $photo->created_at->diffForHumans(),
                'is_naughty' => $photo->is_naughty,
            ]);

        // Pending verifications
        $pendingVerifications = VerificationPhoto::with('user')
            ->where('status', 'pending')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($verification) => [
                'id' => $verification->id,
                'path' => route('admin.verifications.image', $verification),
                'user' => [
                    'id' => $verification->user->id,
                    'name' => $verification->user->name,
                    'email' => $verification->user->email,
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
                    'name' => $report->reporter->name,
                ],
                'reported' => [
                    'id' => $report->reportedUser->id,
                    'name' => $report->reportedUser->name,
                ],
                'reason' => $report->reason,
                'description' => $report->description,
                'created_at' => $report->created_at->diffForHumans(),
            ]);

        // Statistics
        $stats = [
            'pending_photos' => Photo::where('is_approved', false)->whereNull('rejection_reason')->count(),
            'pending_verifications' => VerificationPhoto::where('status', 'pending')->count(),
            'open_reports' => Report::where('status', 'pending')->count(),
            'resolved_reports_today' => Report::where('status', '!=', 'pending')->whereDate('updated_at', today())->count(),
        ];

        return Inertia::render('Admin/Moderation/Index', [
            'pendingPhotos' => $pendingPhotos,
            'pendingVerifications' => $pendingVerifications,
            'openReports' => $openReports,
            'stats' => $stats,
        ]);
    }

    /** Display the immutable moderation decision history. */
    public function audit(Request $request): Response
    {
        $actions = ModerationAction::with(['moderator:id,name,pseudo', 'subjectUser:id,name,pseudo'])
            ->latest()
            ->paginate(50)
            ->through(fn (ModerationAction $action) => [
                'id' => $action->id,
                'action' => $action->action,
                'reason' => $action->reason,
                'notes' => $action->notes,
                'moderator' => $action->moderator,
                'subject_user' => $action->subjectUser,
                'created_at' => $action->created_at->toISOString(),
            ]);

        return Inertia::render('Admin/Moderation/Audit', ['actions' => $actions]);
    }
}
