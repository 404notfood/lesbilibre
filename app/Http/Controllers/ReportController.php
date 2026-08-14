<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateReportRequest;
use App\Models\Report;
use App\Models\User;
use App\Services\ModerationAuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Show the form to report a user.
     */
    public function create(Request $request, int $userId): Response
    {
        $reportedUser = User::findOrFail($userId);

        return Inertia::render('Reports/Create', [
            'reportedUser' => $reportedUser,
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
            ->where('status', 'pending')
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

        return redirect()->route('profile.view', $request->reported_user_id)
            ->with('success', 'Signalement envoyé. Notre équipe va l\'examiner.');
    }

    /**
     * Admin: List all reports.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'pending');

        $reports = Report::with(['reporter', 'reportedUser'])
            ->where('status', $status)
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $reports,
            'status' => $status,
        ]);
    }

    /**
     * Admin: View a specific report.
     */
    public function show(Request $request, Report $report): Response
    {
        $this->authorize('view', $report);

        $report->load(['reporter.profile', 'reportedUser.profile']);

        // Get other reports against the same user
        $relatedReports = Report::where('reported_user_id', $report->reported_user_id)
            ->where('id', '!=', $report->id)
            ->with('reporter')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Reports/Show', [
            'report' => $report,
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
        ]);

        $report->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

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

        return redirect()->back()->with('success', 'Signalement mis à jour.');
    }
}
