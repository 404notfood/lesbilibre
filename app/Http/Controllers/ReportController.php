<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateReportRequest;
use App\Models\Message;
use App\Models\Report;
use App\Models\User;
use App\Services\EphemeralReportService;
use App\Services\ModerationAuditService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    use AuthorizesRequests;

    /**
     * Show the form to report a user.
     */
    public function create(Request $request, int $userId): Response
    {
        $reportedUser = User::findOrFail($userId);

        return Inertia::render('Reports/Create', [
            'reportedUser' => $reportedUser->only(['id', 'pseudo']),
        ]);
    }

    /**
     * Submit a report.
     */
    public function store(CreateReportRequest $request): RedirectResponse
    {
        $currentUser = $request->user();

        if ($currentUser->id === (int) $request->reported_user_id) {
            return redirect()->back()->with('error', 'Vous ne pouvez pas vous signaler vous-même.');
        }

        // Check if user already reported this person
        $existingReport = Report::where('reporter_id', $currentUser->id)
            ->where('reported_user_id', $request->reported_user_id)
            ->whereIn('status', EphemeralReportService::OPEN_STATUSES)
            ->exists();

        if ($existingReport) {
            return redirect()->back()->with('error', 'Vous avez déjà signalé cet utilisateur.');
        }

        Report::create([
            'reporter_id' => $currentUser->id,
            'reported_user_id' => $request->reported_user_id,
            'reason' => $request->reason,
            'description' => $request->description,
        ]);

        $target = User::findOrFail($request->reported_user_id);

        return redirect()->route($currentUser->canInteractWith($target) ? 'profile.view' : 'reports.create', $request->reported_user_id)
            ->with('success', 'Signalement envoyé. Notre équipe va l\'examiner.');
    }

    /**
     * Admin: List all reports.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'pending');

        if (! in_array($status, ['pending', 'reviewed', 'actioned', 'dismissed'], true)) {
            $status = 'pending';
        }

        $reports = Report::with(['reporter:id,pseudo', 'reportedUser:id,pseudo,is_banned'])
            ->where('status', $status)
            ->orderByRaw("CASE WHEN reason = 'suspected_minor' THEN 0 ELSE 1 END")
            ->oldest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Report $report) => [
                'id' => $report->id,
                'reason' => Message::maskEmails($report->reason),
                'description' => $report->description ? Message::maskEmails($report->description) : null,
                'status' => $report->status,
                'admin_notes' => $report->admin_notes ? Message::maskEmails($report->admin_notes) : null,
                'reporter' => $report->reporter,
                'reported_user' => $report->reportedUser,
                'created_at' => $report->created_at->toISOString(),
            ]);

        $counts = Report::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $reports,
            'status' => $status,
            'counts' => [
                'pending' => (int) ($counts['pending'] ?? 0),
                'reviewed' => (int) ($counts['reviewed'] ?? 0),
                'actioned' => (int) ($counts['actioned'] ?? 0),
                'dismissed' => (int) ($counts['dismissed'] ?? 0),
            ],
        ]);
    }

    /**
     * Admin: View a specific report.
     */
    public function show(Request $request, Report $report): Response
    {
        $this->authorize('view', $report);

        $report->load(['reporter:id,pseudo,is_verified', 'reportedUser:id,pseudo,is_banned,is_verified', 'ephemeralMedia']);

        // Get other reports against the same user
        $relatedReports = Report::where('reported_user_id', $report->reported_user_id)
            ->where('id', '!=', $report->id)
            ->with('reporter:id,pseudo')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Report $related) => [
                'id' => $related->id,
                'reason' => Message::maskEmails($related->reason),
                'status' => $related->status,
                'created_at' => $related->created_at->toISOString(),
                'reporter' => $related->reporter,
            ]);

        return Inertia::render('Admin/Reports/Show', [
            'report' => [
                'id' => $report->id,
                'reason' => Message::maskEmails($report->reason),
                'description' => $report->description ? Message::maskEmails($report->description) : null,
                'status' => $report->status,
                'admin_notes' => $report->admin_notes ? Message::maskEmails($report->admin_notes) : null,
                'created_at' => $report->created_at->toISOString(),
                'reporter' => $report->reporter,
                'reported_user' => $report->reportedUser,
                'ephemeral_media_id' => $report->ephemeral_media_id,
                'ephemeral_media_url' => $report->ephemeralMedia?->is_flagged && ! $report->ephemeralMedia?->purged_at
                    ? route('admin.ephemeral.file', $report->ephemeralMedia) : null,
            ],
            'relatedReports' => $relatedReports,
        ]);
    }

    /**
     * Admin: Update report status.
     */
    public function update(Request $request, Report $report): RedirectResponse
    {
        $this->authorize('update', $report);

        $validated = $request->validate([
            'status' => ['required', 'in:pending,reviewed,actioned,dismissed'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
            'ban_user' => ['boolean'],
            'safety_action' => ['nullable', 'in:restrict,restore'],
        ]);

        if (! empty($validated['safety_action'])) {
            $request->validate(['admin_notes' => ['required', 'string', 'min:10', 'max:1000']]);
        } elseif (in_array($validated['status'], ['actioned', 'dismissed'], true) || ! empty($validated['ban_user'])) {
            $request->validate(['admin_notes' => ['required', 'string', 'min:3', 'max:1000']]);
        }

        DB::transaction(function () use ($request, $report, $validated) {
            $report = app(EphemeralReportService::class)->updateReport($report, $validated['status'], $validated['admin_notes'] ?? null);

            if (! empty($validated['safety_action'])) {
                $report->reportedUser->forceFill([
                    'safety_restricted_at' => $validated['safety_action'] === 'restrict' ? now() : null,
                ])->save();
                app(ModerationAuditService::class)->record($request->user(), $report, 'safety_'.$validated['safety_action'], $report->reportedUser, $report->reason, $validated['admin_notes']);
            }

            // Ban the reported user if requested
            if (! empty($validated['ban_user']) && $validated['ban_user']) {
                $report->reportedUser->is_banned = true;
                $report->reportedUser->ban_reason = $report->reason;
                $report->reportedUser->banned_at = now();
                $report->reportedUser->save();
            }

            app(ModerationAuditService::class)->record(
                $request->user(),
                $report,
                ! empty($validated['ban_user']) ? 'report_actioned_and_user_banned' : 'report_updated',
                $report->reportedUser,
                $report->reason,
                $validated['admin_notes'] ?? null,
                ['report_status' => $validated['status']]
            );
        });

        return redirect()->back()->with('success', 'Signalement mis à jour.');
    }
}
