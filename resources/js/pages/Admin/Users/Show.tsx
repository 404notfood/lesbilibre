import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminCardHeader,
    AdminEmpty,
    AdminMeta,
} from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Award,
    BadgeCheck,
    Ban,
    CheckCircle,
    Crown,
    Flag,
    Heart,
    Image as ImageIcon,
    Send,
    ShieldBan,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface AdminPhoto {
    id: number;
    url: string;
    is_primary: boolean;
    is_naughty: boolean;
    moderation_status: 'pending' | 'approved' | 'rejected' | 'quarantined';
    rejection_reason: string | null;
    avatar_requested: boolean;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    pseudo: string;
    is_premium: boolean;
    premium_expires_at: string | null;
    is_verified: boolean;
    is_banned: boolean;
    ban_reason: string | null;
    banned_at: string | null;
    gems_balance: number;
    badge_points: number;
    last_activity_at: string;
    created_at: string;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    profile: any;
    photos: AdminPhoto[];
    badges: any[];
    subscriptions: any[];
    /* eslint-enable @typescript-eslint/no-explicit-any */
}

interface Stats {
    likes_given: number;
    likes_received: number;
    matches: number;
    messages_sent: number;
    photos_count: number;
    badges_count: number;
    reports_received: number;
    reports_made: number;
}

const longDate = (value: string): string =>
    new Date(value).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

