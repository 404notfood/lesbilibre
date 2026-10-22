import { meetingIntentions } from '@/components/community-fields';
import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    BadgeCheck,
    Heart,
    MapPin,
    Sparkles,
    X,
} from 'lucide-react';
import type { ReactNode } from 'react';

export interface MemberCardProfile {
    id: number;
    name: string;
    pseudo?: string | null;
    age?: number | null;
    city?: string | null;
    distance?: number | null;
    bio?: string | null;
    photo?: string | null;
    isVerified?: boolean;
    isOnline?: boolean;
    intentions?: string[];
    compatibility?: number;
    reason?: string;
}

interface MemberCardProps {
    member: MemberCardProfile;
    isLiked?: boolean;
    onOpen?: () => void;
    onLike?: () => void;
    onPass?: () => void;
    className?: string;
    decoration?: ReactNode;
}

export default function MemberCard({
    member,
    isLiked = false,
    onOpen,
    onLike,
    onPass,
    className = '',
    decoration,
}: MemberCardProps) {
    const displayName = member.pseudo || member.name;
    const intentions = (member.intentions ?? [])
        .map((key) => meetingIntentions[key])
        .filter(Boolean);
    const href = `/profile/${member.id}`;
    const openClass =
        'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-[color:var(--wine-deep)] transition-colors hover:bg-[color:var(--blush)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--desire)] focus-visible:ring-offset-2';

    return (
        <article
            className={`group @container flex min-w-0 flex-col overflow-hidden rounded-[1.4rem] border border-border bg-card shadow-[0_5px_24px_-18px_oklch(20%_0.04_350_/_0.25)] transition-shadow hover:shadow-[0_16px_40px_-22px_oklch(20%_0.04_350_/_0.3)] ${className}`}
        >
            <Link
                href={href}
                aria-label={`Voir le profil de ${displayName}`}
                className="relative block aspect-[4/5] shrink-0 overflow-hidden bg-[color:var(--blush)] focus-visible:ring-2 focus-visible:ring-[color:var(--desire)] focus-visible:outline-none focus-visible:ring-inset"
                draggable={false}
            >
                {member.photo ? (
                    <img
                        src={member.photo}
                        alt={displayName}
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width: 1536px) 280px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                        draggable={false}
                        className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[color:var(--paper)] to-[color:var(--blush)] text-[color:var(--wine)]">
                        <span className="grid h-20 w-20 place-items-center rounded-full border border-[color:var(--wine)]/10 bg-card/60 font-display text-3xl italic">
                            {displayName.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-xs text-foreground/55">
                            Photo à venir
                        </span>
                    </div>
                )}

                <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
                    {member.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1.5 text-xs font-medium text-[color:var(--wine-deep)] shadow-sm backdrop-blur-sm">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Photos vérifiées
                        </span>
                    ) : (
                        <span />
                    )}
                    {member.compatibility ? (
                        <span
                            title="Compatibilité des réponses au questionnaire"
                            className="inline-flex items-center gap-1 rounded-full bg-[color:var(--wine-deep)] px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm"
                        >
                            <Sparkles className="h-3 w-3" />
                            {member.compatibility}%
                        </span>
                    ) : null}
                </div>

                {member.isOnline ? (
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        En ligne
                    </span>
                ) : null}
                {decoration}
            </Link>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="flex min-w-0 items-baseline gap-2 font-display text-2xl leading-tight font-medium tracking-tight text-[color:var(--wine-deep)]">
                    <span className="truncate">{displayName}</span>
                    {member.age ? (
                        <span className="shrink-0 text-lg font-normal text-foreground/55">
                            {member.age}
                        </span>
                    ) : null}
                </h3>
                {member.city || member.distance != null ? (
                    <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-sm text-foreground/60">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                            {member.city}
                            {member.city && member.distance != null
                                ? ' · '
                                : ''}
                            {member.distance != null
                                ? member.distance < 1
                                    ? 'À moins de 1 km'
                                    : `${Math.round(member.distance)} km`
                                : ''}
                        </span>
                    </p>
                ) : null}

                {intentions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {intentions.slice(0, 2).map((label) => (
                            <span
                                key={label}
                                className="rounded-lg bg-[color:var(--blush)] px-2 py-1 text-xs leading-relaxed text-[color:var(--wine-deep)]"
                            >
                                {label}
                            </span>
                        ))}
                        {intentions.length > 2 ? (
                            <span className="px-1 py-1 text-xs text-foreground/55">
                                +{intentions.length - 2}
                            </span>
                        ) : null}
                    </div>
                ) : null}

                {member.bio ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/70">
                        {member.bio}
                    </p>
                ) : null}
                {member.reason ? (
                    <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-[color:var(--wine-deep)]/75">
                        <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
                        {member.reason}
                    </p>
                ) : null}

                <div className="mt-auto flex gap-2 pt-4">
                    {onPass ? (
                        <button
                            type="button"
                            onClick={onPass}
                            aria-label={`Passer le profil de ${displayName}`}
                            className="grid min-h-11 w-11 shrink-0 place-items-center rounded-xl border border-border text-foreground/50 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-[color:var(--desire)] focus-visible:outline-none"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                    {onOpen ? (
                        <button
                            type="button"
                            className={openClass}
                            onClick={onOpen}
                            aria-label={`Voir le profil de ${displayName}`}
                        >
                            <span className="@max-[260px]:hidden">
                                Voir le profil
                            </span>
                            <span className="hidden @max-[260px]:inline">
                                Profil
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                        </button>
                    ) : (
                        <Link
                            href={href}
                            className={openClass}
                            aria-label={`Voir le profil de ${displayName}`}
                        >
                            <span className="@max-[260px]:hidden">
                                Voir le profil
                            </span>
                            <span className="hidden @max-[260px]:inline">
                                Profil
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                        </Link>
                    )}
                    {onLike ? (
                        <button
                            type="button"
                            onClick={onLike}
                            disabled={isLiked}
                            aria-label={
                                isLiked
                                    ? `Profil de ${displayName} aimé`
                                    : `Aimer le profil de ${displayName}`
                            }
                            aria-pressed={isLiked}
                            title={isLiked ? 'Profil aimé' : 'J’aime'}
                            className="grid min-h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color:var(--desire)] text-white transition-colors hover:bg-[color:var(--wine)] focus-visible:ring-2 focus-visible:ring-[color:var(--desire)] focus-visible:ring-offset-2 focus-visible:outline-none disabled:bg-[color:var(--wine)]"
                        >
                            <Heart
                                className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                            />
                        </button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
