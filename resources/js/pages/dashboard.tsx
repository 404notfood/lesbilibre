import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import {
    ArrowRight,
    Eye,
    Flame,
    Heart,
    MapPin,
    MessageCircle,
    Search,
    SlidersHorizontal,
    Sparkles,
    Star,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import ProfileCard from '@/components/discovery/ProfileCard';
import { DiscoverySignals } from '@/domain/engagement/DiscoverySignals';
import { RewardFeedback, type RewardState } from '@/domain/engagement/RewardFeedback';

interface Profile {
    id: number;
    name: string;
    age: number;
    city: string;
    distance: number | null;
    bio: string;
    primary_photo: string | null;
    photo_count: number;
    is_online: boolean;
    compatibility_score: number;
}

interface LiveSignals {
    online_count: number;
    last_like: {
        name: string;
        age: number | null;
        when: string | null;
    } | null;
    recent_views: number;
    new_profiles_today: number;
}

interface DashboardProps {
    profiles: Profile[];
    likedUserIds: number[];
    filters: {
        search?: string;
        min_age: number;
        max_age: number;
        search_radius: number;
        sort_by: string;
        quick_filter?: string;
    };
    liveSignals: LiveSignals;
}

type VibeKey = 'coup' | 'live' | 'eye' | 'new';
type MoodKey = 'nearby' | 'online' | 'slow' | 'curious' | 'photos' | 'verified' | 'open';

const VIBES: { id: VibeKey; label: string; icon: typeof Sparkles; hot?: boolean }[] = [
    { id: 'coup', label: 'Coup de cœur du jour', icon: Sparkles, hot: true },
    { id: 'live', label: 'Active maintenant', icon: Flame },
    { id: 'eye', label: 'Te regarde peut-être', icon: Eye },
    { id: 'new', label: 'Nouveaux profils', icon: Star },
];

const MOODS: { id: MoodKey; label: string; quickFilter?: string }[] = [
    { id: 'nearby', label: 'Près de moi', quickFilter: 'nearby' },
    { id: 'online', label: 'En ligne', quickFilter: 'online' },
    { id: 'slow', label: 'Slow' },
    { id: 'curious', label: 'Curieuse' },
    { id: 'photos', label: 'Avec photos', quickFilter: 'photos' },
    { id: 'verified', label: 'Vérifiée' },
    { id: 'open', label: 'Open' },
];

export default function Dashboard({
    profiles,
    likedUserIds,
    filters,
    liveSignals,
}: DashboardProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState(filters.quick_filter || '');
    const [vibe, setVibe] = useState<VibeKey>('coup');
    const [mood, setMood] = useState<MoodKey | null>(null);
    const [passedProfileIds, setPassedProfileIds] = useState<number[]>([]);
    const [rewardState, setRewardState] = useState<RewardState | null>(null);
    const discoverySignals = useMemo(() => new DiscoverySignals(), []);
    const rewardFeedback = useMemo(() => new RewardFeedback(), []);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get(
            '/dashboard',
            { search: value },
            { preserveState: true, preserveScroll: true },
        );
    }, 500);

    useEffect(() => {
        if (searchQuery !== filters.search) {
            debouncedSearch(searchQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const handleMood = (m: MoodKey): void => {
        const next = mood === m ? null : m;
        setMood(next);
        const target = MOODS.find((x) => x.id === m);
        if (target?.quickFilter) {
            const newFilter = next ? target.quickFilter : '';
            setActiveFilter(newFilter);
            router.get(
                '/dashboard',
                { quick_filter: newFilter },
                { preserveState: true, preserveScroll: true },
            );
        }
    };

    const handleAdvancedSearch = (): void => {
        router.visit('/search');
    };

    const handleLike = (profileId: number): void => {
        const next = rewardFeedback.create('like', profileId);
        setRewardState(next);
        rewardFeedback.maybeVibrate('like');
        router.post(`/likes/${profileId}`);
    };

    const handlePass = (profileId: number): void => {
        const next = rewardFeedback.create('pass', profileId);
        setRewardState(next);
        rewardFeedback.maybeVibrate('pass');
        setPassedProfileIds((current) => [...current, profileId]);
    };

    useEffect(() => {
        if (!rewardState) return;
        const timeout = window.setTimeout(() => {
            if (!rewardFeedback.isActive(rewardState)) {
                setRewardState(null);
            }
        }, 950);
        return () => window.clearTimeout(timeout);
    }, [rewardFeedback, rewardState]);

    const visibleProfiles = profiles.filter(
        (profile) => !passedProfileIds.includes(profile.id),
    );

    const spotlightProfile = visibleProfiles[0];
    const restProfiles = visibleProfiles.slice(1);

    const dayName = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
    // Online count vient du backend (utilisatrices actives dans les 15 dernières minutes,
    // hors moi-même). Fallback à 0 si vraiment personne.
    const onlineCount = liveSignals?.online_count ?? 0;

    return (
        <DatingLayout title="Découvrir">
            <Head title="Découvrir · LesbiLibre" />

            <div className="px-8 pb-20 pt-7 lg:px-11">
                {/* ===========================================
                 * TOP BAR — eyebrow + icon buttons
                 * =========================================*/}
                <div className="mb-8 flex items-center justify-between">
                    <div className="editorial-eyebrow text-foreground/55">
                        Découvrir · feed du soir
                    </div>
                    {/* Icons remplacés par ceux du header layout — on garde la place propre */}
                </div>

                {/* ===========================================
                 * HERO — Editorial
                 * =========================================*/}
                <EditorialHero
                    dayName={dayName}
                    onlineCount={onlineCount}
                    signals={liveSignals}
                />

                {/* ===========================================
                 * SEARCH ROW
                 * =========================================*/}
                <SearchRow
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onAdvanced={handleAdvancedSearch}
                />

                {/* ===========================================
                 * VIBE CHIPS
                 * =========================================*/}
                <div className="mb-4 flex flex-wrap gap-2">
                    {VIBES.map((v) => {
                        const Icon = v.icon;
                        const active = vibe === v.id;
                        return (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => setVibe(v.id)}
                                aria-pressed={active}
                                className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all"
                                style={{
                                    background: active
                                        ? v.hot
                                            ? 'var(--desire)'
                                            : 'var(--ink)'
                                        : 'var(--paper)',
                                    color: active ? 'white' : 'var(--ink-soft)',
                                    borderColor: active ? 'transparent' : 'var(--line)',
                                    fontWeight: active ? 600 : 500,
                                }}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {v.label}
                            </button>
                        );
                    })}
                </div>

                {/* ===========================================
                 * MOOD PILL ROW
                 * =========================================*/}
                <div className="flex flex-wrap gap-1.5">
                    {MOODS.map((m) => {
                        const active = mood === m.id;
                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => handleMood(m.id)}
                                aria-pressed={active}
                                className="rounded-full border px-3 py-1.5 text-xs transition-all"
                                style={{
                                    background: active ? 'var(--ink)' : 'transparent',
                                    color: active ? 'var(--bg)' : 'var(--ink-soft)',
                                    borderColor: 'var(--line)',
                                    fontWeight: active ? 600 : 500,
                                }}
                            >
                                {m.label}
                            </button>
                        );
                    })}
                </div>

                {/* ===========================================
                 * SECTION HEADING
                 * =========================================*/}
                <div className="mb-4 mt-7 flex items-baseline justify-between gap-4">
                    <div>
                        <div className="font-display text-3xl font-medium italic leading-tight tracking-tight">
                            Profils prêts à{' '}
                            <span className="text-[color:var(--desire-deep)]">
                                te plaire
                            </span>
                            .
                        </div>
                        <div className="mt-1 text-sm text-foreground/55">
                            {visibleProfiles.length} femmes proches de toi, classées par
                            compatibilité émotionnelle.
                        </div>
                    </div>
                    <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground/65"
                    >
                        <span>Trier par</span>
                        <span className="font-semibold text-foreground">Compatibilité</span>
                    </button>
                </div>

                {/* ===========================================
                 * GRID — Spotlight + cards
                 * =========================================*/}
                {visibleProfiles.length === 0 ? (
                    <EmptyState onReset={() => router.get('/dashboard')} />
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {spotlightProfile && (
                            <SpotlightCard
                                profile={spotlightProfile}
                                isLiked={likedUserIds.includes(spotlightProfile.id)}
                                onLike={handleLike}
                                onOpen={(id) => router.visit(`/profile/${id}`)}
                            />
                        )}
                        {restProfiles.map((profile) => (
                            <ProfileCard
                                key={profile.id}
                                profile={profile}
                                signals={discoverySignals.buildSignals(profile)}
                                isLiked={likedUserIds.includes(profile.id)}
                                reward={rewardState}
                                onOpen={(id) => router.visit(`/profile/${id}`)}
                                onLike={handleLike}
                                onPass={handlePass}
                            />
                        ))}
                    </div>
                )}

                {/* ===========================================
                 * SAFETY BANNER (closer)
                 * =========================================*/}
                <SafetyBanner />
            </div>
        </DatingLayout>
    );
}

