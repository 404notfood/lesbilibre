import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
} from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Ban, Flag, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

interface ReportUser {
    id: number;
    name: string;
    pseudo: string;
    is_banned?: boolean;
}

interface Report {
    id: number;
    reason: string;
    description: string | null;
    status: ReportStatus;
    admin_notes: string | null;
    reporter: ReportUser | null;
    reported_user: ReportUser | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    reports: {
        data: Report[];
        links: PaginationLink[];
        total: number;
        from: number | null;
        to: number | null;
    };
    status: ReportStatus;
    counts: Record<ReportStatus, number>;
}

const STATUS_TABS: { value: ReportStatus; label: string }[] = [
    { value: 'pending', label: 'En attente' },
    { value: 'reviewed', label: 'Examinés' },
    { value: 'actioned', label: 'Sanctionnés' },
    { value: 'dismissed', label: 'Rejetés' },
];

const REASON_LABELS: Record<string, string> = {
    spam: 'Spam',
    harassment: 'Harcèlement',
    fake_profile: 'Faux profil',
    inappropriate_content: 'Contenu inapproprié',
    other: 'Autre',
};

const STATUS_TONES: Record<
    ReportStatus,
    'warning' | 'neutral' | 'danger' | 'success'
> = {
    pending: 'warning',
    reviewed: 'neutral',
    actioned: 'danger',
    dismissed: 'success',
};

