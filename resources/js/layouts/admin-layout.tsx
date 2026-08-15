import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    PropsWithChildren,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    ArrowLeft,
    BarChart3,
    ChevronRight,
    FileText,
    Flag,
    Gem,
    Image as ImageIcon,
    LogOut,
    Menu,
    Search,
    Settings as SettingsIcon,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Tags,
    Timer,
    UserCog,
    Users,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FlashToaster } from '@/components/flash-toaster';

/* ===========================================================================
 * AdminLayout — "Console Wine"
 *
 * Backoffice dédié : sidebar sombre persistante (drawer sous lg), header
 * sticky compact avec recherche globale, main éditorial clair.
 * Sensuel par la palette (wine / gold / desire), pro par la densité.
 * =========================================================================*/

interface AdminLayoutProps {
    title?: string;
    /** Sous-titre court (1 phrase) sous le H1. */
    subtitle?: string;
    /** Fil d'ariane simple. Le dernier item est rendu en évidence. */
    breadcrumbs?: { label: string; href?: string }[];
    /** Actions à droite du header (boutons, exports, etc.) */
    actions?: ReactNode;
    /** Masque la recherche globale du header (pages de formulaire). */
    hideSearch?: boolean;
}

interface NavItem {
    href: string;
    label: string;
    icon: typeof Users;
    /** Badge numérique à droite (alertes modération, etc.) */
    badge?: number;
    /** Match approximatif sur l'URL courante */
    matchPrefix?: string;
    /** Aide contextuelle affichée dans la palette de navigation */
    hint?: string;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

interface AdminPageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            is_admin?: boolean;
        };
    };
    /**
     * Compteurs partagés par le middleware HandleInertiaRequests
     * (badges de la sidebar admin si dispo).
     */
    adminAlerts?: {
        pending_photos?: number;
        pending_verifications?: number;
        open_reports?: number;
        flagged_ephemeral?: number;
    };
    [key: string]: unknown;
}

