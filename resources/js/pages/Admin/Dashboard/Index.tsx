import AdminLayout, {
    AdminBadge,
    AdminCard,
    AdminKpi,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    BadgeCheck,
    Coins,
    CreditCard,
    DollarSign,
    Heart,
    MessageCircle,
    ShieldAlert,
    Sparkles,
    UserCheck,
    UserMinus,
    Users,
} from 'lucide-react';

interface Stats {
    users: {
        total: number;
        active_today: number;
        active_week: number;
        active_month: number;
        new_today: number;
        new_week: number;
        new_month: number;
        premium: number;
        verified: number;
        banned: number;
    };
    engagement: {
        total_matches: number;
        matches_today: number;
        matches_week: number;
        total_likes: number;
        likes_today: number;
        total_messages: number;
        messages_today: number;
        total_conversations: number;
    };
    moderation: {
        pending_photos: number;
        pending_verifications: number;
        open_reports: number;
    };
    revenue: {
        total: number;
        this_month: number;
        active_subscriptions: number;
        gems_distributed: number;
        gems_spent: number;
        gems_revenue_month: number;
    };
}

interface ChartData {
    user_growth: Array<{ date: string; count: number }>;
    activity: Array<{
        date: string;
        matches: number;
        likes: number;
        messages: number;
    }>;
}

interface ReportRow {
    id: number;
    reporter: string;
    reported: string;
    reported_id: number;
    reason: string;
    created_at: string;
}

interface UserRow {
    id: number;
    name: string;
    email: string;
    is_premium: boolean;
    is_verified: boolean;
    is_banned: boolean;
    created_at: string;
    city: string | null;
}

