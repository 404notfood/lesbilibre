import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminKpi,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Eye, Flame, Send, ShieldCheck, Timer } from 'lucide-react';
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
    };
}

export default function Index({ flagged, stats }: Props) {
    const openRate =
        stats.sent_total > 0
            ? Math.round((stats.opened / stats.sent_total) * 100)
            : 0;
    const replayRate =
        stats.opened > 0 ? Math.round((stats.replayed / stats.opened) * 100) : 0;

    return (
        <AdminLayout
            title="Contenus éphémères"
            subtitle="Usage de la fonctionnalité et signalements en attente"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Éphémères' },
            ]}
            actions={
                flagged.length > 0 ? (
                    <AdminBadge tone="danger">
                        {flagged.length} signalement{flagged.length > 1 ? 's' : ''}
                    </AdminBadge>
                ) : undefined
            }
        >
            <Head title="Contenus éphémères · Admin" />

            {/* ---- Signalements — priorité absolue ------------------- */}
            {flagged.length > 0 && (
                <section className="mb-8">
                    <div
                        className="mb-4 flex items-start gap-3 rounded-2xl border p-4"
                        style={{
                            borderColor: 'var(--desire)',
                            background: 'var(--blush)',
                            color: 'var(--wine-deep)',
                        }}
                    >
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
                                prioritaire : la personne visée ne peut plus le
                                consulter, et le fichier est gelé hors du cycle de
                                purge tant que le dossier reste ouvert.
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

            {/* ---- Statistiques agrégées ---------------------------- */}
            <section>
                <AdminSectionTitle
                    eyebrow="Aucun contenu n’est consultable ici sans signalement"
                    title="Usage de la fonctionnalité"
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminKpi
                        label="Envoyés au total"
                        value={stats.sent_total}
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
                        deltaTone="neutral"
                        icon={Eye}
                    />
                    <AdminKpi
                        label="Revus une fois"
                        value={stats.replayed}
                        delta={`${replayRate} % des ouvertures`}
                        deltaTone="neutral"
                        icon={Timer}
                    />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminCard>
                        <div
                            className="editorial-caption mb-2"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Répartition
                        </div>
                        <div className="flex items-baseline gap-4">
                            <div>
                                <div className="font-display text-2xl font-medium">
                                    {stats.photos}
                                </div>
                                <div
                                    className="text-[11px]"
                                    style={{ color: 'var(--ink-mute)' }}
                                >
                                    photos
                                </div>
                            </div>
                            <div>
                                <div className="font-display text-2xl font-medium">
                                    {stats.videos}
                                </div>
                                <div
                                    className="text-[11px]"
                                    style={{ color: 'var(--ink-mute)' }}
                                >
                                    vidéos
                                </div>
                            </div>
                        </div>
                    </AdminCard>

                    <AdminCard>
                        <div
                            className="editorial-caption mb-2"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            En attente d’ouverture
                        </div>
                        <div className="font-display text-2xl font-medium">
                            {stats.never_opened}
                        </div>
                        <p
                            className="mt-1 text-[11px]"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Conservés jusqu’à la première vue
                        </p>
                    </AdminCard>

                    <AdminCard>
                        <div
                            className="editorial-caption mb-2"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Supprimés
                        </div>
                        <div className="font-display text-2xl font-medium">
                            {stats.purged}
                        </div>
                        <p
                            className="mt-1 text-[11px]"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Fichiers effacés après rétention
                        </p>
                    </AdminCard>

                    <AdminCard>
                        <div
                            className="editorial-caption mb-2"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Dossiers ouverts
                        </div>
                        <div
                            className="font-display text-2xl font-medium"
                            style={{
                                color:
                                    stats.flagged_open > 0
                                        ? 'var(--desire-deep)'
                                        : undefined,
                            }}
                        >
                            {stats.flagged_open}
                        </div>
                        <p
                            className="mt-1 text-[11px]"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Signalements à traiter
                        </p>
                    </AdminCard>
                </div>

                {flagged.length === 0 && (
                    <AdminCard className="mt-4">
                        <div className="flex flex-col items-center gap-2 py-10 text-center">
                            <div
                                className="grid h-12 w-12 place-items-center rounded-full"
                                style={{
                                    background: 'var(--bg-soft)',
                                    color: 'var(--success)',
                                }}
                            >
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <h2 className="font-display text-xl font-medium italic">
                                Aucun signalement
                            </h2>
                            <p
                                className="max-w-md text-sm"
                                style={{ color: 'var(--ink-mute)' }}
                            >
                                Les contenus éphémères ne sont pas consultables tant
                                que personne ne les signale.
                            </p>
                        </div>
                    </AdminCard>
                )}
            </section>
        </AdminLayout>
    );
}

