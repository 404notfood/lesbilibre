import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Ban, Flag } from 'lucide-react';
import { useState } from 'react';

type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

interface Profile {
    bio?: string | null;
    city?: string | null;
}

interface ReportUser {
    id: number;
    name: string;
    pseudo: string;
    email?: string;
    is_banned?: boolean;
    is_verified?: boolean;
    profile?: Profile | null;
}

interface RelatedReport {
    id: number;
    reason: string;
    status: ReportStatus;
    created_at: string;
    reporter: { id: number; pseudo: string } | null;
}

interface Report {
    id: number;
    reason: string;
    description: string | null;
    status: ReportStatus;
    admin_notes: string | null;
    created_at: string;
    reporter: ReportUser | null;
    reported_user: ReportUser | null;
}

interface Props {
    report: Report;
    relatedReports: RelatedReport[];
}

const STATUS_LABELS: Record<ReportStatus, string> = {
    pending: 'En attente',
    reviewed: 'Examiné',
    actioned: 'Sanctionné',
    dismissed: 'Rejeté',
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

const REASON_LABELS: Record<string, string> = {
    spam: 'Spam',
    harassment: 'Harcèlement',
    fake_profile: 'Faux profil',
    inappropriate_content: 'Contenu inapproprié',
    other: 'Autre',
};

export default function Show({ report, relatedReports }: Props) {
    const [notes, setNotes] = useState(report.admin_notes ?? '');
    const [processing, setProcessing] = useState(false);

    const submit = (status: ReportStatus, banUser = false) => {
        setProcessing(true);
        router.put(
            `/admin/reports/${report.id}`,
            { status, admin_notes: notes || null, ban_user: banUser },
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    };

    return (
        <AdminLayout
            title={`Signalement #${report.id}`}
            subtitle={REASON_LABELS[report.reason] ?? report.reason}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Signalements', href: '/admin/reports' },
                { label: `#${report.id}` },
            ]}
            actions={
                <AdminBadge tone={STATUS_TONES[report.status]}>
                    {STATUS_LABELS[report.status]}
                </AdminBadge>
            }
        >
            <Head title={`Signalement #${report.id} · Admin`} />

            <div className="grid gap-5 lg:grid-cols-3">
                <div className="flex flex-col gap-5 lg:col-span-2">
                    <AdminCard>
                        <AdminSectionTitle
                            eyebrow="Motif du signalement"
                            title={REASON_LABELS[report.reason] ?? report.reason}
                        />
                        <p
                            className="text-sm leading-relaxed"
                            style={{ color: 'var(--ink-soft)' }}
                        >
                            {report.description ?? 'Aucune description fournie.'}
                        </p>
                        <p
                            className="font-mono mt-4 text-[10px] uppercase tracking-wider"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Déposé le{' '}
                            {new Date(report.created_at).toLocaleString('fr-FR')}
                        </p>
                    </AdminCard>

                    <AdminCard>
                        <AdminSectionTitle
                            eyebrow="Décision"
                            title="Traiter ce signalement"
                        />
                        <label
                            className="editorial-caption"
                            style={{ color: 'var(--ink-mute)' }}
                            htmlFor="admin-notes"
                        >
                            Notes internes
                        </label>
                        <textarea
                            id="admin-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            maxLength={1000}
                            className="mt-2 w-full rounded-lg border p-3 text-sm"
                            style={{
                                borderColor: 'var(--line)',
                                background: 'var(--bg-soft)',
                                color: 'var(--ink)',
                            }}
                            placeholder="Contexte de la décision (visible uniquement par l'équipe)"
                        />

                        <div className="mt-4 flex flex-wrap gap-2">
                            <AdminButton
                                size="sm"
                                disabled={processing}
                                onClick={() => submit('reviewed')}
                            >
                                Marquer examiné
                            </AdminButton>
                            <AdminButton
                                size="sm"
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
                    </AdminCard>

                    <AdminCard>
                        <AdminSectionTitle
                            eyebrow={`${relatedReports.length} autre${relatedReports.length > 1 ? 's' : ''}`}
                            title="Historique du compte signalé"
                        />
                        {relatedReports.length === 0 ? (
                            <p className="text-sm" style={{ color: 'var(--ink-mute)' }}>
                                Aucun autre signalement contre ce compte.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {relatedReports.map((related) => (
                                    <Link
                                        key={related.id}
                                        href={`/admin/reports/${related.id}`}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition-colors hover:border-[color:var(--wine)]"
                                        style={{ borderColor: 'var(--line)' }}
                                    >
                                        <span className="flex flex-wrap items-center gap-2">
                                            <AdminBadge
                                                tone={STATUS_TONES[related.status]}
                                            >
                                                {STATUS_LABELS[related.status]}
                                            </AdminBadge>
                                            <span>
                                                {REASON_LABELS[related.reason] ??
                                                    related.reason}
                                            </span>
                                            <span style={{ color: 'var(--ink-mute)' }}>
                                                par{' '}
                                                {related.reporter?.pseudo ??
                                                    'Compte supprimé'}
                                            </span>
                                        </span>
                                        <span
                                            className="font-mono text-[10px] uppercase tracking-wider"
                                            style={{ color: 'var(--ink-mute)' }}
                                        >
                                            {new Date(
                                                related.created_at,
                                            ).toLocaleDateString('fr-FR')}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </AdminCard>
                </div>

                <div className="flex flex-col gap-5">
                    <PartyCard
                        eyebrow="Signalée par"
                        user={report.reporter}
                        tone="neutral"
                    />
                    <PartyCard
                        eyebrow="Compte signalé"
                        user={report.reported_user}
                        tone="danger"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}

function PartyCard({
    eyebrow,
    user,
    tone,
}: {
    eyebrow: string;
    user: ReportUser | null;
    tone: 'neutral' | 'danger';
}) {
    if (!user) {
        return (
            <AdminCard>
                <div
                    className="editorial-caption mb-2"
                    style={{ color: 'var(--ink-mute)' }}
                >
                    {eyebrow}
                </div>
                <p className="text-sm" style={{ color: 'var(--ink-mute)' }}>
                    Compte supprimé
                </p>
            </AdminCard>
        );
    }

    return (
        <AdminCard>
            <div
                className="editorial-caption mb-2"
                style={{ color: 'var(--ink-mute)' }}
            >
                {eyebrow}
            </div>
            <div className="flex items-center gap-3">
                <div
                    className="font-display grid h-11 w-11 shrink-0 place-items-center rounded-full text-base font-medium italic"
                    style={{
                        background:
                            tone === 'danger' ? 'var(--blush)' : 'var(--bg-soft)',
                        color: 'var(--wine-deep)',
                    }}
                >
                    {user.pseudo.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <Link
                        href={`/admin/users/${user.id}`}
                        className="block truncate font-semibold underline decoration-dotted underline-offset-2"
                    >
                        {user.pseudo}
                    </Link>
                    {user.email && (
                        <div
                            className="truncate text-xs"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            {user.email}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                {user.is_banned && <AdminBadge tone="danger">Banni</AdminBadge>}
                {user.is_verified && <AdminBadge tone="success">Vérifié</AdminBadge>}
                {user.profile?.city && (
                    <AdminBadge tone="neutral">{user.profile.city}</AdminBadge>
                )}
            </div>

            {user.profile?.bio && (
                <p
                    className="mt-3 line-clamp-4 text-xs leading-relaxed"
                    style={{ color: 'var(--ink-soft)' }}
                >
                    {user.profile.bio}
                </p>
            )}

            <div className="mt-4">
                <AdminButton
                    href={`/admin/users/${user.id}`}
                    size="sm"
                    variant="ghost"
                    icon={Flag}
                >
                    Voir la fiche complète
                </AdminButton>
            </div>
        </AdminCard>
    );
}