export default function AdminLayout({
    title,
    subtitle,
    breadcrumbs,
    actions,
    hideSearch = false,
    children,
}: PropsWithChildren<AdminLayoutProps>) {
    const { auth, adminAlerts } = usePage<AdminPageProps>().props;
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState('');

    // Évite toute divergence SSR / client : on résout le chemin après montage.
    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    const pendingPhotos = adminAlerts?.pending_photos ?? 0;
    const pendingVerifications = adminAlerts?.pending_verifications ?? 0;
    const openReports = adminAlerts?.open_reports ?? 0;
    const flaggedEphemeral = adminAlerts?.flagged_ephemeral ?? 0;

    const moderationAlerts = pendingPhotos + pendingVerifications + openReports;

    const navGroups: NavGroup[] = useMemo(
        () => [
            {
                label: 'Pilotage',
                items: [
                    {
                        href: '/admin/dashboard',
                        label: "Vue d'ensemble",
                        icon: BarChart3,
                        hint: 'Indicateurs et tendances',
                    },
                    {
                        href: '/admin/users',
                        label: 'Utilisatrices',
                        icon: Users,
                        matchPrefix: '/admin/users',
                        hint: 'Comptes, bans, premium',
                    },
                ],
            },
            {
                label: 'Modération',
                items: [
                    {
                        href: '/admin/moderation',
                        label: 'File de modération',
                        icon: ShieldAlert,
                        badge: moderationAlerts || undefined,
                        matchPrefix: '/admin/moderation',
                        hint: 'Tout ce qui attend une décision',
                    },
                    {
                        href: '/admin/photos/pending',
                        label: 'Photos',
                        icon: ImageIcon,
                        badge: pendingPhotos || undefined,
                        matchPrefix: '/admin/photos',
                        hint: 'Validation des photos',
                    },
                    {
                        href: '/admin/verifications',
                        label: 'Vérifications',
                        icon: ShieldCheck,
                        badge: pendingVerifications || undefined,
                        matchPrefix: '/admin/verifications',
                        hint: 'Selfies de vérification',
                    },
                    {
                        href: '/admin/reports',
                        label: 'Signalements',
                        icon: Flag,
                        badge: openReports || undefined,
                        matchPrefix: '/admin/reports',
                        hint: 'Plaintes des utilisatrices',
                    },
                    {
                        href: '/admin/ephemeral',
                        label: 'Éphémères',
                        icon: Timer,
                        badge: flaggedEphemeral || undefined,
                        matchPrefix: '/admin/ephemeral',
                        hint: 'Médias temporaires signalés',
                    },
                ],
            },
            {
                label: 'Monétisation',
                items: [
                    {
                        href: '/admin/billing',
                        label: 'Offres & tarifs',
                        icon: Tags,
                        matchPrefix: '/admin/billing',
                        hint: 'Plans premium, packs de gemmes',
                    },
                    {
                        href: '/admin/subscriptions',
                        label: 'Abonnées',
                        icon: Gem,
                        matchPrefix: '/admin/subscriptions',
                        hint: 'Abonnements en cours',
                    },
                    {
                        href: '/admin/gems',
                        label: 'Économie gemmes',
                        icon: Sparkles,
                        matchPrefix: '/admin/gems',
                        hint: 'Soldes et transactions',
                    },
                ],
            },
            {
                label: 'Configuration',
                items: [
                    {
                        href: '/admin/static-pages',
                        label: 'Pages statiques',
                        icon: FileText,
                        matchPrefix: '/admin/static-pages',
                        hint: 'CGU, mentions légales…',
                    },
                    {
                        href: '/admin/settings',
                        label: 'Réglages',
                        icon: SettingsIcon,
                        matchPrefix: '/admin/settings',
                        hint: 'Paramètres de la plateforme',
                    },
                ],
            },
        ],
        [
            moderationAlerts,
            pendingPhotos,
            pendingVerifications,
            openReports,
            flaggedEphemeral,
        ],
    );

    const isActive = useCallback(
        (item: NavItem): boolean => {
            const prefix = item.matchPrefix ?? item.href;

            return currentPath === item.href || currentPath.startsWith(prefix + '/');
        },
        [currentPath],
    );

    // Ferme le drawer à chaque navigation Inertia.
    useEffect(() => {
        return router.on('navigate', () => setMobileNavOpen(false));
    }, []);

    // Verrouille le scroll du body tant que le drawer est ouvert.
    useEffect(() => {
        if (!mobileNavOpen) {
            return;
        }

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previous;
        };
    }, [mobileNavOpen]);

    // Échap ferme le drawer, « / » focus la recherche globale.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMobileNavOpen(false);

                return;
            }

            const target = event.target as HTMLElement | null;
            const isTyping =
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement ||
                target?.isContentEditable;

            if (event.key === '/' && !isTyping) {
                const input = document.getElementById('admin-global-search');

                if (input instanceof HTMLInputElement) {
                    event.preventDefault();
                    input.focus();
                    input.select();
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const sidebar = (
        <AdminSidebar
            auth={auth}
            navGroups={navGroups}
            isActive={isActive}
            onNavigate={() => setMobileNavOpen(false)}
        />
    );

    return (
        <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
            {title && <Head title={`Admin · ${title}`} />}

            <div className="flex min-h-screen">
                {/* Sidebar persistante ≥ lg */}
                <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:flex">
                    {sidebar}
                </aside>

                {/* Drawer < lg */}
                {mobileNavOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <button
                            type="button"
                            aria-label="Fermer la navigation"
                            onClick={() => setMobileNavOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <div className="admin-drawer absolute inset-y-0 left-0 flex w-72 max-w-[85vw]">
                            {sidebar}
                            <button
                                type="button"
                                onClick={() => setMobileNavOpen(false)}
                                aria-label="Fermer"
                                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main */}
                <main className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 border-b border-[color:var(--line)] bg-[color:var(--paper)]/85 backdrop-blur-xl">
                        <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
                            {/* Ligne 1 : burger + fil d'ariane + recherche */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMobileNavOpen(true)}
                                    aria-label="Ouvrir la navigation"
                                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[color:var(--line)] text-[color:var(--ink-soft)] transition-colors hover:bg-[color:var(--bg-soft)] lg:hidden"
                                >
                                    <Menu className="h-4 w-4" />
                                </button>

                                {breadcrumbs && breadcrumbs.length > 0 && (
                                    <nav
                                        className="hidden min-w-0 flex-1 flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-mute)] sm:flex"
                                        aria-label="Fil d'ariane"
                                    >
                                        {breadcrumbs.map((bc, index) => {
                                            const isLast = index === breadcrumbs.length - 1;

                                            return (
                                                <span
                                                    key={`${bc.label}-${index}`}
                                                    className="inline-flex items-center gap-1.5"
                                                >
                                                    {bc.href && !isLast ? (
                                                        <Link
                                                            href={bc.href}
                                                            className="transition-colors hover:text-[color:var(--wine-deep)]"
                                                        >
                                                            {bc.label}
                                                        </Link>
                                                    ) : (
                                                        <span
                                                            className={cn(
                                                                isLast &&
                                                                    'font-semibold text-[color:var(--ink)]',
                                                            )}
                                                        >
                                                            {bc.label}
                                                        </span>
                                                    )}
                                                    {!isLast && (
                                                        <ChevronRight className="h-2.5 w-2.5" />
                                                    )}
                                                </span>
                                            );
                                        })}
                                    </nav>
                                )}

                                <div className="ml-auto flex items-center gap-2">
                                    {!hideSearch && <AdminGlobalSearch />}
                                </div>
                            </div>

                            {/* Ligne 2 : titre + actions */}
                            <div className="flex flex-wrap items-end justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    {title && (
                                        <h1 className="font-display text-2xl font-medium leading-tight tracking-tight text-[color:var(--ink)] lg:text-3xl">
                                            {title}
                                        </h1>
                                    )}
                                    {subtitle && (
                                        <p className="mt-1 text-sm text-[color:var(--ink-mute)]">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                {actions && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {actions}
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</div>
                </main>
            </div>

            <Toaster />
            <FlashToaster />
        </div>
    );
}

/* ---------------------------------------------------------------------------
 * Sidebar
 * -------------------------------------------------------------------------*/
function AdminSidebar({
    auth,
    navGroups,
    isActive,
    onNavigate,
}: {
    auth: AdminPageProps['auth'];
    navGroups: NavGroup[];
    isActive: (item: NavItem) => boolean;
    onNavigate: () => void;
}) {
    return (
        <div className="admin-sidebar flex h-full w-full flex-col overflow-y-auto">
            {/* Marque */}
            <div className="px-5 pb-4 pt-6">
                <Link href="/" className="flex items-baseline gap-1.5">
                    <span className="font-display text-2xl font-medium italic text-white">
                        Lesbi
                    </span>
                    <span className="font-display text-2xl font-medium text-[color:var(--gold)]">
                        Libre
                    </span>
                </Link>
                <div className="mt-2 flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded bg-[color:var(--gold)] text-[color:var(--wine-deep)]">
                        <UserCog className="h-3 w-3" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                        Console admin
                    </span>
                </div>
            </div>

            <div className="mx-5 mb-4 h-px bg-white/10" />

            {/* Navigation */}
            <nav className="flex flex-1 flex-col gap-5 px-3">
                {navGroups.map((group) => (
                    <div key={group.label} className="flex flex-col gap-0.5">
                        <div className="px-3 pb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                            {group.label}
                        </div>
                        {group.items.map((item) => (
                            <AdminNavItem
                                key={item.href}
                                item={item}
                                active={isActive(item)}
                                onClick={onNavigate}
                            />
                        ))}
                    </div>
                ))}
            </nav>

            {/* Pied : retour app + compte */}
            <div className="mt-5 border-t border-white/10 p-3">
                <Link
                    href="/dashboard"
                    className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Retour à l&apos;app
                </Link>
                <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.05] px-3 py-2">
                    <div className="font-display grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--gold)] text-sm font-medium italic text-[color:var(--wine-deep)]">
                        {auth.user?.name?.slice(0, 2).toUpperCase() ?? 'AD'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-white">
                            {auth.user?.name}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--gold)]">
                            Administratrice
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Déconnexion"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function AdminNavItem({
    item,
    active,
    onClick,
}: {
    item: NavItem;
    active: boolean;
    onClick: () => void;
}) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            onClick={onClick}
            title={item.hint}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors',
                active
                    ? 'bg-white/[0.09] font-semibold text-[color:var(--gold)]'
                    : 'font-medium text-white/70 hover:bg-white/[0.05] hover:text-white',
            )}
        >
            {active && (
                <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r bg-[color:var(--gold)]"
                />
            )}
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
                <span className="font-mono grid h-5 min-w-[20px] shrink-0 place-items-center rounded-md bg-[color:var(--desire)] px-1.5 text-[10px] font-bold text-white">
                    {item.badge > 99 ? '99+' : item.badge}
                </span>
            )}
        </Link>
    );
}

