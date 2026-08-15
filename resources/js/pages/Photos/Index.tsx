import DatingLayout from '@/layouts/dating-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Clock,
    EyeOff,
    ImagePlus,
    Info,
    Lock,
    Star,
    Trash2,
    UploadCloud,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Photo {
    id: number;
    url: string;
    is_primary: boolean;
    is_naughty: boolean;
    moderation_status: 'pending' | 'approved' | 'rejected' | 'quarantined';
    rejection_reason: string | null;
    avatar_requested: boolean;
    order: number;
}

const MAX_PHOTOS = 10;

export default function Index({ photos }: { photos: Photo[] }) {
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [markAsNaughty, setMarkAsNaughty] = useState(false);
    const [markAsPrivate, setMarkAsPrivate] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const published = photos.filter((p) => p.moderation_status !== 'rejected');
    const rejected = photos.filter((p) => p.moderation_status === 'rejected');
    const remaining = MAX_PHOTOS - photos.length;
    const isFull = remaining <= 0;

    const upload = (file: File) => {
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isImage && !isVideo) {
            setError('Le fichier doit être une image (JPEG, PNG) ou une vidéo (MP4, MOV, WEBM).');
            return;
        }

        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setError(
                isVideo
                    ? 'La vidéo ne peut pas dépasser 100 Mo.'
                    : 'L’image ne peut pas dépasser 10 Mo.'
            );
            return;
        }

        setError(null);
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('is_naughty', markAsNaughty ? '1' : '0');
        // Une vidéo coquine est toujours privée : pas de floutage vidéo possible.
        formData.append('is_private', markAsPrivate || (isVideo && markAsNaughty) ? '1' : '0');

        setUploading(true);
        router.post('/photos', formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setUploading(false);
                setMarkAsNaughty(false);
                setMarkAsPrivate(false);
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            },
        });
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        if (isFull || uploading) return;

        const file = e.dataTransfer.files?.[0];
        if (file) upload(file);
    };

    return (
        <DatingLayout title="Mes photos" showOnlineUsers={false}>
            <Head title="Mes photos" />

            <main className="container-responsive max-w-5xl py-8">
                {/* ---- En-tête éditorial ---------------------------------- */}
                <header className="mb-8">
                    <p
                        className="editorial-eyebrow"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        {photos.length} sur {MAX_PHOTOS} · {published.length} en ligne
                    </p>
                    <h1 className="font-display mt-2 text-4xl font-medium">
                        Mes photos
                    </h1>
                    <p
                        className="mt-2 max-w-xl text-sm"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        Vos photos sont visibles dès l’ajout. Seule la photo de profil
                        passe par une validation. Les photos marquées coquines restent
                        floutées pour celles qui n’ont pas activé le mode coquin.
                    </p>

                    <div
                        className="mt-4 h-1 w-full overflow-hidden rounded-full"
                        style={{ background: 'var(--bg-soft)' }}
                    >
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${(photos.length / MAX_PHOTOS) * 100}%`,
                                background: 'var(--desire)',
                            }}
                        />
                    </div>
                </header>

                {/* ---- Zone d'upload -------------------------------------- */}
                {!isFull && (
                    <section className="mb-10">
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            className={cn(
                                'relative rounded-2xl border-2 border-dashed p-10 text-center transition-all',
                                uploading && 'pointer-events-none opacity-70',
                            )}
                            style={{
                                borderColor: dragging
                                    ? 'var(--desire)'
                                    : 'var(--line)',
                                background: dragging
                                    ? 'var(--blush)'
                                    : 'var(--paper)',
                            }}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div
                                    className="grid h-14 w-14 place-items-center rounded-full transition-transform"
                                    style={{
                                        background: 'var(--blush)',
                                        color: 'var(--wine-deep)',
                                        transform: dragging
                                            ? 'scale(1.08)'
                                            : undefined,
                                    }}
                                >
                                    {uploading ? (
                                        <UploadCloud className="h-6 w-6 animate-pulse" />
                                    ) : (
                                        <ImagePlus className="h-6 w-6" />
                                    )}
                                </div>

                                <div>
                                    <p className="font-display text-xl font-medium italic">
                                        {uploading
                                            ? 'Envoi en cours…'
                                            : dragging
                                              ? 'Déposez pour envoyer'
                                              : 'Glissez une photo ici'}
                                    </p>
                                    <p
                                        className="mt-1 text-sm"
                                        style={{ color: 'var(--ink-mute)' }}
                                    >
                                        JPEG ou PNG · 10 Mo maximum ·{' '}
                                        {remaining} emplacement
                                        {remaining > 1 ? 's' : ''} restant
                                        {remaining > 1 ? 's' : ''}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    disabled={uploading}
                                    className="mt-1 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-px disabled:opacity-50"
                                    style={{
                                        background: 'var(--ink)',
                                        color: 'var(--bg)',
                                    }}
                                >
                                    Parcourir mes fichiers
                                </button>

                                <label
                                    className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs"
                                    style={{ color: 'var(--ink-soft)' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={markAsNaughty}
                                        onChange={(e) => setMarkAsNaughty(e.target.checked)}
                                        disabled={uploading}
                                    />
                                    <EyeOff className="h-3.5 w-3.5" />
                                    Contenu coquin — flouté sans mode coquin
                                </label>

                                <label
                                    className="mt-1 inline-flex cursor-pointer items-center gap-2 text-xs"
                                    style={{ color: 'var(--ink-soft)' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={markAsPrivate}
                                        onChange={(e) => setMarkAsPrivate(e.target.checked)}
                                        disabled={uploading}
                                    />
                                    <Lock className="h-3.5 w-3.5" />
                                    Galerie privée — accès sur demande
                                </label>

                                <p
                                    className="mt-1 text-[11px]"
                                    style={{ color: 'var(--ink-mute)' }}
                                >
                                    Les vidéos coquines sont automatiquement mises en galerie
                                    privée.
                                </p>

                                <input
                                    ref={inputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/jpeg,image/png,video/mp4,video/quicktime,video/webm"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) upload(file);
                                    }}
                                    disabled={uploading}
                                />
                            </div>
                        </div>

                        {error && (
                            <p
                                className="mt-3 text-sm"
                                style={{ color: 'var(--desire-deep)' }}
                            >
                                {error}
                            </p>
                        )}
                    </section>
                )}

                {isFull && (
                    <section
                        className="mb-10 flex items-start gap-3 rounded-2xl border p-4 text-sm"
                        style={{
                            borderColor: 'var(--line)',
                            background: 'var(--bg-soft)',
                            color: 'var(--ink-soft)',
                        }}
                    >
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>
                            Vous avez atteint la limite de {MAX_PHOTOS} photos.
                            Supprimez-en une pour pouvoir en ajouter une nouvelle.
                        </p>
                    </section>
                )}

                {/* ---- Galerie vide --------------------------------------- */}
                {photos.length === 0 && (
                    <section
                        className="rounded-2xl border p-12 text-center"
                        style={{
                            borderColor: 'var(--line)',
                            background: 'var(--paper)',
                        }}
                    >
                        <h2 className="font-display text-2xl font-medium italic">
                            Votre galerie est vide
                        </h2>
                        <p
                            className="mx-auto mt-2 max-w-sm text-sm"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Les profils avec photos reçoivent bien plus de visites.
                            Commencez par un portrait où l’on vous voit clairement.
                        </p>
                    </section>
                )}

                {/* ---- Photos en ligne ------------------------------------ */}
                {published.length > 0 && (
                    <PhotoSection
                        eyebrow={`${published.length} visible${published.length > 1 ? 's' : ''} sur votre profil`}
                        title="Ma galerie"
                    >
                        {published.map((photo) => (
                            <PhotoTile key={photo.id} photo={photo} />
                        ))}
                    </PhotoSection>
                )}

                {/* ---- Photos retirées par la modération ------------------ */}
                {rejected.length > 0 && (
                    <PhotoSection
                        eyebrow="Retirées par la modération"
                        title="Non conformes"
                    >
                        {rejected.map((photo) => (
                            <PhotoTile key={photo.id} photo={photo} />
                        ))}
                    </PhotoSection>
                )}

                {/* ---- Lien vers la galerie privée ------------------------ */}
                <section
                    className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5"
                    style={{
                        borderColor: 'var(--line)',
                        background: 'var(--paper)',
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                            style={{
                                background: 'var(--blush)',
                                color: 'var(--wine-deep)',
                            }}
                        >
                            <EyeOff className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">Galerie privée</h2>
                            <p
                                className="mt-0.5 text-sm"
                                style={{ color: 'var(--ink-mute)' }}
                            >
                                Choisissez qui peut voir vos photos coquines.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/gallery-access"
                        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-px"
                        style={{
                            borderColor: 'var(--line)',
                            color: 'var(--ink)',
                        }}
                    >
                        Gérer les accès
                    </Link>
                </section>
            </main>
        </DatingLayout>
    );
}

function PhotoSection({
    eyebrow,
    title,
    children,
}: {
    eyebrow: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mb-10">
            <div className="mb-4">
                <p
                    className="editorial-eyebrow"
                    style={{ color: 'var(--ink-mute)' }}
                >
                    {eyebrow}
                </p>
                <h2 className="font-display mt-1 text-2xl font-medium">{title}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {children}
            </div>
        </section>
    );
}

function PhotoTile({ photo }: { photo: Photo }) {
    const [busy, setBusy] = useState(false);

    const isRejected = photo.moderation_status === 'rejected';
    const isApproved = photo.moderation_status === 'approved';

    const act = (url: string) => {
        setBusy(true);
        router.post(url, {}, { preserveScroll: true, onFinish: () => setBusy(false) });
    };

    const remove = () => {
        if (!confirm('Supprimer définitivement cette photo ?')) return;
        setBusy(true);
        router.delete(`/photos/${photo.id}`, {
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    };

    return (
        <figure
            className="group relative aspect-[4/5] overflow-hidden rounded-xl border"
            style={{
                borderColor: photo.is_primary ? 'var(--gold)' : 'var(--line)',
                background: 'var(--bg-soft)',
            }}
        >
            <img
                src={photo.url}
                alt=""
                loading="lazy"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className={cn(
                    'h-full w-full select-none object-cover transition-transform duration-300 group-hover:scale-[1.03]',
                    isRejected && 'opacity-50 grayscale',
                )}
            />

            {/* Calque anti-copie : intercepte clic droit et glisser-déposer */}
            <span
                aria-hidden
                className="absolute inset-0"
                onContextMenu={(e) => e.preventDefault()}
            />

            {/* Badges */}
            <div className="pointer-events-none absolute inset-x-2 top-2 flex flex-wrap items-start justify-between gap-1">
                <div className="flex flex-wrap gap-1">
                    {photo.is_primary && (
                        <span
                            className="font-mono inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{
                                background: 'var(--gold)',
                                color: 'var(--wine-deep)',
                            }}
                        >
                            <Star className="h-2.5 w-2.5" />
                            Profil
                        </span>
                    )}
                    {photo.avatar_requested && (
                        <span
                            className="font-mono inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{
                                background: 'oklch(100% 0 0 / 0.9)',
                                color: 'var(--ink)',
                            }}
                        >
                            <Clock className="h-2.5 w-2.5" />
                            En validation
                        </span>
                    )}
                    {isRejected && (
                        <span
                            className="font-mono inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: 'var(--desire)', color: 'white' }}
                        >
                            Retirée
                        </span>
                    )}
                </div>
                {photo.is_naughty && (
                    <span
                        className="grid h-5 w-5 place-items-center rounded"
                        style={{ background: 'var(--desire)', color: 'white' }}
                        title="Photo coquine — floutée pour les profils non consentants"
                    >
                        <EyeOff className="h-3 w-3" />
                    </span>
                )}
            </div>

            {/* Actions au survol */}
            <figcaption
                className={cn(
                    'absolute inset-x-0 bottom-0 flex flex-col gap-1 p-2 opacity-0 transition-opacity',
                    'group-hover:opacity-100 group-focus-within:opacity-100',
                )}
                style={{
                    background:
                        'linear-gradient(to top, oklch(0% 0 0 / 0.8), transparent)',
                }}
            >
                {isRejected && photo.rejection_reason && (
                    <p className="text-[10px] leading-tight text-white/90">
                        {photo.rejection_reason}
                    </p>
                )}

                <div className="flex items-center justify-end gap-1.5">
                    {!isRejected &&
                        !photo.is_primary &&
                        !photo.is_naughty &&
                        (isApproved ? (
                            <button
                                type="button"
                                onClick={() => act(`/photos/${photo.id}/primary`)}
                                disabled={busy}
                                title="Définir comme photo de profil"
                                aria-label="Définir comme photo de profil"
                                className="grid h-8 w-8 place-items-center rounded-lg backdrop-blur disabled:opacity-50"
                                style={{
                                    background: 'oklch(100% 0 0 / 0.9)',
                                    color: 'var(--ink)',
                                }}
                            >
                                <Star className="h-4 w-4" />
                            </button>
                        ) : (
                            !photo.avatar_requested && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        act(`/photos/${photo.id}/request-avatar`)
                                    }
                                    disabled={busy}
                                    className="rounded-lg px-2 py-1.5 text-[11px] font-semibold backdrop-blur disabled:opacity-50"
                                    style={{
                                        background: 'oklch(100% 0 0 / 0.9)',
                                        color: 'var(--ink)',
                                    }}
                                >
                                    En photo de profil
                                </button>
                            )
                        ))}

                    <button
                        type="button"
                        onClick={remove}
                        disabled={busy}
                        title="Supprimer cette photo"
                        aria-label="Supprimer cette photo"
                        className="grid h-8 w-8 place-items-center rounded-lg backdrop-blur disabled:opacity-50"
                        style={{ background: 'var(--desire)', color: 'white' }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </figcaption>
        </figure>
    );
}
