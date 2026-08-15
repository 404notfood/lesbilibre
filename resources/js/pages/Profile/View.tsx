import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import {
    BadgeCheck,
    Briefcase,
    Flag,
    Gift,
    GraduationCap,
    Heart,
    Languages,
    MapPin,
    MessageCircle,
    Shield,
    Sparkles,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Photo {
    id: number;
    url: string;
    is_primary: boolean;
    is_naughty: boolean;
    is_blurred: boolean;
}

interface Profile {
    bio?: string;
    city?: string;
    age?: number;
    sexual_orientation?: string;
    relationship_status?: string;
    height?: number;
    body_type?: string;
    ethnicity?: string;
    education_level?: string;
    occupation?: string;
    has_children?: string;
    wants_children?: string;
    smoking?: string;
    drinking?: string;
    interests?: string[];
    languages?: string[];
}

interface UserData {
    id: number;
    name: string;
    is_verified: boolean;
    profile?: Profile;
    photos?: Photo[];
}

interface ProfileOptions {
    sexual_orientation: Record<string, string>;
    relationship_status: Record<string, string>;
    looking_for: Record<string, string>;
    body_type: Record<string, string>;
    hair_color: Record<string, string>;
    eye_color: Record<string, string>;
    ethnicity: Record<string, string>;
    education: Record<string, string>;
}

/* ---------------------------------------------------------------------------
 * Profile/View — direction "Wine Editorial"
 * Page d'une autre utilisatrice. Photo héro plein cadre, méta éditoriale,
 * sections sur fond crème, actions wine/blush/desire.
 * -------------------------------------------------------------------------*/
export default function View({
    user,
    hasLiked,
    hasMatched,
    hasBlocked,
    matchScore,
    profileOptions,
}: {
    user: UserData;
    hasLiked: boolean;
    hasMatched: boolean;
    hasBlocked: boolean;
    matchScore: number;
    profileOptions: ProfileOptions;
}) {
    const [showMatchScore, setShowMatchScore] = useState(false);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [processingLike, setProcessingLike] = useState(false);
    const [processingMessage, setProcessingMessage] = useState(false);
    const [processingBlock, setProcessingBlock] = useState(false);

    const primaryPhoto = user.photos?.find((p) => p.is_primary) || user.photos?.[0];
    const otherPhotos = (user.photos ?? []).filter((p) => p.id !== primaryPhoto?.id);
    const initials = user.name.slice(0, 2).toUpperCase();

    const handleLike = () => {
        if (hasLiked) {
            router.delete(`/likes/${user.id}`, {
                onStart: () => setProcessingLike(true),
                onFinish: () => setProcessingLike(false),
            });
        } else {
            router.post(
                `/likes/${user.id}`,
                {},
                {
                    onStart: () => setProcessingLike(true),
                    onFinish: () => setProcessingLike(false),
                },
            );
        }
    };

    const handleMessage = () => {
        router.post(
            `/conversations/${user.id}`,
            {},
            {
                onStart: () => setProcessingMessage(true),
                onFinish: () => setProcessingMessage(false),
            },
        );
    };

    const handleBlockConfirm = () => {
        router.post(
            `/block/${user.id}`,
            {},
            {
                onStart: () => setProcessingBlock(true),
                onFinish: () => {
                    setProcessingBlock(false);
                    setBlockDialogOpen(false);
                },
            },
        );
    };

    const handleReport = () => {
        router.visit(`/reports/create/${user.id}`);
    };

    return (
        <DatingLayout title="Profil" showOnlineUsers={false}>
            <Head title={`${user.name} — Profil`} />

            <div className="px-8 pb-20 pt-7 lg:px-11">
                {/* ===========================================
                 * EDITORIAL HERO
                 * =========================================*/}
                <header
                    className="relative mb-8 grid items-start gap-9 border-t border-b py-9 lg:grid-cols-[1fr_280px]"
                    style={{
                        borderTopColor: 'var(--ink)',
                        borderBottomColor: 'var(--line)',
                    }}
                >
                    {/* Left: Big editorial intro */}
                    <div>
                        <div className="editorial-eyebrow mb-5 text-foreground/55">
                            <span className="magenta-dot text-[color:var(--desire)]">
                                Profil · LesbiLibre
                            </span>
                        </div>
                        <h1 className="font-display m-0 text-5xl font-medium leading-[0.96] tracking-[-0.02em] md:text-6xl xl:text-7xl">
                            {user.name},{' '}
                            <em className="italic text-[color:var(--desire-deep)]">
                                {user.profile?.age ?? '—'}
                            </em>
                        </h1>
                        {user.profile?.city && (
                            <p className="mt-4 flex items-center gap-2 text-sm text-foreground/65">
                                <MapPin className="h-4 w-4" />
                                {user.profile.city}
                            </p>
                        )}

                        {user.profile?.bio && (
                            <p className="font-display mt-6 max-w-2xl text-xl font-medium italic leading-snug text-[color:var(--wine-deep)] md:text-2xl">
                                « {user.profile.bio} »
                            </p>
                        )}

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            {user.is_verified && (
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                                    style={{
                                        background: 'var(--blush)',
                                        color: 'var(--wine-deep)',
                                    }}
                                >
                                    <BadgeCheck className="h-3.5 w-3.5" />
                                    Vérifiée par selfie
                                </span>
                            )}
                            {hasMatched && (
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                                    style={{ background: 'var(--desire)' }}
                                >
                                    <Heart className="h-3.5 w-3.5 fill-current" />
                                    C&apos;est un match
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right: Primary photo + match score (compact, top-aligned) */}
                    <div className="flex flex-col gap-3">
                        <div
                            className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border shadow-[0_20px_50px_-30px_oklch(0%_0_0_/_0.35)]"
                            style={{ borderColor: 'var(--line)' }}
                        >
                            {primaryPhoto ? (
                                <img
                                    src={primaryPhoto.url}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <NoPhotoCover initials={initials} />
                            )}
                        </div>

                        {/* Match score block */}
                        <MatchScoreBlock
                            score={matchScore}
                            shown={showMatchScore}
                            onReveal={() => setShowMatchScore(true)}
                        />
                    </div>
                </header>

                {/* ===========================================
                 * ACTIONS BAR
                 * =========================================*/}
                <ActionsBar
                    hasLiked={hasLiked}
                    hasMatched={hasMatched}
                    hasBlocked={hasBlocked}
                    processingLike={processingLike}
                    processingMessage={processingMessage}
                    userId={user.id}
                    userName={user.name}
                    onLike={handleLike}
                    onMessage={handleMessage}
                    onBlock={() => setBlockDialogOpen(true)}
                    onReport={handleReport}
                />

                {/* ===========================================
                 * MAIN GRID
                 * =========================================*/}
                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                    {/* Left col: identity & infos */}
                    <div className="space-y-6 lg:col-span-2">
                        {user.profile?.bio && (
                            <Section eyebrow="À propos" number="01">
                                <p className="text-base leading-relaxed text-foreground/80">
                                    {user.profile.bio}
                                </p>
                            </Section>
                        )}

                        <Section eyebrow="Informations" number="02">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <InfoLine
                                    icon={Heart}
                                    label="Orientation"
                                    value={
                                        user.profile?.sexual_orientation &&
                                        (profileOptions.sexual_orientation[
                                            user.profile.sexual_orientation
                                        ] ||
                                            user.profile.sexual_orientation)
                                    }
                                />
                                <InfoLine
                                    icon={Users}
                                    label="Statut"
                                    value={
                                        user.profile?.relationship_status &&
                                        (profileOptions.relationship_status[
                                            user.profile.relationship_status
                                        ] ||
                                            user.profile.relationship_status)
                                    }
                                />
                                <InfoLine
                                    icon={Briefcase}
                                    label="Profession"
                                    value={user.profile?.occupation}
                                />
                                <InfoLine
                                    icon={GraduationCap}
                                    label="Éducation"
                                    value={
                                        user.profile?.education_level &&
                                        (profileOptions.education[
                                            user.profile.education_level
                                        ] ||
                                            user.profile.education_level)
                                    }
                                />
                            </div>
                        </Section>

                        {user.profile?.interests &&
                            user.profile.interests.length > 0 && (
                                <Section eyebrow="Centres d'intérêt" number="03">
                                    <div className="flex flex-wrap gap-2">
                                        {user.profile.interests.map((interest, i) => (
                                            <Chip key={i} tone="blush">
                                                {interest}
                                            </Chip>
                                        ))}
                                    </div>
                                </Section>
                            )}

                        {user.profile?.languages &&
                            user.profile.languages.length > 0 && (
                                <Section
                                    eyebrow="Langues parlées"
                                    number="04"
                                    icon={Languages}
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {user.profile.languages.map((lang, i) => (
                                            <Chip key={i} tone="outline">
                                                {lang}
                                            </Chip>
                                        ))}
                                    </div>
                                </Section>
                            )}
                    </div>

                    {/* Right col: gallery */}
                    <div className="space-y-6">
                        {otherPhotos.length > 0 && (
                            <Section eyebrow="Galerie" number="05">
                                <div className="grid grid-cols-2 gap-2">
                                    {otherPhotos.map((photo) => (
                                        <div
                                            key={photo.id}
                                            className="reveal-tile relative aspect-square overflow-hidden rounded-lg border"
                                            style={{ borderColor: 'var(--line)' }}
                                            onContextMenu={(e) => e.preventDefault()}
                                        >
                                            <img
                                                src={photo.url}
                                                alt=""
                                                draggable={false}
                                                onContextMenu={(e) => e.preventDefault()}
                                                className="reveal-bg h-full w-full select-none object-cover"
                                            />
                                            {photo.is_blurred && (
                                                <span
                                                    className="absolute inset-x-0 bottom-0 px-2 py-1 text-center text-[10px] font-semibold text-white"
                                                    style={{
                                                        background:
                                                            'oklch(0% 0 0 / 0.55)',
                                                    }}
                                                >
                                                    Contenu coquin
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Editorial signal */}
                        <div
                            className="relative overflow-hidden rounded-2xl p-6 text-[oklch(96%_0.02_50)]"
                            style={{
                                background:
                                    'linear-gradient(135deg, var(--wine) 0%, var(--wine-deep) 100%)',
                            }}
                        >
                            <div
                                aria-hidden
                                className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40"
                                style={{
                                    background:
                                        'radial-gradient(circle, var(--desire) 0%, transparent 65%)',
                                }}
                            />
                            <div className="relative">
                                <div className="editorial-eyebrow mb-3 opacity-60">
                                    Avant d&apos;écrire
                                </div>
                                <p className="font-display text-xl font-medium italic leading-snug">
                                    Sois honnête, sois douce.
                                    <br />
                                    Sois toi.
                                </p>
                                <p className="mt-3 text-xs leading-relaxed opacity-80">
                                    LesbiLibre est un espace safe. Tout comportement
                                    inapproprié peut être signalé en un clic.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===========================================
                 * BLOCK DIALOG
                 * =========================================*/}
                <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-display text-2xl font-medium italic">
                                Bloquer {user.name} ?
                            </DialogTitle>
                            <DialogDescription>
                                Cette personne ne pourra plus voir ton profil, t&apos;envoyer
                                de messages ou interagir avec toi. Tu peux annuler depuis tes
                                paramètres.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setBlockDialogOpen(false)}
                                disabled={processingBlock}
                                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleBlockConfirm}
                                disabled={processingBlock}
                                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                                style={{ background: 'var(--destructive)' }}
                            >
                                {processingBlock && <Spinner className="h-4 w-4" />}
                                Bloquer
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DatingLayout>
    );
}

/* ===========================================================================
 * Section — wrapper éditorial pour chaque bloc
 * ==========================================================================*/
function Section({
    eyebrow,
    number,
    icon: Icon,
    children,
}: {
    eyebrow: string;
    number: string;
    icon?: typeof Heart;
    children: React.ReactNode;
}): JSX.Element {
    return (
        <section
            className="rounded-2xl border bg-card p-6"
            style={{ borderColor: 'var(--line)' }}
        >
            <div className="mb-5 flex items-center justify-between">
                <div className="editorial-eyebrow flex items-center gap-2 text-foreground/55">
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {eyebrow}
                </div>
                <span
                    className="font-mono text-[10px] font-semibold"
                    style={{ color: 'var(--desire)' }}
                >
                    {number}
                </span>
            </div>
            {children}
        </section>
    );
}

/* ===========================================================================
 * InfoLine
 * ==========================================================================*/
function InfoLine({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Heart;
    label: string;
    value?: string | null;
}): JSX.Element | null {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                style={{
                    background: 'var(--blush)',
                    color: 'var(--wine-deep)',
                }}
            >
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <div className="editorial-caption text-foreground/55">{label}</div>
                <div className="mt-0.5 font-medium text-foreground">{value}</div>
            </div>
        </div>
    );
}

/* ===========================================================================
 * Chip
 * ==========================================================================*/
function Chip({
    children,
    tone = 'blush',
}: {
    children: React.ReactNode;
    tone?: 'blush' | 'outline';
}): JSX.Element {
    const style =
        tone === 'blush'
            ? { background: 'var(--blush)', color: 'var(--wine-deep)' }
            : {
                  background: 'transparent',
                  color: 'var(--ink-soft)',
                  border: '1px solid var(--line)',
              };
    return (
        <span
            className="inline-flex rounded-full px-3 py-1.5 text-xs font-medium"
            style={style}
        >
            {children}
        </span>
    );
}

/* ===========================================================================
 * NoPhotoCover — placeholder éditorial quand pas de photo
 * ==========================================================================*/
function NoPhotoCover({ initials }: { initials: string }): JSX.Element {
    return (
        <div
            className="relative grid h-full w-full place-items-center"
            style={{
                background:
                    'linear-gradient(135deg, var(--wine-deep) 0%, var(--wine) 100%)',
            }}
        >
            <span
                className="font-display select-none text-5xl font-medium italic leading-none"
                style={{ color: 'var(--gold)' }}
            >
                {initials}
            </span>
        </div>
    );
}

/* ===========================================================================
 * MatchScoreBlock
 * ==========================================================================*/
function MatchScoreBlock({
    score,
    shown,
    onReveal,
}: {
    score: number;
    shown: boolean;
    onReveal: () => void;
}): JSX.Element {
    return (
        <div
            className="relative overflow-hidden rounded-2xl border p-5"
            style={{
                borderColor: 'var(--line)',
                background:
                    'linear-gradient(135deg, var(--blush) 0%, var(--paper) 70%)',
            }}
        >
            <div className="flex items-center justify-between">
                <div className="editorial-eyebrow text-foreground/55">
                    <span className="magenta-dot text-[color:var(--desire)]">
                        Match Score
                    </span>
                </div>
                <Sparkles
                    className="h-4 w-4"
                    style={{ color: 'var(--desire)' }}
                />
            </div>
            {shown ? (
                <div className="mt-3">
                    <div className="font-display text-5xl font-medium italic leading-none text-[color:var(--wine-deep)]">
                        {score}%
                    </div>
                    <div
                        className="mt-3 h-1.5 overflow-hidden rounded-full"
                        style={{ background: 'oklch(20% 0.04 20 / 0.1)' }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                                width: `${score}%`,
                                background:
                                    'linear-gradient(90deg, var(--desire), var(--gold))',
                            }}
                        />
                    </div>
                    <p className="mt-2 text-[11px] text-foreground/55">
                        Compatibilité émotionnelle, musicale et centres d&apos;intérêt
                    </p>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={onReveal}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-foreground/15 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-foreground hover:text-background"
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    Révéler le score
                </button>
            )}
        </div>
    );
}

/* ===========================================================================
 * ActionsBar
 * ==========================================================================*/
function ActionsBar({
    hasLiked,
    hasMatched,
    hasBlocked,
    processingLike,
    processingMessage,
    userId,
    userName,
    onLike,
    onMessage,
    onBlock,
    onReport,
}: {
    hasLiked: boolean;
    hasMatched: boolean;
    hasBlocked: boolean;
    processingLike: boolean;
    processingMessage: boolean;
    userId: number;
    userName: string;
    onLike: () => void;
    onMessage: () => void;
    onBlock: () => void;
    onReport: () => void;
}): JSX.Element {
    return (
        <div
            className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-2xl border bg-card/95 p-3 backdrop-blur-xl"
            style={{ borderColor: 'var(--line)' }}
        >
            {/* Primary: Like */}
            <button
                type="button"
                onClick={onLike}
                disabled={processingLike}
                aria-label={hasLiked ? `Retirer ton like de ${userName}` : `Aimer ${userName}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all sm:flex-initial sm:min-w-[180px]"
                style={{
                    background: hasLiked ? 'var(--wine)' : 'var(--desire)',
                }}
            >
                {processingLike ? (
                    <Spinner className="h-4 w-4" />
                ) : (
                    <Heart
                        className={`h-4 w-4 ${hasLiked ? 'fill-current animate-heartbeat' : ''}`}
                    />
                )}
                {hasLiked ? 'Like envoyé' : "J'aime"}
            </button>

            {/* Message (after a like, or once matched) */}
            {(hasMatched || hasLiked) && (
                <button
                    type="button"
                    onClick={onMessage}
                    disabled={processingMessage}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
                    style={{
                        background: 'var(--blush)',
                        color: 'var(--wine-deep)',
                    }}
                >
                    {processingMessage ? (
                        <Spinner className="h-4 w-4" />
                    ) : (
                        <MessageCircle className="h-4 w-4" />
                    )}
                    {hasMatched ? 'Écrire' : 'Envoyer un mot'}
                </button>
            )}

            {/* Gift */}
            <button
                type="button"
                onClick={() => router.visit(`/shop?gift_to=${userId}`)}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
                style={{
                    borderColor: 'var(--line)',
                    color: 'var(--ink-soft)',
                }}
            >
                <Gift className="h-4 w-4" />
                Cadeau
            </button>

            <div className="ml-auto flex items-center gap-1">
                <button
                    type="button"
                    onClick={onBlock}
                    disabled={hasBlocked}
                    className="grid h-10 w-10 place-items-center rounded-xl text-foreground/55 transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50"
                    title={hasBlocked ? 'Bloqué' : 'Bloquer'}
                    aria-label={hasBlocked ? 'Bloqué' : 'Bloquer'}
                >
                    <Shield className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={onReport}
                    className="grid h-10 w-10 place-items-center rounded-xl text-foreground/55 transition-colors hover:bg-muted hover:text-destructive"
                    title="Signaler"
                    aria-label="Signaler"
                >
                    <Flag className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