/* ---------------------------------------------------------------------------
 * Recherche globale — raccourci « / »
 * -------------------------------------------------------------------------*/
function AdminGlobalSearch() {
    const [value, setValue] = useState('');

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (value.trim() === '') {
            return;
        }

        router.get('/admin/users', { search: value.trim() });
    };

    return (
        <form onSubmit={submit} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--ink-mute)]" />
            <input
                id="admin-global-search"
                type="search"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Chercher une utilisatrice…"
                aria-label="Chercher une utilisatrice"
                className="h-9 w-40 rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-soft)] pl-9 pr-9 text-sm text-[color:var(--ink)] outline-none transition-all placeholder:text-[color:var(--ink-mute)] focus:w-56 focus:border-[color:var(--desire)] focus:bg-[color:var(--paper)] sm:w-52 sm:focus:w-72"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-[color:var(--line)] bg-[color:var(--paper)] px-1.5 font-mono text-[10px] text-[color:var(--ink-mute)] sm:block">
                /
            </kbd>
        </form>
    );
}

/* ===========================================================================
 * Primitives partagées par les pages admin
 * =========================================================================*/

/** Carte d'admin standard (bordure fine, fond paper) */
export function AdminCard({
    children,
    className = '',
    padded = true,
}: {
    children: ReactNode;
    className?: string;
    padded?: boolean;
}) {
    return (
        <section
            className={cn(
                'relative overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)]',
                padded && 'p-5',
                className,
            )}
        >
            {children}
        </section>
    );
}

