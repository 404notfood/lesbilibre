import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface LightboxItem {
    id: number | string;
    /** Média pleine résolution servi par la route média (filigrané). */
    url: string;
    /** 'video' lit le média dans un lecteur ; par défaut une image. */
    mediaType?: 'photo' | 'video';
    /** Image d'attente affichée avant la lecture d'une vidéo. */
    posterUrl?: string | null;
    /** Légende ou informations affichées sous le média. */
    caption?: ReactNode;
    /** Badges affichés en haut de la visionneuse. */
    badges?: ReactNode;
}

/**
 * Visionneuse plein écran pour les galeries.
 *
 * Les images restent servies par la route média : le filigrane, le floutage et
 * les contrôles d'accès s'appliquent donc exactement comme dans la grille. La
 * visionneuse ne fait qu'agrandir, elle ne contourne rien.
 *
 * Navigation : flèches gauche/droite, Échap pour fermer, glissement horizontal
 * sur mobile. Le focus est piégé le temps de l'ouverture et rendu à la vignette
 * d'origine à la fermeture.
 */
export default function PhotoLightbox({
    items,
    index,
    onClose,
    onNavigate,
}: {
    items: LightboxItem[];
    /** Index affiché, ou null quand la visionneuse est fermée. */
    index: number | null;
    onClose: () => void;
    onNavigate: (index: number) => void;
}) {
    const isOpen = index !== null;
    const dialogRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);
    const [loadedItemId, setLoadedItemId] = useState<LightboxItem['id'] | null>(null);

    const count = items.length;

    const goPrevious = useCallback(() => {
        if (index === null || count < 2) {
            return;
        }

        onNavigate((index - 1 + count) % count);
    }, [index, count, onNavigate]);

    const goNext = useCallback(() => {
        if (index === null || count < 2) {
            return;
        }

        onNavigate((index + 1) % count);
    }, [index, count, onNavigate]);

    // Clavier : navigation, fermeture, et piège à focus pour ne pas tabuler
    // dans la page située derrière la visionneuse.
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();

                return;
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goPrevious();

                return;
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                goNext();

                return;
            }

            if (event.key !== 'Tab') {
                return;
            }

            const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
                'button:not([disabled])',
            );

            if (!focusables || focusables.length === 0) {
                return;
            }

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose, goPrevious, goNext]);

    // Le fond ne doit pas défiler pendant la consultation.
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previous;
        };
    }, [isOpen]);

    // Rend le focus à l'élément qui a ouvert la visionneuse.
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const opener = document.activeElement as HTMLElement | null;
        dialogRef.current?.focus();

        return () => opener?.focus?.();
    }, [isOpen]);

    if (!isOpen || typeof document === 'undefined') {
        return null;
    }

    const item = items[index];

    if (!item) {
        return null;
    }

    const loading = loadedItemId !== item.id;

    return createPortal(
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Photo ${index + 1} sur ${count}`}
            tabIndex={-1}
            className="fixed inset-0 z-[100] flex flex-col bg-black/92 outline-none backdrop-blur-sm"
            onTouchStart={(event) => {
                touchStartX.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
                const start = touchStartX.current;
                const end = event.changedTouches[0]?.clientX;
                touchStartX.current = null;

                if (start === null || end === undefined) {
                    return;
                }

                const distance = end - start;

                // 50 px : au-delà, l'intention de glisser ne fait plus de doute.
                if (Math.abs(distance) < 50) {
                    return;
                }

                if (distance > 0) {
                    goPrevious();
                } else {
                    goNext();
                }
            }}
        >
            {/* Barre supérieure */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {item.badges}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    {count > 1 && (
                        <span className="font-mono text-xs text-white/70">
                            {index + 1} / {count}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Zone image — un clic à côté ferme, un clic sur l'image non. */}
            <div
                className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4"
                onClick={onClose}
            >
                {count > 1 && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            goPrevious();
                        }}
                        aria-label="Photo précédente"
                        className="absolute left-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                )}

                {loading && (
                    <div
                        aria-hidden
                        className="absolute h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white/80"
                    />
                )}

                {item.mediaType === 'video' ? (
                    <video
                        key={item.id}
                        src={item.url}
                        poster={item.posterUrl ?? undefined}
                        controls
                        autoPlay
                        playsInline
                        controlsList="nodownload"
                        onClick={(event) => event.stopPropagation()}
                        onContextMenu={(event) => event.preventDefault()}
                        onLoadedData={() => setLoadedItemId(item.id)}
                        className={cn(
                            'max-h-full max-w-full rounded-lg transition-opacity duration-200',
                            loading ? 'opacity-0' : 'opacity-100',
                        )}
                    />
                ) : (
                    <img
                        key={item.id}
                        src={item.url}
                        alt=""
                        draggable={false}
                        onClick={(event) => event.stopPropagation()}
                        onContextMenu={(event) => event.preventDefault()}
                        onLoad={() => setLoadedItemId(item.id)}
                        className={cn(
                            'max-h-full max-w-full select-none rounded-lg object-contain transition-opacity duration-200',
                            loading ? 'opacity-0' : 'opacity-100',
                        )}
                    />
                )}

                {count > 1 && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            goNext();
                        }}
                        aria-label="Photo suivante"
                        className="absolute right-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Légende */}
            {item.caption && (
                <div className="px-4 pb-5 text-center text-sm text-white/80">
                    {item.caption}
                </div>
            )}
        </div>,
        document.body,
    );
}
