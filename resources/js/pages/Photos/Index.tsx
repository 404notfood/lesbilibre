import DatingLayout from '@/layouts/dating-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Clock,
    EyeOff,
    ImagePlus,
    Info,
    Star,
    Trash2,
    UploadCloud,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Photo {
    id: number;
    path: string;
    is_primary: boolean;
    is_approved: boolean;
    is_naughty: boolean;
    order: number;
}

const MAX_PHOTOS = 10;

export default function Index({ photos }: { photos: Photo[] }) {
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [markAsSensitive, setMarkAsSensitive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const approved = photos.filter((p) => p.is_approved);
    const pending = photos.filter((p) => !p.is_approved);
    const remaining = MAX_PHOTOS - photos.length;
    const isFull = remaining <= 0;

    const upload = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Le fichier doit être une image (JPEG ou PNG).');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('L’image ne peut pas dépasser 10 Mo.');
            return;
        }

        setError(null);
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('is_naughty', markAsSensitive ? '1' : '0');

        setUploading(true);
        router.post('/photos', formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setUploading(false);
                setMarkAsSensitive(false);
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
                        {photos.length} sur {MAX_PHOTOS} · {approved.length} publiée
                        {approved.length > 1 ? 's' : ''}
                    </p>
                    <h1 className="font-display mt-2 text-4xl font-medium">
                        Mes photos
                    </h1>
                    <p
                        className="mt-2 max-w-xl text-sm"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        Votre première photo approuvée devient votre portrait principal.
                        Chaque ajout passe par la modération avant d’apparaître sur
                        votre profil.
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
                                        checked={markAsSensitive}
                                        onChange={(e) =>
                                            setMarkAsSensitive(e.target.checked)
                                        }
                                        disabled={uploading}
                                    />
                                    <EyeOff className="h-3.5 w-3.5" />
                                    Photo sensible — floutée jusqu’à accès accordé
                                </label>

                                <input
                                    ref={inputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/jpeg,image/png"
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

                {/* ---- Photos publiées ------------------------------------ */}
                {approved.length > 0 && (
                    <PhotoSection
                        eyebrow={`${approved.length} visible${approved.length > 1 ? 's' : ''} sur votre profil`}
                        title="Publiées"
                    >
                        {approved.map((photo) => (
                            <PhotoTile key={photo.id} photo={photo} />
                        ))}
                    </PhotoSection>
                )}

                {/* ---- Photos en attente ---------------------------------- */}
                {pending.length > 0 && (
                    <PhotoSection
                        eyebrow="Validation sous 48 h en général"
                        title="En attente de modération"
                    >
                        {pending.map((photo) => (
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
                                Choisissez qui peut voir vos photos sensibles.
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

    const setPrimary = () => {
        setBusy(true);
        router.post(
            `/photos/${photo.id}/primary`,
            {},
            { preserveScroll: true, onFinish: () => setBusy(false) },
        );
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
                src={`/storage/${photo.path}`}
                alt=""
                loading="lazy"
                className={cn(
                    'h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]',
                    !photo.is_approved && 'opacity-70 grayscale',
                )}
            />

            {/* Badges */}
            <div className="absolute inset-x-2 top-2 flex flex-wrap items-start justify-between gap-1">
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
                            Principale
                        </span>
                    )}
                    {!photo.is_approved && (
                        <span
                            className="font-mono inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{
                                background: 'oklch(100% 0 0 / 0.9)',
                                color: 'var(--ink)',
                            }}
                        >
                            <Clock className="h-2.5 w-2.5" />
                            En attente
                        </span>
                    )}
                </div>
                {photo.is_naughty && (
                    <span
                        className="grid h-5 w-5 place-items-center rounded"
                        style={{
                            background: 'var(--desire)',
                            color: 'white',
                        }}
                        title="Photo sensible"
                    >
                        <EyeOff className="h-3 w-3" />
                    </span>
                )}
            </div>

            {/* Actions au survol */}
            <figcaption
                className={cn(
                    'absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 p-2 opacity-0 transition-opacity',
                    'group-hover:opacity-100 group-focus-within:opacity-100',
                )}
                style={{
                    background:
                        'linear-gradient(to top, oklch(0% 0 0 / 0.75), transparent)',
                }}
            >
                {photo.is_approved && !photo.is_primary && (
                    <button
                        type="button"
                        onClick={setPrimary}
                        disabled={busy}
                        title="Définir comme photo principale"
                        aria-label="Définir comme photo principale"
                        className="grid h-8 w-8 place-items-center rounded-lg backdrop-blur transition-colors disabled:opacity-50"
                        style={{
                            background: 'oklch(100% 0 0 / 0.9)',
                            color: 'var(--ink)',
                        }}
                    >
                        <Star className="h-4 w-4" />
                    </button>
                )}
                <button
                    type="button"
                    onClick={remove}
                    disabled={busy}
                    title="Supprimer cette photo"
                    aria-label="Supprimer cette photo"
                    className="grid h-8 w-8 place-items-center rounded-lg backdrop-blur transition-colors disabled:opacity-50"
                    style={{
                        background: 'var(--desire)',
                        color: 'white',
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </figcaption>
        </figure>
    );
}
