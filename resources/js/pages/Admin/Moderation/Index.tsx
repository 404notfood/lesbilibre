import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminCardHeader,
    AdminEmpty,
    AdminKpi,
    AdminMeta,
} from '@/layouts/admin-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Head, Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    CheckCircle,
    Flag,
    History,
    Image as ImageIcon,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

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

/** Cible d'un rejet en attente de motif. */
interface RejectTarget {
    kind: 'photo' | 'verification';
    id: number;
    name: string;
}

const REJECT_COPY = {
    photo: {
        title: 'Rejeter cette photo',
        description:
            'Le motif est transmis à la membre et conservé au journal de modération.',
        placeholder: 'Ex : visage non visible, contenu interdit, photo de groupe…',
    },
    verification: {
        title: 'Rejeter cette vérification',
        description:
            'Le motif est transmis à la membre pour qu’elle puisse réessayer correctement.',
        placeholder: 'Ex : geste demandé non reproduit, photo floue, visage masqué…',
    },
} as const;

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
    const [rejecting, setRejecting] = useState<RejectTarget | null>(null);
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);

    const totalPending =
        stats.pending_photos + stats.pending_verifications + stats.open_reports;

    const approve = (kind: 'photos' | 'verifications', id: number) =>
        router.post(`/admin/${kind}/${id}/approve`, {}, { preserveScroll: true });

    const confirmReject = () => {
        if (!rejecting || !reason.trim()) {
            return;
        }

        const endpoint =
            rejecting.kind === 'photo'
                ? `/admin/photos/${rejecting.id}/reject`
                : `/admin/verifications/${rejecting.id}/reject`;

        setBusy(true);
        router.post(
            endpoint,
            { rejection_reason: reason },
            {
                preserveScroll: true,
                onFinish: () => {
                    setBusy(false);
                    setRejecting(null);
                    setReason('');
                },
            },
        );
    };

    return (
        <AdminLayout
            title="Modération"
            subtitle={
                totalPending > 0
                    ? `${totalPending} élément${totalPending > 1 ? 's' : ''} en attente de décision`
                    : 'Aucune décision en attente'
            }
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Modération' },
            ]}
            actions={
                <AdminButton icon={History} href="/admin/moderation/audit">
                    Journal des décisions
                </AdminButton>
            }
        >
            <Head title="Modération · Admin" />

            <div className="space-y-6">
                {/* Indicateurs */}
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminKpi
                        label="Photos en attente"
                        value={stats.pending_photos}
                        icon={ImageIcon}
                        href="/admin/photos/pending"
                    />
                    <AdminKpi
                        label="Vérifications"
                        value={stats.pending_verifications}
                        icon={BadgeCheck}
                        href="/admin/verifications"
                    />
                    <AdminKpi
                        label="Signalements ouverts"
                        value={stats.open_reports}
                        icon={Flag}
                        href="/admin/reports"
                    />
                    <AdminKpi
                        label="Traités aujourd’hui"
                        value={stats.resolved_reports_today}
                        deltaTone="positive"
                        hint="Signalements clôturés"
                        icon={CheckCircle}
                    />
                </div>

                {totalPending === 0 && (
                    <AdminCard>
                        <AdminEmpty
                            icon={ShieldCheck}
                            title="Tout est à jour"
                            description="Aucune photo, vérification ou plainte n’attend de décision. Reviens plus tard."
                        />
                    </AdminCard>
                )}

                {/* Photos */}
                {pendingPhotos.length > 0 && (
                    <AdminCard padded={false}>
                        <AdminCardHeader
                            title={`Photos à valider · ${stats.pending_photos}`}
                            icon={ImageIcon}
                            action={
                                <Link
                                    href="/admin/photos/pending"
                                    className="ghost-link text-xs font-medium text-[color:var(--wine-deep)]"
                                >
                                    File complète →
                                </Link>
                            }
                        />
                        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {pendingPhotos.map((photo) => (
                                <figure
                                    key={photo.id}
                                    className="overflow-hidden rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-soft)]"
                                >
                                    <div className="relative aspect-[4/5]">
                                        <img
                                            src={photo.path}
                                            alt=""
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                        {photo.is_naughty && (
                                            <span className="absolute left-2 top-2">
                                                <AdminBadge tone="danger">
                                                    Coquine
                                                </AdminBadge>
                                            </span>
                                        )}
                                    </div>
                                    <figcaption className="flex flex-col gap-2 p-3">
                                        <div className="min-w-0">
                                            <Link
                                                href={`/admin/users/${photo.user.id}`}
                                                className="block truncate text-sm font-semibold text-[color:var(--ink)] hover:underline"
                                            >
                                                {photo.user.name}
                                            </Link>
                                            <AdminMeta>{photo.created_at}</AdminMeta>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <AdminButton
                                                size="sm"
                                                variant="success"
                                                icon={CheckCircle}
                                                className="flex-1"
                                                onClick={() =>
                                                    approve('photos', photo.id)
                                                }
                                            >
                                                Valider
                                            </AdminButton>
                                            <AdminButton
                                                size="sm"
                                                variant="danger"
                                                icon={XCircle}
                                                className="flex-1"
                                                onClick={() =>
                                                    setRejecting({
                                                        kind: 'photo',
                                                        id: photo.id,
                                                        name: photo.user.name,
                                                    })
                                                }
                                            >
                                                Rejeter
                                            </AdminButton>
                                        </div>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </AdminCard>
                )}

                {/* Vérifications */}
                {pendingVerifications.length > 0 && (
                    <AdminCard padded={false}>
                        <AdminCardHeader
                            title={`Vérifications · ${stats.pending_verifications}`}
                            icon={BadgeCheck}
                            action={
                                <Link
                                    href="/admin/verifications"
                                    className="ghost-link text-xs font-medium text-[color:var(--wine-deep)]"
                                >
                                    File complète →
                                </Link>
                            }
                        />
                        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {pendingVerifications.map((verification) => (
                                <figure
                                    key={verification.id}
                                    className="overflow-hidden rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-soft)]"
                                >
                                    <div className="aspect-[4/5]">
                                        <img
                                            src={verification.path}
                                            alt=""
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <figcaption className="flex flex-col gap-2 p-3">
                                        <div className="min-w-0">
                                            <Link
                                                href={`/admin/users/${verification.user.id}`}
                                                className="block truncate text-sm font-semibold text-[color:var(--ink)] hover:underline"
                                            >
                                                {verification.user.name}
                                            </Link>
                                            <AdminMeta>
                                                {verification.created_at}
                                            </AdminMeta>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <AdminButton
                                                size="sm"
                                                variant="success"
                                                icon={CheckCircle}
                                                className="flex-1"
                                                onClick={() =>
                                                    approve(
                                                        'verifications',
                                                        verification.id,
                                                    )
                                                }
                                            >
                                                Valider
                                            </AdminButton>
                                            <AdminButton
                                                size="sm"
                                                variant="danger"
                                                icon={XCircle}
                                                className="flex-1"
                                                onClick={() =>
                                                    setRejecting({
                                                        kind: 'verification',
                                                        id: verification.id,
                                                        name: verification.user.name,
                                                    })
                                                }
                                            >
                                                Rejeter
                                            </AdminButton>
                                        </div>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </AdminCard>
                )}

                {/* Signalements */}
                {openReports.length > 0 && (
                    <AdminCard padded={false}>
                        <AdminCardHeader
                            title={`Signalements ouverts · ${stats.open_reports}`}
                            icon={Flag}
                            action={
                                <Link
                                    href="/admin/reports"
                                    className="ghost-link text-xs font-medium text-[color:var(--wine-deep)]"
                                >
                                    Tous voir →
                                </Link>
                            }
                        />
                        <ul>
                            {openReports.map((report) => (
                                <li
                                    key={report.id}
                                    className="border-b border-[color:var(--line-soft)] last:border-b-0"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5 text-sm">
                                                <Link
                                                    href={`/admin/users/${report.reporter.id}`}
                                                    className="font-semibold hover:underline"
                                                >
                                                    {report.reporter.name}
                                                </Link>
                                                <span className="text-[color:var(--ink-mute)]">
                                                    signale
                                                </span>
                                                <Link
                                                    href={`/admin/users/${report.reported.id}`}
                                                    className="font-semibold hover:underline"
                                                >
                                                    {report.reported.name}
                                                </Link>
                                                <AdminBadge tone="warning">
                                                    {report.reason}
                                                </AdminBadge>
                                            </div>
                                            {report.description && (
                                                <p className="mt-1 line-clamp-2 text-xs text-[color:var(--ink-soft)]">
                                                    {report.description}
                                                </p>
                                            )}
                                            <AdminMeta>{report.created_at}</AdminMeta>
                                        </div>
                                        <AdminButton
                                            size="sm"
                                            href={`/admin/reports/${report.id}`}
                                        >
                                            Examiner
                                        </AdminButton>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </AdminCard>
                )}
            </div>

            {/* Motif de rejet */}
            <Dialog
                open={rejecting !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setRejecting(null);
                        setReason('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium italic">
                            {rejecting && REJECT_COPY[rejecting.kind].title}
                        </DialogTitle>
                        <DialogDescription>
                            {rejecting && (
                                <>
                                    Compte concerné : <strong>{rejecting.name}</strong>.{' '}
                                    {REJECT_COPY[rejecting.kind].description}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder={
                            rejecting ? REJECT_COPY[rejecting.kind].placeholder : ''
                        }
                        rows={3}
                        autoFocus
                    />
                    <DialogFooter>
                        <AdminButton onClick={() => setRejecting(null)}>
                            Annuler
                        </AdminButton>
                        <AdminButton
                            variant="danger"
                            onClick={confirmReject}
                            disabled={busy || !reason.trim()}
                        >
                            {busy ? 'Envoi…' : 'Confirmer le rejet'}
                        </AdminButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