export default function Show({ user, stats }: { user: User; stats: Stats }) {
    const [showBanDialog, setShowBanDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showPremiumDialog, setShowPremiumDialog] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [premiumExpiresAt, setPremiumExpiresAt] = useState('');

    /** Une date de fin de premium ne peut pas être antérieure à demain. */
    const minPremiumExpiresAt = useMemo(
        () => new Date(Date.now() + 86400000).toISOString().split('T')[0],
        [],
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBan = () => {
        if (!banReason.trim()) {
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/admin/users/${user.id}/ban`,
            { reason: banReason },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setShowBanDialog(false);
                    setBanReason('');
                },
            },
        );
    };

    const handleUnban = () => {
        router.post(`/admin/users/${user.id}/unban`, {}, { preserveScroll: true });
    };

    const handleTogglePremium = () => {
        setIsSubmitting(true);
        router.post(
            `/admin/users/${user.id}/toggle-premium`,
            { premium_expires_at: premiumExpiresAt || null },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setShowPremiumDialog(false);
                    setPremiumExpiresAt('');
                },
            },
        );
    };

    const handleRemovePremium = () => {
        router.post(
            `/admin/users/${user.id}/toggle-premium`,
            {},
            { preserveScroll: true },
        );
    };

    const hasAvatar = user.photos.some((photo) => photo.is_primary);

    return (
        <AdminLayout
            title={user.name}
            subtitle={`${user.email}${user.pseudo ? ` · @${user.pseudo}` : ''}`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Utilisatrices', href: '/admin/users' },
                { label: user.name },
            ]}
            hideSearch
            actions={
                <>
                    {user.is_premium ? (
                        <AdminButton icon={Crown} onClick={handleRemovePremium}>
                            Retirer Premium
                        </AdminButton>
                    ) : (
                        <AdminButton
                            variant="gold"
                            icon={Crown}
                            onClick={() => setShowPremiumDialog(true)}
                        >
                            Accorder Premium
                        </AdminButton>
                    )}
                    {user.is_banned ? (
                        <AdminButton icon={CheckCircle} onClick={handleUnban}>
                            Débannir
                        </AdminButton>
                    ) : (
                        <AdminButton
                            variant="danger"
                            icon={Ban}
                            onClick={() => setShowBanDialog(true)}
                        >
                            Bannir
                        </AdminButton>
                    )}
                    <AdminButton
                        variant="ghost"
                        icon={Trash2}
                        onClick={() => setShowDeleteDialog(true)}
                        title="Supprimer définitivement le compte"
                    >
                        Supprimer
                    </AdminButton>
                </>
            }
        >
            <Head title={`${user.name} · Admin`} />

            <div className="space-y-6">
                {/* Bandeau de bannissement */}
                {user.is_banned && (
                    <div className="rounded-2xl bg-gradient-to-br from-[color:var(--destructive)] to-[oklch(38%_0.18_12)] p-5 text-white">
                        <div className="flex items-start gap-4">
                            <ShieldBan className="mt-0.5 h-5 w-5 shrink-0" />
                            <div className="min-w-0">
                                <div className="editorial-eyebrow mb-1 text-white/70">
                                    Compte banni
                                </div>
                                {user.ban_reason && (
                                    <p className="font-display text-lg font-medium italic">
                                        « {user.ban_reason} »
                                    </p>
                                )}
                                {user.banned_at && (
                                    <p className="mt-2 text-xs text-white/75">
                                        Banni le {longDate(user.banned_at)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Colonne principale */}
                    <div className="space-y-4 lg:col-span-2">
                        {/* Galerie */}
                        <AdminCard padded={false}>
                            <AdminCardHeader
                                title={`Galerie · ${user.photos.length} photo${user.photos.length > 1 ? 's' : ''}`}
                                icon={ImageIcon}
                                action={
                                    hasAvatar ? (
                                        <AdminButton
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                router.post(
                                                    `/admin/users/${user.id}/clear-avatar`,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            Retirer l&apos;avatar
                                        </AdminButton>
                                    ) : undefined
                                }
                            />
                            {user.photos.length === 0 ? (
                                <AdminEmpty
                                    icon={ImageIcon}
                                    title="Aucune photo"
                                    description="Ce compte n’a encore rien publié."
                                />
                            ) : (
                                <div className="p-5">
                                    <p className="mb-4 text-xs text-[color:var(--ink-mute)]">
                                        Images affichées telles qu&apos;envoyées, sans
                                        floutage, pour permettre le jugement. Marquer une
                                        photo comme coquine la floute côté membres et la
                                        retire de la photo de profil.
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {user.photos.map((photo) => (
                                            <AdminPhotoTile
                                                key={photo.id}
                                                photo={photo}
                                                userId={user.id}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </AdminCard>

                        {/* Activité */}
                        <AdminCard padded={false}>
                            <AdminCardHeader title="Activité" icon={Heart} />
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3">
                                <DetailStat
                                    label="Matches"
                                    value={stats.matches}
                                    icon={Heart}
                                />
                                <DetailStat
                                    label="Messages envoyés"
                                    value={stats.messages_sent}
                                    icon={Send}
                                />
                                <DetailStat
                                    label="Likes donnés"
                                    value={stats.likes_given}
                                />
                                <DetailStat
                                    label="Likes reçus"
                                    value={stats.likes_received}
                                />
                                <DetailStat
                                    label="Badges obtenus"
                                    value={stats.badges_count}
                                    icon={Award}
                                />
                                <DetailStat
                                    label="Signalements reçus"
                                    value={stats.reports_received}
                                    tone={stats.reports_received > 0 ? 'danger' : 'neutral'}
                                    icon={Flag}
                                />
                            </div>
                        </AdminCard>
                    </div>

                    {/* Colonne latérale */}
                    <div className="space-y-4">
                        <AdminCard>
                            <div className="mb-4 flex flex-wrap gap-1.5">
                                {user.is_premium && (
                                    <AdminBadge tone="gold">
                                        <Crown className="h-2.5 w-2.5" />
                                        {user.premium_expires_at
                                            ? `Premium → ${new Date(user.premium_expires_at).toLocaleDateString('fr-FR')}`
                                            : 'Premium illimité'}
                                    </AdminBadge>
                                )}
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
                                {!user.is_premium &&
                                    !user.is_verified &&
                                    !user.is_banned && <AdminBadge>Standard</AdminBadge>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <ResourceTile
                                    label="Gemmes"
                                    value={user.gems_balance}
                                    icon={Sparkles}
                                    href={`/admin/gems/${user.id}`}
                                />
                                <ResourceTile
                                    label="Points badge"
                                    value={user.badge_points}
                                    icon={Award}
                                />
                            </div>
                        </AdminCard>

                        <AdminCard padded={false}>
                            <AdminCardHeader title="Informations" />
                            <dl className="divide-y divide-[color:var(--line-soft)]">
                                <InfoRow
                                    label="Inscription"
                                    value={longDate(user.created_at)}
                                />
                                <InfoRow
                                    label="Dernière activité"
                                    value={
                                        user.last_activity_at
                                            ? new Date(
                                                  user.last_activity_at,
                                              ).toLocaleDateString('fr-FR', {
                                                  day: 'numeric',
                                                  month: 'long',
                                                  year: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              })
                                            : 'Jamais'
                                    }
                                />
                                <InfoRow label="E-mail" value={user.email} />
                                {user.pseudo && (
                                    <InfoRow label="Pseudo" value={`@${user.pseudo}`} />
                                )}
                                {user.profile?.city && (
                                    <InfoRow label="Ville" value={user.profile.city} />
                                )}
                                {user.profile?.age && (
                                    <InfoRow label="Âge" value={`${user.profile.age} ans`} />
                                )}
                                <InfoRow
                                    label="Signalements faits"
                                    value={String(stats.reports_made)}
                                />
                            </dl>
                        </AdminCard>
                    </div>
                </div>
            </div>

            {/* ================= Dialogues ================= */}
            <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium italic">
                            Accorder Premium
                        </DialogTitle>
                        <DialogDescription>
                            Date de fin optionnelle. Laisser vide pour un Premium illimité.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="premium_expires_at" className="editorial-caption">
                            Date de fin
                        </Label>
                        <Input
                            id="premium_expires_at"
                            type="date"
                            value={premiumExpiresAt}
                            onChange={(event) => setPremiumExpiresAt(event.target.value)}
                            min={minPremiumExpiresAt}
                        />
                    </div>
                    <DialogFooter>
                        <AdminButton onClick={() => setShowPremiumDialog(false)}>
                            Annuler
                        </AdminButton>
                        <AdminButton
                            variant="gold"
                            onClick={handleTogglePremium}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Activation…' : 'Confirmer'}
                        </AdminButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium italic">
                            Bannir {user.name}
                        </DialogTitle>
                        <DialogDescription>
                            Le motif est enregistré au journal de modération et reste
                            consultable.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={banReason}
                        onChange={(event) => setBanReason(event.target.value)}
                        placeholder="Ex : comportement inapproprié envers d'autres membres…"
                        rows={4}
                    />
                    <DialogFooter>
                        <AdminButton onClick={() => setShowBanDialog(false)}>
                            Annuler
                        </AdminButton>
                        <AdminButton
                            variant="danger"
                            onClick={handleBan}
                            disabled={isSubmitting || !banReason.trim()}
                        >
                            {isSubmitting ? 'Bannissement…' : 'Confirmer le ban'}
                        </AdminButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium italic text-[color:var(--destructive)]">
                            Supprimer définitivement {user.name}
                        </DialogTitle>
                        <DialogDescription>
                            <strong>Action irréversible.</strong> Toutes les données —
                            profil, photos, messages, matches — seront effacées. Préfère un
                            bannissement si tu veux garder une trace.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <AdminButton onClick={() => setShowDeleteDialog(false)}>
                            Annuler
                        </AdminButton>
                        <AdminButton
                            variant="danger"
                            onClick={() => router.delete(`/admin/users/${user.id}`)}
                        >
                            Supprimer définitivement
                        </AdminButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

/* ---------------------------------------------------------------------------
 * Sous-composants
 * -------------------------------------------------------------------------*/

function ResourceTile({
    label,
    value,
    icon: Icon,
    href,
}: {
    label: string;
    value: number;
    icon: typeof Heart;
    href?: string;
}) {
    const content = (
        <>
            <div className="mb-1 flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-[color:var(--gold)]" />
                <span className="editorial-caption text-[color:var(--ink-mute)]">
                    {label}
                </span>
            </div>
            <div className="font-display text-2xl font-medium text-[color:var(--ink)]">
                {value.toLocaleString('fr-FR')}
            </div>
        </>
    );

    const className =
        'rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-soft)] p-3';

    if (href) {
        return (
            <a
                href={href}
                className={`${className} block transition-colors hover:border-[color:var(--wine)]`}
            >
                {content}
            </a>
        );
    }

    return <div className={className}>{content}</div>;
}

function DetailStat({
    label,
    value,
    icon: Icon,
    tone = 'neutral',
}: {
    label: string;
    value: number;
    icon?: typeof Heart;
    tone?: 'neutral' | 'danger';
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <div className="editorial-caption text-[color:var(--ink-mute)]">
                    {label}
                </div>
                <div
                    className={`font-display mt-0.5 text-xl font-medium tracking-tight ${
                        tone === 'danger' && value > 0
                            ? 'text-[color:var(--destructive)]'
                            : 'text-[color:var(--ink)]'
                    }`}
                >
                    {value.toLocaleString('fr-FR')}
                </div>
            </div>
            {Icon && (
                <Icon className="h-4 w-4 shrink-0 text-[color:var(--ink-mute)]" />
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-3 px-5 py-2.5">
            <dt className="editorial-caption shrink-0 text-[color:var(--ink-mute)]">
                {label}
            </dt>
            <dd className="min-w-0 truncate text-right text-sm font-medium text-[color:var(--ink)]">
                {value}
            </dd>
        </div>
    );
}

/** Vignette de modération d'une photo depuis la fiche membre. */
function AdminPhotoTile({ photo, userId }: { photo: AdminPhoto; userId: number }) {
    const [busy, setBusy] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [reason, setReason] = useState('');

    const toggleSensitivity = () => {
        setBusy(true);
        router.post(
            `/admin/users/${userId}/photos/${photo.id}/sensitivity`,
            {},
            { preserveScroll: true, onFinish: () => setBusy(false) },
        );
    };

    const remove = () => {
        if (!reason.trim()) {
            return;
        }

        setBusy(true);
        router.delete(`/admin/users/${userId}/photos/${photo.id}`, {
            data: { reason },
            preserveScroll: true,
            onFinish: () => {
                setBusy(false);
                setShowDelete(false);
                setReason('');
            },
        });
    };

    return (
        <>
            <figure
                className={`group relative overflow-hidden rounded-xl border bg-[color:var(--bg-soft)] ${
                    photo.is_primary
                        ? 'border-[color:var(--gold)]'
                        : 'border-[color:var(--line)]'
                }`}
            >
                <div className="relative aspect-[4/5]">
                    <img
                        src={photo.url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-2 top-2 flex flex-wrap gap-1">
                        {photo.is_primary && <AdminBadge tone="gold">Profil</AdminBadge>}
                        {photo.is_naughty && (
                            <AdminBadge tone="danger">Coquine</AdminBadge>
                        )}
                        {photo.avatar_requested && (
                            <AdminBadge tone="warning">Demande avatar</AdminBadge>
                        )}
                        {photo.moderation_status === 'rejected' && (
                            <AdminBadge tone="neutral">Retirée</AdminBadge>
                        )}
                    </div>
                </div>

                <figcaption className="flex flex-col gap-2 p-2.5">
                    <AdminMeta>
                        {new Date(photo.created_at).toLocaleDateString('fr-FR')}
                    </AdminMeta>
                    <div className="flex flex-wrap gap-1.5">
                        <AdminButton
                            size="sm"
                            variant={photo.is_naughty ? 'default' : 'wine'}
                            disabled={busy}
                            onClick={toggleSensitivity}
                        >
                            {photo.is_naughty ? 'Tout public' : 'Coquine'}
                        </AdminButton>
                        <AdminButton
                            size="sm"
                            variant="ghost"
                            icon={Trash2}
                            disabled={busy}
                            onClick={() => setShowDelete(true)}
                            title="Supprimer la photo"
                        />
                    </div>
                </figcaption>
            </figure>

            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium italic">
                            Supprimer cette photo
                        </DialogTitle>
                        <DialogDescription>
                            Le motif est obligatoire et conservé au journal de modération.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Ex : contenu non conforme aux règles de la plateforme…"
                        rows={3}
                    />
                    <DialogFooter>
                        <AdminButton onClick={() => setShowDelete(false)}>
                            Annuler
                        </AdminButton>
                        <AdminButton
                            variant="danger"
                            onClick={remove}
                            disabled={busy || !reason.trim()}
                        >
                            {busy ? 'Suppression…' : 'Supprimer'}
                        </AdminButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
