import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminKpi,
    AdminSectionTitle,
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
    MessageCircle,
    ShieldBan,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

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

export default function Show({ user, stats }: { user: User; stats: Stats }) {
    const [showBanDialog, setShowBanDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showPremiumDialog, setShowPremiumDialog] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [premiumExpiresAt, setPremiumExpiresAt] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBan = () => {
        if (!banReason.trim()) return;
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
        if (confirm('Débannir cette utilisatrice ?')) {
            router.post(`/admin/users/${user.id}/unban`);
        }
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
        if (confirm('Retirer le statut Premium ?')) {
            router.post(`/admin/users/${user.id}/toggle-premium`);
        }
    };

    const handleDelete = () => {
        router.delete(`/admin/users/${user.id}`);
    };

    return (
        <AdminLayout
            title={user.name}
            subtitle={`${user.email}${user.pseudo ? ` · @${user.pseudo}` : ''}`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Utilisatrices', href: '/admin/users' },
                { label: user.name },
            ]}
            actions={
                <>
                    {user.is_premium ? (
                        <AdminButton
                            variant="default"
                            icon={Crown}
                            onClick={handleRemovePremium}
                        >
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
                        <AdminButton
                            variant="default"
                            icon={CheckCircle}
                            onClick={handleUnban}
                        >
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
                    >
                        Supprimer
                    </AdminButton>
                </>
            }
        >
            <Head title={`${user.name} · Admin`} />

            <div className="space-y-8">
                {/* Status row */}
                <div className="flex flex-wrap gap-2">
                    {user.is_premium && (
                        <AdminBadge tone="gold">
                            <Crown className="h-2.5 w-2.5" />
                            {user.premium_expires_at
                                ? `Premium jusqu’au ${new Date(user.premium_expires_at).toLocaleDateString('fr-FR')}`
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
                    {!user.is_premium && !user.is_verified && !user.is_banned && (
                        <AdminBadge>Standard</AdminBadge>
                    )}
                </div>

                {/* Ban warning */}
                {user.is_banned && user.ban_reason && (
                    <div
                        className="relative overflow-hidden rounded-2xl p-5 text-[oklch(96%_0.02_50)]"
                        style={{
                            background:
                                'linear-gradient(135deg, var(--destructive) 0%, oklch(40% 0.18 12) 100%)',
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <ShieldBan className="mt-0.5 h-5 w-5 shrink-0" />
                            <div>
                                <div className="editorial-eyebrow mb-1 opacity-70">
                                    Utilisatrice bannie
                                </div>
                                <p className="font-display text-lg font-medium italic">
                                    « {user.ban_reason} »
                                </p>
                                {user.banned_at && (
                                    <p className="mt-2 text-xs opacity-75">
                                        Banni le{' '}
                                        {new Date(user.banned_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* KPIs principaux */}
                <section>
                    <AdminSectionTitle eyebrow="01 · Ressources" title="État du compte" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminKpi
                            label="Gemmes"
                            value={user.gems_balance}
                            icon={Sparkles}
                        />
                        <AdminKpi
                            label="Points badge"
                            value={user.badge_points}
                            icon={Award}
                        />
                        <AdminKpi
                            label="Matches"
                            value={stats.matches}
                            icon={Heart}
                        />
                        <AdminKpi
                            label="Messages envoyés"
                            value={stats.messages_sent}
                            icon={MessageCircle}
                        />
                    </div>
                </section>

                {/* Stats détaillées */}
                <section>
                    <AdminSectionTitle
                        eyebrow="02 · Activité"
                        title="Statistiques détaillées"
                    />
                    <AdminCard>
                        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
                            <DetailStat label="Likes donnés" value={stats.likes_given} />
                            <DetailStat label="Likes reçus" value={stats.likes_received} />
                            <DetailStat
                                label="Photos"
                                value={stats.photos_count}
                                icon={ImageIcon}
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
                            <DetailStat
                                label="Signalements faits"
                                value={stats.reports_made}
                                icon={Flag}
                            />
                        </div>
                    </AdminCard>
                </section>

                {/* Galerie */}
                <section>
                    <AdminSectionTitle
                        eyebrow="03 · Contenu"
                        title="Galerie photo"
                        right={
                            user.photos.some((p) => p.is_primary) ? (
                                <AdminButton
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                'Retirer la photo de profil de ce compte ?',
                                            )
                                        ) {
                                            router.post(
                                                `/admin/users/${user.id}/clear-avatar`,
                                                {},
                                                { preserveScroll: true },
                                            );
                                        }
                                    }}
                                >
                                    Retirer l&apos;avatar
                                </AdminButton>
                            ) : undefined
                        }
                    />
                    <AdminCard>
                        {user.photos.length === 0 ? (
                            <p
                                className="py-8 text-center text-sm"
                                style={{ color: 'var(--ink-mute)' }}
                            >
                                Aucune photo.
                            </p>
                        ) : (
                            <>
                                <p
                                    className="mb-4 text-xs"
                                    style={{ color: 'var(--ink-mute)' }}
                                >
                                    Images affichées telles qu&apos;envoyées, sans
                                    floutage, pour permettre le jugement. Marquer une
                                    photo comme coquine la floute côté membres et la
                                    retire de la photo de profil.
                                </p>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                    {user.photos.map((photo) => (
                                        <AdminPhotoTile
                                            key={photo.id}
                                            photo={photo}
                                            userId={user.id}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </AdminCard>
                </section>

                {/* Informations compte */}
                <section>
                    <AdminSectionTitle
                        eyebrow="04 · Métadonnées"
                        title="Informations du compte"
                    />
                    <AdminCard>
                        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                            <InfoRow
                                label="Inscription"
                                value={new Date(user.created_at).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            />
                            <InfoRow
                                label="Dernière activité"
                                value={
                                    user.last_activity_at
                                        ? new Date(user.last_activity_at).toLocaleDateString(
                                              'fr-FR',
                                              {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              },
                                          )
                                        : '—'
                                }
                            />
                            {user.profile?.city && (
                                <InfoRow label="Ville" value={user.profile.city} />
                            )}
                            {user.profile?.age && (
                                <InfoRow
                                    label="Âge"
                                    value={`${user.profile.age} ans`}
                                />
                            )}
                        </div>
                    </AdminCard>
                </section>
            </div>

            {/* ========================
             * Premium Dialog
             * ======================*/}
            <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium italic">
                            Accorder Premium
                        </DialogTitle>
                        <DialogDescription>
                            Date de fin optionnelle. Vide = Premium illimité.
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
                            onChange={(e) => setPremiumExpiresAt(e.target.value)}
                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        />
                    </div>
                    <DialogFooter>
                        <AdminButton
                            variant="default"
                            onClick={() => setShowPremiumDialog(false)}
                        >
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

            {/* ========================
             * Ban Dialog
             * ======================*/}
            <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium italic">
                            Bannir {user.name}
                        </DialogTitle>
                        <DialogDescription>
                            Indique la raison du bannissement. Elle sera enregistrée pour audit.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Ex: Comportement inapproprié envers d'autres membres…"
                        rows={4}
                    />
                    <DialogFooter>
                        <AdminButton
                            variant="default"
                            onClick={() => setShowBanDialog(false)}
                        >
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

            {/* ========================
             * Delete Dialog
             * ======================*/}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle
                            className="font-display text-2xl font-medium italic"
                            style={{ color: 'var(--destructive)' }}
                        >
                            Supprimer définitivement {user.name}
                        </DialogTitle>
                        <DialogDescription>
                            <strong>Action irréversible.</strong> Toutes les données — profil,
                            photos, messages, matches — seront effacées.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <AdminButton
                            variant="default"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Annuler
                        </AdminButton>
                        <AdminButton variant="danger" onClick={handleDelete}>
                            Supprimer définitivement
                        </AdminButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

/* ---------- Sub-components ---------- */
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
}): JSX.Element {
    const valueColor =
        tone === 'danger' ? 'var(--destructive)' : 'var(--ink)';
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <div
                    className="editorial-caption"
                    style={{ color: 'var(--ink-mute)' }}
                >
                    {label}
                </div>
                <div
                    className="font-display mt-1 text-2xl font-medium tracking-tight"
                    style={{ color: valueColor }}
                >
                    {value.toLocaleString('fr-FR')}
                </div>
            </div>
            {Icon && (
                <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--ink-mute)' }}
                />
            )}
        </div>
    );
}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}): JSX.Element {
    return (
        <div>
            <div
                className="editorial-caption mb-1"
                style={{ color: 'var(--ink-mute)' }}
            >
                {label}
            </div>
            <div className="text-sm font-semibold">{value}</div>
        </div>
    );
}

/* ---------------------------------------------------------------------------
 * AdminPhotoTile — modération d'une photo depuis la fiche membre
 * -------------------------------------------------------------------------*/
function AdminPhotoTile({
    photo,
    userId,
}: {
    photo: AdminPhoto;
    userId: number;
}): JSX.Element {
    const [busy, setBusy] = useState(false);

    const toggleSensitivity = (): void => {
        setBusy(true);
        router.post(
            `/admin/users/${userId}/photos/${photo.id}/sensitivity`,
            {},
            { preserveScroll: true, onFinish: () => setBusy(false) },
        );
    };

    const remove = (): void => {
        const reason = prompt('Motif de la suppression (conservé au journal) :');
        if (!reason?.trim()) return;

        setBusy(true);
        router.delete(`/admin/users/${userId}/photos/${photo.id}`, {
            data: { reason },
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    };

    return (
        <figure
            className="group relative overflow-hidden rounded-xl border"
            style={{
                borderColor: photo.is_primary ? 'var(--gold)' : 'var(--line)',
                background: 'var(--bg-soft)',
            }}
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
                    {photo.is_naughty && <AdminBadge tone="danger">Coquine</AdminBadge>}
                    {photo.avatar_requested && (
                        <AdminBadge tone="warning">Demande avatar</AdminBadge>
                    )}
                    {photo.moderation_status === 'rejected' && (
                        <AdminBadge tone="neutral">Retirée</AdminBadge>
                    )}
                </div>
            </div>

            <figcaption className="flex flex-col gap-2 p-3">
                <p
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: 'var(--ink-mute)' }}
                >
                    {new Date(photo.created_at).toLocaleDateString('fr-FR')}
                </p>

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
                        variant="danger"
                        icon={Trash2}
                        disabled={busy}
                        onClick={remove}
                    >
                        Supprimer
                    </AdminButton>
                </div>
            </figcaption>
        </figure>
    );
}