/** En-tête de carte (titre + action à droite) */
export function AdminCardHeader({
    title,
    icon: Icon,
    action,
}: {
    title: string;
    icon?: typeof Users;
    action?: ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--line)] px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-2">
                {Icon && (
                    <Icon className="h-4 w-4 shrink-0 text-[color:var(--wine-deep)]" />
                )}
                <h3 className="font-display truncate text-base font-semibold text-[color:var(--ink)]">
                    {title}
                </h3>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

/** Heading de section avec eyebrow mono + titre Fraunces */
export function AdminSectionTitle({
    eyebrow,
    title,
    right,
}: {
    eyebrow?: string;
    title: string;
    right?: ReactNode;
}) {
    return (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
                {eyebrow && (
                    <div className="editorial-eyebrow mb-1 text-[color:var(--ink-mute)]">
                        {eyebrow}
                    </div>
                )}
                <h2 className="font-display text-xl font-medium leading-tight text-[color:var(--ink)]">
                    {title}
                </h2>
            </div>
            {right && <div className="flex items-center gap-2">{right}</div>}
        </div>
    );
}

export type AdminTone = 'neutral' | 'success' | 'warning' | 'danger' | 'gold' | 'wine';

/** KPI card éditorial (gros chiffre + label + tendance + sparkline optionnelle) */
export function AdminKpi({
    label,
    value,
    delta,
    deltaTone = 'neutral',
    hint,
    icon: Icon,
    href,
    series,
}: {
    label: string;
    value: number | string;
    delta?: string;
    deltaTone?: 'positive' | 'negative' | 'neutral' | 'warning';
    /** Ligne secondaire discrète sous la valeur (contexte, ratio…) */
    hint?: string;
    icon?: typeof Users;
    href?: string;
    /** Série pour la sparkline de fond */
    series?: number[];
}) {
    const deltaClass =
        deltaTone === 'positive'
            ? 'text-[color:var(--success)]'
            : deltaTone === 'negative'
              ? 'text-[color:var(--destructive)]'
              : deltaTone === 'warning'
                ? 'text-[color:var(--desire)]'
                : 'text-[color:var(--ink-mute)]';

    const inner = (
        <>
            {series && series.length > 1 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 opacity-[0.18]">
                    <Sparkline data={series} color="var(--wine)" filled />
                </div>
            )}
            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="editorial-caption mb-1.5 text-[color:var(--ink-mute)]">
                        {label}
                    </div>
                    <div className="font-display text-3xl font-medium tracking-tight text-[color:var(--ink)]">
                        {typeof value === 'number'
                            ? value.toLocaleString('fr-FR')
                            : value}
                    </div>
                    {delta && (
                        <div className={cn('mt-1.5 text-xs font-medium', deltaClass)}>
                            {delta}
                        </div>
                    )}
                    {hint && (
                        <div className="mt-0.5 text-[11px] text-[color:var(--ink-mute)]">
                            {hint}
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--blush)] text-[color:var(--wine-deep)]">
                        <Icon className="h-4 w-4" />
                    </div>
                )}
            </div>
        </>
    );

    const base =
        'relative overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4';

    if (href) {
        return (
            <Link
                href={href}
                className={cn(
                    base,
                    'block transition-all hover:-translate-y-px hover:border-[color:var(--wine)] hover:shadow-sm',
                )}
            >
                {inner}
            </Link>
        );
    }

    return <div className={base}>{inner}</div>;
}