export default function Index({
    stats,
    charts: _charts,
    recent_reports,
    recent_users,
}: {
    stats: Stats;
    charts: ChartData;
    recent_reports: ReportRow[];
    recent_users: UserRow[];
}) {
    const totalMod =
        stats.moderation.pending_photos +
        stats.moderation.pending_verifications +
        stats.moderation.open_reports;

    return (
        <AdminLayout
            title="Vue d'ensemble"
            subtitle="État de la plateforme en temps réel"
            breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Vue d’ensemble' }]}
        >
            <div className="space-y-8">
                {/* ===========================================
                 * MOD ALERT (priority block, only if alerts)
                 * =========================================*/}
                {totalMod > 0 && (
                    <section
                        className="relative overflow-hidden rounded-2xl p-6 text-[oklch(96%_0.02_50)]"
                        style={{
                            background:
                                'linear-gradient(135deg, var(--wine) 0%, var(--wine-deep) 100%)',
                        }}
                    >
                        <div
                            aria-hidden
                            className="absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-30"
                            style={{
                                background:
                                    'radial-gradient(circle, var(--desire) 0%, transparent 65%)',
                            }}
                        />
                        <div className="relative flex flex-wrap items-end justify-between gap-6">
                            <div className="min-w-0 flex-1">
                                <div className="editorial-eyebrow mb-2 opacity-70">
                                    <span className="inline-flex items-center gap-2">
                                        <AlertTriangle className="h-3 w-3" />
                                        Modération · action requise
                                    </span>
                                </div>
                                <h2 className="font-display text-3xl font-medium leading-tight md:text-4xl">
                                    <em
                                        className="italic"
                                        style={{ color: 'var(--gold)' }}
                                    >
                                        {totalMod}
                                    </em>{' '}
                                    élément{totalMod > 1 ? 's' : ''} en attente.
                                </h2>
                                <p className="mt-2 text-sm opacity-75">
                                    Les utilisatrices attendent ta décision.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {stats.moderation.pending_photos > 0 && (
                                    <ModChip
                                        href="/admin/photos/pending"
                                        count={stats.moderation.pending_photos}
                                        label="photos"
                                    />
                                )}
                                {stats.moderation.pending_verifications > 0 && (
                                    <ModChip
                                        href="/admin/verifications"
                                        count={stats.moderation.pending_verifications}
                                        label="vérifications"
                                    />
                                )}
                                {stats.moderation.open_reports > 0 && (
                                    <ModChip
                                        href="/admin/reports"
                                        count={stats.moderation.open_reports}
                                        label="signalements"
                                    />
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* ===========================================
                 * KPIs principaux — 4 colonnes
                 * =========================================*/}
                <section>
                    <AdminSectionTitle
                        eyebrow="01 · Indicateurs clés"
                        title="Plateforme"
                    />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminKpi
                            label="Utilisatrices"
                            value={stats.users.total}
                            delta={`+${stats.users.new_today} aujourd’hui`}
                            icon={Users}
                            href="/admin/users"
                        />
                        <AdminKpi
                            label="Matches"
                            value={stats.engagement.total_matches}
                            delta={`+${stats.engagement.matches_today} aujourd’hui`}
                            icon={Heart}
                        />
                        <AdminKpi
                            label="Messages"
                            value={stats.engagement.total_messages}
                            delta={`+${stats.engagement.messages_today} aujourd’hui`}
                            icon={MessageCircle}
                        />
                        <AdminKpi
                            label="Abonnements actifs"
                            value={stats.revenue.active_subscriptions}
                            delta={`${stats.users.premium} Premium`}
                            deltaTone="neutral"
                            icon={CreditCard}
                            href="/admin/subscriptions"
                        />
                    </div>
                </section>

                {/* ===========================================
                 * Détails utilisatrices — grid
                 * =========================================*/}
                <section>
                    <AdminSectionTitle
                        eyebrow="02 · Audience"
                        title="Activité des utilisatrices"
                    />
                    <AdminCard>
                        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
                            <UserStat
                                label="Actives aujourd’hui"
                                value={stats.users.active_today}
                            />
                            <UserStat
                                label="Actives cette semaine"
                                value={stats.users.active_week}
                            />
                            <UserStat
                                label="Actives ce mois"
                                value={stats.users.active_month}
                            />
                            <UserStat
                                label="Nouvelles aujourd’hui"
                                value={stats.users.new_today}
                                tone="positive"
                            />
                            <UserStat
                                label="Nouvelles cette semaine"
                                value={stats.users.new_week}
                                tone="positive"
                            />
                            <UserStat
                                label="Nouvelles ce mois"
                                value={stats.users.new_month}
                                tone="positive"
                            />
                            <UserStat
                                label="Vérifiées"
                                value={stats.users.verified}
                                icon={BadgeCheck}
                            />
                            <UserStat
                                label="Premium"
                                value={stats.users.premium}
                                icon={Sparkles}
                                tone="gold"
                            />
                            <UserStat
                                label="Bannies"
                                value={stats.users.banned}
                                icon={UserMinus}
                                tone="danger"
                            />
                        </div>
                    </AdminCard>
                </section>

                {/* ===========================================
                 * Revenue & gems
                 * =========================================*/}
                <section>
                    <AdminSectionTitle
                        eyebrow="03 · Monétisation"
                        title="Revenus & gemmes"
                    />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AdminKpi
                            label="Revenus totaux"
                            value={`${stats.revenue.total.toLocaleString('fr-FR')} €`}
                            icon={DollarSign}
                        />
                        <AdminKpi
                            label="Revenus ce mois"
                            value={`${stats.revenue.this_month.toLocaleString('fr-FR')} €`}
                            icon={DollarSign}
                        />
                        <AdminKpi
                            label="Gemmes distribuées"
                            value={stats.revenue.gems_distributed}
                            icon={Coins}
                            href="/admin/gems"
                        />
                        <AdminKpi
                            label="Gemmes vendues (mois)"
                            value={`${stats.revenue.gems_revenue_month.toLocaleString('fr-FR')} €`}
                            icon={Coins}
                        />
                    </div>
                </section>

                {/* ===========================================
                 * Reports + Users récents
                 * =========================================*/}
                <section>
                    <AdminSectionTitle
                        eyebrow="04 · Flux récents"
                        title="À l'instant"
                    />
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Recent reports */}
                        <AdminCard padded={false}>
                            <div
                                className="flex items-center justify-between border-b px-6 py-4"
                                style={{ borderColor: 'var(--line)' }}
                            >
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-[color:var(--wine-deep)]" />
                                    <h3 className="font-display text-base font-semibold">
                                        Derniers signalements
                                    </h3>
                                </div>
                                <Link
                                    href="/admin/reports"
                                    className="ghost-link text-xs font-medium"
                                    style={{ color: 'var(--wine-deep)' }}
                                >
                                    Tous voir →
                                </Link>
                            </div>
                            {recent_reports.length === 0 ? (
                                <EmptyRow
                                    label="Aucun signalement en attente."
                                    icon={ShieldAlert}
                                />
                            ) : (
                                <ul>
                                    {recent_reports.map((r) => (
                                        <li
                                            key={r.id}
                                            className="border-b last:border-b-0"
                                            style={{ borderColor: 'var(--line-soft)' }}
                                        >
                                            <Link
                                                href={`/admin/reports/${r.id}`}
                                                className="block px-6 py-4 transition-colors hover:bg-[color:var(--bg-soft)]"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-sm font-semibold">
                                                            {r.reporter}{' '}
                                                            <span
                                                                className="font-normal"
                                                                style={{ color: 'var(--ink-mute)' }}
                                                            >
                                                                contre
                                                            </span>{' '}
                                                            {r.reported}
                                                        </div>
                                                        <p
                                                            className="mt-1 truncate text-xs"
                                                            style={{ color: 'var(--ink-soft)' }}
                                                        >
                                                            {r.reason}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className="font-mono shrink-0 text-[10px] uppercase tracking-wider"
                                                        style={{ color: 'var(--ink-mute)' }}
                                                    >
                                                        {r.created_at}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </AdminCard>

                        {/* Recent users */}
                        <AdminCard padded={false}>
                            <div
                                className="flex items-center justify-between border-b px-6 py-4"
                                style={{ borderColor: 'var(--line)' }}
                            >
                                <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-[color:var(--wine-deep)]" />
                                    <h3 className="font-display text-base font-semibold">
                                        Nouvelles inscriptions
                                    </h3>
                                </div>
                                <Link
                                    href="/admin/users"
                                    className="ghost-link text-xs font-medium"
                                    style={{ color: 'var(--wine-deep)' }}
                                >
                                    Toutes voir →
                                </Link>
                            </div>
                            {recent_users.length === 0 ? (
                                <EmptyRow
                                    label="Aucune nouvelle inscription."
                                    icon={Users}
                                />
                            ) : (
                                <ul>
                                    {recent_users.map((u) => (
                                        <li
                                            key={u.id}
                                            className="border-b last:border-b-0"
                                            style={{ borderColor: 'var(--line-soft)' }}
                                        >
                                            <Link
                                                href={`/admin/users/${u.id}`}
                                                className="block px-6 py-4 transition-colors hover:bg-[color:var(--bg-soft)]"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-sm font-semibold">
                                                                {u.name}
                                                            </span>
                                                            {u.is_verified && (
                                                                <BadgeCheck
                                                                    className="h-3.5 w-3.5"
                                                                    style={{ color: 'var(--success)' }}
                                                                />
                                                            )}
                                                            {u.is_premium && (
                                                                <AdminBadge tone="gold">
                                                                    Premium
                                                                </AdminBadge>
                                                            )}
                                                            {u.is_banned && (
                                                                <AdminBadge tone="danger">
                                                                    Bannie
                                                                </AdminBadge>
                                                            )}
                                                        </div>
                                                        <p
                                                            className="mt-1 truncate text-xs"
                                                            style={{ color: 'var(--ink-soft)' }}
                                                        >
                                                            {u.email}
                                                            {u.city ? ` · ${u.city}` : ''}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className="font-mono shrink-0 text-[10px] uppercase tracking-wider"
                                                        style={{ color: 'var(--ink-mute)' }}
                                                    >
                                                        {u.created_at}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </AdminCard>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}

/* ---------------------------------------------------------------------------
 * Sub-components
 * -------------------------------------------------------------------------*/

function ModChip({
    href,
    count,
    label,
}: {
    href: string;
    count: number;
    label: string;
}): JSX.Element {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-transform hover:-translate-y-px"
            style={{
                background: 'oklch(100% 0 0 / 0.12)',
                color: 'oklch(96% 0.02 50)',
            }}
        >
            <span
                className="grid h-6 min-w-[24px] place-items-center rounded px-1.5 text-xs font-bold"
                style={{ background: 'var(--gold)', color: 'var(--wine-deep)' }}
            >
                {count}
            </span>
            {label}
        </Link>
    );
}

function UserStat({
    label,
    value,
    tone = 'neutral',
    icon: Icon,
}: {
    label: string;
    value: number;
    tone?: 'neutral' | 'positive' | 'danger' | 'gold';
    icon?: typeof Users;
}): JSX.Element {
    const valueColor =
        tone === 'positive'
            ? 'var(--success)'
            : tone === 'danger'
              ? 'var(--destructive)'
              : tone === 'gold'
                ? 'var(--gold)'
                : 'var(--ink)';

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <div
                    className="editorial-caption"
                    style={{ color: 'var(--ink-mute)' }}
                >
                    {label}
                </div>
                <div
                    className="font-display mt-1 text-2xl font-medium tracking-tight"
                    style={{ color: valueColor }}
                >
                    {tone === 'positive' && value > 0 ? '+' : ''}
                    {value.toLocaleString('fr-FR')}
                </div>
            </div>
            {Icon && (
                <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--ink-mute)' }}
                />
            )}
        </div>
    );
}

function EmptyRow({
    label,
    icon: Icon,
}: {
    label: string;
    icon: typeof Users;
}): JSX.Element {
    return (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Icon
                className="h-8 w-8 opacity-30"
                style={{ color: 'var(--ink-mute)' }}
            />
            <p className="text-sm" style={{ color: 'var(--ink-mute)' }}>
                {label}
            </p>
        </div>
    );
}