/* ===========================================================================
 * EDITORIAL HERO — collage + bubbles flottantes + trust strip
 * ==========================================================================*/
function EditorialHero({
    dayName,
    onlineCount,
    signals,
}: {
    dayName: string;
    onlineCount: number;
    signals: LiveSignals;
}): JSX.Element {
    return (
        <section
            className="relative mb-8 grid gap-9 border-t border-b py-9 lg:grid-cols-[1fr_340px]"
            style={{
                borderTopColor: 'var(--ink)',
                borderBottomColor: 'var(--line)',
            }}
        >
            <div>
                {/* Eyebrow with dot */}
                <div className="mb-5 flex items-center gap-2.5">
                    <span
                        className="h-2 w-2 rounded-full"
                        style={{
                            background: 'var(--desire)',
                            boxShadow: '0 0 0 4px oklch(62% 0.19 10 / 0.18)',
                        }}
                    />
                    <span className="editorial-eyebrow text-foreground/65">
                        {dayName} soir · {onlineCount.toLocaleString('fr-FR')} femmes en ligne
                    </span>
                </div>

                {/* Big editorial title */}
                <h1 className="font-display m-0 text-5xl font-medium leading-[0.96] tracking-[-0.02em] md:text-6xl xl:text-7xl">
                    Qui te fait{' '}
                    <em className="italic text-[color:var(--desire-deep)]">vibrer</em> ce
                    soir&nbsp;?
                </h1>

                <p className="mt-5 max-w-[480px] text-[15.5px] leading-relaxed text-foreground/65">
                    Du flirt d&apos;un soir à l&apos;histoire d&apos;un été. Choisis ton tempo
                    — on te trouve la rencontre qui va avec.
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                    <button
                        type="button"
                        className="btn-velvet"
                        onClick={() => {
                            window.scrollBy({ top: 600, behavior: 'smooth' });
                        }}
                    >
                        Commencer à scroller
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => router.visit('/likes')}
                        className="inline-flex items-center gap-2 rounded-xl border border-foreground bg-transparent px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                    >
                        <Eye className="h-3.5 w-3.5" /> Voir qui m&apos;a likée
                    </button>
                </div>

                {/* Trust strip */}
                <div className="mt-7 flex flex-wrap gap-6 text-foreground/65">
                    {[
                        ['100%', 'communauté féminine'],
                        ['Vérifié', 'par selfie'],
                        ['Safe', 'modération 24/7'],
                    ].map(([k, v]) => (
                        <div key={v}>
                            <div className="font-display text-2xl font-medium italic text-foreground">
                                {k}
                            </div>
                            <div className="editorial-caption mt-0.5 text-[0.625rem]">
                                {v}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Live signals stack — données réelles du backend */}
            <LiveSignalsStack signals={signals} onlineCount={onlineCount} />
        </section>
    );
}

/* ---------------------------------------------------------------------------
 * LiveSignalsStack — pile de notifs vivantes alimentée par les vraies
 * données backend. Tombe en empty state élégant si rien à montrer.
 * -------------------------------------------------------------------------*/
function LiveSignalsStack({
    signals,
    onlineCount,
}: {
    signals: LiveSignals;
    onlineCount: number;
}): JSX.Element {
    const items: {
        id: string;
        icon: typeof Heart;
        iconColor: string;
        title: string;
        sub: string;
        time: string;
        tone: 'card' | 'wine';
    }[] = [];

    if (signals.last_like) {
        items.push({
            id: 'like',
            icon: Heart,
            iconColor: 'var(--desire)',
            title: signals.last_like.age
                ? `${signals.last_like.name}, ${signals.last_like.age}`
                : signals.last_like.name,
            sub: "t'a likée",
            time: signals.last_like.when ?? '',
            tone: 'card',
        });
    }

    if (signals.recent_views > 0) {
        items.push({
            id: 'view',
            icon: Eye,
            iconColor: 'var(--wine-deep)',
            title:
                signals.recent_views === 1
                    ? '1 femme te regarde'
                    : `${signals.recent_views} femmes te regardent`,
            sub: 'profils anonymes',
            time: '24h',
            tone: 'card',
        });
    }

    if (signals.new_profiles_today > 0) {
        items.push({
            id: 'new',
            icon: Sparkles,
            iconColor: 'var(--gold)',
            title:
                signals.new_profiles_today === 1
                    ? '1 nouveau profil'
                    : `${signals.new_profiles_today} nouveaux profils`,
            sub: 'inscrites aujourd’hui',
            time: 'fresh',
            tone: 'wine',
        });
    }

    return (
        <div className="relative flex flex-col gap-3 self-center">
            {/* Eyebrow */}
            <div className="editorial-eyebrow mb-1 text-foreground/55">
                Activité · maintenant
            </div>

            {items.length === 0 && (
                <div
                    className="rounded-2xl border px-4 py-5 text-center"
                    style={{
                        borderColor: 'var(--line-soft)',
                        background: 'var(--bg-soft)',
                    }}
                >
                    <p className="font-display text-base italic text-foreground/65">
                        Rien encore — sois la première à&nbsp;liker.
                    </p>
                </div>
            )}

            {items.map((s, i) => {
                const Icon = s.icon;
                const isWine = s.tone === 'wine';
                return (
                    <div
                        key={s.id}
                        className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-transform hover:-translate-y-px"
                        style={{
                            background: isWine ? 'var(--wine-deep)' : 'var(--paper)',
                            color: isWine ? 'oklch(96% 0.02 50)' : 'var(--ink)',
                            borderColor: isWine ? 'transparent' : 'var(--line)',
                            boxShadow:
                                '0 8px 24px -16px oklch(0% 0 0 / 0.18)',
                            animation: `editorial-rise 0.7s ${i * 120}ms cubic-bezier(0.16,1,0.3,1) both`,
                        }}
                    >
                        <div
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                            style={{
                                background: isWine
                                    ? 'oklch(100% 0 0 / 0.1)'
                                    : 'var(--blush)',
                                color: s.iconColor,
                            }}
                        >
                            <Icon className="h-4 w-4 fill-current" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-display text-base font-medium italic leading-tight">
                                {s.title}
                            </div>
                            <div
                                className="mt-0.5 text-xs"
                                style={{
                                    color: isWine
                                        ? 'oklch(96% 0.02 50 / 0.65)'
                                        : 'var(--ink-mute)',
                                }}
                            >
                                {s.sub}
                            </div>
                        </div>
                        <div
                            className="font-mono shrink-0 text-[10px] uppercase tracking-wider"
                            style={{
                                color: isWine
                                    ? 'oklch(96% 0.02 50 / 0.55)'
                                    : 'var(--ink-mute)',
                            }}
                        >
                            {s.time}
                        </div>
                    </div>
                );
            })}

            {/* Bottom live counter — vrai compteur d'utilisatrices en ligne */}
            <div
                className="mt-1 flex items-center justify-between rounded-2xl border px-4 py-3"
                style={{
                    background: 'var(--bg-soft)',
                    borderColor: 'var(--line-soft)',
                }}
            >
                <div className="flex items-center gap-2">
                    {onlineCount > 0 && <span className="online-dot" />}
                    <span className="text-xs font-medium">
                        {onlineCount > 0
                            ? `${onlineCount.toLocaleString('fr-FR')} ${onlineCount === 1 ? 'femme en ligne' : 'femmes en ligne'}`
                            : 'Personne en ligne pour le moment'}
                    </span>
                </div>
                <span className="font-mono text-[10px] text-foreground/55">
                    en direct
                </span>
            </div>
        </div>
    );
}

/* ===========================================================================
 * SEARCH ROW
 * ==========================================================================*/
function SearchRow({
    value,
    onChange,
    onAdvanced,
}: {
    value: string;
    onChange: (v: string) => void;
    onAdvanced: () => void;
}): JSX.Element {
    return (
        <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-border bg-card p-2">
            <div className="flex flex-1 items-center gap-3 px-3.5 py-2">
                <Search className="h-4 w-4 text-foreground/55" />
                <Input
                    type="text"
                    placeholder="Cherche un prénom, une ville, un mood…"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
            </div>
            <button
                type="button"
                onClick={onAdvanced}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground/65 transition-colors hover:text-foreground"
            >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtres
            </button>
            <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-px"
                style={{ background: 'var(--desire)' }}
                onClick={() => router.reload({ only: ['profiles'] })}
            >
                <Flame className="h-3 w-3" />
                Surprends-moi
            </button>
        </div>
    );
}

/* ===========================================================================
 * SPOTLIGHT CARD — full wine, gold badge, premium feel
 * ==========================================================================*/
function SpotlightCard({
    profile,
    isLiked,
    onLike,
    onOpen,
}: {
    profile: Profile;
    isLiked: boolean;
    onLike: (id: number) => void;
    onOpen: (id: number) => void;
}): JSX.Element {
    return (
        <article
            onClick={() => onOpen(profile.id)}
            className="group relative flex min-h-[600px] cursor-pointer flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1"
            style={{
                background: 'var(--wine-deep)',
                color: 'oklch(96% 0.02 50)',
            }}
        >
            {/* Photo */}
            <div className="reveal-tile relative min-h-[280px] flex-1">
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
                                'radial-gradient(120% 100% at 0% 0%, var(--wine) 0%, var(--wine-deep) 60%, oklch(15% 0.05 350) 100%)',
                        }}
                    >
                        {/* Huge editorial monogram */}
                        <div className="absolute inset-0 grid place-items-center">
                            <span
                                className="font-display select-none text-[10rem] font-medium italic leading-none"
                                style={{ color: 'var(--gold)', opacity: 0.22 }}
                            >
                                {profile.name.slice(0, 2).toUpperCase()}
                            </span>
                        </div>
                    </div>
                )}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to bottom, transparent 40%, oklch(20% 0.075 12 / 0.85) 100%)',
                    }}
                />
                <div className="absolute left-3.5 top-3.5 flex gap-1.5">
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider"
                        style={{ background: 'var(--gold)', color: 'var(--wine-deep)' }}
                    >
                        <Sparkles className="h-2.5 w-2.5 fill-current" />
                        Spotlight du jour
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-5">
                <div className="editorial-caption mb-2 text-[0.625rem] opacity-70">
                    {profile.compatibility_score || 96}% compatibilité émotionnelle
                </div>
                <h3 className="font-display m-0 text-3xl font-medium leading-tight tracking-[-0.015em]">
                    {profile.name},{' '}
                    <em className="italic opacity-80">{profile.age}</em>
                </h3>
                <div className="mt-1 flex items-center gap-1.5 text-xs opacity-70">
                    <MapPin className="h-3 w-3" />
                    {profile.city}
                    {profile.distance != null && (
                        <span>
                            · {profile.distance < 1 ? 'à moins d\'1 km' : `à ${profile.distance} km`}
                        </span>
                    )}
                </div>
                <p className="mt-3 mb-3.5 text-[13.5px] leading-relaxed opacity-85 line-clamp-3">
                    {profile.bio ||
                        'Photographe argentique. Je nage tôt, je danse tard. Cherche une complicité qui ne se presse pas.'}
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpen(profile.id);
                        }}
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-transform hover:-translate-y-px"
                        style={{ background: 'var(--gold)', color: 'var(--wine-deep)' }}
                    >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Lui écrire
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isLiked) onLike(profile.id);
                        }}
                        disabled={isLiked}
                        aria-label={`Aimer ${profile.name}`}
                        className="grid h-11 w-11 place-items-center rounded-xl border text-white transition-colors"
                        style={{
                            background: 'oklch(100% 0 0 / 0.12)',
                            borderColor: 'oklch(100% 0 0 / 0.18)',
                        }}
                    >
                        <Heart
                            className={`h-4 w-4 ${
                                isLiked ? 'fill-current animate-heartbeat' : ''
                            }`}
                        />
                    </button>
                </div>
            </div>
        </article>
    );
}

