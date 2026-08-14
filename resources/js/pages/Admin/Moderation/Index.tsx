import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminKpi,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    CheckCircle,
    Eye,
    Flag,
    Image as ImageIcon,
    ShieldAlert,
    ShieldCheck,
    XCircle,
} from 'lucide-react';

interface Photo {
    id: number;
    path: string;
    user: { id: number; name: string; email: string };
    created_at: string;
    is_naughty: boolean;
}

interface Verification {
    id: number;
    path: string;
    user: { id: number; name: string; email: string };
    created_at: string;
}

interface ReportRow {
    id: number;
    reporter: { id: number; name: string };
    reported: { id: number; name: string };
    reason: string;
    description: string | null;
    created_at: string;
}

interface Stats {
    pending_photos: number;
    pending_verifications: number;
    open_reports: number;
    resolved_reports_today: number;
}

export default function Index({
    pendingPhotos,
    pendingVerifications,
    openReports,
    stats,
}: {
    pendingPhotos: Photo[];
    pendingVerifications: Verification[];
    openReports: ReportRow[];
    stats: Stats;
}) {
    const handleApprovePhoto = (id: number) =>
        router.post(`/admin/photos/${id}/approve`, {}, { preserveScroll: true });

    const handleRejectPhoto = (id: number) => {
        const reason = prompt('Raison du rejet :');
        if (reason) {
            router.post(
                `/admin/photos/${id}/reject`,
                { rejection_reason: reason },
                { preserveScroll: true },
            );
        }
    };

    const handleApproveVerif = (id: number) =>
        router.post(`/admin/verifications/${id}/approve`, {}, { preserveScroll: true });

    const handleRejectVerif = (id: number) => {
        const reason = prompt('Raison du rejet :');
        if (reason) {
            router.post(
                `/admin/verifications/${id}/reject`,
                { rejection_reason: reason },
                { preserveScroll: true },
            );
        }
    };

    return (
        <AdminLayout
            title="Modération"
            subtitle="File d'attente : photos, vérifications, signalements"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Modération' },
            ]}
        >
            <Head title="Modération · Admin" />

            <div className="space-y-8">
                {/* KPIs */}
                <section>
                    <AdminSectionTitle eyebrow="01 · État" title="Files d'attente" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminKpi
                            label="Photos en attente"
                            value={stats.pending_photos}
                            icon={ImageIcon}
                            deltaTone={stats.pending_photos > 0 ? 'warning' : 'neutral'}
                        />
                        <AdminKpi
                            label="Vérifications"
                            value={stats.pending_verifications}
                            icon={BadgeCheck}
                            deltaTone={
                                stats.pending_verifications > 0 ? 'warning' : 'neutral'
                            }
                        />
                        <AdminKpi
                            label="Signalements ouverts"
                            value={stats.open_reports}
                            icon={Flag}
                            deltaTone={stats.open_reports > 0 ? 'warning' : 'neutral'}
                            href="/admin/reports"
                        />
                        <AdminKpi
                            label="Traités aujourd'hui"
                            value={stats.resolved_reports_today}
                            icon={ShieldCheck}
                            deltaTone="positive"
                        />
                    </div>
                </section>

                {/* Photos */}
                <section>
                    <AdminSectionTitle
                        eyebrow="02 · Photos"
                        title={`Photos en attente (${stats.pending_photos})`}
                        right={
                            stats.pending_photos > pendingPhotos.length ? (
                                <AdminButton
                                    variant="default"
                                    size="sm"
                                    href="/admin/photos/pending"
                                >
                                    Tout voir →
                                </AdminButton>
                            ) : undefined
                        }
                    />
                    {pendingPhotos.length === 0 ? (
                        <EmptyQueue
                            icon={ImageIcon}
                            label="Aucune photo en attente."
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                            {pendingPhotos.map((photo) => (
                                <ModerationTile
                                    key={photo.id}
                                    imagePath={photo.path}
                                    userName={photo.user.name}
                                    date={photo.created_at}
                                    overlay={
                                        photo.is_naughty ? (
                                            <AdminBadge tone="danger">18+</AdminBadge>
                                        ) : undefined
                                    }
                                    onApprove={() => handleApprovePhoto(photo.id)}
                                    onReject={() => handleRejectPhoto(photo.id)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Verifications */}
                <section>
                    <AdminSectionTitle
                        eyebrow="03 · Vérifications"
                        title={`Vérifications selfie (${stats.pending_verifications})`}
                        right={
                            stats.pending_verifications > pendingVerifications.length ? (
                                <AdminButton
                                    variant="default"
                                    size="sm"
                                    href="/admin/verifications"
                                >
                                    Tout voir →
                                </AdminButton>
                            ) : undefined
                        }
                    />
                    {pendingVerifications.length === 0 ? (
                        <EmptyQueue
                            icon={BadgeCheck}
                            label="Aucune vérification en attente."
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                            {pendingVerifications.map((v) => (
                                <ModerationTile
                                    key={v.id}
                                    imagePath={v.path}
                                    userName={v.user.name}
                                    date={v.created_at}
                                    onApprove={() => handleApproveVerif(v.id)}
                                    onReject={() => handleRejectVerif(v.id)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Reports */}
                <section>
                    <AdminSectionTitle
                        eyebrow="04 · Signalements"
                        title={`Signalements ouverts (${stats.open_reports})`}
                        right={
                            stats.open_reports > openReports.length ? (
                                <AdminButton variant="default" size="sm" href="/admin/reports">
                                    Tout voir →
                                </AdminButton>
                            ) : undefined
                        }
                    />
                    {openReports.length === 0 ? (
                        <EmptyQueue icon={Flag} label="Aucun signalement ouvert." />
                    ) : (
                        <div className="space-y-3">
                            {openReports.map((r) => (
                                <AdminCard key={r.id}>
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex items-center gap-2 flex-wrap">
                                                <span className="font-display text-base font-semibold">
                                                    {r.reporter.name}
                                                </span>
                                                <span
                                                    className="font-mono text-[10px] uppercase tracking-wider"
                                                    style={{ color: 'var(--ink-mute)' }}
                                                >
                                                    a signalé
                                                </span>
                                                <span className="font-display text-base font-semibold">
                                                    {r.reported.name}
                                                </span>
                                                <AdminBadge tone="danger">{r.reason}</AdminBadge>
                                            </div>
                                            {r.description && (
                                                <p
                                                    className="text-sm leading-relaxed"
                                                    style={{ color: 'var(--ink-soft)' }}
                                                >
                                                    « {r.description} »
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span
                                                className="font-mono text-[10px] uppercase tracking-wider"
                                                style={{ color: 'var(--ink-mute)' }}
                                            >
                                                {r.created_at}
                                            </span>
                                            <div className="flex gap-2">
                                                <AdminButton
                                                    variant="default"
                                                    size="sm"
                                                    icon={Eye}
                                                    href={`/admin/reports/${r.id}`}
                                                >
                                                    Examiner
                                                </AdminButton>
                                                <AdminButton
                                                    variant="ghost"
                                                    size="sm"
                                                    href={`/admin/users/${r.reported.id}`}
                                                >
                                                    Profil
                                                </AdminButton>
                                            </div>
                                        </div>
                                    </div>
                                </AdminCard>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}

/* ---------- Sub-components ---------- */

function ModerationTile({
    imagePath,
    userName,
    date,
    overlay,
    onApprove,
    onReject,
}: {
    imagePath: string;
    userName: string;
    date: string;
    overlay?: React.ReactNode;
    onApprove: () => void;
    onReject: () => void;
}): JSX.Element {
    return (
        <div
            className="overflow-hidden rounded-2xl border"
            style={{
                borderColor: 'var(--line)',
                background: 'var(--paper)',
            }}
        >
            <div
                className="reveal-tile relative aspect-square"
                style={{ background: 'var(--bg-soft)' }}
            >
                <img
                    src={imagePath}
                    alt={`Photo de ${userName}`}
                    className="reveal-bg h-full w-full object-cover"
                    loading="lazy"
                />
                {overlay && <div className="absolute right-2 top-2">{overlay}</div>}
            </div>
            <div className="px-3 pb-3 pt-2">
                <div className="font-display text-sm font-semibold leading-tight">
                    {userName}
                </div>
                <div
                    className="font-mono mb-2 mt-0.5 text-[10px] uppercase tracking-wider"
                    style={{ color: 'var(--ink-mute)' }}
                >
                    {date}
                </div>
                <div className="flex gap-1.5">
                    <button
                        type="button"
                        onClick={onApprove}
                        className="font-mono flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white transition-all hover:-translate-y-px"
                        style={{ background: 'var(--success)' }}
                    >
                        <CheckCircle className="h-3 w-3" />
                        OK
                    </button>
                    <button
                        type="button"
                        onClick={onReject}
                        className="font-mono flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white transition-all hover:-translate-y-px"
                        style={{ background: 'var(--destructive)' }}
                    >
                        <XCircle className="h-3 w-3" />
                        Rejet
                    </button>
                </div>
            </div>
        </div>
    );
}

function EmptyQueue({
    icon: Icon,
    label,
}: {
    icon: typeof ShieldAlert;
    label: string;
}): JSX.Element {
    return (
        <AdminCard>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Icon
                    className="h-8 w-8 opacity-30"
                    style={{ color: 'var(--ink-mute)' }}
                />
                <p
                    className="font-display text-base font-medium italic"
                    style={{ color: 'var(--ink-mute)' }}
                >
                    {label}
                </p>
            </div>
        </AdminCard>
    );
}
