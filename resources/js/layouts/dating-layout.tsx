import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import {
    Activity,
    ArrowRight,
    BadgeCheck,
    BellRing,
    Compass,
    Crown,
    Heart,
    HelpCircle,
    Images,
    Lock,
    MessageCircle,
    Shield,
    ShoppingBag,
    Sparkles,
    User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Toaster } from '@/components/ui/toaster';
import { FlashToaster } from '@/components/flash-toaster';
import NotificationBell from '@/components/NotificationBell';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import PresencePanel, { type PresenceUser } from '@/components/discovery/PresencePanel';

interface DatingLayoutProps {
    title?: string;
    showOnlineUsers?: boolean;
    /**
     * Override manuel des gemmes. Optionnel — par défaut on lit
     * `auth.user.gems` depuis la prop Inertia partagée.
     */
    gems?: number;
}

/* ---------------------------------------------------------------------------
 * DatingLayout — direction "Wine Editorial"
 * Sidebar logo cœur tilté · gems blush · Premium wine+gold · header avec icônes
 * -------------------------------------------------------------------------*/
export default function DatingLayout({
    title,
    showOnlineUsers = true,
    gems,
    children,
}: PropsWithChildren<DatingLayoutProps>) {
    const { counts, auth, presenceUsers, onboarding } = usePage<{
        counts: {
            unreadConversations: number;
            recentActivities: number;
            pendingGalleryRequests: number;
        };
        presenceUsers?: PresenceUser[];
        onboarding?: { completed: number; total: number } | null;
        auth: {
            user: {
                id: number;
                name: string;
                email: string;
                is_admin?: boolean;
                is_verified?: boolean;
                gems?: number;
            };
        };
    }>().props;

    // Gemmes : on prend l'override prop si fourni, sinon le vrai solde user.
    const gemsBalance = gems ?? auth.user?.gems ?? 0;

    const { permission, isSubscribed, subscribe } = usePushNotifications();

    const currentPath =
        typeof window !== 'undefined' ? window.location.pathname : '';

    const isActive = (href: string): boolean =>
        href === '/dashboard'
            ? currentPath === '/' || currentPath === '/dashboard'
            : currentPath.startsWith(href);

    const menuItems = [
        { icon: Compass, label: 'Découvrir', href: '/dashboard' },
        {
            icon: MessageCircle,
            label: 'Mes échanges',
            href: '/conversations',
            badge: counts.unreadConversations > 0 ? counts.unreadConversations : undefined,
        },
        {
            icon: Activity,
            label: 'Activité',
            href: '/activity',
            badge: counts.recentActivities > 0 ? counts.recentActivities : undefined,
        },
        { icon: User, label: 'Mon profil', href: '/profile/edit' },
        { icon: Images, label: 'Mes photos', href: '/photos' },
        {
            icon: Lock,
            label: 'Galerie privée',
            href: '/gallery-access',
            badge:
                counts.pendingGalleryRequests > 0
                    ? counts.pendingGalleryRequests
                    : undefined,
        },
    ];

    const secondaryItems = [
        // Tant que le compte n'est pas vérifié, on garde un accès direct au
        // parcours : sans lui, la page /verification est introuvable.
        ...(auth.user?.is_verified
            ? []
            : [
                  {
                      icon: BadgeCheck,
                      label: 'Faire vérifier mon profil',
                      href: '/verification',
                  },
              ]),
        { icon: Shield, label: 'Badges', href: '/badges' },
        { icon: ShoppingBag, label: 'Boutique', href: '/shop' },
    ];

    const onlineUsers: PresenceUser[] = presenceUsers ?? [];

    return (
        <div className="min-h-screen bg-background text-foreground">
            {title && <Head title={title} />}

            <div className="flex h-screen">
                {/* ============================================================
                 * SIDEBAR — Wine Editorial
                 * ==========================================================*/}
                <aside
                    className="hidden w-64 flex-col px-4 pb-4 pt-5 lg:flex"
                    style={{
                        background: 'var(--paper)',
                        borderRight: '1px solid var(--line)',
                    }}
                >
                    {/* Logo with tilted heart */}
                    <Link href="/" className="flex items-center gap-2.5 px-1.5 pb-4 pt-1">
                        <div
                            className="grid h-9 w-9 place-items-center text-white"
                            style={{
                                borderRadius: '50% 50% 50% 8px',
                                background:
                                    'linear-gradient(135deg, var(--desire), var(--wine))',
                                transform: 'rotate(-8deg)',
                            }}
                        >
                            <Heart className="h-4 w-4 fill-current" />
                        </div>
                        <div>
                            <div className="font-display text-[22px] font-semibold leading-none">
                                LesbiLibre
                            </div>
                            <div className="font-mono mt-0.5 text-[9.5px] uppercase tracking-[0.14em] text-foreground/55">
                                intimate loop
                            </div>
                        </div>
                    </Link>

                    {/* Gems card */}
                    <div
                        className="mb-5 rounded-2xl border p-3.5"
                        style={{
                            borderColor: 'var(--line)',
                            background:
                                'linear-gradient(135deg, var(--blush) 0%, transparent 70%), var(--paper)',
                        }}
                    >
                        <div className="mb-1.5 flex items-center justify-between">
                            <div
                                className="flex items-center gap-2"
                                style={{ color: 'var(--wine-deep)' }}
                            >
                                <Sparkles className="h-4 w-4" />
                                <span className="text-[13px] font-semibold">Mes gemmes</span>
                            </div>
                            <span
                                className="font-display text-2xl italic"
                                style={{ color: 'var(--wine-deep)' }}
                            >
                                {gemsBalance.toLocaleString('fr-FR')}
                            </span>
                        </div>
                        <Link
                            href="/shop"
                            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold"
                            style={{
                                background: 'var(--ink)',
                                color: 'var(--bg)',
                            }}
                        >
                            <Sparkles className="h-3 w-3" />
                            En obtenir plus
                        </Link>
                    </div>

                    {/* Primary nav */}
                    <nav className="flex flex-col gap-0.5">
                        {menuItems.map((item) => (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                badge={item.badge}
                                active={isActive(item.href)}
                            />
                        ))}
                    </nav>

                    <Divider />

                    <nav className="flex flex-col gap-0.5">
                        {secondaryItems.map((item) => (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                active={isActive(item.href)}
                                muted
                            />
                        ))}
                    </nav>

                    {/* Premium block */}
                    <Link
                        href="/premium"
                        className="relative mt-4 overflow-hidden rounded-2xl px-3.5 py-3.5"
                        style={{
                            background:
                                'linear-gradient(140deg, var(--wine) 0%, var(--wine-deep) 100%)',
                            color: 'oklch(96% 0.02 50)',
                        }}
                    >
                        <div
                            aria-hidden
                            className="absolute -right-5 -top-5 h-[90px] w-[90px] rounded-full opacity-55"
                            style={{
                                background:
                                    'radial-gradient(circle, var(--desire) 0%, transparent 70%)',
                            }}
                        />
                        <div className="relative mb-2 flex items-center gap-2">
                            <Crown
                                className="h-4 w-4 fill-current"
                                style={{ color: 'var(--gold)' }}
                            />
                            <span className="font-display text-[17px] font-medium italic">
                                Passe en Premium
                            </span>
                        </div>
                        <p className="relative mb-2.5 text-[11.5px] leading-[1.4] opacity-80">
                            Vois qui t&apos;a likée. Filtres avancés. Mode incognito.
                        </p>
                        <div
                            className="relative flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold"
                            style={{ background: 'var(--gold)', color: 'var(--wine-deep)' }}
                        >
                            Découvrir
                            <ArrowRight className="h-3 w-3" />
                        </div>
                    </Link>

                    {auth.user?.is_admin && (
                        <>
                            <Divider />
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold"
                                style={{
                                    background: 'oklch(70% 0.15 320 / 0.12)',
                                    color: 'var(--ink)',
                                }}
                            >
                                <Shield className="h-4 w-4" />
                                Administration
                            </Link>
                        </>
                    )}

                    {/* Aide section */}
                    <Divider />
                    <div className="flex flex-col gap-1 px-1 pb-1">
                        <Link
                            href="/faq"
                            className="flex items-center gap-2 text-[11px] text-foreground/50 transition-colors hover:text-foreground"
                        >
                            <HelpCircle className="h-3 w-3" />
                            FAQ
                        </Link>
                        <Link
                            href="/terms"
                            className="flex items-center gap-2 text-[11px] text-foreground/50 transition-colors hover:text-foreground"
                        >
                            <Shield className="h-3 w-3" />
                            Conditions
                        </Link>
                    </div>

                    <div className="flex-1" />

                    {/* Footer profile mini */}
                    <Link
                        href="/profile/edit"
                        className="mt-3 flex items-center gap-2.5 border-t pt-3.5"
                        style={{ borderColor: 'var(--line-soft)' }}
                    >
                        <Avatar className="h-[34px] w-[34px]">
                            <AvatarImage src="/images/logo.png" />
                            <AvatarFallback
                                className="font-display text-sm font-medium italic"
                                style={{
                                    background: 'var(--blush)',
                                    color: 'var(--wine-deep)',
                                }}
                            >
                                {auth.user?.name?.slice(0, 2).toUpperCase() ?? 'ME'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="text-[12.5px] font-semibold">
                                {auth.user?.name ?? 'Mon profil'}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                                <div
                                    className="h-[3px] flex-1 overflow-hidden rounded-sm"
                                    style={{ background: 'var(--line)' }}
                                >
                                    <div
                                        className="h-full"
                                        style={{ background: 'var(--desire)', width: `${((onboarding?.completed ?? 0) / (onboarding?.total ?? 3)) * 100}%` }}
                                    />
                                </div>
                                <span className="font-mono text-[9.5px] text-foreground/55">
                                    {Math.round(((onboarding?.completed ?? 0) / (onboarding?.total ?? 3)) * 100)}%
                                </span>
                            </div>
                        </div>
                    </Link>
                </aside>

                {/* ============================================================
                 * MAIN
                 * ==========================================================*/}
                <main className="flex flex-1 flex-col overflow-hidden">
                    <header
                        className="flex h-16 items-center justify-between border-b px-6"
                        style={{
                            background: 'var(--paper)',
                            borderColor: 'var(--line)',
                        }}
                    >
                        <div className="flex items-baseline gap-3">
                            <div className="editorial-eyebrow text-foreground/55">
                                LesbiLibre
                            </div>
                            <h1 className="font-display text-lg font-medium italic">
                                {title || 'Découvrir'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2.5 text-foreground/65">
                            {permission !== 'unsupported' &&
                                !isSubscribed &&
                                permission !== 'denied' && (
                                    <button
                                        type="button"
                                        onClick={subscribe}
                                        title="Activer les notifications push"
                                        className="grid h-9 w-9 place-items-center rounded-full border bg-card text-foreground/65 transition-colors hover:text-foreground"
                                        style={{ borderColor: 'var(--line)' }}
                                    >
                                        <BellRing className="h-4 w-4" />
                                    </button>
                                )}
                            <NotificationBell userId={auth.user.id} />
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto">{children}</div>
                </main>

                {showOnlineUsers && onlineUsers.length > 0 ? (
                    <PresencePanel users={onlineUsers} />
                ) : null}
            </div>

            <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t bg-card px-2 py-2 lg:hidden" aria-label="Navigation principale mobile">
                {menuItems.slice(0, 4).map((item) => <Link key={item.href} href={item.href} className="flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-xs" aria-current={isActive(item.href) ? 'page' : undefined}><item.icon className="h-5 w-5" /><span>{item.label}</span></Link>)}
            </nav>

            <Toaster />
            <FlashToaster />
        </div>
    );
}

/* ---------------------------------------------------------------------------
 * NavItem — Wine Editorial style
 * -------------------------------------------------------------------------*/
function NavItem({
    href,
    icon: Icon,
    label,
    badge,
    active,
    muted,
}: {
    href: string;
    icon: typeof Heart;
    label: string;
    badge?: number;
    active?: boolean;
    muted?: boolean;
}): JSX.Element {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-all',
            )}
            style={{
                background: active ? 'var(--blush)' : 'transparent',
                color: active
                    ? 'var(--wine-deep)'
                    : muted
                      ? 'var(--ink-mute)'
                      : 'var(--ink-soft)',
                fontWeight: active ? 600 : 500,
            }}
        >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {badge !== undefined && (
                <span
                    className="grid h-[18px] min-w-[18px] place-items-center rounded-md px-1.5 text-[10px] font-bold text-white"
                    style={{ background: 'var(--desire)' }}
                >
                    {badge}
                </span>
            )}
        </Link>
    );
}

function Divider(): JSX.Element {
    return (
        <div
            className="mx-2 my-4 h-px"
            style={{ background: 'var(--line-soft)' }}
        />
    );
}
