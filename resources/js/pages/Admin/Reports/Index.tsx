import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminEmpty,
    AdminMeta,
    AdminPagination,
    AdminTable,
    AdminTd,
    AdminTh,
    AdminThead,
    AdminTr,
} from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Ban, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface Props {
    reports: {
        data: Report[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
        from: number | null;
        to: number | null;
        last_page: number;
    };
    status: ReportStatus;
    counts: Record<ReportStatus, number>;
}

const STATUS_TABS: { value: ReportStatus; label: string }[] = [
    { value: 'pending', label: 'En attente' },
    { value: 'reviewed', label: 'Examinés' },
    { value: 'actioned', label: 'Sanctionnés' },
    { value: 'dismissed', label: 'Classés sans suite' },
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

const STATUS_LABELS: Record<ReportStatus, string> = {
    pending: 'En attente',
    reviewed: 'Examiné',
    actioned: 'Sanctionné',
    dismissed: 'Classé',
};

export default function Index({ reports, status, counts }: Props) {
    return (
        <AdminLayout
            title="Signalements"
            subtitle={`${counts.pending} plainte${counts.pending > 1 ? 's' : ''} en attente de traitement`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Modération', href: '/admin/moderation' },
                { label: 'Signalements' },
            ]}
            hideSearch
        >
            <Head title="Signalements · Admin" />

            <div className="space-y-4">
                {/* Onglets de statut */}
                <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-2">
                    {STATUS_TABS.map((tab) => {
                        const active = tab.value === status;

                        return (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() =>
                                    router.get(
                                        '/admin/reports',
                                        { status: tab.value },
                                        { preserveScroll: true },
                                    )
                                }
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                                    active
                                        ? 'bg-[color:var(--wine-deep)] text-white'
                                        : 'text-[color:var(--ink-soft)] hover:bg-[color:var(--bg-soft)]',
                                )}
                            >
                                {tab.label}
                                <span
                                    className={cn(
                                        'font-mono grid h-5 min-w-[20px] place-items-center rounded px-1 text-[10px] font-bold',
                                        active
                                            ? 'bg-white/20 text-white'
                                            : 'bg-[color:var(--bg-soft)] text-[color:var(--ink-mute)]',
                                    )}
                                >
                                    {counts[tab.value]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <AdminCard padded={false}>
                    {reports.data.length === 0 ? (
                        <AdminEmpty
                            icon={Flag}
                            title="Aucun signalement dans cette file"
                            description={
                                status === 'pending'
                                    ? 'Aucune plainte n’attend de traitement.'
                                    : 'Aucun signalement avec ce statut.'
                            }
                        />
                    ) : (
                        <>
                            <AdminTable>
                                <AdminThead>
                                    <AdminTh>Compte visé</AdminTh>
                                    <AdminTh>Motif</AdminTh>
                                    <AdminTh>Signalé par</AdminTh>
                                    <AdminTh>Statut</AdminTh>
                                    <AdminTh>Date</AdminTh>
                                    <AdminTh align="right">Action</AdminTh>
                                </AdminThead>
                                <tbody>
                                    {reports.data.map((report) => (
                                        <AdminTr key={report.id}>
                                            <AdminTd>
                                                {report.reported_user ? (
                                                    <Link
                                                        href={`/admin/users/${report.reported_user.id}`}
                                                        className="block min-w-0"
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-display truncate text-[15px] font-semibold text-[color:var(--ink)]">
                                                                {report.reported_user
                                                                    .pseudo ||
                                                                    report.reported_user
                                                                        .name}
                                                            </span>
                                                            {report.reported_user
                                                                .is_banned && (
                                                                <AdminBadge tone="danger">
                                                                    <Ban className="h-2.5 w-2.5" />
                                                                    Bannie
                                                                </AdminBadge>
                                                            )}
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <span className="text-sm italic text-[color:var(--ink-mute)]">
                                                        compte supprimé
                                                    </span>
                                                )}
                                            </AdminTd>

                                            <AdminTd>
                                                <AdminBadge tone="warning">
                                                    {REASON_LABELS[report.reason] ??
                                                        report.reason}
                                                </AdminBadge>
                                                {report.description && (
                                                    <p className="mt-1 max-w-xs truncate text-xs text-[color:var(--ink-soft)]">
                                                        {report.description}
                                                    </p>
                                                )}
                                            </AdminTd>

                                            <AdminTd>
                                                {report.reporter ? (
                                                    <Link
                                                        href={`/admin/users/${report.reporter.id}`}
                                                        className="text-sm text-[color:var(--ink-soft)] hover:underline"
                                                    >
                                                        {report.reporter.pseudo ||
                                                            report.reporter.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-sm italic text-[color:var(--ink-mute)]">
                                                        compte supprimé
                                                    </span>
                                                )}
                                            </AdminTd>

                                            <AdminTd>
                                                <AdminBadge
                                                    tone={STATUS_TONES[report.status]}
                                                >
                                                    {STATUS_LABELS[report.status]}
                                                </AdminBadge>
                                            </AdminTd>

                                            <AdminTd>
                                                <AdminMeta>
                                                    {new Date(
                                                        report.created_at,
                                                    ).toLocaleDateString('fr-FR')}
                                                </AdminMeta>
                                            </AdminTd>

                                            <AdminTd align="right">
                                                <AdminButton
                                                    size="sm"
                                                    variant={
                                                        report.status === 'pending'
                                                            ? 'wine'
                                                            : 'default'
                                                    }
                                                    href={`/admin/reports/${report.id}`}
                                                >
                                                    {report.status === 'pending'
                                                        ? 'Examiner'
                                                        : 'Ouvrir'}
                                                </AdminButton>
                                            </AdminTd>
                                        </AdminTr>
                                    ))}
                                </tbody>
                            </AdminTable>

                            <AdminPagination
                                from={reports.from}
                                to={reports.to}
                                total={reports.total}
                                lastPage={reports.last_page}
                                links={reports.links}
                            />
                        </>
                    )}
                </AdminCard>
            </div>
        </AdminLayout>
    );
}
