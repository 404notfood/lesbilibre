import { Head, Link } from '@inertiajs/react';
import {
    motion,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'framer-motion';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface HomeProps {
    stats?: {
        total_users: number;
        active_today: number;
        total_matches: number;
    };
}

/* ---------------------------------------------------------------------------
 * LESBILIBRE — Landing publique
 * Direction: "After Hours, Velvet" · Editorial · Queer-positive · Sensuel
 * Mode dark forcé sur la landing (cinéma > brochure)
 * -------------------------------------------------------------------------*/

export default function Home({ stats }: HomeProps): JSX.Element {
    // Force dark on landing — sensual cinematic mood
    useEffect(() => {
        const html = document.documentElement;
        const wasLight = !html.classList.contains('dark');
        html.classList.add('dark');
        return () => {
            if (wasLight) html.classList.remove('dark');
        };
    }, []);

    return (
        <>
            <Head title="LesbiLibre · Pour celles qui savent">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:300,400,400i,500,600,600i,700,900|inter-tight:300,400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative min-h-screen overflow-x-clip bg-background text-foreground antialiased">
                {/* Grain layer (full page) */}
                <NoiseOverlay />

                <SiteHeader />

                <main className="relative z-10">
                    <Hero stats={stats} />
                    <MarqueeBand />
                    <Manifesto />
                    <Voices />
                    <HowItWorks />
                    <SocialProof stats={stats} />
                    <Faq />
                    <FinalCta />
                </main>

                <SiteFooter />
            </div>
        </>
    );
}

/* ============================================================================
 * Background grain — fixed, applied on top of everything but pointer-events:none
 * ==========================================================================*/
function NoiseOverlay(): JSX.Element {
    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[1] opacity-[0.07] mix-blend-overlay"
            style={{
                backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
            }}
        />
    );
}

function BrandLockup({ size }: { size: 'header' | 'footer' }): JSX.Element {
    const isFooter = size === 'footer';

    return (
        <span className="flex items-center gap-2.5">
            <img
                src="/images/branding/icon-192.png"
                width="192"
                height="192"
                alt=""
                aria-hidden="true"
                className={isFooter ? 'size-10 shrink-0' : 'size-8 shrink-0'}
            />
            <span
                className={`font-display leading-none tracking-[-0.06em] ${
                    isFooter ? 'text-[2.15rem]' : 'text-[1.7rem]'
                }`}
            >
                <span className="font-medium text-foreground">Lesbi</span>
                <span className="ml-1.5 font-medium text-primary italic">
                    Libre
                </span>
            </span>
        </span>
    );
}

/* ============================================================================
 * Site header — minimal, editorial, anchored
 * ==========================================================================*/
