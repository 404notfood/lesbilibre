import { Head, Link } from '@inertiajs/react';
import DatingLayout from '@/layouts/dating-layout';
import {
    BadgeCheck,
    Briefcase,
    Camera,
    GraduationCap,
    Heart,
    Languages,
    MapPin,
    Pencil,
    Users,
} from 'lucide-react';

interface Photo {
    id: number;
    path: string;
    is_primary: boolean;
    is_approved: boolean;
    is_naughty: boolean;
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
    email: string;
    is_verified: boolean;
    profile?: Profile;
    photos: Photo[];
}

/* ---------------------------------------------------------------------------
 * Profile/Show — Mon profil. Direction "Wine Editorial".
 * -------------------------------------------------------------------------*/
export default function Show({ user }: { user: UserData }) {
    const primaryPhoto = user.photos.find((p) => p.is_primary) || user.photos[0];
    const otherPhotos = user.photos.filter((p) => p.id !== primaryPhoto?.id);
    const initials = user.name.slice(0, 2).toUpperCase();

    return (
        <DatingLayout title="Mon profil">
            <Head title="Mon profil" />

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
                    <div>
                        <div className="editorial-eyebrow mb-5 text-foreground/55">
                            <span className="magenta-dot text-[color:var(--desire)]">
                                Mon profil · {user.email}
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
                            {user.is_verified ? (
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
                            ) : (
                                <Link
                                    href="/verification"
                                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
                                    style={{
                                        borderColor: 'var(--line)',
                                        color: 'var(--ink-soft)',
                                    }}
                                >
                                    <BadgeCheck className="h-3.5 w-3.5" />
                                    Vérifier mon profil
                                </Link>
                            )}

                            <Link
                                href="/profile/edit"
                                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-px"
                                style={{ background: 'var(--ink)' }}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Modifier mon profil
                            </Link>
                        </div>
                    </div>

                    {/* Right: Primary photo (compact, top-aligned) */}
                    <div className="flex flex-col gap-3">
                        <div
                            className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border shadow-[0_20px_50px_-30px_oklch(0%_0_0_/_0.35)]"
                            style={{ borderColor: 'var(--line)' }}
                        >
                            {primaryPhoto ? (
                                <img
                                    src={`/storage/${primaryPhoto.path}`}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <NoPhotoCover initials={initials} />
                            )}
                            <Link
                                href="/photos"
                                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors hover:bg-background"
                                style={{ color: 'var(--wine-deep)' }}
                            >
                                <Camera className="h-3 w-3" />
                                {user.photos.length > 0
                                    ? `${user.photos.length} photo${user.photos.length > 1 ? 's' : ''}`
                                    : 'Ajouter'}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* ===========================================
                 * COMPLETION HINT
                 * =========================================*/}
                <CompletionHint user={user} />

                {/* ===========================================
                 * MAIN GRID
                 * =========================================*/}
                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                    {/* Left col */}
                    <div className="space-y-6 lg:col-span-2">
                        {user.profile?.bio && (
                            <Section eyebrow="À propos de moi" number="01">
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
                                    value={user.profile?.sexual_orientation}
                                />
                                <InfoLine
                                    icon={Users}
                                    label="Statut"
                                    value={user.profile?.relationship_status}
                                />
                                <InfoLine
                                    icon={Briefcase}
                                    label="Profession"
                                    value={user.profile?.occupation}
                                />
                                <InfoLine
                                    icon={GraduationCap}
                                    label="Éducation"
                                    value={user.profile?.education_level}
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

                    {/* Right col */}
                    <div className="space-y-6">
                        <Section eyebrow="Mes photos" number="05">
                            {user.photos.length === 0 ? (
                                <EmptyPhotos />
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        {user.photos.slice(0, 6).map((photo) => (
                                            <div
                                                key={photo.id}
                                                className="reveal-tile relative aspect-square overflow-hidden rounded-lg border"
                                                style={{ borderColor: 'var(--line)' }}
                                            >
                                                <img
                                                    src={`/storage/${photo.path}`}
                                                    alt=""
                                                    className="reveal-bg h-full w-full object-cover"
                                                />
                                                {!photo.is_approved && (
                                                    <div className="absolute inset-0 grid place-items-center bg-black/55 text-[10px] font-medium uppercase tracking-wider text-white">
                                                        En attente
                                                    </div>
                                                )}
                                                {photo.is_primary && (
                                                    <span
                                                        className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
                                                        style={{ background: 'var(--desire)' }}
                                                    >
                                                        Principale
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Link
                                        href="/photos"
                                        className="ghost-link mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
                                        style={{ color: 'var(--desire-deep)' }}
                                    >
                                        <Camera className="h-3.5 w-3.5" />
                                        Gérer mes photos →
                                    </Link>
                                </>
                            )}
                        </Section>

                        {/* Editorial closing */}
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
                                    Conseil
                                </div>
                                <p className="font-display text-xl font-medium italic leading-snug">
                                    Plus tu en dis,
                                    <br />
                                    plus on te trouve.
                                </p>
                                <p className="mt-3 text-xs leading-relaxed opacity-80">
                                    Une bio honnête + 3 photos + tes intérêts = jusqu&apos;à
                                    5× plus de matches.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DatingLayout>
    );
}

/* ===========================================================================
 * CompletionHint
 * ==========================================================================*/
function CompletionHint({ user }: { user: UserData }): JSX.Element | null {
    const checks = [
        { ok: !!user.profile?.bio, label: 'Bio', href: '/profile/edit' },
        { ok: user.photos.length >= 3, label: '3+ photos', href: '/photos' },
        {
            ok: !!user.profile?.occupation,
            label: 'Profession',
            href: '/profile/edit',
        },
        {
            ok: !!user.profile?.interests && user.profile.interests.length > 0,
            label: 'Intérêts',
            href: '/profile/edit',
        },
        { ok: user.is_verified, label: 'Vérification', href: '/verification' },
    ];
    const done = checks.filter((c) => c.ok).length;
    const pct = Math.round((done / checks.length) * 100);
    const nextStep = checks.find((c) => !c.ok);

    if (pct === 100) return null;

    return (
        <div
            className="flex flex-wrap items-center gap-4 rounded-2xl border p-4 lg:gap-8"
            style={{
                borderColor: 'var(--line)',
                background:
                    'linear-gradient(90deg, var(--blush) 0%, var(--paper) 70%)',
            }}
        >
            <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-medium italic text-[color:var(--wine-deep)]">
                    {pct}%
                </span>
                <div>
                    <div className="editorial-caption text-foreground/55">
                        Profil complété
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                        {done} / {checks.length} étapes
                    </div>
                </div>
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-2">
                {checks.map((c) =>
                    c.ok ? (
                        <span
                            key={c.label}
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                            style={{ background: 'var(--desire)', color: 'white' }}
                        >
                            ✓ {c.label}
                        </span>
                    ) : (
                        <Link
                            key={c.label}
                            href={c.href}
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-[color:var(--desire)] hover:text-[color:var(--desire-deep)]"
                            style={{
                                color: 'var(--ink-mute)',
                                border: '1px solid var(--line)',
                            }}
                        >
                            ○ {c.label}
                        </Link>
                    ),
                )}
            </div>
            <Link
                href={nextStep?.href ?? '/profile/edit'}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: 'var(--ink)' }}
            >
                {nextStep ? `Compléter : ${nextStep.label}` : 'Compléter'}
            </Link>
        </div>
    );
}

/* ===========================================================================
 * Section
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
 * NoPhotoCover — gradient + huge initials
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
 * EmptyPhotos
 * ==========================================================================*/
function EmptyPhotos(): JSX.Element {
    return (
        <div
            className="grid place-items-center rounded-xl border-2 border-dashed py-10 text-center"
            style={{ borderColor: 'var(--line)' }}
        >
            <Camera
                className="h-8 w-8 opacity-40"
                style={{ color: 'var(--wine-deep)' }}
            />
            <p className="mt-3 max-w-[180px] text-xs text-foreground/55">
                Une photo, c&apos;est <em className="font-display italic">5× plus de chances</em> d&apos;être vue.
            </p>
            <Link
                href="/photos"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
                style={{ background: 'var(--desire)' }}
            >
                Ajouter
            </Link>
        </div>
    );
}