/* ===========================================================================
 * SAFETY BANNER — wine gradient, 3 engagements
 * ==========================================================================*/
function SafetyBanner(): JSX.Element {
    return (
        <section
            className="relative mt-12 grid grid-cols-1 items-center gap-9 overflow-hidden rounded-2xl p-9 text-[oklch(96%_0.02_50)] lg:grid-cols-[1.4fr_1fr]"
            style={{
                background:
                    'linear-gradient(120deg, var(--wine) 0%, var(--wine-deep) 60%, oklch(20% 0.08 350) 100%)',
            }}
        >
            <div
                aria-hidden
                className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-40"
                style={{
                    background:
                        'radial-gradient(circle, var(--desire) 0%, transparent 65%)',
                }}
            />
            <div className="relative">
                <div className="editorial-eyebrow mb-3 opacity-60">Notre engagement</div>
                <h2 className="font-display m-0 text-4xl font-medium leading-[1.05] tracking-[-0.015em] lg:text-[42px]">
                    Un espace{' '}
                    <em className="italic" style={{ color: 'var(--gold)' }}>
                        pour nous
                    </em>
                    , par nous.
                </h2>
                <p className="mt-3.5 max-w-[520px] text-[14.5px] leading-relaxed opacity-80">
                    100% communauté féminine. Profils vérifiés par selfie. Modération 24/7.
                    Mode incognito pour les curieuses qui veulent prendre leur temps.
                </p>
            </div>

            <div className="relative flex flex-col gap-2.5">
                {[
                    {
                        k: '01',
                        t: 'Vérification selfie',
                        d: 'Chaque profil est une vraie femme.',
                    },
                    {
                        k: '02',
                        t: 'Tu choisis le tempo',
                        d: "Plan d'un soir, slow, ou amitié.",
                    },
                    {
                        k: '03',
                        t: 'Block & report en 1 clic',
                        d: "On t'écoute, on agit vite.",
                    },
                ].map((item) => (
                    <div
                        key={item.k}
                        className="grid grid-cols-[auto_1fr] items-center gap-3.5 rounded-xl p-3.5"
                        style={{ background: 'oklch(100% 0 0 / 0.06)' }}
                    >
                        <span
                            className="font-display text-2xl font-medium italic"
                            style={{ color: 'var(--gold)' }}
                        >
                            {item.k}
                        </span>
                        <div>
                            <div className="text-sm font-semibold">{item.t}</div>
                            <div className="mt-0.5 text-xs opacity-70">{item.d}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ===========================================================================
 * EMPTY STATE
 * ==========================================================================*/
function EmptyState({ onReset }: { onReset: () => void }): JSX.Element {
    return (
        <div className="col-span-full">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-8 py-20 text-center">
                <div className="editorial-eyebrow mb-3 text-[color:var(--desire-deep)]">
                    <span className="magenta-dot">Personne ce soir</span>
                </div>
                <h2 className="font-display mx-auto max-w-xl text-4xl font-medium italic leading-tight">
                    Personne ne correspond.
                    <br />
                    <span className="text-[color:var(--desire-deep)]">Pas encore.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-md text-sm text-foreground/65">
                    Élargis tes filtres, change la ville, ou attends quelques heures. Les
                    profils arrivent tout le temps.
                </p>
                <button type="button" onClick={onReset} className="btn-desire mt-8">
                    Réinitialiser les filtres
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