/** Badge admin coloré */
export function AdminBadge({
    children,
    tone = 'neutral',
}: {
    children: ReactNode;
    tone?: AdminTone;
}) {
    const tones: Record<AdminTone, string> = {
        neutral: 'bg-[color:var(--bg-soft)] text-[color:var(--ink-soft)]',
        success: 'bg-[oklch(60%_0.16_160_/_0.15)] text-[oklch(40%_0.16_160)]',
        warning: 'bg-[oklch(80%_0.13_75_/_0.22)] text-[oklch(42%_0.13_75)]',
        danger: 'bg-[oklch(62%_0.19_10_/_0.15)] text-[oklch(52%_0.21_12)]',
        gold: 'bg-[color:var(--gold)] text-[color:var(--wine-deep)]',
        wine: 'bg-[color:var(--wine-deep)] text-white',
    };

    return (
        <span
            className={cn(
                'font-mono inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                tones[tone],
            )}
        >
            {children}
        </span>
    );
}

/** Bouton admin */
export function AdminButton({
    children,
    onClick,
    href,
    method,
    variant = 'default',
    size = 'md',
    icon: Icon,
    disabled,
    type = 'button',
    className = '',
    title,
}: {
    children?: ReactNode;
    onClick?: () => void;
    href?: string;
    method?: 'get' | 'post' | 'put' | 'delete';
    variant?: 'default' | 'primary' | 'wine' | 'gold' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md';
    icon?: typeof Users;
    disabled?: boolean;
    type?: 'button' | 'submit';
    className?: string;
    title?: string;
}) {
    const variants = {
        default:
            'border border-[color:var(--line)] bg-[color:var(--paper)] text-[color:var(--ink)] hover:bg-[color:var(--bg-soft)]',
        primary:
            'bg-[color:var(--ink)] text-[color:var(--bg)] hover:bg-[color:var(--wine-deep)]',
        wine: 'bg-[color:var(--wine-deep)] text-white hover:bg-[color:var(--wine)]',
        gold: 'bg-[color:var(--gold)] text-[color:var(--wine-deep)] hover:brightness-105',
        ghost: 'text-[color:var(--ink-soft)] hover:bg-[color:var(--bg-soft)] hover:text-[color:var(--ink)]',
        danger: 'bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)] hover:brightness-110',
        success:
            'bg-[color:var(--success)] text-[color:var(--success-foreground)] hover:brightness-105',
    } as const;

    const sizing = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm';
    const classes = cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-semibold transition-all disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizing,
        className,
    );

    const inner = (
        <>
            {Icon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
            {children}
        </>
    );

    if (href && !disabled) {
        return (
            <Link
                href={href}
                method={method}
                as={method && method !== 'get' ? 'button' : undefined}
                className={classes}
                title={title}
            >
                {inner}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={classes}
            title={title}
        >
            {inner}
        </button>
    );
}

/** Barre d'outils : filtres à gauche, actions à droite */
export function AdminToolbar({
    children,
    right,
}: {
    children: ReactNode;
    right?: ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
            <div className="flex flex-1 flex-wrap items-end gap-3">{children}</div>
            {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
        </div>
    );
}

/** Champ de formulaire admin avec label mono */
export function AdminField({
    label,
    children,
    className = '',
    hint,
    error,
}: {
    label: string;
    children: ReactNode;
    className?: string;
    hint?: string;
    error?: string;
}) {
    return (
        <div className={cn('min-w-0', className)}>
            <label className="editorial-caption mb-1.5 block text-[color:var(--ink-mute)]">
                {label}
            </label>
            {children}
            {hint && !error && (
                <p className="mt-1 text-[11px] text-[color:var(--ink-mute)]">{hint}</p>
            )}
            {error && (
                <p className="mt-1 text-[11px] font-medium text-[color:var(--destructive)]">
                    {error}
                </p>
            )}
        </div>
    );
}

/** Select stylé cohérent avec les inputs shadcn du projet */
export function AdminSelect({
    value,
    onChange,
    children,
    className = '',
}: {
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
    className?: string;
}) {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={cn(
                'h-9 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--paper)] px-3 text-sm text-[color:var(--ink)] outline-none transition-colors focus:border-[color:var(--desire)]',
                className,
            )}
        >
            {children}
        </select>
    );
}

/** Conteneur de table admin (scroll horizontal maîtrisé) */
export function AdminTable({ children }: { children: ReactNode }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">{children}</table>
        </div>
    );
}

