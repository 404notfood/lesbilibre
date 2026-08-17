import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { DiscoverySignal } from '@/domain/engagement/DiscoverySignals';
import type { RewardState } from '@/domain/engagement/RewardFeedback';
import { Heart, MapPin, MessageCircle, Sparkles, Star, X } from 'lucide-react';
import { useState } from 'react';

interface DiscoveryProfileCard {
    id: number;
    name: string;
    age: number;
    city: string;
    distance: number | null;
    bio: string;
    primary_photo: string | null;
    is_online: boolean;
    compatibility_score: number;
    recommendation_reasons: string[];
}

interface ProfileCardProps {
    profile: DiscoveryProfileCard;
    signals: DiscoverySignal[];
    isLiked: boolean;
    reward: RewardState | null;
    onOpen: (id: number) => void;
    onLike: (id: number) => void;
    onPass: (id: number) => void;
}

/* ---------------------------------------------------------------------------
 * ProfileCard — direction "Wine Editorial"
 * Citation italique en gros, badge vibe coloré, tags mono, trio d'actions
 * -------------------------------------------------------------------------*/
export default function ProfileCard({
    profile,
    signals,
    isLiked,
    reward,
    onOpen,
    onLike,
    onPass,
}: ProfileCardProps) {
    const [hover, setHover] = useState(false);
    const showReward = reward?.profileId === profile.id;
    const noPhotoInitials = profile.name.slice(0, 2).toUpperCase();

    // Map first signal to a vibe label (badge top-left)
    const vibe = signals[0];

    return (
        <article
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => onOpen(profile.id)}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 ${
                hover
                    ? 'translate-y-[-3px] shadow-[0_24px_50px_-28px_oklch(0%_0_0_/_0.35)]'
                    : ''
            } ${showReward ? (reward?.pulseClassName ?? '') : ''}`}
        >
            {/* ============================================
             * IMAGE BLOCK
             * ============================================*/}
            <CardImage
                profile={profile}
                isLiked={isLiked}
                onLike={(e) => {
                    e.stopPropagation();
                    if (!isLiked) onLike(profile.id);
                }}
                vibe={vibe}
                noPhotoInitials={noPhotoInitials}
                showReward={showReward ? reward : null}
            />

            {/* ============================================
             * BODY
             * ============================================*/}
            <div className="px-2.5 pt-2 pb-2.5">
                {/* Name + match score */}
                <div className="flex items-baseline justify-between gap-1">
                    <h3 className="truncate font-display text-sm leading-tight font-semibold tracking-tight">
                        {profile.name}
                        {profile.age ? (
                            <span className="font-medium text-foreground/65 italic">
                                , {profile.age}
                            </span>
                        ) : null}
                    </h3>
                    {profile.compatibility_score > 0 && (
                        <div className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-[color:var(--desire-deep)]">
                            <Heart className="h-2.5 w-2.5 fill-current" />
                            {profile.compatibility_score}%
                        </div>
                    )}
                </div>

                {/* City */}
                <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-foreground/55">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {profile.city}
                    {profile.distance !== null &&
                        profile.distance !== undefined && (
                            <span>· {profile.distance} km</span>
                        )}
                </div>

                {/* Bio réelle uniquement — pas de texte inventé */}
                {profile.bio && (
                    <p className="mt-1.5 line-clamp-2 font-display text-xs leading-snug font-medium text-[color:var(--wine-deep)] italic">
                        « {profile.bio} »
                    </p>
                )}

                {profile.recommendation_reasons.length > 0 && (
                    <div className="mt-2 rounded-lg bg-[color:var(--blush)] px-2 py-1.5">
                        <div className="text-[9px] font-semibold tracking-[0.1em] text-[color:var(--desire-deep)] uppercase">
                            Pourquoi ce profil ?
                        </div>
                        <div className="mt-0.5 text-[10px] leading-4 text-foreground/65">
                            {profile.recommendation_reasons.join(' · ')}
                        </div>
                    </div>
                )}

                {/* Tags mono */}
                {signals.length > 0 && (
                    <div className="mt-2 mb-2 flex flex-wrap gap-1">
                        {signals.slice(0, 2).map((tag) => (
                            <span
                                key={`${profile.id}-${tag.id}`}
                                className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-[0.09em] text-foreground/65 uppercase"
                            >
                                {tag.label}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions trio: X, message, Like */}
                <div className="flex gap-1.5">
                    <button
                        type="button"
                        aria-label={`Passer ${profile.name}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onPass(profile.id);
                        }}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-background text-foreground/55 transition-colors hover:border-foreground/40 hover:text-foreground"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        aria-label={`Écrire à ${profile.name}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpen(profile.id);
                        }}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-[color:var(--wine-deep)] transition-colors hover:bg-[color:var(--blush)] hover:bg-blush"
                        style={{ background: 'var(--bg-soft)' }}
                    >
                        <MessageCircle className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        aria-label={`Aimer ${profile.name}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isLiked) onLike(profile.id);
                        }}
                        disabled={isLiked}
                        className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg text-xs font-semibold text-white transition-all"
                        style={{
                            background: isLiked
                                ? 'var(--wine)'
                                : 'var(--desire)',
                        }}
                    >
                        <Heart
                            className={`h-3.5 w-3.5 ${
                                isLiked ? 'animate-heartbeat fill-current' : ''
                            }`}
                        />
                        <span>{isLiked ? 'Likée' : 'Like'}</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

/* ===========================================================================
 * Card image — photo + vibe badge + distance pill + online + floating like
 * ==========================================================================*/
function CardImage({
    profile,
    isLiked,
    onLike,
    vibe,
    noPhotoInitials,
    showReward,
}: {
    profile: DiscoveryProfileCard;
    isLiked: boolean;
    onLike: (e: React.MouseEvent) => void;
    vibe?: DiscoverySignal;
    noPhotoInitials: string;
    showReward: RewardState | null;
}): JSX.Element {
    const vibeStyle =
        vibe?.tone === 'accent'
            ? { background: 'oklch(60% 0.16 160)', color: 'white' }
            : vibe?.tone === 'secondary'
              ? { background: 'var(--wine)', color: 'white' }
              : { background: 'var(--desire)', color: 'white' };

    const VibeIcon = vibe?.tone === 'accent' ? Star : Sparkles;

    return (
        <div className="reveal-tile relative aspect-square w-full overflow-hidden">
            {profile.primary_photo ? (
                <img
                    src={profile.primary_photo}
                    alt={profile.name}
                    loading="lazy"
                    className="reveal-bg h-full w-full object-cover"
                />
            ) : (
                <div
                    className="relative h-full w-full"
                    style={{
                        background:
                            'linear-gradient(135deg, var(--blush) 0%, var(--paper) 60%, var(--wine) 200%)',
                    }}
                >
                    {/* Big editorial initials, centred */}
                    <div className="absolute inset-0 grid place-items-center">
                        <span
                            className="font-display text-[3.5rem] leading-none font-medium italic select-none"
                            style={{ color: 'var(--wine-deep)', opacity: 0.18 }}
                        >
                            {noPhotoInitials}
                        </span>
                    </div>
                    {/* Foreground avatar circle */}
                    <div className="absolute inset-0 grid place-items-center">
                        <Avatar
                            className="h-12 w-12 border-2"
                            style={{ borderColor: 'var(--paper)' }}
                        >
                            <AvatarImage src="" />
                            <AvatarFallback
                                className="font-display text-base font-medium italic"
                                style={{
                                    background: 'var(--wine-deep)',
                                    color: 'var(--paper)',
                                }}
                            >
                                {noPhotoInitials}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            )}

            {/* Bottom gradient for legibility */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'linear-gradient(to top, oklch(15% 0.04 350 / 0.5) 0%, transparent 35%)',
                }}
            />

            {/* Top row: vibe badge + distance pill */}
            <div className="absolute inset-x-1.5 top-1.5 flex justify-between gap-1">
                {vibe && (
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wide"
                        style={vibeStyle}
                    >
                        <VibeIcon className="h-2.5 w-2.5 fill-current" />
                        {vibe.label}
                    </span>
                )}
                {profile.distance !== null &&
                    profile.distance !== undefined && (
                        <span
                            className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-white uppercase backdrop-blur"
                            style={{ background: 'oklch(15% 0.02 350 / 0.55)' }}
                        >
                            {profile.distance} km
                        </span>
                    )}
            </div>

            {/* Online badge */}
            {profile.is_online && (
                <div
                    className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2 text-xs font-medium text-white backdrop-blur"
                    style={{ background: 'oklch(15% 0.02 350 / 0.55)' }}
                >
                    <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: 'oklch(75% 0.18 145)' }}
                    />
                    en ligne
                </div>
            )}

            {/* Floating like */}
            <button
                type="button"
                onClick={onLike}
                aria-label={`Aimer ${profile.name}`}
                className="absolute right-3.5 bottom-3.5 grid h-9 w-9 place-items-center rounded-full shadow-[0_8px_20px_-8px_oklch(0%_0_0_/_0.4)] transition-colors"
                style={{
                    background: isLiked ? 'var(--desire)' : 'white',
                    color: isLiked ? 'white' : 'var(--desire)',
                }}
            >
                <Heart
                    className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`}
                />
            </button>

            {/* Reward particles */}
            {showReward?.burstParticles ? (
                <div className="pointer-events-none absolute inset-0">
                    {Array.from({ length: showReward.burstParticles }).map(
                        (_, index) => (
                            <span
                                key={`${profile.id}-particle-${index}`}
                                className="absolute top-1/2 left-1/2 h-2 w-2 animate-ping rounded-full"
                                style={{
                                    background: 'var(--desire)',
                                    transform: `translate(${(index - 3) * 16}px, ${
                                        (index % 2 === 0 ? -1 : 1) *
                                        (10 + index * 4)
                                    }px)`,
                                    animationDelay: `${index * 45}ms`,
                                }}
                            />
                        ),
                    )}
                </div>
            ) : null}
        </div>
    );
}