export default function Index({ reports, status, counts }: Props) {
    return (
        <AdminLayout
            title="Signalements"
            subtitle="Liste complète des signalements ouverts et résolus"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Signalements' },
            ]}
            actions={
                <AdminButton
                    href="/admin/moderation"
                    variant="default"
                    size="sm"
                    icon={ShieldAlert}
                >
                    Centre de modération
                </AdminButton>
            }
        >
            <Head title="Signalements · Admin" />

            <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map((tab) => {
                    const active = tab.value === status;
                    return (
                        <Link
                            key={tab.value}
                            href={`/admin/reports?status=${tab.value}`}
                            preserveScroll
                            className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all hover:-translate-y-px"
                            style={{
                                borderColor: active
                                    ? 'var(--wine-deep)'
                                    : 'var(--line)',
                                background: active
                                    ? 'var(--wine-deep)'
                                    : 'var(--paper)',
                                color: active
                                    ? 'oklch(96% 0.02 50)'
                                    : 'var(--ink-soft)',
                            }}
                        >
                            {tab.label}
                            <span
                                className="font-mono grid h-5 min-w-[20px] place-items-center rounded px-1.5 text-[10px] font-bold"
                                style={{
                                    background: active
                                        ? 'oklch(100% 0 0 / 0.15)'
                                        : 'var(--bg-soft)',
                                    color: active
                                        ? 'var(--gold)'
                                        : 'var(--ink-mute)',
                                }}
                            >
                                {counts[tab.value]}
                            </span>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-6">
                {reports.data.length === 0 ? (
                    <AdminCard>
                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                            <div
                                className="grid h-14 w-14 place-items-center rounded-full"
                                style={{
                                    background: 'var(--blush)',
                                    color: 'var(--wine-deep)',
                                }}
                            >
                                <Flag className="h-6 w-6" />
                            </div>
                            <h2 className="font-display text-2xl font-medium italic">
                                Aucun signalement
                            </h2>
                            <p
                                className="max-w-md text-sm"
                                style={{ color: 'var(--ink-mute)' }}
                            >
                                Rien à traiter dans cette catégorie pour le moment.
                            </p>
                        </div>
                    </AdminCard>
                ) : (
                    <div className="flex flex-col gap-3">
                        {reports.data.map((report) => (
                            <ReportRow key={report.id} report={report} />
                        ))}
                    </div>
                )}
            </div>

            {reports.data.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <p
                        className="font-mono text-[11px] uppercase tracking-wider"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        {reports.from}–{reports.to} sur {reports.total}
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {reports.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveScroll
                                className="inline-grid h-8 min-w-[32px] place-items-center rounded-md border px-2 text-xs font-semibold transition-colors"
                                style={{
                                    borderColor: link.active
                                        ? 'var(--wine-deep)'
                                        : 'var(--line)',
                                    background: link.active
                                        ? 'var(--wine-deep)'
                                        : 'var(--paper)',
                                    color: link.active
                                        ? 'oklch(96% 0.02 50)'
                                        : link.url
                                          ? 'var(--ink-soft)'
                                          : 'var(--ink-mute)',
                                    pointerEvents: link.url ? undefined : 'none',
                                    opacity: link.url ? 1 : 0.4,
                                }}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function UserLink({ user }: { user: ReportUser | null }) {
    if (!user) {
        return (
            <span className="font-semibold" style={{ color: 'var(--ink-mute)' }}>
                Compte supprimé
            </span>
        );
    }

    return (
        <Link
            href={`/admin/users/${user.id}`}
            className="font-semibold underline decoration-dotted underline-offset-2"
        >
            {user.pseudo}
        </Link>
    );
}

function ReportRow({ report }: { report: Report }) {
    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState(report.admin_notes ?? '');
    const [processing, setProcessing] = useState(false);

    const submit = (nextStatus: ReportStatus, banUser = false) => {
        setProcessing(true);
        router.put(
            `/admin/reports/${report.id}`,
            {
                status: nextStatus,
                admin_notes: notes || null,
                ban_user: banUser,
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AdminCard padded={false}>
            <div className="flex flex-col gap-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <AdminBadge tone="wine">
                                {REASON_LABELS[report.reason] ?? report.reason}
                            </AdminBadge>
                            <AdminBadge tone={STATUS_TONES[report.status]}>
                                {STATUS_TABS.find((t) => t.value === report.status)
                                    ?.label ?? report.status}
                            </AdminBadge>
                            {report.reported_user?.is_banned && (
                                <AdminBadge tone="danger">Compte banni</AdminBadge>
                            )}
                        </div>

                        <p className="mt-3 text-sm" style={{ color: 'var(--ink)' }}>
                            <UserLink user={report.reporter} />
                            <span style={{ color: 'var(--ink-mute)' }}>
                                {' '}
                                a signalé{' '}
                            </span>
                            <UserLink user={report.reported_user} />
                        </p>

                        {report.description && (
                            <p
                                className="mt-2 text-sm leading-relaxed"
                                style={{ color: 'var(--ink-soft)' }}
                            >
                                {report.description}
                            </p>
                        )}

                        <p
                            className="font-mono mt-3 text-[10px] uppercase tracking-wider"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            {new Date(report.created_at).toLocaleString('fr-FR')}
                        </p>
                    </div>

                    <AdminButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen((v) => !v)}
                    >
                        {open ? 'Fermer' : 'Traiter'}
                    </AdminButton>
                </div>

                {open && (
                    <div
                        className="flex flex-col gap-3 rounded-xl border p-4"
                        style={{
                            borderColor: 'var(--line)',
                            background: 'var(--bg-soft)',
                        }}
                    >
                        <label
                            className="editorial-caption"
                            style={{ color: 'var(--ink-mute)' }}
                            htmlFor={`notes-${report.id}`}
                        >
                            Notes internes
                        </label>
                        <textarea
                            id={`notes-${report.id}`}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            maxLength={1000}
                            className="w-full rounded-lg border p-3 text-sm"
                            style={{
                                borderColor: 'var(--line)',
                                background: 'var(--paper)',
                                color: 'var(--ink)',
                            }}
                            placeholder="Contexte de la décision (visible uniquement par l'équipe)"
                        />

                        <div className="flex flex-wrap gap-2">
                            <AdminButton
                                size="sm"
                                variant="default"
                                disabled={processing}
                                onClick={() => submit('reviewed')}
                            >
                                Marquer examiné
                            </AdminButton>
                            <AdminButton
                                size="sm"
                                variant="default"
                                disabled={processing}
                                onClick={() => submit('dismissed')}
                            >
                                Rejeter
                            </AdminButton>
                            <AdminButton
                                size="sm"
                                variant="wine"
                                disabled={processing}
                                onClick={() => submit('actioned')}
                            >
                                Sanctionner
                            </AdminButton>
                            <AdminButton
                                size="sm"
                                variant="danger"
                                icon={Ban}
                                disabled={processing}
                                onClick={() => {
                                    if (
                                        confirm(
                                            `Bannir définitivement ${report.reported_user?.pseudo ?? 'ce compte'} ?`,
                                        )
                                    ) {
                                        submit('actioned', true);
                                    }
                                }}
                            >
                                Sanctionner et bannir
                            </AdminButton>
                        </div>
                    </div>
                )}
            </div>
        </AdminCard>
    );
}