/** En-tête de colonne, triable si onSort est fourni */
export function AdminTh({
    children,
    onSort,
    active,
    direction,
    align = 'left',
    className = '',
}: {
    children?: ReactNode;
    onSort?: () => void;
    active?: boolean;
    direction?: string;
    align?: 'left' | 'right' | 'center';
    className?: string;
}) {
    const alignment =
        align === 'right'
            ? 'text-right'
            : align === 'center'
              ? 'text-center'
              : 'text-left';

    if (!onSort) {
        return (
            <th
                className={cn(
                    'editorial-caption whitespace-nowrap px-4 py-2.5 font-normal text-[color:var(--ink-mute)]',
                    alignment,
                    className,
                )}
            >
                {children}
            </th>
        );
    }

    return (
        <th className={cn('px-0 py-0', alignment, className)}>
            <button
                type="button"
                onClick={onSort}
                className={cn(
                    'editorial-caption inline-flex w-full items-center gap-1 whitespace-nowrap px-4 py-2.5 transition-colors hover:text-[color:var(--ink)]',
                    align === 'right' && 'justify-end',
                    align === 'center' && 'justify-center',
                    active
                        ? 'font-semibold text-[color:var(--ink)]'
                        : 'text-[color:var(--ink-mute)]',
                )}
            >
                {children}
                <span aria-hidden className="text-[9px]">
                    {active ? (direction === 'asc' ? '▲' : '▼') : '↕'}
                </span>
            </button>
        </th>
    );
}

/** Ligne d'en-tête de table */
export function AdminThead({ children }: { children: ReactNode }) {
    return (
        <thead>
            <tr className="border-b border-[color:var(--line)] bg-[color:var(--bg-soft)]">
                {children}
            </tr>
        </thead>
    );
}

/** Ligne de table avec survol */
export function AdminTr({
    children,
    onClick,
}: {
    children: ReactNode;
    onClick?: () => void;
}) {
    return (
        <tr
            onClick={onClick}
            className={cn(
                'border-b border-[color:var(--line-soft)] transition-colors last:border-b-0 hover:bg-[color:var(--bg-soft)]/60',
                onClick && 'cursor-pointer',
            )}
        >
            {children}
        </tr>
    );
}

/** Cellule de table */
export function AdminTd({
    children,
    align = 'left',
    className = '',
    colSpan,
}: {
    children?: ReactNode;
    align?: 'left' | 'right' | 'center';
    className?: string;
    colSpan?: number;
}) {
    const alignment =
        align === 'right'
            ? 'text-right'
            : align === 'center'
              ? 'text-center'
              : 'text-left';

    return (
        <td className={cn('px-4 py-3 align-middle', alignment, className)} colSpan={colSpan}>
            {children}
        </td>
    );
}

/** Valeur monospace discrète (dates, identifiants, compteurs) */
export function AdminMeta({ children }: { children: ReactNode }) {
    return (
        <span className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--ink-mute)]">
            {children}
        </span>
    );
}

/** État vide illustré */
export function AdminEmpty({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: typeof Users;
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--bg-soft)]">
                <Icon className="h-5 w-5 text-[color:var(--ink-mute)]" />
            </div>
            <div>
                <p className="font-display text-base font-semibold text-[color:var(--ink)]">
                    {title}
                </p>
                {description && (
                    <p className="mt-1 max-w-sm text-sm text-[color:var(--ink-mute)]">
                        {description}
                    </p>
                )}
            </div>
            {action}
        </div>
    );
}

