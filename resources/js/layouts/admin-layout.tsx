import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';
import {
    ArrowLeft,
    BarChart3,
    ChevronRight,
    FileText,
    Flag,
    Gem,
    LogOut,
    Settings as SettingsIcon,
    ShieldAlert,
    Sparkles,
    Tags,
    Timer,
    UserCog,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FlashToaster } from '@/components/flash-toaster';

interface AdminLayoutProps {
    title?: string;
    /**
     * Sous-titre court (1 phrase) sous le H1. Optionnel.
     */
    subtitle?: string;
    /**
     * Fil d'ariane simple. Le dernier item est rendu en évidence.
     */
    breadcrumbs?: { label: string; href?: string }[];
    /**
     * Actions à droite du header (boutons, exports, etc.)
     */
    actions?: ReactNode;
}

interface NavItem {
    href: string;
    label: string;
    icon: typeof Users;
    /** Si défini, badge numérique à droite (alertes modération, etc.) */
    badge?: number;
    /** Match approximatif sur l'URL courante */
    matchPrefix?: string;
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
     * Compteurs partagés par le HandleInertiaRequests middleware
     * (utilisés pour les badges de la sidebar admin si dispo).
     */
    adminAlerts?: {
        pending_photos?: number;
        pending_verifications?: number;
        open_reports?: number;
        flagged_ephemeral?: number;
    };
}

/* ---------------------------------------------------------------------------
 * AdminLayout — "Console Wine"
 * Backoffice dédié, sidebar sombre wine-deep persistante, main éditorial clair.
 * Cohérent avec le front public sans en imiter le mood magazine.
 * -------------------------------------------------------------------------*/
