import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminCardHeader,
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
import { Head, Link, router } from '@inertiajs/react';
import { Ban, BadgeCheck, Flag, History, ShieldAlert, User } from 'lucide-react';
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
    dismissed: 'Classé sans suite',
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
    const [confirmBan, setConfirmBan] = useState(false);

    const submit = (status: ReportStatus, banUser = false) => {
        setProcessing(true);
        router.put(
            `/admin/reports/${report.id}`,
            { status, admin_notes: notes || null, ban_user: banUser },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setConfirmBan(false);
                },
            },
        );
    };

    const reportedName =
        report.reported_user?.pseudo ?? report.reported_user?.name ?? 'ce compte';

    return (
        <AdminLayout
            title={`Signalement #${report.id}`}
            subtitle={REASON_LABELS[report.reason] ?? report.reason}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Signalements', href: '/admin/reports' },
                { label: `#${report.id}` },
            ]}
            hideSearch
            actions={
                <AdminBadge tone={STATUS_TONES[report.status]}>
                    {STATUS_LABELS[report.status]}
                </AdminBadge>
            }
        >
            <Head title={`Signalement #${report.id} · Admin`} />

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    {/* Le signalement */}
                    <AdminCard padded={false}>
                        <AdminCardHeader
                            title={REASON_LABELS[report.reason] ?? report.reason}
                            icon={Flag}
                            action={
                                <AdminMeta>
                                    {new Date(report.created_at).toLocaleString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </AdminMeta>
                            }
                        />
                        <div className="p-5">
                            <p className="text-sm leading-relaxed text-[color:var(--ink-soft)]">
                                {report.description ?? (
                                    <span className="italic text-[color:var(--ink-mute)]">
                                        Aucune description fournie par la personne qui
                                        signale.
                                    </span>
                                )}
                            </p>
                        </div>
                    </AdminCard>

                    {/* Décision */}
                    <AdminCard padded={false}>
                        <AdminCardHeader
                            title="Traiter ce signalement"
                            icon={ShieldAlert}
                        />
                        <div className="p-5">
                            <label
                                className="editorial-caption mb-1.5 block text-[color:var(--ink-mute)]"
                                htmlFor="admin-notes"
                            >
                                Notes internes
                            </label>
                            <textarea
                                id="admin-notes"
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                rows={4}
                                maxLength={1000}
                                placeholder="Contexte de la décision (visible uniquement par l'équipe)"
                                className="w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-soft)] p-3 text-sm text-[color:var(--ink)] outline-none transition-colors focus:border-[color:var(--desire)]"
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
                                    Classer sans suite
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
                                    disabled={processing || !report.reported_user}
                                    onClick={() => setConfirmBan(true)}
                                >
                                    Sanctionner et bannir
                                </AdminButton>
                            </div>
                            <p className="mt-3 text-[11px] text-[color:var(--ink-mute)]">
                                Chaque décision est enregistrée au journal de modération
                                avec ton nom.
                            </p>
                        </div>
                    </AdminCard>

                    {/* Antécédents */}
                    <AdminCard padded={false}>
                        <AdminCardHeader
                            title={`Antécédents du compte visé · ${relatedReports.length}`}
                            icon={History}
                        />
                        {relatedReports.length === 0 ? (
                            <p className="px-5 py-6 text-sm text-[color:var(--ink-mute)]">
                                Aucun autre signalement contre ce compte. C&apos;est une
                                première plainte.
                            </p>
                        ) : (
                            <ul>
                                {relatedReports.map((related) => (
                                    <li
                                        key={related.id}
                                        className="border-b border-[color:var(--line-soft)] last:border-b-0"
                                    >
                                        <Link
                                            href={`/admin/reports/${related.id}`}
                                            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm transition-colors hover:bg-[color:var(--bg-soft)]"
                                        >
                                            <span className="flex flex-wrap items-center gap-2">
                                                <AdminBadge
                                                    tone={STATUS_TONES[related.status]}
                                                >
                                                    {STATUS_LABELS[related.status]}
                                                </AdminBadge>
                                                <span className="text-[color:var(--ink)]">
                                                    {REASON_LABELS[related.reason] ??
                                                        related.reason}
                                                </span>
                                                <span className="text-[color:var(--ink-mute)]">
                                                    par{' '}
                                                    {related.reporter?.pseudo ??
                                                        'compte supprimé'}
                                                </span>
                                            </span>
                                            <AdminMeta>
                                                {new Date(
                                                    related.created_at,
                                                ).toLocaleDateString('fr-FR')}
                                            </AdminMeta>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </AdminCard>
                </div>

                {/* Colonne latérale : les deux comptes */}
                <div className="space-y-4">
                    <PartyCard
                        title="Compte visé"
                        user={report.reported_user}
                        tone="danger"
                    />
                    <PartyCard
                        title="A signalé"
                        user={report.reporter}
                        tone="neutral"
                    />
                </div>
            </div>

            <Dialog open={confirmBan} onOpenChange={setConfirmBan}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium italic text-[color:var(--destructive)]">
                            Bannir {reportedName}
                        </DialogTitle>
                        <DialogDescription>
                            Le signalement passera en « sanctionné » et le compte sera
                            banni immédiatement, avec « {REASON_LABELS[report.reason] ??
                            report.reason} » comme motif. La membre perdra l&apos;accès à
                            la plateforme.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <AdminButton onClick={() => setConfirmBan(false)}>
                            Annuler
                        </AdminButton>
                        <AdminButton
                            variant="danger"
                            icon={Ban}
                            disabled={processing}
                            onClick={() => submit('actioned', true)}
                        >
                            {processing ? 'Bannissement…' : 'Confirmer le ban'}
                        </AdminButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

/** Carte d'identité d'une des deux parties du signalement. */
function PartyCard({
    title,
    user,
    tone,
}: {
    title: string;
    user: ReportUser | null;
    tone: 'danger' | 'neutral';
}) {
    if (!user) {
        return (
            <AdminCard>
                <div className="editorial-caption mb-2 text-[color:var(--ink-mute)]">
                    {title}
                </div>
                <p className="text-sm italic text-[color:var(--ink-mute)]">
                    Compte supprimé depuis le signalement.
                </p>
            </AdminCard>
        );
    }

    return (
        <AdminCard>
            <div className="editorial-caption mb-2 text-[color:var(--ink-mute)]">
                {title}
            </div>
            <div className="flex items-start gap-3">
                <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                        tone === 'danger'
                            ? 'bg-[oklch(62%_0.19_10_/_0.15)] text-[color:var(--destructive)]'
                            : 'bg-[color:var(--bg-soft)] text-[color:var(--ink-mute)]'
                    }`}
                >
                    <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="font-display truncate text-base font-semibold text-[color:var(--ink)]">
                        {user.pseudo || user.name}
                    </div>
                    {user.email && (
                        <div className="truncate text-xs text-[color:var(--ink-soft)]">
                            {user.email}
                        </div>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                        {user.is_verified && (
                            <AdminBadge tone="success">
                                <BadgeCheck className="h-2.5 w-2.5" />
                                Vérifiée
                            </AdminBadge>
                        )}
                        {user.is_banned && (
                            <AdminBadge tone="danger">
                                <Ban className="h-2.5 w-2.5" />
                                Bannie
                            </AdminBadge>
                        )}
                    </div>
                    {user.profile?.city && (
                        <p className="mt-1.5 text-xs text-[color:var(--ink-mute)]">
                            {user.profile.city}
                        </p>
                    )}
                </div>
            </div>

            <AdminButton
                size="sm"
                className="mt-3 w-full"
                href={`/admin/users/${user.id}`}
            >
                Ouvrir la fiche
            </AdminButton>
        </AdminCard>
    );
}