function FlaggedCard({ medium }: { medium: FlaggedMedia }) {
    const [revealed, setRevealed] = useState(false);
    const [busy, setBusy] = useState(false);

    const dismiss = () => {
        if (!confirm('Classer ce signalement sans suite ?')) return;
        setBusy(true);
        router.post(
            `/admin/ephemeral/${medium.id}/dismiss`,
            {},
            { preserveScroll: true, onFinish: () => setBusy(false) },
        );
    };

    const destroy = () => {
        const reason = prompt('Motif de la suppression (conservé au journal) :');
        if (!reason?.trim()) return;

        setBusy(true);
        router.delete(`/admin/ephemeral/${medium.id}`, {
            data: { reason },
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    };

    return (
        <AdminCard>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <AdminBadge tone="wine">
                            {medium.type === 'video' ? 'Vidéo' : 'Photo'}
                        </AdminBadge>
                        {medium.is_naughty && (
                            <AdminBadge tone="danger">Sensible</AdminBadge>
                        )}
                    </div>
                    <p className="mt-2 text-sm">
                        <span className="font-semibold">
                            {medium.sender?.pseudo ?? 'Compte supprimé'}
                        </span>
                        <span style={{ color: 'var(--ink-mute)' }}> → </span>
                        <span className="font-semibold">
                            {medium.recipient?.pseudo ?? 'Compte supprimé'}
                        </span>
                    </p>
                    <p
                        className="font-mono mt-1 text-[10px] uppercase tracking-wider"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        Envoyé le {new Date(medium.sent_at).toLocaleString('fr-FR')}
                        {medium.first_viewed_at
                            ? ` · vu le ${new Date(medium.first_viewed_at).toLocaleString('fr-FR')}`
                            : ' · jamais ouvert'}
                    </p>
                </div>
            </div>

            {revealed ? (
                <div
                    className="overflow-hidden rounded-xl border"
                    style={{ borderColor: 'var(--line)' }}
                >
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
                    className="w-full rounded-xl border-2 border-dashed py-10 text-center text-sm font-semibold transition-colors hover:border-[color:var(--wine)]"
                    style={{
                        borderColor: 'var(--line)',
                        color: 'var(--ink-soft)',
                    }}
                >
                    Afficher le contenu signalé
                    <span
                        className="mt-1 block text-[11px] font-normal"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        Cette consultation est enregistrée au journal de modération
                    </span>
                </button>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                <AdminButton size="sm" disabled={busy} onClick={dismiss}>
                    Classer sans suite
                </AdminButton>
                <AdminButton
                    size="sm"
                    variant="danger"
                    disabled={busy}
                    onClick={destroy}
                >
                    Supprimer le fichier
                </AdminButton>
            </div>

            <p
                className="mt-3 text-[11px]"
                style={{ color: 'var(--ink-mute)' }}
            >
                Purge prévue le{' '}
                {new Date(medium.purge_after).toLocaleDateString('fr-FR')} — gelée
                tant que le dossier est ouvert.
            </p>
        </AdminCard>
    );
}
