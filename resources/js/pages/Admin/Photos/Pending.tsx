import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
} from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Check, ImageOff, X } from 'lucide-react';
import { useState } from 'react';

interface PhotoUser {
    id: number;
    name: string;
    pseudo: string;
    email: string;
}

interface Photo {
    id: number;
    path: string;
    thumbnail_path: string | null;
    is_naughty: boolean;
    created_at: string;
    user: PhotoUser | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    photos: {
        data: Photo[];
        links: PaginationLink[];
        total: number;
    };
}

export default function Pending({ photos }: Props) {
    return (
        <AdminLayout
            title="Photos en attente"
            subtitle="Valider ou refuser les photos avant publication sur les profils"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Modération', href: '/admin/moderation' },
                { label: 'Photos' },
            ]}
            actions={
                <AdminBadge tone={photos.total > 0 ? 'warning' : 'success'}>
                    {photos.total} en attente
                </AdminBadge>
            }
        >
            <Head title="Photos en attente · Admin" />

            {photos.data.length === 0 ? (
                <AdminCard>
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <div
                            className="grid h-14 w-14 place-items-center rounded-full"
                            style={{
                                background: 'var(--blush)',
                                color: 'var(--wine-deep)',
                            }}
                        >
                            <ImageOff className="h-6 w-6" />
                        </div>
                        <h2 className="font-display text-2xl font-medium italic">
                            File vide
                        </h2>
                        <p
                            className="max-w-md text-sm"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Toutes les photos soumises ont été traitées.
                        </p>
                    </div>
                </AdminCard>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {photos.data.map((photo) => (
                        <PhotoCard key={photo.id} photo={photo} />
                    ))}
                </div>
            )}

            {photos.links.length > 3 && (
                <div className="mt-6 flex flex-wrap justify-center gap-1">
                    {photos.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            preserveScroll
                            className="inline-grid h-8 min-w-[32px] place-items-center rounded-md border px-2 text-xs font-semibold"
                            style={{
                                borderColor: link.active
                                    ? 'var(--wine-deep)'
                                    : 'var(--line)',
                                background: link.active
                                    ? 'var(--wine-deep)'
                                    : 'var(--paper)',
                                color: link.active
                                    ? 'oklch(96% 0.02 50)'
                                    : 'var(--ink-soft)',
                                pointerEvents: link.url ? undefined : 'none',
                                opacity: link.url ? 1 : 0.4,
                            }}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}

function PhotoCard({ photo }: { photo: Photo }) {
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
            <div
                className="relative aspect-[4/5] overflow-hidden"
                style={{ background: 'var(--bg-soft)' }}
            >
                <img
                    src={photo.thumbnail_path ?? photo.path}
                    alt={`Photo soumise par ${photo.user?.pseudo ?? 'un compte supprimé'}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
                {photo.is_naughty && (
                    <div className="absolute left-3 top-3">
                        <AdminBadge tone="danger">Contenu sensible</AdminBadge>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 p-4">
                <div className="min-w-0">
                    {photo.user ? (
                        <Link
                            href={`/admin/users/${photo.user.id}`}
                            className="block truncate text-sm font-semibold underline decoration-dotted underline-offset-2"
                        >
                            {photo.user.pseudo}
                        </Link>
                    ) : (
                        <span
                            className="text-sm font-semibold"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Compte supprimé
                        </span>
                    )}
                    <p
                        className="font-mono mt-1 text-[10px] uppercase tracking-wider"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        {new Date(photo.created_at).toLocaleString('fr-FR')}
                    </p>
                </div>

                {rejecting ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            maxLength={500}
                            autoFocus
                            className="w-full rounded-lg border p-2 text-xs"
                            style={{
                                borderColor: 'var(--line)',
                                background: 'var(--bg-soft)',
                                color: 'var(--ink)',
                            }}
                            placeholder="Motif du refus (communiqué à l'utilisatrice)"
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
                                onClick={() => setRejecting(false)}
                            >
                                Annuler
                            </AdminButton>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <AdminButton
                            size="sm"
                            variant="wine"
                            icon={Check}
                            disabled={processing}
                            onClick={approve}
                        >
                            Approuver
                        </AdminButton>
                        <AdminButton
                            size="sm"
                            icon={X}
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
