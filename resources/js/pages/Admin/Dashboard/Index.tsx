import AdminLayout, {
    AdminAreaChart,
    AdminBadge,
    AdminCard,
    AdminCardHeader,
    AdminChartLegend,
    AdminEmpty,
    AdminKpi,
    AdminMeta,
    AdminMeter,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    Coins,
    CreditCard,
    Flag,
    Heart,
    Image as ImageIcon,
    MessageCircle,
    ShieldCheck,
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
        new_previous_week: number;
        new_month: number;
        premium: number;
        verified: number;
        banned: number;
    };
    activation: {
        registered: number;
        profile_complete: number;
        with_photo: number;
        verified: number;
        first_like: number;
        first_match: number;
        first_message: number;
    };
    engagement: {
        total_matches: number;
        matches_today: number;
        matches_week: number;
        matches_previous_week: number;
        total_likes: number;
        likes_today: number;
        total_messages: number;
        messages_today: number;
        messages_week: number;
        messages_previous_week: number;
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

/** Formate une date ISO en libellé court « 12 août ». */
function shortDate(iso: string): string {
    const date = new Date(`${iso}T00:00:00`);

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/** Variation en pourcentage entre deux périodes, formatée pour l'affichage. */
function trend(
    current: number,
    previous: number,
): { label: string; tone: 'positive' | 'negative' | 'neutral' } {
    if (previous === 0) {
        return current > 0
            ? {
                  label: `+${current.toLocaleString('fr-FR')} vs 0`,
                  tone: 'positive',
              }
            : { label: 'stable', tone: 'neutral' };
    }

    const delta = Math.round(((current - previous) / previous) * 100);

    if (delta === 0) {
        return { label: 'stable', tone: 'neutral' };
    }

    return {
        label: `${delta > 0 ? '+' : ''}${delta}% vs semaine précédente`,
        tone: delta > 0 ? 'positive' : 'negative',
    };
}

const euro = (value: number): string =>
    `${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;

export default function Index({
    stats,
    charts,
    recent_reports,
    recent_users,
}: {
    stats: Stats;
    charts: ChartData;
    recent_reports: ReportRow[];
    recent_users: UserRow[];
}) {
    const { users, activation, engagement, moderation, revenue } = stats;

    const totalMod =
        moderation.pending_photos +
        moderation.pending_verifications +
        moderation.open_reports;

    const growthSeries = charts.user_growth.map((point) => point.count);
    const usersTrend = trend(users.new_week, users.new_previous_week);
    const matchesTrend = trend(
        engagement.matches_week,
        engagement.matches_previous_week,
    );
    const messagesTrend = trend(
        engagement.messages_week,
        engagement.messages_previous_week,
    );

    // Taux de conversion like → match : indicateur de santé du matching.
    const matchRate =
        engagement.total_likes > 0
            ? Math.round(
                  (engagement.total_matches / engagement.total_likes) * 100,
              )
            : 0;

    return (
        <AdminLayout
            title="Vue d'ensemble"
            subtitle="État de la plateforme en temps réel"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: "Vue d'ensemble" },
            ]}
        >
            <div className="space-y-8">
                {/* ==========================================================
                 * 00 · File d'attente de modération (prioritaire)
                 * ========================================================*/}
                {totalMod > 0 ? (
                    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[color:var(--wine)] to-[color:var(--wine-deep)] p-5 text-white sm:p-6">
                        <div
                            aria-hidden
                            className="absolute -top-16 -right-16 h-52 w-52 rounded-full opacity-40"
                            style={{
                                background:
                                    'radial-gradient(circle, var(--desire) 0%, transparent 68%)',
                            }}
                        />
                        <div className="relative flex flex-wrap items-end justify-between gap-5">
                            <div className="min-w-0 flex-1">
                                <div className="editorial-eyebrow mb-2 inline-flex items-center gap-2 text-white/70">
                                    <AlertTriangle className="h-3 w-3" />
                                    Action requise
                                </div>
                                <h2 className="font-display text-2xl leading-tight font-medium md:text-3xl">
                                    <em className="text-[color:var(--gold)] italic">
                                        {totalMod}
                                    </em>{' '}
                                    élément{totalMod > 1 ? 's' : ''} en attente
                                    de décision.
                                </h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {moderation.pending_photos > 0 && (
                                    <ModChip
                                        href="/admin/photos/pending"
                                        count={moderation.pending_photos}
                                        label="photos"
                                        icon={ImageIcon}
                                    />
                                )}
                                {moderation.pending_verifications > 0 && (
                                    <ModChip
                                        href="/admin/verifications"
                                        count={moderation.pending_verifications}
                                        label="vérifications"
                                        icon={ShieldCheck}
                                    />
                                )}
                                {moderation.open_reports > 0 && (
                                    <ModChip
                                        href="/admin/reports"
                                        count={moderation.open_reports}
                                        label="signalements"
                                        icon={Flag}
                                    />
                                )}
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] px-5 py-4">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[oklch(60%_0.16_160_/_0.15)]">
                            <ShieldCheck className="h-4 w-4 text-[color:var(--success)]" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="font-display text-base font-semibold">
                                File de modération vide
                            </p>
                            <p className="text-sm text-[color:var(--ink-mute)]">
                                Aucune photo, vérification ou plainte
                                n&apos;attend de décision.
                            </p>
                        </div>
                    </section>
                )}

                {/* ==========================================================
                 * 01 · Indicateurs clés
                 * ========================================================*/}
                <section>
                    <AdminSectionTitle
                        eyebrow="01 · Indicateurs clés"
                        title="Plateforme"
                    />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <AdminKpi
                            label="Utilisatrices"
                            value={users.total}
                            delta={usersTrend.label}
                            deltaTone={usersTrend.tone}
                            hint={`${users.new_today} inscription${users.new_today > 1 ? 's' : ''} aujourd’hui`}
                            icon={Users}
                            href="/admin/users"
                            series={growthSeries}
                        />
                        <AdminKpi
                            label="Matches"
                            value={engagement.total_matches}
                            delta={matchesTrend.label}
                            deltaTone={matchesTrend.tone}
                            hint={`${matchRate}% des likes deviennent un match`}
                            icon={Heart}
                        />
                        <AdminKpi
                            label="Messages"
                            value={engagement.total_messages}
                            delta={messagesTrend.label}
                            deltaTone={messagesTrend.tone}
                            hint={`${engagement.total_conversations.toLocaleString('fr-FR')} conversations`}
                            icon={MessageCircle}
                        />
                        <AdminKpi
                            label="Abonnements actifs"
                            value={revenue.active_subscriptions}
                            hint={`${users.premium.toLocaleString('fr-FR')} comptes Premium`}
                            icon={CreditCard}
                            href="/admin/subscriptions"
                        />
                    </div>
                </section>

                <section>
                    <AdminSectionTitle
                        eyebrow="02 · Activation"
                        title="De l’inscription à la conversation"
                    />
                    <p className="mb-4 max-w-3xl text-sm text-[color:var(--ink-mute)]">
                        Chaque taux est calculé sur l’ensemble des comptes. Il
                        permet de voir où les membres ont besoin d’un meilleur
                        accompagnement.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            ['Inscrites', activation.registered],
                            ['Profil complété', activation.profile_complete],
                            ['Avec une photo', activation.with_photo],
                            ['Vérifiées', activation.verified],
                            ['Premier like', activation.first_like],
                            ['Premier match', activation.first_match],
                            ['Premier message', activation.first_message],
                        ].map(([label, rawValue]) => {
                            const value = Number(rawValue);
                            const rate =
                                activation.registered > 0
                                    ? Math.round(
                                          (value / activation.registered) * 100,
                                      )
                                    : 0;
                            return (
                                <AdminCard key={String(label)} className="p-4">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <span className="text-sm font-medium">
                                            {label}
                                        </span>
                                        <strong className="font-display text-xl">
                                            {value.toLocaleString('fr-FR')}
                                        </strong>
                                    </div>
                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[color:var(--line-soft)]">
                                        <div
                                            className="h-full rounded-full bg-[color:var(--desire)]"
                                            style={{
                                                width: `${Math.min(rate, 100)}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="mt-2 text-xs text-[color:var(--ink-mute)]">
                                        {rate}% des inscrites
                                    </div>
                                </AdminCard>
                            );
                        })}
                    </div>
                </section>

                {/* ==========================================================
                 * 02 · Courbes
                 * ========================================================*/}
                <section className="grid gap-4 lg:grid-cols-5">
                    <AdminCard className="lg:col-span-3" padded={false}>
                        <AdminCardHeader
                            title="Inscriptions"
                            icon={Users}
                            action={<AdminMeta>30 derniers jours</AdminMeta>}
                        />
                        <div className="p-5">
                            <AdminAreaChart
                                labels={charts.user_growth.map((point) =>
                                    shortDate(point.date),
                                )}
                                series={[
                                    {
                                        label: 'Inscriptions',
                                        color: 'var(--desire)',
                                        values: growthSeries,
                                    },
                                ]}
                                height={200}
                            />
                        </div>
                    </AdminCard>

                    <AdminCard className="lg:col-span-2" padded={false}>
                        <AdminCardHeader
                            title="Engagement"
                            icon={Heart}
                            action={<AdminMeta>7 jours</AdminMeta>}
                        />
                        <div className="space-y-4 p-5">
                            <AdminAreaChart
                                labels={charts.activity.map((point) =>
                                    shortDate(point.date),
                                )}
                                series={[
                                    {
                                        label: 'Likes',
                                        color: 'var(--desire)',
                                        values: charts.activity.map(
                                            (p) => p.likes,
                                        ),
                                    },
                                    {
                                        label: 'Matches',
                                        color: 'var(--gold)',
                                        values: charts.activity.map(
                                            (p) => p.matches,
                                        ),
                                    },
                                    {
                                        label: 'Messages',
                                        color: 'var(--wine)',
                                        values: charts.activity.map(
                                            (p) => p.messages,
                                        ),
                                    },
                                ]}
                                height={180}
                            />
                            <AdminChartLegend
                                series={[
                                    { label: 'Likes', color: 'var(--desire)' },
                                    { label: 'Matches', color: 'var(--gold)' },
                                    { label: 'Messages', color: 'var(--wine)' },
                                ]}
                            />
                        </div>
                    </AdminCard>
                </section>

                {/* ==========================================================
                 * 03 · Audience — ratios plutôt que nombres bruts
                 * ========================================================*/}
                <section>
                    <AdminSectionTitle
                        eyebrow="02 · Audience"
                        title="Composition et activité"
                        right={
                            <Link
                                href="/admin/users"
                                className="ghost-link text-xs font-medium text-[color:var(--wine-deep)]"
                            >
                                Gérer les comptes →
                            </Link>
                        }
                    />
                    <div className="grid gap-3 lg:grid-cols-3">
                        <AdminCard>
                            <h3 className="editorial-caption mb-4 text-[color:var(--ink-mute)]">
                                Utilisatrices actives
                            </h3>
                            <div className="space-y-3.5">
                                <AdminMeter
                                    label={`Aujourd’hui · ${users.active_today}`}
                                    value={users.active_today}
                                    total={users.total}
                                />
                                <AdminMeter
                                    label={`Cette semaine · ${users.active_week}`}
                                    value={users.active_week}
                                    total={users.total}
                                />
                                <AdminMeter
                                    label={`Ce mois · ${users.active_month}`}
                                    value={users.active_month}
                                    total={users.total}
                                />
                            </div>
                            <p className="mt-4 border-t border-[color:var(--line-soft)] pt-3 text-[11px] text-[color:var(--ink-mute)]">
                                Part de la base totale (
                                {users.total.toLocaleString('fr-FR')} comptes).
                            </p>
                        </AdminCard>

                        <AdminCard>
                            <h3 className="editorial-caption mb-4 text-[color:var(--ink-mute)]">
                                Qualité de la base
                            </h3>
                            <div className="space-y-3.5">
                                <AdminMeter
                                    label={`Vérifiées · ${users.verified}`}
                                    value={users.verified}
                                    total={users.total}
                                    tone="success"
                                />
                                <AdminMeter
                                    label={`Premium · ${users.premium}`}
                                    value={users.premium}
                                    total={users.total}
                                    tone="gold"
                                />
                                <AdminMeter
                                    label={`Bannies · ${users.banned}`}
                                    value={users.banned}
                                    total={users.total}
                                    tone="danger"
                                />
                            </div>
                            <p className="mt-4 border-t border-[color:var(--line-soft)] pt-3 text-[11px] text-[color:var(--ink-mute)]">
                                La vérification est le meilleur signal anti-faux
                                profils.
                            </p>
                        </AdminCard>

                        <AdminCard>
                            <h3 className="editorial-caption mb-4 text-[color:var(--ink-mute)]">
                                Nouvelles inscriptions
                            </h3>
                            <dl className="space-y-3">
                                <SplitStat
                                    label="Aujourd’hui"
                                    value={users.new_today}
                                />
                                <SplitStat
                                    label="Cette semaine"
                                    value={users.new_week}
                                    note={usersTrend.label}
                                    tone={usersTrend.tone}
                                />
                                <SplitStat
                                    label="Ce mois"
                                    value={users.new_month}
                                />
                            </dl>
                            <div className="mt-4 h-10 border-t border-[color:var(--line-soft)] pt-3">
                                <AdminAreaChart
                                    labels={charts.user_growth.map((p) =>
                                        shortDate(p.date),
                                    )}
                                    series={[
                                        {
                                            label: 'Inscriptions',
                                            color: 'var(--wine)',
                                            values: growthSeries,
                                        },
                                    ]}
                                    height={40}
                                />
                            </div>
                        </AdminCard>
                    </div>
                </section>

                {/* ==========================================================
                 * 04 · Monétisation
                 * ========================================================*/}
                <section>
                    <AdminSectionTitle
                        eyebrow="03 · Monétisation"
                        title="Revenus & gemmes"
                        right={
                            <Link
                                href="/admin/billing"
                                className="ghost-link text-xs font-medium text-[color:var(--wine-deep)]"
                            >
                                Offres & tarifs →
                            </Link>
                        }
                    />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <AdminKpi
                            label="Revenus abonnements"
                            value={euro(revenue.total)}
                            hint="Cumul des abonnements actifs"
                            icon={CreditCard}
                        />
                        <AdminKpi
                            label="Revenus ce mois"
                            value={euro(revenue.this_month)}
                            hint="Abonnements souscrits ce mois"
                            icon={CreditCard}
                        />
                        <AdminKpi
                            label="Gemmes vendues (mois)"
                            value={euro(revenue.gems_revenue_month)}
                            hint="Achats de packs de gemmes"
                            icon={Coins}
                            href="/admin/gems"
                        />
                        <AdminKpi
                            label="Gemmes en circulation"
                            value={
                                revenue.gems_distributed - revenue.gems_spent
                            }
                            hint={`${revenue.gems_distributed.toLocaleString('fr-FR')} distribuées · ${revenue.gems_spent.toLocaleString('fr-FR')} dépensées`}
                            icon={Sparkles}
                            href="/admin/gems"
                        />
                    </div>
                </section>

                {/* ==========================================================
                 * 05 · Flux récents
                 * ========================================================*/}
                <section>
                    <AdminSectionTitle
                        eyebrow="04 · Flux récents"
                        title="À l'instant"
                    />
                    <div className="grid gap-4 lg:grid-cols-2">
                        <AdminCard padded={false}>
                            <AdminCardHeader
                                title="Derniers signalements"
                                icon={Flag}
                                action={
                                    <Link
                                        href="/admin/reports"
                                        className="ghost-link text-xs font-medium text-[color:var(--wine-deep)]"
                                    >
                                        Tous voir →
                                    </Link>
                                }
                            />
                            {recent_reports.length === 0 ? (
                                <AdminEmpty
                                    icon={Flag}
                                    title="Aucun signalement en attente"
                                    description="Les plaintes des utilisatrices apparaîtront ici."
                                />
                            ) : (
                                <ul>
                                    {recent_reports.map((report) => (
                                        <li
                                            key={report.id}
                                            className="border-b border-[color:var(--line-soft)] last:border-b-0"
                                        >
                                            <Link
                                                href={`/admin/reports/${report.id}`}
                                                className="flex items-start justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[color:var(--bg-soft)]"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-semibold">
                                                        {report.reporter}{' '}
                                                        <span className="font-normal text-[color:var(--ink-mute)]">
                                                            contre
                                                        </span>{' '}
                                                        {report.reported}
                                                    </div>
                                                    <p className="mt-0.5 truncate text-xs text-[color:var(--ink-soft)]">
                                                        {report.reason}
                                                    </p>
                                                </div>
                                                <AdminMeta>
                                                    {report.created_at}
                                                </AdminMeta>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </AdminCard>

                        <AdminCard padded={false}>
                            <AdminCardHeader
                                title="Nouvelles inscriptions"
                                icon={UserCheck}
                                action={
                                    <Link
                                        href="/admin/users"
                                        className="ghost-link text-xs font-medium text-[color:var(--wine-deep)]"
                                    >
                                        Toutes voir →
                                    </Link>
                                }
                            />
                            {recent_users.length === 0 ? (
                                <AdminEmpty
                                    icon={Users}
                                    title="Aucune nouvelle inscription"
                                    description="Les derniers comptes créés apparaîtront ici."
                                />
                            ) : (
                                <ul>
                                    {recent_users.map((user) => (
                                        <li
                                            key={user.id}
                                            className="border-b border-[color:var(--line-soft)] last:border-b-0"
                                        >
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="flex items-start justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[color:var(--bg-soft)]"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="text-sm font-semibold">
                                                            {user.name}
                                                        </span>
                                                        {user.is_verified && (
                                                            <BadgeCheck className="h-3.5 w-3.5 text-[color:var(--success)]" />
                                                        )}
                                                        {user.is_premium && (
                                                            <AdminBadge tone="gold">
                                                                Premium
                                                            </AdminBadge>
                                                        )}
                                                        {user.is_banned && (
                                                            <AdminBadge tone="danger">
                                                                <UserMinus className="h-2.5 w-2.5" />
                                                                Bannie
                                                            </AdminBadge>
                                                        )}
                                                    </div>
                                                    <p className="mt-0.5 truncate text-xs text-[color:var(--ink-soft)]">
                                                        {user.email}
                                                        {user.city
                                                            ? ` · ${user.city}`
                                                            : ''}
                                                    </p>
                                                </div>
                                                <AdminMeta>
                                                    {user.created_at}
                                                </AdminMeta>
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
 * Sous-composants
 * -------------------------------------------------------------------------*/

function ModChip({
    href,
    count,
    label,
    icon: Icon,
}: {
    href: string;
    count: number;
    label: string;
    icon: typeof Users;
}) {
    return (
        <Link
            href={href}
            className="group inline-flex items-center gap-2 rounded-lg bg-white/[0.14] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/[0.22]"
        >
            <span className="grid h-6 min-w-[24px] place-items-center rounded bg-[color:var(--gold)] px-1.5 font-mono text-xs font-bold text-[color:var(--wine-deep)]">
                {count}
            </span>
            <Icon className="h-3.5 w-3.5 opacity-70" />
            {label}
            <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-70" />
        </Link>
    );
}

function SplitStat({
    label,
    value,
    note,
    tone = 'neutral',
}: {
    label: string;
    value: number;
    note?: string;
    tone?: 'positive' | 'negative' | 'neutral';
}) {
    const noteClass =
        tone === 'positive'
            ? 'text-[color:var(--success)]'
            : tone === 'negative'
              ? 'text-[color:var(--destructive)]'
              : 'text-[color:var(--ink-mute)]';

    return (
        <div className="flex items-baseline justify-between gap-3">
            <dt className="text-xs text-[color:var(--ink-soft)]">{label}</dt>
            <dd className="text-right">
                <span className="font-display text-lg font-medium text-[color:var(--ink)]">
                    {value.toLocaleString('fr-FR')}
                </span>
                {note && (
                    <div className={`text-[10px] ${noteClass}`}>{note}</div>
                )}
            </dd>
        </div>
    );
}
