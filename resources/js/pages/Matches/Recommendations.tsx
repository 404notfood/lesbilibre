import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, Sparkles, Search } from 'lucide-react';
import DatingLayout from '@/layouts/dating-layout';
import { useCallback, useRef, useState } from 'react';

interface RecommendedUser {
    id: number;
    name: string;
    is_verified: boolean;
    compatibility_score?: number;
    photos?: { path: string }[];
    profile?: {
        age?: number;
        city?: string;
        bio?: string;
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

export default function Recommendations({ recommendations }: { recommendations: RecommendedUser[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipe, setSwipe] = useState<SwipeState>({
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
    });
    const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const deltaX = swipe.isDragging ? swipe.currentX - swipe.startX : 0;
    const deltaY = swipe.isDragging ? swipe.currentY - swipe.startY : 0;
    const rotation = deltaX * ROTATION_FACTOR;
    const swipeDirection = deltaX > SWIPE_THRESHOLD ? 'right' : deltaX < -SWIPE_THRESHOLD ? 'left' : null;
    const overlayOpacity = Math.min(Math.abs(deltaX) / SWIPE_THRESHOLD, 1);

    const handleAction = useCallback((direction: 'left' | 'right') => {
        if (isAnimatingOut || currentIndex >= recommendations.length) return;

        const user = recommendations[currentIndex];

        setExitDirection(direction);
        setIsAnimatingOut(true);

        if (direction === 'right') {
            router.post(`/likes/${user.id}`, {}, { preserveState: true, preserveScroll: true });
        }

        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            setExitDirection(null);
            setIsAnimatingOut(false);
            setSwipe({ isDragging: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
        }, 300);
    }, [currentIndex, recommendations, isAnimatingOut]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (isAnimatingOut) return;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setSwipe({
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            currentX: e.clientX,
            currentY: e.clientY,
        });
    }, [isAnimatingOut]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!swipe.isDragging) return;
        setSwipe((prev) => ({
            ...prev,
            currentX: e.clientX,
            currentY: e.clientY,
        }));
    }, [swipe.isDragging]);

    const handlePointerUp = useCallback(() => {
        if (!swipe.isDragging) return;

        const dx = swipe.currentX - swipe.startX;

        if (dx > SWIPE_THRESHOLD) {
            handleAction('right');
        } else if (dx < -SWIPE_THRESHOLD) {
            handleAction('left');
        } else {
            setSwipe({ isDragging: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
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
        <DatingLayout title="Decouvrir" showOnlineUsers={false}>
            <Head title="Decouvrir" />

            <div className="flex flex-col items-center justify-center p-4 sm:p-6">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
                        <Sparkles className="h-7 w-7 text-pink-500" />
                        Decouvrir
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Swipe pour decouvrir des profils
                    </p>
                </div>

                {/* Card Stack */}
                {!allSwiped ? (
                    <>
                        <div className="relative h-[500px] w-full max-w-[360px] sm:h-[560px]">
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
                                          transition: swipe.isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
                                          opacity: isAnimatingOut ? 0 : 1,
                                          zIndex: 30,
                                          cursor: 'grab',
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
                                        className="absolute inset-0 select-none overflow-hidden rounded-2xl shadow-xl"
                                        style={cardStyle}
                                        onPointerDown={isTopCard ? handlePointerDown : undefined}
                                        onPointerMove={isTopCard ? handlePointerMove : undefined}
                                        onPointerUp={isTopCard ? handlePointerUp : undefined}
                                        onPointerCancel={isTopCard ? handlePointerUp : undefined}
                                    >
                                        {/* Photo background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900">
                                            {user.photos?.[0] ? (
                                                <img
                                                    src={`/storage/${user.photos[0].path}`}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                    draggable={false}
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-8xl font-bold text-white/30">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Gradient overlay for text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                        {/* Top badges */}
                                        <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
                                            {user.compatibility_score ? (
                                                <Badge className="bg-pink-500/90 text-white backdrop-blur-sm">
                                                    <Sparkles className="mr-1 h-3 w-3" />
                                                    {user.compatibility_score}% Compatible
                                                </Badge>
                                            ) : (
                                                <div />
                                            )}
                                            {user.is_verified && (
                                                <Badge className="bg-blue-500/90 text-white backdrop-blur-sm">
                                                    Verifiee
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Like overlay (green heart) */}
                                        {isTopCard && swipe.isDragging && swipeDirection === 'right' && (
                                            <div
                                                className="absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-green-400 bg-green-400/20"
                                                style={{ opacity: overlayOpacity }}
                                            >
                                                <div className="rounded-full bg-green-500 p-4 shadow-2xl">
                                                    <Heart className="h-12 w-12 fill-white text-white" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Pass overlay (red X) */}
                                        {isTopCard && swipe.isDragging && swipeDirection === 'left' && (
                                            <div
                                                className="absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-red-400 bg-red-400/20"
                                                style={{ opacity: overlayOpacity }}
                                            >
                                                <div className="rounded-full bg-red-500 p-4 shadow-2xl">
                                                    <X className="h-12 w-12 text-white" />
                                                </div>
                                            </div>
                                        )}

                                        {/* User info at bottom */}
                                        <div className="absolute bottom-0 left-0 right-0 p-5">
                                            <div className="space-y-2">
                                                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                                                    {user.name}{user.profile?.age ? `, ${user.profile.age}` : ''}
                                                </h2>
                                                {user.profile?.city && (
                                                    <div className="flex items-center gap-1.5 text-sm text-white/90">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{user.profile.city}</span>
                                                    </div>
                                                )}
                                                {user.profile?.bio && (
                                                    <p className="line-clamp-2 text-sm text-white/80">
                                                        {user.profile.bio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-6 flex items-center gap-6">
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-16 w-16 rounded-full border-2 border-red-300 text-red-500 shadow-lg transition-all hover:scale-110 hover:border-red-400 hover:bg-red-50 hover:text-red-600 dark:border-red-700 dark:hover:bg-red-950"
                                onClick={() => handleAction('left')}
                                disabled={isAnimatingOut}
                            >
                                <X className="h-7 w-7" />
                            </Button>
                            <Button
                                size="lg"
                                className="h-20 w-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg transition-all hover:scale-110 hover:from-pink-600 hover:to-rose-600"
                                onClick={() => handleAction('right')}
                                disabled={isAnimatingOut}
                            >
                                <Heart className="h-9 w-9 fill-white" />
                            </Button>
                        </div>

                        {/* Counter */}
                        <p className="mt-4 text-sm text-muted-foreground">
                            {currentIndex + 1} / {recommendations.length}
                        </p>
                    </>
                ) : (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
                            <Sparkles className="h-12 w-12 text-pink-400" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-foreground">
                            Plus de profils pour le moment
                        </h2>
                        <p className="mb-6 max-w-sm text-muted-foreground">
                            Tu as vu tous les profils disponibles. Reviens plus tard pour en decouvrir de nouveaux !
                        </p>
                        <Button
                            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
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