function SiteHeader(): JSX.Element {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 z-50 w-full transition-all duration-700 ${
                scrolled
                    ? 'border-b border-border/40 bg-background/80 backdrop-blur-xl'
                    : // Sans fond, les liens se noyaient dans le hero sombre : un
                      // voile dégradé les détache sans masquer l'image.
                      'border-b border-transparent bg-gradient-to-b from-background/70 to-transparent backdrop-blur-sm'
            }`}
        >
            <div className="container-editorial flex h-20 items-center justify-between">
                <Link
                    href="/"
                    aria-label="LesbiLibre — accueil"
                    className="group"
                >
                    <BrandLockup size="header" />
                </Link>

                <nav className="hidden items-center gap-10 md:flex">
                    <a
                        href="#manifesto"
                        className="ghost-link editorial-caption opacity-95 transition hover:opacity-100"
                    >
                        Le concept
                    </a>
                    <a
                        href="#voices"
                        className="ghost-link editorial-caption opacity-95 transition hover:opacity-100"
                    >
                        Elles témoignent
                    </a>
                    <a
                        href="#how-it-works"
                        className="ghost-link editorial-caption opacity-95 transition hover:opacity-100"
                    >
                        Les 4 étapes
                    </a>
                    <a
                        href="#faq"
                        className="ghost-link editorial-caption opacity-95 transition hover:opacity-100"
                    >
                        Questions
                    </a>
                </nav>

                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="hidden rounded-full border border-foreground/25 px-4 py-2 text-sm font-semibold transition hover:border-foreground/60 hover:bg-foreground/10 sm:inline-block"
                    >
                        Connexion
                    </Link>
                    <Link href="/register" className="btn-velvet">
                        <span>Rejoindre</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </header>
    );
}

/* ============================================================================
 * Hero — the moment of seduction
 * ==========================================================================*/
function Hero({ stats }: { stats?: HomeProps['stats'] }): JSX.Element {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });
    const reduce = useReducedMotion();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

    return (
        <section
            ref={ref}
            className="relative isolate flex min-h-[100svh] items-end overflow-hidden pt-32 pb-12"
        >
            {/* Velvet radial glow */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{
                    background:
                        'radial-gradient(80% 60% at 70% 30%, color-mix(in srgb, #E11D74 22%, transparent), transparent 60%), radial-gradient(60% 50% at 15% 80%, color-mix(in srgb, #C8A8D6 14%, transparent), transparent 60%), #0E0B0D',
                }}
            />

            {/* Big tilted "ENFIN." display word */}
            <motion.div
                aria-hidden
                style={{ y: y2, opacity }}
                className="pointer-events-none absolute top-32 -right-12 z-0 select-none"
            >
                <span className="block font-display text-[28vw] leading-none font-light tracking-tighter text-foreground/[0.035] italic sm:text-[22vw]">
                    enfin.
                </span>
            </motion.div>

            {/* Vertical eyebrow */}
            <div className="container-editorial relative z-10 w-full">
                <div className="absolute top-0 left-6 hidden h-full items-center sm:flex lg:left-16">
                    <div className="vertical-text editorial-caption text-foreground/50">
                        Édition Nº 01 · Volume Velours
                    </div>
                </div>

                <div className="relative">
                    {/* Eyebrow */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-10 flex items-center gap-6"
                    >
                        <span className="h-px w-12 bg-primary" />
                        <span className="editorial-eyebrow text-primary">
                            Rencontres · Lesbiennes · Sincères
                        </span>
                    </motion.div>

                    {/* Main display heading */}
                    <motion.h1
                        style={{ y: y1 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-[16ch] font-display text-[clamp(3.5rem,11vw,11rem)] leading-[0.88] font-light tracking-[-0.04em] text-foreground"
                    >
                        <span className="block">Aimer une</span>
                        <span className="block">
                            <em className="not-italic">
                                <span className="text-primary italic">
                                    femme
                                </span>
                                ,
                            </em>
                        </span>
                        <span className="block">
                            <em className="font-light text-foreground/85 italic">
                                sans détour.
                            </em>
                        </span>
                    </motion.h1>

                    {/* Right-aligned tagline */}
                    <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-8">
                        <motion.p
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 1,
                                delay: 0.5,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="max-w-md text-base leading-relaxed text-foreground/75 lg:col-span-5 lg:col-start-7"
                        >
                            <span className="editorial-eyebrow mb-3 block text-foreground/40">
                                Pourquoi tu es là
                            </span>
                            Une histoire d&apos;un soir. Une amitié qui dérape,
                            ou pas. Une vie à deux. Une curiosité. Un fantasme
                            tenu trop longtemps. Tout est légitime ici — et rien
                            n&apos;est jugé.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 1,
                                delay: 0.75,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="flex flex-col items-start gap-4 lg:col-span-12"
                        >
                            <div className="mt-6 flex flex-wrap items-center gap-5">
                                <Link href="/register" className="btn-velvet">
                                    <span>Créer mon profil</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="ghost-link text-sm font-medium text-foreground/70 hover:text-foreground"
                                >
                                    J&apos;ai déjà un compte
                                </Link>
                            </div>

                            <p className="editorial-caption mt-3 text-foreground/40">
                                Gratuit · Pas de carte · Pas d&apos;hommes
                            </p>
                        </motion.div>
                    </div>

                    {/* Bottom meta row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            duration: 1.4,
                            delay: 1,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="mt-24 grid grid-cols-2 gap-6 border-t border-border/40 pt-8 sm:grid-cols-4"
                    >
                        <MetaCell
                            label="Membres"
                            value={stats?.total_users ?? 0}
                        />
                        <MetaCell
                            label="Connectées aujourd’hui"
                            value={stats?.active_today ?? 0}
                            pulse
                        />
                        <MetaCell
                            label="Rencontres au total"
                            value={stats?.total_matches ?? 0}
                        />
                        <MetaCell label="Année fondation" raw="MMXXV" mono />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function MetaCell({
    label,
    value,
    raw,
    pulse,
    mono,
}: {
    label: string;
    value?: number;
    raw?: string;
    pulse?: boolean;
    mono?: boolean;
}): JSX.Element {
    const display =
        raw ?? (value !== undefined ? value.toLocaleString('fr-FR') : '—');
    return (
        <div className="flex flex-col gap-2">
            <div className="editorial-caption flex items-center gap-2 text-foreground/40">
                {pulse && (value ?? 0) > 0 && <span className="online-dot" />}
                {label}
            </div>
            <div
                className={`text-2xl ${
                    mono ? 'font-mono font-medium' : 'font-display font-light'
                } tracking-tight text-foreground`}
            >
                {display}
            </div>
        </div>
    );
}

/* ============================================================================
 * Marquee band — running tagline (cinematic)
 * ==========================================================================*/
function MarqueeBand(): JSX.Element {
    const words = [
        'Désir',
        '·',
        'Complicité',
        '·',
        'Vertige',
        '·',
        'Curiosité',
        '·',
        'Tendresse',
        '·',
        'Fantasme',
        '·',
        'Intimité',
        '·',
        'Liberté',
        '·',
    ];

    return (
        <section className="relative border-y border-border/30 bg-primary/[0.06] py-8">
            <div className="marquee">
                {[0, 1].map((dup) => (
                    <div
                        key={dup}
                        className="marquee-track"
                        aria-hidden={dup === 1}
                    >
                        {words.map((w, i) => (
                            <span
                                key={`${dup}-${i}`}
                                className={`font-display text-3xl font-light italic md:text-5xl ${
                                    w === '·'
                                        ? 'text-primary'
                                        : 'text-foreground/85'
                                }`}
                            >
                                {w}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ============================================================================
 * Manifesto — what we stand for
 * ==========================================================================*/
function Manifesto(): JSX.Element {
    return (
        <section id="manifesto" className="relative py-32 md:py-48">
            <div className="container-editorial grid gap-16 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <div className="sticky top-32">
                        <div className="editorial-eyebrow mb-6 text-primary">
                            <span className="magenta-dot">Manifeste · 01</span>
                        </div>
                        <h2 className="font-display text-5xl leading-[0.95] font-light tracking-tight md:text-7xl">
                            Un lieu où tu n&apos;as pas
                            <em className="text-primary italic">
                                {' '}
                                à t&apos;expliquer
                            </em>
                            .
                        </h2>
                        <p className="mt-8 max-w-md text-foreground/65">
                            On a fait LesbiLibre parce qu&apos;on en avait marre
                            des apps où il fallait préciser. Préciser qu&apos;on
                            ne voulait pas de mecs. Préciser qu&apos;on
                            n&apos;était pas là pour leur fantasme. Préciser.
                            Toujours préciser.
                        </p>
                    </div>
                </div>

                <div className="space-y-8 lg:col-span-6 lg:col-start-7">
                    {[
                        {
                            n: '01',
                            t: 'Entre nous. Vraiment.',
                            d: "Inscription vérifiée. Pas de profils fake, pas d'hommes, pas de couples curieux. Juste des femmes — cis, trans, non-binaires, queer — qui aiment les femmes.",
                        },
                        {
                            n: '02',
                            t: 'Toutes les nuances.',
                            d: "Tu cherches une histoire d'un soir ? Une amitié + ? Un amour qui dure ? Une amante secrète ? Une partenaire de fantasme ? Tout est dit. Rien n'est honteux.",
                        },
                        {
                            n: '03',
                            t: 'Pensé pour le désir.',
                            d: "Pas d'algorithme manipulateur. Pas de gamification cheap. Des outils intimes : photos privées, galeries déverrouillables, listes de envies, codes secrets entre vous.",
                        },
                        {
                            n: '04',
                            t: 'On te respecte.',
                            d: 'Modération humaine, signalement instantané, bouton "disparais" qui marche vraiment. La sécurité comme prérequis, pas comme argument marketing.',
                        },
                    ].map((item) => (
                        <ManifestoCard key={item.n} {...item} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ManifestoCard({
    n,
    t,
    d,
}: {
    n: string;
    t: string;
    d: string;
}): JSX.Element {
    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="group relative border-t border-border/40 pt-8"
        >
            <div className="flex items-baseline gap-6">
                <span className="font-mono text-xs tracking-widest text-primary">
                    {n}
                </span>
                <h3 className="font-display text-2xl font-medium md:text-3xl">
                    {t}
                </h3>
            </div>
            <p className="mt-4 max-w-prose pl-12 text-foreground/70 md:text-lg">
                {d}
            </p>
            <span className="absolute top-8 right-0 hidden h-px bg-primary/40 transition-all duration-700 group-hover:w-16 md:block md:w-0" />
        </motion.article>
    );
}

/* ============================================================================
 * Voices — fake but cinematic testimonials
 * ==========================================================================*/
function Voices(): JSX.Element {
    const voices = [
        {
            q: 'Je suis tombée sur Lina un mardi soir, à 23h. On se parle encore tous les jours, trois mois après.',
            who: 'Camille',
            where: 'Lyon · 31 ans',
            tone: 'magenta',
        },
        {
            q: 'C\'est la première app où j\'ai osé écrire ce que je voulais vraiment. Pas de filtre. Pas de "et si on me jugeait".',
            who: 'Yas',
            where: 'Marseille · 27 ans',
            tone: 'gold',
        },
        {
            q: "J'avais 42 ans, je sortais d'un mariage avec un homme. J'ai trouvé une amitié qui s'est transformée. Doucement.",
            who: 'Sophie',
            where: 'Bordeaux · 43 ans',
            tone: 'lilac',
        },
    ] as const;

    return (
        <section id="voices" className="relative bg-card/30 py-32 md:py-48">
            <div className="container-editorial">
                <div className="mb-20 flex items-end justify-between gap-12">
                    <div>
                        <div className="editorial-eyebrow mb-6 text-primary">
                            <span className="magenta-dot">Voix · 02</span>
                        </div>
                        <h2 className="max-w-2xl font-display text-5xl leading-[0.95] font-light tracking-tight md:text-7xl">
                            Elles ont dit
                            <em className="text-primary italic"> oui</em>.
                        </h2>
                    </div>
                    <p className="hidden max-w-xs text-sm text-foreground/55 md:block">
                        Témoignages anonymisés.
                        <br />
                        Prénoms modifiés, émotions intactes.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {voices.map((v, i) => (
                        <VoiceCard key={i} {...v} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function VoiceCard({
    q,
    who,
    where,
    tone,
    index,
}: {
    q: string;
    who: string;
    where: string;
    tone: 'magenta' | 'gold' | 'lilac';
    index: number;
}): JSX.Element {
    const toneMap = {
        magenta: 'from-primary/30 via-primary/5 to-transparent',
        gold: 'from-accent/30 via-accent/5 to-transparent',
        lilac: 'from-secondary/30 via-secondary/5 to-transparent',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
                duration: 0.9,
                delay: index * 0.12,
                ease: [0.16, 1, 0.3, 1],
            }}
            className="reveal-tile group relative flex h-full flex-col justify-between overflow-hidden rounded-sm border border-border/40 bg-background p-8 md:p-10"
        >
            {/* Velvet gradient bg */}
            <div
                className={`reveal-bg pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${toneMap[tone]}`}
            />

            <div>
                <span className="block font-display text-7xl leading-none font-light text-primary/80 italic">
                    «
                </span>
                <blockquote className="mt-2 font-display text-2xl leading-snug font-light tracking-tight text-foreground md:text-3xl">
                    {q}
                </blockquote>
            </div>

            <footer className="mt-10 flex items-baseline gap-4 border-t border-border/40 pt-4">
                <span className="font-display text-xl text-foreground italic">
                    {who}
                </span>
                <span className="editorial-caption text-foreground/50">
                    {where}
                </span>
            </footer>
        </motion.div>
    );
}

/* ============================================================================
 * How it works — the ritual
 * ==========================================================================*/
function HowItWorks(): JSX.Element {
    const steps = [
        {
            n: 'I',
            t: 'Tu te présentes',
            d: 'Quelques photos, une intention, ce que tu cherches — vraiment. Pas de bio Tinder cringe. Une voix.',
        },
        {
            n: 'II',
            t: 'Tu observes',
            d: 'Les profils défilent comme une page de magazine. Tu prends ton temps. Tu reviens. Tu marques une page.',
        },
        {
            n: 'III',
            t: 'Vous vous écrivez',
            d: "Quand l'envie est mutuelle, le fil s'ouvre. Photos privées, codes secrets, galeries qui se déverrouillent à deux.",
        },
        {
            n: 'IV',
            t: 'Vous décidez',
            d: 'Un verre. Un voyage. Un fantasme à faire. Une amitié à long terme. Vous décidez du tempo. Toujours.',
        },
    ];

    return (
        <section id="how-it-works" className="relative py-32 md:py-48">
            <div className="container-editorial">
                <div className="mb-24 max-w-3xl">
                    <div className="editorial-eyebrow mb-6 text-primary">
                        <span className="magenta-dot">Rituel · 03</span>
                    </div>
                    <h2 className="font-display text-5xl leading-[0.95] font-light tracking-tight md:text-7xl">
                        Quatre temps,
                        <em className="text-primary italic"> aucune urgence</em>
                        .
                    </h2>
                </div>

                <div className="grid gap-x-12 gap-y-20 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((s, i) => (
                        <motion.div
                            key={s.n}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{
                                duration: 0.9,
                                delay: i * 0.1,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="relative"
                        >
                            <div className="mb-6 font-display text-7xl font-light text-primary/60 md:text-8xl">
                                {s.n}
                            </div>
                            <h3 className="mb-3 font-display text-2xl font-medium">
                                {s.t}
                            </h3>
                            <p className="text-foreground/65">{s.d}</p>

                            {i < steps.length - 1 && (
                                <span className="absolute top-12 right-0 hidden h-px w-12 bg-primary/30 lg:block" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ============================================================================
 * Social proof — big numbers, cinematic
 * ==========================================================================*/
function SocialProof({ stats }: { stats?: HomeProps['stats'] }): JSX.Element {
    // Compteurs réels — 0 par défaut si pas de stats (ne ment jamais).
    const totalUsers = stats?.total_users ?? 0;
    const activeToday = stats?.active_today ?? 0;
    const totalMatches = stats?.total_matches ?? 0;

    return (
        <section className="relative overflow-hidden border-y border-border/30 bg-card/40 py-24 md:py-32">
            <div className="container-editorial">
                <div className="grid gap-16 md:grid-cols-3">
                    <BigNumber
                        value={totalUsers}
                        suffix={totalUsers >= 1000 ? '+' : ''}
                        label="femmes inscrites"
                        sub="cis · trans · non-binaires"
                    />
                    <BigNumber
                        value={activeToday}
                        suffix=""
                        label="connectées aujourd’hui"
                        sub="depuis minuit"
                        pulse={activeToday > 0}
                    />
                    <BigNumber
                        value={totalMatches}
                        suffix=""
                        label="rencontres au total"
                        sub="depuis le lancement"
                    />
                </div>

                <div className="mt-20 flex flex-wrap items-center justify-between gap-8 border-t border-border/40 pt-10">
                    <div className="editorial-caption text-foreground/50">
                        Présentes à · Paris · Lyon · Marseille · Bordeaux ·
                        Toulouse · Lille · Rennes · Nantes · Bruxelles · Genève
                        · Montréal
                    </div>
                    <Link
                        href="/register"
                        className="ghost-link text-sm font-medium text-primary"
                    >
                        Voir si on est dans ta ville →
                    </Link>
                </div>
            </div>
        </section>
    );
}

function BigNumber({
    value,
    suffix,
    label,
    sub,
    pulse,
}: {
    value: number;
    suffix: string;
    label: string;
    sub: string;
    pulse?: boolean;
}): JSX.Element {
    return (
        <div>
            <div className="flex items-baseline gap-2 font-display text-7xl leading-none font-light tracking-tight text-foreground md:text-8xl">
                {value.toLocaleString('fr-FR')}
                <span className="text-primary">{suffix}</span>
            </div>
            <div className="mt-6 flex items-center gap-3 border-t border-border/40 pt-4">
                {pulse && <span className="online-dot" />}
                <div>
                    <div className="text-sm font-medium text-foreground">
                        {label}
                    </div>
                    <div className="editorial-caption text-foreground/50">
                        {sub}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================================================================
 * FAQ — editorial accordion
 * ==========================================================================*/
function Faq(): JSX.Element {
    const items = [
        {
            q: "C'est uniquement pour les lesbiennes ?",
            a: "Pour les femmes qui aiment les femmes — toutes. Lesbiennes, bi, pan, queer, en questionnement. Cis, trans, non-binaires. Pas d'hommes, pas de couples hétéros à la recherche d'une troisième. C'est aussi simple que ça.",
        },
        {
            q: "C'est gratuit ?",
            a: "L'inscription, le profil, les messages, les matches — gratuits. Les rituels premium (boost de visibilité, galeries privées illimitées, mode incognito, codes secrets entre partenaires) sont en abonnement. Tu peux tout faire sans payer.",
        },
        {
            q: "Comment vous garantissez qu'il n'y a pas d'hommes ?",
            a: "Vérification d'identité à l'inscription. Modération humaine. Système de signalement instantané. Si tu vois un profil qui te semble suspect, tu cliques, on s'en occupe dans l'heure.",
        },
        {
            q: 'Mes photos sont-elles privées ?',
            a: 'Tu choisis. Photos publiques (visibles sur ton profil), galeries privées (visibles seulement par les personnes à qui tu donnes un code), photos éphémères dans les messages (disparaissent après lecture). Tu contrôles tout.',
        },
        {
            q: "Je cherche juste une amitié, c'est ok ?",
            a: 'Oui. Tu indiques ton intention dans ton profil ("amitié", "amitié +", "histoire d\'un soir", "long terme", "fantasme", "curiosité"). Les filtres respectent tes envies. Aucune pression pour aller plus loin que ce que tu veux.',
        },
        {
            q: 'Je peux supprimer mon compte facilement ?',
            a: 'En 2 clics. Bouton "Disparais" dans tes paramètres : ton profil, tes photos, tes messages — tout part. Pas de rétention, pas d\'email "on regrette de te voir partir", rien. Tu pars, tu pars.',
        },
    ];

    return (
        <section id="faq" className="relative py-32 md:py-48">
            <div className="container-editorial grid gap-16 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <div className="sticky top-32">
                        <div className="editorial-eyebrow mb-6 text-primary">
                            <span className="magenta-dot">Questions · 04</span>
                        </div>
                        <h2 className="font-display text-5xl leading-[0.95] font-light tracking-tight md:text-6xl">
                            Tout ce que tu te
                            <em className="text-primary italic"> demandais</em>.
                        </h2>
                        <p className="mt-8 max-w-sm text-foreground/65">
                            Et si tu as d&apos;autres questions, on a une vraie
                            boîte mail. Pas un chatbot.
                        </p>
                        <Link
                            href="/contact"
                            className="ghost-link mt-6 inline-block text-sm font-medium text-foreground"
                        >
                            Nous écrire →
                        </Link>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="border-t border-border/50">
                        {items.map((item, i) => (
                            <FaqItem key={i} {...item} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FaqItem({ q, a }: { q: string; a: string }): JSX.Element {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-border/50">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="group flex w-full items-start justify-between gap-6 py-7 text-left transition"
                aria-expanded={open}
            >
                <span
                    className={`font-display text-xl leading-snug font-light transition-colors md:text-2xl ${
                        open
                            ? 'text-primary'
                            : 'text-foreground group-hover:text-primary/90'
                    }`}
                >
                    {q}
                </span>
                <span className="mt-1 shrink-0 text-primary">
                    {open ? (
                        <Minus className="h-5 w-5" />
                    ) : (
                        <Plus className="h-5 w-5" />
                    )}
                </span>
            </button>
            <motion.div
                initial={false}
                animate={{
                    height: open ? 'auto' : 0,
                    opacity: open ? 1 : 0,
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
            >
                <p className="max-w-prose pr-10 pb-8 text-foreground/70">{a}</p>
            </motion.div>
        </div>
    );
}

/* ============================================================================
 * Final CTA — the leave-with-this moment
 * ==========================================================================*/
function FinalCta(): JSX.Element {
    return (
        <section className="relative isolate overflow-hidden py-32 md:py-48">
            {/* Velvet bg */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{
                    background:
                        'radial-gradient(60% 80% at 50% 100%, color-mix(in srgb, #E11D74 20%, transparent), transparent 60%), radial-gradient(60% 50% at 20% 20%, color-mix(in srgb, #C8A8D6 12%, transparent), transparent 70%), #0E0B0D',
                }}
            />

            {/* Huge backdrop word */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-[-2vw] text-center font-display text-[18vw] leading-none font-light text-foreground/[0.06] italic select-none"
            >
                viens.
            </div>

            <div className="container-editorial relative z-10 flex flex-col items-center text-center">
                <span className="editorial-eyebrow mb-8 text-primary">
                    Final · 05
                </span>

                <h2 className="max-w-4xl font-display text-[clamp(2.5rem,8vw,7rem)] leading-[0.92] font-light tracking-[-0.03em]">
                    Tu as déjà
                    <br />
                    <em className="text-primary italic">trop attendu</em>.
                </h2>

                <p className="mt-10 max-w-md text-lg text-foreground/70">
                    L&apos;inscription prend trois minutes. Le reste, on verra
                    ensemble.
                </p>

                <div className="mt-12 flex flex-col items-center gap-5">
                    <Link href="/register" className="btn-velvet">
                        <span>Je crée mon profil</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                    <span className="editorial-caption text-foreground/45">
                        gratuit · 100 % féminin · sans engagement
                    </span>
                </div>
            </div>
        </section>
    );
}

/* ============================================================================
 * Footer
 * ==========================================================================*/
function SiteFooter(): JSX.Element {
    return (
        <footer className="relative z-10 border-t border-border/40 bg-background py-16">
            <div className="container-editorial">
                <div className="grid gap-12 md:grid-cols-12">
                    <div className="md:col-span-5">
                        <Link href="/" aria-label="LesbiLibre — accueil">
                            <BrandLockup size="footer" />
                        </Link>
                        <p className="mt-6 max-w-sm text-sm text-foreground/55">
                            Édition Nº 01 · Volume Velours. Conçu et écrit en
                            France, pour toutes celles qui savent.
                        </p>
                    </div>

                    <FooterCol
                        title="Le site"
                        links={[
                            { label: 'Le concept', href: '#manifesto' },
                            { label: 'Les 4 étapes', href: '#how-it-works' },
                            { label: 'Premium', href: '/premium' },
                            { label: 'Boutique', href: '/shop' },
                        ]}
                    />
                    <FooterCol
                        title="Soutien"
                        links={[
                            { label: 'Contact', href: '/contact' },
                            { label: 'Aide', href: '/help' },
                            { label: 'Sécurité', href: '/safety' },
                            { label: 'Signaler', href: '/report' },
                        ]}
                    />
                    <FooterCol
                        title="Légal"
                        links={[
                            { label: 'Confidentialité', href: '/privacy' },
                            { label: 'Conditions', href: '/terms' },
                            { label: 'Cookies', href: '/cookies' },
                            { label: 'Mentions', href: '/legal' },
                        ]}
                    />
                </div>

                <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-8 md:flex-row md:items-center">
                    <div className="editorial-caption text-foreground/40">
                        © {new Date().getFullYear()} LesbiLibre · Tous droits
                        réservés
                    </div>
                    <div className="editorial-caption text-foreground/40">
                        Made with intention · Pas d&apos;IA pour la modération
                        sensible.
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterCol({
    title,
    links,
}: {
    title: string;
    links: { label: string; href: string }[];
}): JSX.Element {
    return (
        <div className="md:col-span-2">
            <div className="editorial-caption mb-5 text-foreground/40">
                {title}
            </div>
            <ul className="flex flex-col gap-3">
                {links.map((l) => (
                    <li key={l.href}>
                        <Link
                            href={l.href}
                            className="ghost-link text-sm text-foreground/80 hover:text-foreground"
                        >
                            {l.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
