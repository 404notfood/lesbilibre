import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import {
    BadgeCheck,
    Briefcase,
    Camera,
    ChevronLeft,
    ChevronRight,
    Flag,
    Gift,
    GraduationCap,
    Heart,
    Languages,
    Lock,
    MapPin,
    MessageCircle,
    Play,
    Shield,
    Sparkles,
    Users,
    Video,
} from 'lucide-react';
import { useState } from 'react';

interface Photo {
    id: number;
    url: string;
    media_type?: 'photo' | 'video';
    duration?: number | null;
    is_primary: boolean;
    is_naughty: boolean;
    is_private?: boolean;
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
}

interface GalleryState {
    photo_count: number;
    has_access: boolean;
    request_status: 'pending' | 'accepted' | 'rejected' | null;
    viewer_accepts_naughty: boolean;
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
    photos = [],
    viewerAcceptsNaughty: _viewerAcceptsNaughty = false,
    gallery = null,
    hasLiked,
    hasMatched,
    hasBlocked,
    matchScore,
    profileOptions,
}: {
    user: UserData;
    photos?: Photo[];
    viewerAcceptsNaughty?: boolean;
    gallery?: GalleryState | null;
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
    const [requestingAccess, setRequestingAccess] = useState(false);

    const handleRequestGalleryAccess = () => {
        setRequestingAccess(true);
        router.post(
            `/gallery-access/request/${user.id}`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setRequestingAccess(false),
            },
        );
    };

    const primaryPhoto = photos.find((p) => p.is_primary) || photos[0];
    const otherPhotos = photos.filter((p) => p.id !== primaryPhoto?.id);
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

            <div className="px-8 pt-7 pb-20 lg:px-11">
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
                        <h1 className="m-0 font-display text-5xl leading-[0.96] font-medium tracking-[-0.02em] md:text-6xl xl:text-7xl">
                            {user.name},{' '}
                            <em className="text-[color:var(--desire-deep)] italic">
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
                            <p className="mt-6 max-w-2xl font-display text-xl leading-snug font-medium text-[color:var(--wine-deep)] italic md:text-2xl">
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
                                <Section
                                    eyebrow="Centres d'intérêt"
                                    number="03"
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {user.profile.interests.map(
                                            (interest, i) => (
                                                <Chip key={i} tone="blush">
                                                    {interest}
                                                </Chip>
                                            ),
                                        )}
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
                                        {user.profile.languages.map(
                                            (lang, i) => (
                                                <Chip key={i} tone="outline">
                                                    {lang}
                                                </Chip>
                                            ),
                                        )}
                                    </div>
                                </Section>
                            )}
                    </div>

                    {/* Right col: gallery */}
                    <div className="space-y-6">
                        {(otherPhotos.length > 0 ||
                            (gallery?.photo_count ?? 0) > 0) && (
                            <Section eyebrow="Galerie" number="05">
                                <ProfileMediaGallery
                                    media={otherPhotos}
                                    userName={user.name}
                                />

                                {gallery &&
                                    gallery.photo_count > 0 &&
                                    !gallery.has_access && (
                                        <div
                                            className="mt-4 rounded-xl border p-4 text-center"
                                            style={{
                                                borderColor: 'var(--line)',
                                            }}
                                        >
                                            <Lock
                                                className="mx-auto h-5 w-5"
                                                style={{
                                                    color: 'var(--ink-mute)',
                                                }}
                                            />
                                            <p className="mt-2 text-sm font-semibold">
                                                {gallery.photo_count} média
                                                {gallery.photo_count > 1
                                                    ? 's'
                                                    : ''}{' '}
                                                en galerie privée
                                            </p>

                                            {!gallery.viewer_accepts_naughty ? (
                                                <p
                                                    className="mt-1 text-xs"
                                                    style={{
                                                        color: 'var(--ink-mute)',
                                                    }}
                                                >
                                                    Activez le mode coquin dans
                                                    votre profil pour pouvoir y
                                                    accéder.
                                                </p>
                                            ) : gallery.request_status ===
                                              'pending' ? (
                                                <p
                                                    className="mt-1 text-xs"
                                                    style={{
                                                        color: 'var(--ink-mute)',
                                                    }}
                                                >
                                                    Demande envoyée — en attente
                                                    de réponse.
                                                </p>
                                            ) : gallery.request_status ===
                                              'rejected' ? (
                                                <p
                                                    className="mt-1 text-xs"
                                                    style={{
                                                        color: 'var(--ink-mute)',
                                                    }}
                                                >
                                                    Votre demande a été refusée.
                                                </p>
                                            ) : (
                                                <>
                                                    <p
                                                        className="mt-1 text-xs"
                                                        style={{
                                                            color: 'var(--ink-mute)',
                                                        }}
                                                    >
                                                        Demandez l&apos;accès
                                                        pour voir ces photos.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            requestingAccess
                                                        }
                                                        onClick={
                                                            handleRequestGalleryAccess
                                                        }
                                                        className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-foreground/15 px-4 py-2 text-sm font-semibold transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
                                                    >
                                                        <Lock className="h-3.5 w-3.5" />
                                                        {requestingAccess
                                                            ? 'Envoi...'
                                                            : "Demander l'accès"}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
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
                                className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-40"
                                style={{
                                    background:
                                        'radial-gradient(circle, var(--desire) 0%, transparent 65%)',
                                }}
                            />
                            <div className="relative">
                                <div className="editorial-eyebrow mb-3 opacity-60">
                                    Avant d&apos;écrire
                                </div>
                                <p className="font-display text-xl leading-snug font-medium italic">
                                    Sois honnête, sois douce.
                                    <br />
                                    Sois toi.
                                </p>
                                <p className="mt-3 text-xs leading-relaxed opacity-80">
                                    LesbiLibre est un espace safe. Tout
                                    comportement inapproprié peut être signalé
                                    en un clic.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===========================================
                 * BLOCK DIALOG
                 * =========================================*/}
                <Dialog
                    open={blockDialogOpen}
                    onOpenChange={setBlockDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-display text-2xl font-medium italic">
                                Bloquer {user.name} ?
                            </DialogTitle>
                            <DialogDescription>
                                Cette personne ne pourra plus voir ton profil,
                                t&apos;envoyer de messages ou interagir avec
                                toi. Tu peux annuler depuis tes paramètres.
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
                                {processingBlock && (
                                    <Spinner className="h-4 w-4" />
                                )}
                                Bloquer
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DatingLayout>
    );
}

type MediaKind = 'photo' | 'video';

function ProfileMediaGallery({
    media,
    userName,
}: {
    media: Photo[];
    userName: string;
}): JSX.Element {
    const photoMedia = media.filter((item) => item.media_type !== 'video');
    const videoMedia = media.filter((item) => item.media_type === 'video');
    const initialTab: MediaKind = photoMedia.length > 0 ? 'photo' : 'video';
    const [activeTab, setActiveTab] = useState<MediaKind>(initialTab);
    const [activeMediaId, setActiveMediaId] = useState<number | null>(null);

    const activeItems = activeTab === 'photo' ? photoMedia : videoMedia;
    const activeIndex = activeItems.findIndex(
        (item) => item.id === activeMediaId,
    );
    const activeMedia = activeIndex >= 0 ? activeItems[activeIndex] : null;

    const openMedia = (item: Photo, kind: MediaKind) => {
        if (item.is_blurred) {
            return;
        }

        setActiveTab(kind);
        setActiveMediaId(item.id);
    };

    const showPrevious = () => {
        if (activeItems.length < 2) {
            return;
        }

        const previousIndex =
            (activeIndex - 1 + activeItems.length) % activeItems.length;
        setActiveMediaId(activeItems[previousIndex].id);
    };

    const showNext = () => {
        if (activeItems.length < 2) {
            return;
        }

        const nextIndex = (activeIndex + 1) % activeItems.length;
        setActiveMediaId(activeItems[nextIndex].id);
    };

    const renderGrid = (items: Photo[], kind: MediaKind) => {
        if (items.length === 0) {
            return (
                <div className="rounded-xl border border-dashed border-foreground/15 px-4 py-8 text-center">
                    {kind === 'photo' ? (
                        <Camera className="mx-auto h-5 w-5 text-foreground/35" />
                    ) : (
                        <Video className="mx-auto h-5 w-5 text-foreground/35" />
                    )}
                    <p className="mt-2 text-xs text-foreground/50">
                        Aucune {kind === 'photo' ? 'photo' : 'vidéo'} publiée.
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 gap-2">
                {items.map((item) => {
                    const isVideo = item.media_type === 'video';

                    return (
                        <button
                            key={item.id}
                            type="button"
                            disabled={item.is_blurred}
                            onClick={() => openMedia(item, kind)}
                            onContextMenu={(event) => event.preventDefault()}
                            aria-label={
                                item.is_blurred
                                    ? 'Média privé verrouillé'
                                    : `Ouvrir ${isVideo ? 'la vidéo' : 'la photo'} de ${userName}`
                            }
                            className="reveal-tile group relative aspect-square overflow-hidden rounded-lg border text-left focus-visible:ring-2 focus-visible:ring-[color:var(--desire)] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed"
                            style={{ borderColor: 'var(--line)' }}
                        >
                            <img
                                src={isVideo ? `${item.url}?thumb=1` : item.url}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                draggable={false}
                                className="reveal-bg h-full w-full object-cover transition-transform duration-300 select-none group-enabled:group-hover:scale-[1.03]"
                            />

                            {isVideo && !item.is_blurred && (
                                <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/10 transition-colors group-hover:bg-black/20">
                                    <span className="grid h-11 w-11 place-items-center rounded-full border border-white/60 bg-black/55 text-white shadow-lg backdrop-blur-sm">
                                        <Play className="ml-0.5 h-5 w-5 fill-current" />
                                    </span>
                                </span>
                            )}

                            {item.is_blurred && (
                                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[oklch(28%_0.12_15_/_0.82)] text-center">
                                    <Lock className="h-5 w-5 text-white" />
                                    <span className="px-2 text-[11px] font-semibold tracking-wide text-white uppercase">
                                        Contenu coquin
                                    </span>
                                    <span className="px-2 text-[10px] text-white/80">
                                        Galerie privée
                                    </span>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as MediaKind)}
            >
                <TabsList className="mb-3 grid h-auto w-full grid-cols-2 rounded-xl bg-muted/70 p-1">
                    <TabsTrigger
                        value="photo"
                        className="gap-2 rounded-lg py-2 text-xs data-[state=active]:text-[color:var(--wine-deep)]"
                    >
                        <Camera className="h-3.5 w-3.5" />
                        Photos
                        <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px]">
                            {photoMedia.length}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="video"
                        className="gap-2 rounded-lg py-2 text-xs data-[state=active]:text-[color:var(--wine-deep)]"
                    >
                        <Video className="h-3.5 w-3.5" />
                        Vidéos
                        <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px]">
                            {videoMedia.length}
                        </span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="photo" className="mt-0">
                    {renderGrid(photoMedia, 'photo')}
                </TabsContent>
                <TabsContent value="video" className="mt-0">
                    {renderGrid(videoMedia, 'video')}
                </TabsContent>
            </Tabs>

            <Dialog
                open={activeMedia !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActiveMediaId(null);
                    }
                }}
            >
                <DialogContent
                    className="h-[min(90vh,900px)] max-w-[min(94vw,1200px)] gap-0 overflow-hidden border-white/10 bg-black p-0 text-white shadow-2xl"
                    onKeyDown={(event) => {
                        if (event.key === 'ArrowLeft') {
                            event.preventDefault();
                            showPrevious();
                        }

                        if (event.key === 'ArrowRight') {
                            event.preventDefault();
                            showNext();
                        }
                    }}
                    onContextMenu={(event) => event.preventDefault()}
                >
                    <DialogTitle className="sr-only">
                        {activeTab === 'video' ? 'Vidéo' : 'Photo'} de{' '}
                        {userName}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Utilisez les flèches gauche et droite pour parcourir les
                        médias.
                    </DialogDescription>

                    {activeMedia && (
                        <div className="relative flex h-full min-h-0 items-center justify-center bg-black">
                            {activeMedia.media_type === 'video' ? (
                                <video
                                    key={activeMedia.id}
                                    src={activeMedia.url}
                                    poster={`${activeMedia.url}?thumb=1`}
                                    controls
                                    autoPlay
                                    playsInline
                                    preload="metadata"
                                    controlsList="nodownload"
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <img
                                    src={activeMedia.url}
                                    alt={`${userName} — photo ${activeIndex + 1} sur ${activeItems.length}`}
                                    draggable={false}
                                    className="h-full w-full object-contain select-none"
                                />
                            )}

                            {activeItems.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={showPrevious}
                                        aria-label="Média précédent"
                                        className="absolute left-3 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={showNext}
                                        aria-label="Média suivant"
                                        className="absolute right-3 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </>
                            )}

                            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                {activeIndex + 1} / {activeItems.length}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
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
                <div className="editorial-caption text-foreground/55">
                    {label}
                </div>
                <div className="mt-0.5 font-medium text-foreground">
                    {value}
                </div>
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
                className="font-display text-5xl leading-none font-medium italic select-none"
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
                    <div className="font-display text-5xl leading-none font-medium text-[color:var(--wine-deep)] italic">
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
                        Compatibilité émotionnelle, musicale et centres
                        d&apos;intérêt
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
                aria-label={
                    hasLiked
                        ? `Retirer ton like de ${userName}`
                        : `Aimer ${userName}`
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all sm:min-w-[180px] sm:flex-initial"
                style={{
                    background: hasLiked ? 'var(--wine)' : 'var(--desire)',
                }}
            >
                {processingLike ? (
                    <Spinner className="h-4 w-4" />
                ) : (
                    <Heart
                        className={`h-4 w-4 ${hasLiked ? 'animate-heartbeat fill-current' : ''}`}
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