export default function AdminLayout({
    title,
    subtitle,
    breadcrumbs,
    actions,
    children,
}: PropsWithChildren<AdminLayoutProps>) {
    const { auth, adminAlerts } = usePage<AdminPageProps>().props;

    const currentPath =
        typeof window !== 'undefined' ? window.location.pathname : '';

    const isActive = (item: NavItem): boolean => {
        const prefix = item.matchPrefix ?? item.href;
        return currentPath === item.href || currentPath.startsWith(prefix + '/');
    };

    const totalAlerts =
        (adminAlerts?.pending_photos ?? 0) +
        (adminAlerts?.pending_verifications ?? 0) +
        (adminAlerts?.open_reports ?? 0);

    const primaryNav: NavItem[] = [
        {
            href: '/admin/dashboard',
            label: "Vue d'ensemble",
            icon: BarChart3,
        },
        {
            href: '/admin/users',
            label: 'Utilisatrices',
            icon: Users,
            matchPrefix: '/admin/users',
        },
        {
            href: '/admin/moderation',
            label: 'Modération',
            icon: ShieldAlert,
            badge: totalAlerts || undefined,
            matchPrefix: '/admin/moderation',
        },
        {
            href: '/admin/reports',
            label: 'Signalements',
            icon: Flag,
            badge: adminAlerts?.open_reports || undefined,
            matchPrefix: '/admin/reports',
        },
        {
            href: '/admin/ephemeral',
            label: 'Éphémères',
            icon: Timer,
            badge: adminAlerts?.flagged_ephemeral || undefined,
            matchPrefix: '/admin/ephemeral',
        },
    ];

    const secondaryNav: NavItem[] = [
        {
            href: '/admin/billing',
            label: 'Abonnements & tarifs',
            icon: Tags,
            matchPrefix: '/admin/billing',
        },
        {
            href: '/admin/subscriptions',
            label: 'Abonnées',
            icon: Gem,
            matchPrefix: '/admin/subscriptions',
        },
        {
            href: '/admin/gems',
            label: 'Économie gemmes',
            icon: Sparkles,
            matchPrefix: '/admin/gems',
        },
        {
            href: '/admin/static-pages',
            label: 'Pages statiques',
            icon: FileText,
            matchPrefix: '/admin/static-pages',
        },
        {
            href: '/admin/settings',
            label: 'Réglages',
            icon: SettingsIcon,
            matchPrefix: '/admin/settings',
        },
    ];

    return (
        <div
            className="min-h-screen"
            style={{
                background: 'var(--bg)',
                color: 'var(--ink)',
            }}
        >
            {title && <Head title={`Admin · ${title}`} />}

            <div className="flex min-h-screen">
                {/* ============================================================
                 * SIDEBAR — Console Wine (sombre, persistante)
                 * ==========================================================*/}
                <aside
                    className="hidden w-64 shrink-0 flex-col lg:flex"
                    style={{
                        background:
                            'linear-gradient(180deg, var(--wine-deep) 0%, oklch(18% 0.05 12) 100%)',
                        color: 'oklch(96% 0.02 50)',
                        borderRight: '1px solid oklch(100% 0 0 / 0.06)',
                    }}
                >
                    {/* Logo + admin badge */}
                    <div className="px-5 pb-5 pt-6">
                        <Link href="/" className="flex items-baseline gap-1.5">
                            <span className="font-display text-2xl font-medium italic">
                                Lesbi
                            </span>
                            <span
                                className="font-display text-2xl font-medium"
                                style={{ color: 'var(--gold)' }}
                            >
                                Libre
                            </span>
                        </Link>
                        <div className="mt-2 flex items-center gap-2">
                            <span
                                className="grid h-5 w-5 place-items-center rounded"
                                style={{ background: 'var(--gold)', color: 'var(--wine-deep)' }}
                            >
                                <UserCog className="h-3 w-3" />
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-70">
                                Console admin
                            </span>
                        </div>
                    </div>

                    <div
                        className="mx-5 mb-5 h-px"
                        style={{ background: 'oklch(100% 0 0 / 0.08)' }}
                    />

                    {/* Primary nav */}
                    <nav className="flex flex-col gap-1 px-3">
                        <div
                            className="font-mono px-3 pb-2 text-[9px] uppercase tracking-[0.18em]"
                            style={{ color: 'oklch(100% 0 0 / 0.4)' }}
                        >
                            Plateforme
                        </div>
                        {primaryNav.map((item) => (
                            <AdminNavItem
                                key={item.href}
                                item={item}
                                active={isActive(item)}
                            />
                        ))}
                    </nav>

                    <div
                        className="mx-5 my-4 h-px"
                        style={{ background: 'oklch(100% 0 0 / 0.08)' }}
                    />

                    {/* Secondary nav */}
                    <nav className="flex flex-col gap-1 px-3">
                        <div
                            className="font-mono px-3 pb-2 text-[9px] uppercase tracking-[0.18em]"
                            style={{ color: 'oklch(100% 0 0 / 0.4)' }}
                        >
                            Économie & contenu
                        </div>
                        {secondaryNav.map((item) => (
                            <AdminNavItem
                                key={item.href}
                                item={item}
                                active={isActive(item)}
                            />
                        ))}
                    </nav>

                    <div className="flex-1" />

                    {/* Footer : back to app + user */}
                    <div
                        className="border-t p-3"
                        style={{ borderColor: 'oklch(100% 0 0 / 0.08)' }}
                    >
                        <Link
                            href="/dashboard"
                            className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-white/[0.06]"
                            style={{ color: 'oklch(100% 0 0 / 0.7)' }}
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Retour à l&apos;app
                        </Link>
                        <div
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                            style={{ background: 'oklch(100% 0 0 / 0.04)' }}
                        >
                            <div
                                className="font-display grid h-8 w-8 place-items-center rounded-full text-sm font-medium italic"
                                style={{
                                    background: 'var(--gold)',
                                    color: 'var(--wine-deep)',
                                }}
                            >
                                {auth.user?.name?.slice(0, 2).toUpperCase() ?? 'AD'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-semibold">
                                    {auth.user?.name}
                                </div>
                                <div
                                    className="font-mono text-[10px] uppercase tracking-wider"
                                    style={{ color: 'var(--gold)' }}
                                >
                                    Administratrice
                                </div>
                            </div>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-white/[0.1]"
                                style={{ color: 'oklch(100% 0 0 / 0.55)' }}
                                aria-label="Déconnexion"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* ============================================================
                 * MAIN
                 * ==========================================================*/}
                <main className="flex flex-1 flex-col overflow-x-hidden">
                    {/* Header sticky */}
                    <header
                        className="sticky top-0 z-30 border-b backdrop-blur-xl"
                        style={{
                            background: 'oklch(99% 0.006 60 / 0.85)',
                            borderColor: 'var(--line)',
                        }}
                    >
                        <div className="flex flex-col gap-3 px-6 py-5 lg:px-10 lg:py-6">
                            {/* Breadcrumbs */}
                            {breadcrumbs && breadcrumbs.length > 0 && (
                                <nav
                                    className="font-mono flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.16em]"
                                    style={{ color: 'var(--ink-mute)' }}
                                    aria-label="Fil d'ariane"
                                >
                                    {breadcrumbs.map((bc, i) => {
                                        const isLast = i === breadcrumbs.length - 1;
                                        return (
                                            <span
                                                key={`${bc.label}-${i}`}
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
                                                        style={{
                                                            color: isLast
                                                                ? 'var(--wine-deep)'
                                                                : undefined,
                                                            fontWeight: isLast ? 600 : undefined,
                                                        }}
                                                    >
                                                        {bc.label}
                                                    </span>
                                                )}
                                                {!isLast && (
                                                    <ChevronRight
                                                        className="h-2.5 w-2.5"
                                                        style={{ color: 'var(--ink-mute)' }}
                                                    />
                                                )}
                                            </span>
                                        );
                                    })}
                                </nav>
                            )}

                            {/* Title row */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    {title && (
                                        <h1
                                            className="font-display text-3xl font-medium leading-tight tracking-tight lg:text-4xl"
                                            style={{ color: 'var(--ink)' }}
                                        >
                                            {title}
                                        </h1>
                                    )}
                                    {subtitle && (
                                        <p
                                            className="mt-1 text-sm"
                                            style={{ color: 'var(--ink-mute)' }}
                                        >
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                {actions && (
                                    <div className="flex items-center gap-2">{actions}</div>
                                )}
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 px-6 pb-16 pt-6 lg:px-10 lg:pt-8">
                        {children}
                    </div>
                </main>
            </div>

            <Toaster />
            <FlashToaster />
        </div>
    );
}

/* ---------------------------------------------------------------------------
 * NavItem — pill admin
 * -------------------------------------------------------------------------*/
function AdminNavItem({
    item,
    active,
}: {
    item: NavItem;
    active: boolean;
}): JSX.Element {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all',
            )}
            style={{
                background: active ? 'oklch(100% 0 0 / 0.08)' : 'transparent',
                color: active ? 'var(--gold)' : 'oklch(100% 0 0 / 0.7)',
                fontWeight: active ? 600 : 500,
            }}
        >
            {active && (
                <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r"
                    style={{ background: 'var(--gold)' }}
                />
            )}
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
                <span
                    className="font-mono grid h-5 min-w-[20px] place-items-center rounded-md px-1.5 text-[10px] font-bold"
                    style={{
                        background: 'var(--desire)',
                        color: 'white',
                    }}
                >
                    {item.badge}
                </span>
            )}
        </Link>
    );
}

