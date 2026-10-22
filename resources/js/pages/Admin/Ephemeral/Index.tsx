import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminEmpty,
    AdminKpi,
    AdminMeta,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Eye,
    EyeOff,
    Flame,
    Send,
    ShieldCheck,
    Timer,
} from 'lucide-react';
import { useState } from 'react';

interface Party {
    id: number;
    pseudo: string;
}

interface FlaggedMedia {
    id: number;
    type: 'photo' | 'video';
    is_naughty: boolean;
    sender: Party | null;
    recipient: Party | null;
    sent_at: string;
    first_viewed_at: string | null;
    purge_after: string;
}

interface Props {
    flagged: FlaggedMedia[];
    pending: PendingMedia[];
    stats: {
        sent_total: number;
        sent_last_30_days: number;
        photos: number;
        videos: number;
        opened: number;
        never_opened: number;
        replayed: number;
        flagged_open: number;
        purged: number;
        pending_moderation: number;
    };
}

interface PendingMedia {
    id: number;
    type: 'photo' | 'video';
    sender: Party | null;
    recipient: Party | null;
    sent_at: string;
    processing_status: string;
}

export default function Index({ flagged, pending, stats }: Props) {
    const openRate =
        stats.sent_total > 0
            ? Math.round((stats.opened / stats.sent_total) * 100)
            : 0;
    const replayRate =
        stats.opened > 0
            ? Math.round((stats.replayed / stats.opened) * 100)
            : 0;

    return (
        <AdminLayout
            title="Contenus éphémères"
            subtitle="Validation humaine avant diffusion et suivi des signalements"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Éphémères' },
            ]}
            hideSearch
            actions={
                flagged.length > 0 ? (
                    <AdminBadge tone="danger">
                        {flagged.length} signalement
                        {flagged.length > 1 ? 's' : ''}
                    </AdminBadge>
                ) : undefined
            }
        >
            <Head title="Contenus éphémères · Admin" />

            <div className="space-y-6">
                <section aria-labelledby="pending-media-title">
                    <h2
                        id="pending-media-title"
                        className="text-xl font-semibold"
                    >
                        Pièces jointes en attente de validation (
                        {stats.pending_moderation})
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Aucune photo ou vidéo n’est livrée avant validation. Les
                        50 premiers dépôts sont présentés du plus ancien au plus
                        récent. Une validation ne lève pas un conflit entre deux
                        comptes ni les limites de consentement.
                    </p>
                    {pending.length ? (
                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                            {pending.map((medium) => (
                                <PendingMediaCard
                                    key={medium.id}
                                    medium={medium}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-4 rounded-xl border border-border p-4 text-sm text-muted-foreground">
                            Aucun dépôt en attente.
                        </p>
                    )}
                </section>
                {/* Signalements — priorité absolue */}
                {flagged.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[color:var(--desire)] bg-[color:var(--blush)] p-4 text-[color:var(--wine-deep)]">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                            <div className="text-sm">
                                <p className="font-semibold">
                                    {flagged.length} contenu
                                    {flagged.length > 1 ? 's' : ''} éphémère
                                    {flagged.length > 1 ? 's' : ''} signalé
                                    {flagged.length > 1 ? 's' : ''}
                                </p>
                                <p className="mt-1">
                                    Un signalement sur du contenu éphémère est
                                    prioritaire : le fichier est conservé pour
                                    l’examen, hors du cycle de purge tant que le
                                    dossier reste ouvert.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            {flagged.map((medium) => (
                                <FlaggedCard key={medium.id} medium={medium} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Statistiques agrégées */}
                <section>
                    <AdminSectionTitle
                        eyebrow="Consultation pour validation avant diffusion ou examen d’un signalement"
                        title="Usage de la fonctionnalité"
                    />

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <AdminKpi
                            label="Envoyés au total"
                            value={stats.sent_total}
                            hint={`${stats.photos} photos · ${stats.videos} vidéos`}
                            icon={Send}
                        />
                        <AdminKpi
                            label="30 derniers jours"
                            value={stats.sent_last_30_days}
                            icon={Flame}
                        />
                        <AdminKpi
                            label="Ouverts"
                            value={stats.opened}
                            delta={`${openRate} % des envois`}
                            hint={`${stats.never_opened} jamais ouverts`}
                            icon={Eye}
                        />
                        <AdminKpi
                            label="Revus une fois"
                            value={stats.replayed}
                            delta={`${replayRate} % des ouvertures`}
                            hint={`${stats.purged} fichiers purgés`}
                            icon={Timer}
                        />
                    </div>

                    {flagged.length === 0 && (
                        <AdminCard className="mt-4" padded={false}>
                            <AdminEmpty
                                icon={ShieldCheck}
                                title="Aucun signalement"
                                description="Les contenus éphémères ne sont pas consultables tant que personne ne les signale."
                            />
                        </AdminCard>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}

function PendingMediaCard({ medium }: { medium: PendingMedia }) {
    const [revealed, setRevealed] = useState(false);
    const [reviewed, setReviewed] = useState(false);
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const ready = medium.processing_status === 'ready';
    const decide = (action: 'approve' | 'reject') => {
        setBusy(true);
        setError('');
        router.post(
            `/admin/ephemeral/${medium.id}/${action}`,
            action === 'approve' ? { review_confirmed: reviewed } : { reason },
            {
                preserveScroll: true,
                onFinish: () => setBusy(false),
                onError: (errors) =>
                    setError(
                        Object.values(errors)[0] ||
                            'La décision n’a pas pu être enregistrée.',
                    ),
            },
        );
    };

    return (
        <AdminCard>
            <p className="text-sm font-semibold">
                {medium.sender?.pseudo ?? 'Compte supprimé'} →{' '}
                {medium.recipient?.pseudo ?? 'Compte supprimé'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
                Dépôt du {new Date(medium.sent_at).toLocaleString('fr-FR')} ·{' '}
                {medium.type === 'video' ? 'Vidéo' : 'Photo'}
            </p>
            {!ready ? (
                <p className="mt-4 rounded-xl bg-muted p-4 text-sm">
                    Préparation technique en cours : la validation sera possible
                    une fois le fichier prêt.
                </p>
            ) : revealed ? (
                <div className="mt-4 rounded-xl border border-border bg-muted">
                    {medium.type === 'video' ? (
                        <video
                            src={`/admin/ephemeral/${medium.id}/file`}
                            controls
                            className="max-h-96 w-full"
                        />
                    ) : (
                        <img
                            src={`/admin/ephemeral/${medium.id}/file`}
                            alt="Pièce jointe privée à examiner"
                            className="max-h-96 w-full object-contain"
                        />
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="mt-4 min-h-12 w-full rounded-xl border border-dashed border-border p-4 text-sm font-semibold"
                >
                    Examiner le média privé (consultation journalisée)
                </button>
            )}
            <label className="mt-4 flex items-start gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={reviewed}
                    disabled={!ready || !revealed || busy}
                    onChange={(event) => setReviewed(event.target.checked)}
                    className="mt-1"
                />
                J’ai examiné ce média et j’autorise sa diffusion.
            </label>
            <div className="mt-3">
                <AdminButton
                    disabled={busy || !ready || !revealed || !reviewed}
                    onClick={() => decide('approve')}
                >
                    Valider la diffusion
                </AdminButton>
            </div>
            <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={500}
                aria-label="Motif du refus"
                placeholder="Motif du refus, communiqué à l’expéditrice (3 caractères minimum)"
                className="mt-4"
            />
            <div className="mt-3">
                <AdminButton
                    variant="danger"
                    disabled={busy || reason.trim().length < 3}
                    onClick={() => decide('reject')}
                >
                    Refuser la diffusion
                </AdminButton>
            </div>
            {error && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                    {error}
                </p>
            )}
        </AdminCard>
    );
}

function FlaggedCard({ medium }: { medium: FlaggedMedia }) {
    const [revealed, setRevealed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [confirmDismiss, setConfirmDismiss] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [reason, setReason] = useState('');
    const [decisionError, setDecisionError] = useState('');

    const dismiss = () => {
        if (reason.trim().length < 3) return;
        setDecisionError('');
        setBusy(true);
        router.post(
            `/admin/ephemeral/${medium.id}/dismiss`,
            { reason },
            {
                preserveScroll: true,
                onFinish: () => setBusy(false),
                onError: (errors) =>
                    setDecisionError(
                        errors.reason ||
                            'La décision n’a pas pu être enregistrée.',
                    ),
                onSuccess: () => {
                    setConfirmDismiss(false);
                    setReason('');
                },
            },
        );
    };

    const destroy = () => {
        if (reason.trim().length < 3) {
            return;
        }

        setBusy(true);
        setDecisionError('');
        router.delete(`/admin/ephemeral/${medium.id}`, {
            data: { reason },
            preserveScroll: true,
            onFinish: () => setBusy(false),
            onError: (errors) =>
                setDecisionError(
                    errors.reason ||
                        'La suppression n’a pas pu être enregistrée.',
                ),
            onSuccess: () => {
                setConfirmDelete(false);
                setReason('');
            },
        });
    };

    return (
        <>
            <AdminCard>
                <div className="mb-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <AdminBadge tone="wine">
                            {medium.type === 'video' ? 'Vidéo' : 'Photo'}
                        </AdminBadge>
                        {medium.is_naughty && (
                            <AdminBadge tone="danger">Coquin</AdminBadge>
                        )}
                    </div>
                    <p className="mt-2 text-sm">
                        <span className="font-semibold text-[color:var(--ink)]">
                            {medium.sender?.pseudo ?? 'Compte supprimé'}
                        </span>
                        <span className="text-[color:var(--ink-mute)]">
                            {' '}
                            →{' '}
                        </span>
                        <span className="font-semibold text-[color:var(--ink)]">
                            {medium.recipient?.pseudo ?? 'Compte supprimé'}
                        </span>
                    </p>
                    <AdminMeta>
                        Envoyé le{' '}
                        {new Date(medium.sent_at).toLocaleString('fr-FR')}
                        {medium.first_viewed_at
                            ? ` · vu le ${new Date(medium.first_viewed_at).toLocaleString('fr-FR')}`
                            : ' · jamais ouvert'}
                    </AdminMeta>
                </div>

                {revealed ? (
                    <div className="overflow-hidden rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-soft)]">
                        {medium.type === 'video' ? (
                            <video
                                src={`/admin/ephemeral/${medium.id}/file`}
                                controls
                                className="max-h-[420px] w-full"
                            />
                        ) : (
                            <img
                                src={`/admin/ephemeral/${medium.id}/file`}
                                alt=""
                                className="max-h-[420px] w-full object-contain"
                            />
                        )}
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setRevealed(true)}
                        className="w-full rounded-xl border-2 border-dashed border-[color:var(--line)] py-10 text-center text-sm font-semibold text-[color:var(--ink-soft)] transition-colors hover:border-[color:var(--wine)] hover:text-[color:var(--ink)]"
                    >
                        <EyeOff className="mx-auto mb-2 h-5 w-5" />
                        Afficher le contenu signalé
                        <span className="mt-1 block text-[11px] font-normal text-[color:var(--ink-mute)]">
                            Cette consultation est enregistrée au journal de
                            modération
                        </span>
                    </button>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                    <AdminButton
                        size="sm"
                        disabled={busy}
                        onClick={() => setConfirmDismiss(true)}
                    >
                        Classer sans suite
                    </AdminButton>
                    <AdminButton
                        size="sm"
                        variant="danger"
                        disabled={busy}
                        onClick={() => setConfirmDelete(true)}
                    >
                        Supprimer le fichier
                    </AdminButton>
                </div>

                <p className="mt-3 text-[11px] text-[color:var(--ink-mute)]">
                    Purge prévue le{' '}
                    {new Date(medium.purge_after).toLocaleDateString('fr-FR')} —
                    gelée tant que le dossier est ouvert.
                </p>
            </AdminCard>

            <Dialog open={confirmDismiss} onOpenChange={setConfirmDismiss}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium italic">
                            Classer sans suite
                        </DialogTitle>
                        <DialogDescription>
                            Le signalement sera clos et le fichier reprendra son
                            cycle de purge normal, selon les règles habituelles
                            d’accès et de revoyure.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        maxLength={500}
                        placeholder="Motif de la décision (3 caractères minimum)"
                        aria-label="Motif du classement"
                    />
                    {decisionError && (
                        <p role="alert" className="text-sm text-destructive">
                            {decisionError}
                        </p>
                    )}
                    <DialogFooter>
                        <AdminButton onClick={() => setConfirmDismiss(false)}>
                            Annuler
                        </AdminButton>
                        <AdminButton
                            variant="wine"
                            disabled={busy || reason.trim().length < 3}
                            onClick={dismiss}
                        >
                            {busy ? 'Traitement…' : 'Confirmer'}
                        </AdminButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium text-[color:var(--destructive)] italic">
                            Supprimer ce fichier
                        </DialogTitle>
                        <DialogDescription>
                            Suppression définitive du média. Le motif est
                            obligatoire et conservé au journal de modération.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Ex : contenu non consenti, personne mineure, violence…"
                        rows={3}
                        autoFocus
                    />
                    {decisionError && (
                        <p role="alert" className="text-sm text-destructive">
                            {decisionError}
                        </p>
                    )}
                    <DialogFooter>
                        <AdminButton onClick={() => setConfirmDelete(false)}>
                            Annuler
                        </AdminButton>
                        <AdminButton
                            variant="danger"
                            disabled={busy || reason.trim().length < 3}
                            onClick={destroy}
                        >
                            {busy ? 'Suppression…' : 'Supprimer définitivement'}
                        </AdminButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