/** Pagination Laravel standard */
export function AdminPagination({
    from,
    to,
    total,
    lastPage,
    links,
}: {
    from: number | null;
    to: number | null;
    total: number;
    lastPage: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}) {
    if (lastPage <= 1) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--line)] bg-[color:var(--bg-soft)] px-5 py-3">
            <p className="editorial-caption text-[color:var(--ink-mute)]">
                {from ?? 0}–{to ?? 0} sur {total.toLocaleString('fr-FR')}
            </p>
            <div className="flex flex-wrap gap-1">
                {links.map((link, index) => (
                    <button
                        key={index}
                        type="button"
                        disabled={!link.url}
                        onClick={() =>
                            link.url &&
                            router.visit(link.url, { preserveScroll: true })
                        }
                        className={cn(
                            'font-mono min-w-[30px] rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors disabled:opacity-40',
                            link.active
                                ? 'bg-[color:var(--ink)] text-[color:var(--bg)]'
                                : 'border border-[color:var(--line)] text-[color:var(--ink-soft)] hover:bg-[color:var(--paper)]',
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
}

/** Barre de progression / ratio */
export function AdminMeter({
    value,
    total,
    label,
    tone = 'wine',
}: {
    value: number;
    total: number;
    label?: string;
    tone?: 'wine' | 'gold' | 'success' | 'danger';
}) {
    const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
    const colors = {
        wine: 'var(--wine)',
        gold: 'var(--gold)',
        success: 'var(--success)',
        danger: 'var(--destructive)',
    } as const;

    return (
        <div>
            <div className="mb-1 flex items-baseline justify-between gap-2">
                {label && (
                    <span className="editorial-caption text-[color:var(--ink-mute)]">
                        {label}
                    </span>
                )}
                <span className="font-mono text-[11px] font-semibold text-[color:var(--ink-soft)]">
                    {pct}%
                </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--bg-soft)]">
                <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${pct}%`, background: colors[tone] }}
                />
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------------------
 * Graphiques SVG maison — aucune dépendance ajoutée
 * -------------------------------------------------------------------------*/

/** Courbe compacte, sans axes. Utilisée en fond de KPI ou en ligne de tableau. */
export function Sparkline({
    data,
    color = 'var(--wine)',
    filled = false,
    strokeWidth = 1.5,
}: {
    data: number[];
    color?: string;
    filled?: boolean;
    strokeWidth?: number;
}) {
    if (data.length < 2) {
        return null;
    }

    const width = 100;
    const height = 32;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const span = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / span) * (height - 4) - 2;

        return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden
        >
            {filled && (
                <polygon
                    points={`0,${height} ${points.join(' ')} ${width},${height}`}
                    fill={color}
                />
            )}
            <polyline
                points={points.join(' ')}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

export interface AreaChartSeries {
    label: string;
    color: string;
    values: number[];
}

/**
 * Graphique en aires empilables (une aire par série), avec grille, axe des
 * ordonnées et survol colonne par colonne. Rendu 100 % SVG.
 */
export function AdminAreaChart({
    labels,
    series,
    height = 220,
    formatValue = (value: number) => value.toLocaleString('fr-FR'),
}: {
    labels: string[];
    series: AreaChartSeries[];
    height?: number;
    formatValue?: (value: number) => string;
}) {
    const [hover, setHover] = useState<number | null>(null);

    const count = labels.length;
    const max = Math.max(1, ...series.flatMap((serie) => serie.values));

    if (count < 2) {
        return (
            <div className="flex h-40 items-center justify-center text-sm text-[color:var(--ink-mute)]">
                Pas encore assez de données pour tracer une courbe.
            </div>
        );
    }

    // Repère interne : on dessine en 0→100 sur X et 0→100 sur Y, l'échelle
    // est ensuite gérée par le viewBox pour rester responsive.
    const width = 100;
    const chartHeight = 100;
    const toX = (index: number) => (index / (count - 1)) * width;
    const toY = (value: number) => chartHeight - (value / max) * chartHeight;

    const ticks = [0, 0.25, 0.5, 0.75, 1];

    return (
        <div className="flex gap-3">
            {/* Axe Y */}
            <div
                className="flex shrink-0 flex-col justify-between py-0 text-right font-mono text-[10px] text-[color:var(--ink-mute)]"
                style={{ height }}
            >
                {[...ticks].reverse().map((tick) => (
                    <span key={tick}>{formatValue(Math.round(max * tick))}</span>
                ))}
            </div>

            <div className="min-w-0 flex-1">
                <div className="relative" style={{ height }}>
                    <svg
                        viewBox={`0 0 ${width} ${chartHeight}`}
                        preserveAspectRatio="none"
                        className="h-full w-full overflow-visible"
                        onMouseLeave={() => setHover(null)}
                    >
                        {/* Grille horizontale */}
                        {ticks.map((tick) => (
                            <line
                                key={tick}
                                x1={0}
                                x2={width}
                                y1={chartHeight - tick * chartHeight}
                                y2={chartHeight - tick * chartHeight}
                                stroke="var(--line)"
                                strokeWidth={0.5}
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}

                        {series.map((serie) => {
                            const points = serie.values
                                .map(
                                    (value, index) =>
                                        `${toX(index).toFixed(2)},${toY(value).toFixed(2)}`,
                                )
                                .join(' ');

                            return (
                                <g key={serie.label}>
                                    <polygon
                                        points={`0,${chartHeight} ${points} ${width},${chartHeight}`}
                                        fill={serie.color}
                                        opacity={0.12}
                                    />
                                    <polyline
                                        points={points}
                                        fill="none"
                                        stroke={serie.color}
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </g>
                            );
                        })}

                        {/* Repère de survol */}
                        {hover !== null && (
                            <line
                                x1={toX(hover)}
                                x2={toX(hover)}
                                y1={0}
                                y2={chartHeight}
                                stroke="var(--ink-mute)"
                                strokeWidth={1}
                                strokeDasharray="2 2"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}
                        {hover !== null &&
                            series.map((serie) => (
                                <circle
                                    key={serie.label}
                                    cx={toX(hover)}
                                    cy={toY(serie.values[hover] ?? 0)}
                                    r={3}
                                    fill="var(--paper)"
                                    stroke={serie.color}
                                    strokeWidth={2}
                                    vectorEffect="non-scaling-stroke"
                                />
                            ))}

                        {/* Zones de survol */}
                        {labels.map((label, index) => (
                            <rect
                                key={`${label}-${index}`}
                                x={index === 0 ? 0 : toX(index) - width / (count - 1) / 2}
                                y={0}
                                width={width / (count - 1)}
                                height={chartHeight}
                                fill="transparent"
                                onMouseEnter={() => setHover(index)}
                            />
                        ))}
                    </svg>

                    {/* Infobulle */}
                    {hover !== null && (
                        <div
                            className="pointer-events-none absolute top-2 z-10 min-w-[130px] -translate-x-1/2 rounded-lg border border-[color:var(--line)] bg-[color:var(--paper)] px-2.5 py-2 shadow-lg"
                            style={{
                                left: `${Math.min(85, Math.max(15, (hover / (count - 1)) * 100))}%`,
                            }}
                        >
                            <div className="editorial-caption mb-1 text-[color:var(--ink-mute)]">
                                {labels[hover]}
                            </div>
                            {series.map((serie) => (
                                <div
                                    key={serie.label}
                                    className="flex items-center justify-between gap-3 text-xs"
                                >
                                    <span className="inline-flex items-center gap-1.5 text-[color:var(--ink-soft)]">
                                        <span
                                            className="h-1.5 w-1.5 rounded-full"
                                            style={{ background: serie.color }}
                                        />
                                        {serie.label}
                                    </span>
                                    <span className="font-mono font-semibold text-[color:var(--ink)]">
                                        {formatValue(serie.values[hover] ?? 0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Axe X : premier, milieu, dernier pour éviter la surcharge */}
                <div className="mt-2 flex justify-between font-mono text-[10px] text-[color:var(--ink-mute)]">
                    <span>{labels[0]}</span>
                    {count > 2 && <span>{labels[Math.floor((count - 1) / 2)]}</span>}
                    <span>{labels[count - 1]}</span>
                </div>
            </div>
        </div>
    );
}

/** Légende de graphique */
export function AdminChartLegend({
    series,
}: {
    series: Array<{ label: string; color: string }>;
}) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {series.map((serie) => (
                <span
                    key={serie.label}
                    className="editorial-caption inline-flex items-center gap-1.5 text-[color:var(--ink-soft)]"
                >
                    <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: serie.color }}
                    />
                    {serie.label}
                </span>
            ))}
        </div>
    );
}

/** Histogramme horizontal — répartitions (raisons de signalement, etc.) */
export function AdminBarList({
    items,
    formatValue = (value: number) => value.toLocaleString('fr-FR'),
}: {
    items: Array<{ label: string; value: number; href?: string }>;
    formatValue?: (value: number) => string;
}) {
    const max = Math.max(1, ...items.map((item) => item.value));

    return (
        <div className="flex flex-col gap-2.5">
            {items.map((item) => {
                const row = (
                    <>
                        <div className="mb-1 flex items-baseline justify-between gap-3">
                            <span className="truncate text-xs font-medium text-[color:var(--ink-soft)]">
                                {item.label}
                            </span>
                            <span className="font-mono shrink-0 text-xs font-semibold text-[color:var(--ink)]">
                                {formatValue(item.value)}
                            </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--bg-soft)]">
                            <div
                                className="h-full rounded-full bg-[color:var(--wine)]"
                                style={{ width: `${(item.value / max) * 100}%` }}
                            />
                        </div>
                    </>
                );

                if (item.href) {
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="group rounded-lg transition-opacity hover:opacity-80"
                        >
                            {row}
                        </Link>
                    );
                }

                return <div key={item.label}>{row}</div>;
            })}
        </div>
    );
}
