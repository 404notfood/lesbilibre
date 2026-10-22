import MemberCard from '@/components/discovery/MemberCard';
import { Button } from '@/components/ui/button';
import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import { Heart, Search, Sparkles, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface RecommendedUser {
    id: number;
    name: string;
    pseudo?: string;
    is_verified: boolean;
    compatibility_score?: number;
    photos?: { url: string }[];
    profile?: {
        age?: number;
        city?: string;
        bio?: string;
        meeting_intentions?: string[];
    };
}

interface SwipeState {
    isDragging: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
}

const SWIPE_THRESHOLD = 100;
const SWIPE_OUT_DISTANCE = 600;
const ROTATION_FACTOR = 0.1;

export default function Recommendations({
    recommendations,
}: {
    recommendations: RecommendedUser[];
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipe, setSwipe] = useState<SwipeState>({
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
    });
    const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(
        null,
    );
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const deltaX = swipe.isDragging ? swipe.currentX - swipe.startX : 0;
    const deltaY = swipe.isDragging ? swipe.currentY - swipe.startY : 0;
    const rotation = deltaX * ROTATION_FACTOR;
    const swipeDirection =
        deltaX > SWIPE_THRESHOLD
            ? 'right'
            : deltaX < -SWIPE_THRESHOLD
              ? 'left'
              : null;
    const overlayOpacity = Math.min(Math.abs(deltaX) / SWIPE_THRESHOLD, 1);

    const handleAction = useCallback(
        (direction: 'left' | 'right') => {
            if (isAnimatingOut || currentIndex >= recommendations.length)
                return;

            const user = recommendations[currentIndex];

            setExitDirection(direction);
            setIsAnimatingOut(true);

            if (direction === 'right') {
                router.post(
                    `/likes/${user.id}`,
                    {},
                    { preserveState: true, preserveScroll: true },
                );
            }

            setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
                setExitDirection(null);
                setIsAnimatingOut(false);
                setSwipe({
                    isDragging: false,
                    startX: 0,
                    startY: 0,
                    currentX: 0,
                    currentY: 0,
                });
            }, 300);
        },
        [currentIndex, recommendations, isAnimatingOut],
    );

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (isAnimatingOut) return;
            if ((e.target as HTMLElement).closest('a, button')) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            setSwipe({
                isDragging: true,
                startX: e.clientX,
                startY: e.clientY,
                currentX: e.clientX,
                currentY: e.clientY,
            });
        },
        [isAnimatingOut],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!swipe.isDragging) return;
            setSwipe((prev) => ({
                ...prev,
                currentX: e.clientX,
                currentY: e.clientY,
            }));
        },
        [swipe.isDragging],
    );

    const handlePointerUp = useCallback(() => {
        if (!swipe.isDragging) return;

        const dx = swipe.currentX - swipe.startX;

        if (dx > SWIPE_THRESHOLD) {
            handleAction('right');
        } else if (dx < -SWIPE_THRESHOLD) {
            handleAction('left');
        } else {
            setSwipe({
                isDragging: false,
                startX: 0,
                startY: 0,
                currentX: 0,
                currentY: 0,
            });
        }
    }, [swipe, handleAction]);

    const getExitTransform = () => {
        if (exitDirection === 'right') {
            return `translateX(${SWIPE_OUT_DISTANCE}px) rotate(30deg)`;
        }
        if (exitDirection === 'left') {
            return `translateX(-${SWIPE_OUT_DISTANCE}px) rotate(-30deg)`;
        }
        return undefined;
    };

    const remainingCards = recommendations.slice(currentIndex);
    const visibleCards = remainingCards.slice(0, 3);
    const allSwiped = currentIndex >= recommendations.length;

    return (
        <DatingLayout title="Découvrir" showOnlineUsers={false}>
            <Head title="Découvrir" />

            <div className="flex flex-col items-center justify-center p-4 sm:p-6">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="flex items-center justify-center gap-2 font-display text-3xl font-medium text-[color:var(--wine-deep)] sm:text-4xl">
                        <Sparkles className="h-6 w-6 text-[color:var(--desire)]" />
                        Une rencontre à la fois
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Prends le temps de découvrir chaque profil.
                    </p>
                </div>

                {/* Card Stack */}
                {!allSwiped ? (
                    <>
                        <div className="relative isolate grid w-full max-w-[360px]">
                            {visibleCards.map((user, stackIndex) => {
                                const isTopCard = stackIndex === 0;
                                const scale = 1 - stackIndex * 0.04;
                                const yOffset = stackIndex * 8;

                                const cardStyle: React.CSSProperties = isTopCard
                                    ? {
                                          transform: isAnimatingOut
                                              ? getExitTransform()
                                              : swipe.isDragging
                                                ? `translateX(${deltaX}px) translateY(${deltaY * 0.3}px) rotate(${rotation}deg)`
                                                : 'translateX(0) translateY(0) rotate(0)',
                                          transition: swipe.isDragging
                                              ? 'none'
                                              : 'transform 0.3s ease-out, opacity 0.3s ease-out',
                                          opacity: isAnimatingOut ? 0 : 1,
                                          zIndex: 30,
                                          cursor: 'grab',
                                          touchAction: 'pan-y',
                                      }
                                    : {
                                          transform: `scale(${scale}) translateY(${yOffset}px)`,
                                          transition: 'transform 0.3s ease-out',
                                          zIndex: 20 - stackIndex,
                                          pointerEvents: 'none' as const,
                                      };

                                return (
                                    <div
                                        key={user.id}
                                        ref={isTopCard ? cardRef : undefined}
                                        className="relative col-start-1 row-start-1 select-none"
                                        inert={!isTopCard}
                                        style={cardStyle}
                                        onPointerDown={
                                            isTopCard
                                                ? handlePointerDown
                                                : undefined
                                        }
                                        onPointerMove={
                                            isTopCard
                                                ? handlePointerMove
                                                : undefined
                                        }
                                        onPointerUp={
                                            isTopCard
                                                ? handlePointerUp
                                                : undefined
                                        }
                                        onPointerCancel={
                                            isTopCard
                                                ? () =>
                                                      setSwipe({
                                                          isDragging: false,
                                                          startX: 0,
                                                          startY: 0,
                                                          currentX: 0,
                                                          currentY: 0,
                                                      })
                                                : undefined
                                        }
                                    >
                                        <MemberCard
                                            member={{
                                                id: user.id,
                                                name: user.name,
                                                pseudo: user.pseudo,
                                                age: user.profile?.age,
                                                city: user.profile?.city,
                                                bio: user.profile?.bio,
                                                photo: user.photos?.[0]?.url,
                                                isVerified: user.is_verified,
                                                intentions:
                                                    user.profile
                                                        ?.meeting_intentions,
                                                compatibility:
                                                    user.compatibility_score,
                                            }}
                                            className="h-full"
                                        />

                                        {/* Like overlay (green heart) */}
                                        {isTopCard &&
                                            swipe.isDragging &&
                                            swipeDirection === 'right' && (
                                                <div
                                                    className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[1.4rem] border-2 border-[color:var(--desire)] bg-[color:var(--desire)]/10"
                                                    style={{
                                                        opacity: overlayOpacity,
                                                    }}
                                                >
                                                    <div className="rounded-full bg-[color:var(--desire)] p-4 shadow-xl">
                                                        <Heart className="h-12 w-12 fill-white text-white" />
                                                    </div>
                                                </div>
                                            )}

                                        {/* Pass overlay (red X) */}
                                        {isTopCard &&
                                            swipe.isDragging &&
                                            swipeDirection === 'left' && (
                                                <div
                                                    className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[1.4rem] border-2 border-[color:var(--wine)] bg-[color:var(--wine)]/10"
                                                    style={{
                                                        opacity: overlayOpacity,
                                                    }}
                                                >
                                                    <div className="rounded-full bg-[color:var(--wine)] p-4 shadow-xl">
                                                        <X className="h-12 w-12 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-7 flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                className="min-h-12 rounded-full border-border px-6 text-[color:var(--wine-deep)] hover:bg-[color:var(--blush)]"
                                aria-label="Passer ce profil"
                                onClick={() => handleAction('left')}
                                disabled={isAnimatingOut}
                            >
                                <X className="h-4 w-4" />
                                Passer
                            </Button>
                            <Button
                                size="lg"
                                className="min-h-12 rounded-full bg-[color:var(--desire)] px-7 text-white hover:bg-[color:var(--wine)]"
                                aria-label="Aimer ce profil"
                                onClick={() => handleAction('right')}
                                disabled={isAnimatingOut}
                            >
                                <Heart className="h-4 w-4" />
                                J’aime
                            </Button>
                        </div>

                        {/* Counter */}
                        <p
                            className="mt-4 text-sm text-muted-foreground"
                            aria-live="polite"
                        >
                            {currentIndex + 1} / {recommendations.length}
                        </p>
                    </>
                ) : (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[color:var(--blush)]">
                            <Sparkles className="h-10 w-10 text-[color:var(--wine)]" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-foreground">
                            Plus de profils pour le moment
                        </h2>
                        <p className="mb-6 max-w-sm text-muted-foreground">
                            Tu as vu tous les profils disponibles. Reviens plus
                            tard pour en découvrir de nouveaux !
                        </p>
                        <Button
                            className="min-h-11 bg-[color:var(--wine)] text-white hover:bg-[color:var(--wine-deep)]"
                            onClick={() => router.visit('/search')}
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Rechercher des profils
                        </Button>
                    </div>
                )}
            </div>
        </DatingLayout>
    );
}
