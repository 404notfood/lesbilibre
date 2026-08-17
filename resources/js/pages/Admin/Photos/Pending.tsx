import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminEmpty,
    AdminMeta,
    AdminPagination,
} from '@/layouts/admin-layout';
import PhotoLightbox, { LightboxItem } from '@/components/photo-lightbox';
import { Head, Link, router } from '@inertiajs/react';
import { Check, ImageOff, Video, X, ZoomIn } from 'lucide-react';
import { useState } from 'react';

interface PhotoUser {
    id: number;
    name: string;
    pseudo: string;
    email: string;
}

interface Photo {
    id: number;
    url: string | null;
    thumbnail_url: string | null;
    media_type: 'photo' | 'video';
    available: boolean;
    is_naughty: boolean;
    /** La membre demande à en faire sa photo de profil : à traiter en priorité. */
    awaiting_avatar: boolean;
    created_at: string;
    user: PhotoUser | null;
}

interface Props {
    photos: {
        data: Photo[];
        from: number | null;
        to: number | null;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
}

export default function Pending({ photos }: Props) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const lightboxItems: LightboxItem[] = photos.data.flatMap((photo) =>
        photo.available && photo.url
            ? [
                  {
                      id: photo.id,
                      url: photo.url,
                      mediaType: photo.media_type,
                      posterUrl: photo.thumbnail_url,
                      caption: photo.user
                          ? `Média soumis par ${photo.user.pseudo || photo.user.name}`
                          : 'Compte supprimé',
                  },
              ]
            : [],
    );
    const lightboxIndexes = new Map(
        lightboxItems.map((item, index) => [item.id, index]),
    );

    return (
        <AdminLayout
            title="Photos en attente"
            subtitle="Valider ou refuser les photos avant leur publication sur les profils"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Modération', href: '/admin/moderation' },
                { label: 'Photos' },
            ]}
            hideSearch
            actions={
                <AdminBadge tone={photos.total > 0 ? 'warning' : 'success'}>
                    {photos.total} en attente
                </AdminBadge>
            }
        >
            <Head title="Photos en attente · Admin" />

            {photos.data.length === 0 ? (
                <AdminCard padded={false}>
                    <AdminEmpty
                        icon={ImageOff}
                        title="File vide"
                        description="Toutes les photos soumises ont été traitées."
                        action={
                            <AdminButton size="sm" href="/admin/moderation">
                                Retour à la modération
                            </AdminButton>
                        }
                    />
                </AdminCard>
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {photos.data.map((photo) => (
                            <PhotoCard
                                key={photo.id}
                                photo={photo}
                                onPreview={() => {
                                    const index = lightboxIndexes.get(photo.id);

                                    if (index !== undefined) {
                                        setLightboxIndex(index);
                                    }
                                }}
                            />
                        ))}
                    </div>

                    <AdminCard padded={false}>
                        <AdminPagination
                            from={photos.from}
                            to={photos.to}
                            total={photos.total}
                            lastPage={photos.last_page}
                            links={photos.links}
                        />
                    </AdminCard>
                </div>
            )}

            <PhotoLightbox
                items={lightboxItems}
                index={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
                onNavigate={setLightboxIndex}
            />
        </AdminLayout>
    );
}

function PhotoCard({ photo, onPreview }: { photo: Photo; onPreview: () => void }) {
    const [processing, setProcessing] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState('');

    const approve = () => {
        setProcessing(true);
        router.post(
            `/admin/photos/${photo.id}/approve`,
            {},
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    };

    const reject = () => {
        if (!reason.trim()) {
            return;
        }

        setProcessing(true);
        router.post(
            `/admin/photos/${photo.id}/reject`,
            { rejection_reason: reason },
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    };

    return (
        <AdminCard padded={false}>
            <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--bg-soft)]">
                {!photo.available || !photo.url ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center text-xs text-[color:var(--ink-mute)]">
                        <ImageOff className="h-6 w-6" />
                        Média indisponible
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onPreview}
                        className="group/preview relative h-full w-full cursor-zoom-in"
                        aria-label={
                            photo.media_type === 'video'
                                ? 'Lire la vidéo en grand'
                                : 'Agrandir la photo'
                        }
                    >
                        {photo.thumbnail_url || photo.media_type === 'photo' ? (
                            <img
                                src={photo.thumbnail_url ?? photo.url}
                                alt={`Média soumis par ${photo.user?.pseudo ?? 'un compte supprimé'}`}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-[color:var(--ink-mute)]">
                                <Video className="h-7 w-7" />
                                Voir la vidéo
                            </div>
                        )}
                        <span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition-all group-hover/preview:bg-black/25 group-hover/preview:opacity-100 group-focus-visible/preview:bg-black/25 group-focus-visible/preview:opacity-100">
                            <ZoomIn className="h-6 w-6" />
                        </span>
                    </button>
                )}
                <div className="absolute inset-x-3 top-3 flex flex-wrap gap-1">
                    {photo.awaiting_avatar && (
                        <AdminBadge tone="gold">Demande d&apos;avatar</AdminBadge>
                    )}
                    {photo.is_naughty && (
                        <AdminBadge tone="danger">Contenu coquin</AdminBadge>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4">
                <div className="min-w-0">
                    {photo.user ? (
                        <Link
                            href={`/admin/users/${photo.user.id}`}
                            className="block truncate text-sm font-semibold text-[color:var(--ink)] underline decoration-dotted underline-offset-2"
                        >
                            {photo.user.pseudo || photo.user.name}
                        </Link>
                    ) : (
                        <span className="text-sm font-semibold text-[color:var(--ink-mute)]">
                            Compte supprimé
                        </span>
                    )}
                    <AdminMeta>
                        {new Date(photo.created_at).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </AdminMeta>
                </div>

                {rejecting ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            rows={3}
                            maxLength={500}
                            autoFocus
                            placeholder="Motif du refus (communiqué à l'utilisatrice)"
                            className="w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-soft)] p-2 text-xs text-[color:var(--ink)] outline-none focus:border-[color:var(--desire)]"
                        />
                        <div className="flex gap-2">
                            <AdminButton
                                size="sm"
                                variant="danger"
                                disabled={processing || !reason.trim()}
                                onClick={reject}
                            >
                                Confirmer le refus
                            </AdminButton>
                            <AdminButton
                                size="sm"
                                variant="ghost"
                                disabled={processing}
                                onClick={() => {
                                    setRejecting(false);
                                    setReason('');
                                }}
                            >
                                Annuler
                            </AdminButton>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <AdminButton
                            size="sm"
                            variant="success"
                            icon={Check}
                            className="flex-1"
                            disabled={processing}
                            onClick={approve}
                        >
                            Approuver
                        </AdminButton>
                        <AdminButton
                            size="sm"
                            variant="danger"
                            icon={X}
                            className="flex-1"
                            disabled={processing}
                            onClick={() => setRejecting(true)}
                        >
                            Refuser
                        </AdminButton>
                    </div>
                )}
            </div>
        </AdminCard>
    );
}