/* ---------------------------------------------------------------------------
 * Helpers exportés pour les pages admin — primitives cohérentes
 * -------------------------------------------------------------------------*/

/** Carte d'admin standard (bordure fine, fond paper) */
export function AdminCard({
    children,
    className = '',
    padded = true,
}: {
    children: ReactNode;
    className?: string;
    padded?: boolean;
}): JSX.Element {
    return (
        <section
            className={`relative overflow-hidden rounded-2xl border ${padded ? 'p-6' : ''} ${className}`}
            style={{
                borderColor: 'var(--line)',
                background: 'var(--paper)',
            }}
        >
            {children}
        </section>
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
}): JSX.Element {
    return (
        <div className="mb-5 flex items-end justify-between gap-4">
            <div>
                {eyebrow && (
                    <div
                        className="editorial-eyebrow mb-1"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        {eyebrow}
                    </div>
                )}
                <h2
                    className="font-display text-2xl font-medium leading-tight"
                    style={{ color: 'var(--ink)' }}
                >
                    {title}
                </h2>
            </div>
            {right && <div className="flex items-center gap-2">{right}</div>}
        </div>
    );
}

/** KPI card éditorial (gros chiffre Fraunces + label + delta optionnel) */
export function AdminKpi({
    label,
    value,
    delta,
    deltaTone = 'positive',
    icon: Icon,
    href,
}: {
    label: string;
    value: number | string;
    delta?: string;
    deltaTone?: 'positive' | 'neutral' | 'warning';
    icon?: typeof Users;
    href?: string;
}): JSX.Element {
    const deltaColor =
        deltaTone === 'positive'
            ? 'var(--success)'
            : deltaTone === 'warning'
              ? 'var(--desire)'
              : 'var(--ink-mute)';

    const inner = (
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
                <div
                    className="editorial-caption mb-2"
                    style={{ color: 'var(--ink-mute)' }}
                >
                    {label}
                </div>
                <div
                    className="font-display text-4xl font-medium tracking-tight"
                    style={{ color: 'var(--ink)' }}
                >
                    {typeof value === 'number'
                        ? value.toLocaleString('fr-FR')
                        : value}
                </div>
                {delta && (
                    <div
                        className="mt-2 text-xs font-medium"
                        style={{ color: deltaColor }}
                    >
                        {delta}
                    </div>
                )}
            </div>
            {Icon && (
                <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                    style={{
                        background: 'var(--blush)',
                        color: 'var(--wine-deep)',
                    }}
                >
                    <Icon className="h-4 w-4" />
                </div>
            )}
        </div>
    );

    const cls =
        'relative overflow-hidden rounded-2xl border p-5 transition-transform';
    const style = {
        borderColor: 'var(--line)',
        background: 'var(--paper)',
    } as const;

    if (href) {
        return (
            <Link
                href={href}
                className={`${cls} hover:-translate-y-px hover:border-[color:var(--wine)] block`}
                style={style}
            >
                {inner}
            </Link>
        );
    }

    return (
        <div className={cls} style={style}>
            {inner}
        </div>
    );
}

/** Badge admin coloré */
export function AdminBadge({
    children,
    tone = 'neutral',
}: {
    children: ReactNode;
    tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'gold' | 'wine';
}): JSX.Element {
    const styles: Record<string, { bg: string; fg: string }> = {
        neutral: {
            bg: 'var(--bg-soft)',
            fg: 'var(--ink-soft)',
        },
        success: {
            bg: 'oklch(60% 0.16 160 / 0.15)',
            fg: 'oklch(40% 0.16 160)',
        },
        warning: {
            bg: 'oklch(80% 0.13 75 / 0.2)',
            fg: 'oklch(40% 0.13 75)',
        },
        danger: {
            bg: 'oklch(62% 0.19 10 / 0.15)',
            fg: 'oklch(52% 0.21 12)',
        },
        gold: {
            bg: 'var(--gold)',
            fg: 'var(--wine-deep)',
        },
        wine: {
            bg: 'var(--wine-deep)',
            fg: 'oklch(96% 0.02 50)',
        },
    };
    const s = styles[tone];
    return (
        <span
            className="font-mono inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: s.bg, color: s.fg }}
        >
            {children}
        </span>
    );
}

/** Bouton admin minimal */
export function AdminButton({
    children,
    onClick,
    href,
    variant = 'default',
    size = 'md',
    icon: Icon,
    disabled,
    type = 'button',
}: {
    children: ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: 'default' | 'primary' | 'wine' | 'gold' | 'ghost' | 'danger';
    size?: 'sm' | 'md';
    icon?: typeof Users;
    disabled?: boolean;
    type?: 'button' | 'submit';
}): JSX.Element {
    const variants: Record<string, { bg: string; fg: string; border?: string }> = {
        default: {
            bg: 'var(--paper)',
            fg: 'var(--ink)',
            border: 'var(--line)',
        },
        primary: {
            bg: 'var(--ink)',
            fg: 'var(--bg)',
        },
        wine: {
            bg: 'var(--wine-deep)',
            fg: 'oklch(96% 0.02 50)',
        },
        gold: {
            bg: 'var(--gold)',
            fg: 'var(--wine-deep)',
        },
        ghost: {
            bg: 'transparent',
            fg: 'var(--ink-soft)',
        },
        danger: {
            bg: 'var(--destructive)',
            fg: 'var(--destructive-foreground)',
        },
    };
    const v = variants[variant];
    const sizing = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

    const inner = (
        <>
            {Icon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
            {children}
        </>
    );
    const cls = `inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0 ${sizing}`;
    const style = {
        background: v.bg,
        color: v.fg,
        ...(v.border ? { border: `1px solid ${v.border}` } : {}),
    };

    if (href && !disabled) {
        return (
            <Link href={href} className={cls} style={style}>
                {inner}
            </Link>
        );
    }
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cls}
            style={style}
        >
            {inner}
        </button>
    );
}
