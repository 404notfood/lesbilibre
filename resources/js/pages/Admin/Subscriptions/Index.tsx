import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminEmpty,
    AdminField,
    AdminKpi,
    AdminMeta,
    AdminPagination,
    AdminSelect,
    AdminTable,
    AdminTd,
    AdminTh,
    AdminThead,
    AdminToolbar,
    AdminTr,
} from '@/layouts/admin-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BadgeCheck,
    CalendarClock,
    CheckCircle,
    CreditCard,
    Plus,
    RotateCcw,
    Search,
    Wallet,
    X,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Subscription {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
        is_premium: boolean;
        is_banned: boolean;
    };
    plan: string;
    amount: number;
    status: string;
    payment_method: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    starts_at: string | null;
    expires_at: string | null;
    days_remaining: number | null;
    created_at: string;
}

interface Pagination {
    current_page: number;
    data: Subscription[];
    from: number | null;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    per_page: number;
    to: number | null;
    total: number;
}

interface Filters {
    search?: string;
    status?: string;
    plan?: string;
    sort_by: string;
    sort_direction: string;
}

interface Stats {
    total: number;
    active: number;
    canceled: number;
    expired: number;
    stale: number;
    expiring_soon: number;
    mrr: number;
}

const STATUS_TONES: Record<string, 'success' | 'danger' | 'neutral' | 'warning'> = {
    active: 'success',
    canceled: 'danger',
    expired: 'neutral',
    pending: 'warning',
};

const STATUS_LABELS: Record<string, string> = {
    active: 'Actif',
    canceled: 'Annulé',
    expired: 'Expiré',
    pending: 'En attente',
};

const PLAN_LABELS: Record<string, string> = {
    monthly: 'Mensuel',
    yearly: 'Annuel',
};

export default function Index({
    subscriptions,
    filters,
    stats,
}: {
    subscriptions: Pagination;
    filters: Filters;
    stats: Stats;
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [confirming, setConfirming] = useState<Subscription | null>(null);
    const isFirstRender = useRef(true);

    const visit = (params: Record<string, string>) => {
        router.get(
            '/admin/subscriptions',
            {
                search: params.search ?? search,
                status: params.status ?? filters.status ?? '',
                plan: params.plan ?? filters.plan ?? '',
                sort_by: params.sort_by ?? filters.sort_by,
                sort_direction: params.sort_direction ?? filters.sort_direction,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                visit({ search });
            }
        }, 350);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const sort = (field: string) => {
        const direction =
            filters.sort_by === field && filters.sort_direction === 'asc'
                ? 'desc'
                : 'asc';
        visit({ sort_by: field, sort_direction: direction });
    };

    const hasFilters = Boolean(filters.search || filters.status || filters.plan);

    return (
        <AdminLayout
            title="Abonnées"
            subtitle={`${subscriptions.total.toLocaleString('fr-FR')} abonnement${subscriptions.total > 1 ? 's' : ''}`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Abonnées' },
            ]}
            hideSearch
            actions={
                <AdminButton
                    variant="wine"
                    icon={Plus}
                    href="/admin/subscriptions/create"
                >
                    Créer un abonnement
                </AdminButton>
            }
        >
            <Head title="Abonnées · Admin" />

            <div className="space-y-4">
                {/* Anomalie : des abonnements marqués actifs sont périmés. */}
                {stats.stale > 0 && (
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--destructive)]/30 bg-[oklch(62%_0.19_10_/_0.08)] px-5 py-4">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-[color:var(--destructive)]" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[color:var(--ink)]">
                                {stats.stale} abonnement{stats.stale > 1 ? 's' : ''} encore
                                marqué{stats.stale > 1 ? 's' : ''} actif
                                {stats.stale > 1 ? 's' : ''} alors que la date de fin est
                                passée.
                            </p>
                            <p className="mt-0.5 text-xs text-[color:var(--ink-mute)]">
                                Ces comptes gardent leur Premium indûment. La tâche
                                planifiée <code className="font-mono">subscriptions:expire</code>{' '}
                                les régularise chaque nuit à 2 h — si le cron n&apos;est pas
                                actif sur le serveur, lance-la à la main.
                            </p>
                        </div>
                        <AdminButton
                            size="sm"
                            variant="danger"
                            onClick={() => visit({ status: 'active' })}
                        >
                            Les voir
                        </AdminButton>
                    </div>
                )}

                {/* Indicateurs */}
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminKpi
                        label="Abonnements actifs"
                        value={stats.active}
                        hint={`${stats.total.toLocaleString('fr-FR')} au total`}
                        icon={CheckCircle}
                    />
                    <AdminKpi
                        label="Revenu récurrent"
                        value={`${Number(stats.mrr).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`}
                        hint="Somme des abonnements valides"
                        icon={Wallet}
                    />
                    <AdminKpi
                        label="Expirent sous 7 jours"
                        value={stats.expiring_soon}
                        deltaTone={stats.expiring_soon > 0 ? 'warning' : 'neutral'}
                        hint="À relancer si tu veux les retenir"
                        icon={CalendarClock}
                    />
                    <AdminKpi
                        label="Annulés / expirés"
                        value={stats.canceled + stats.expired}
                        hint={`${stats.canceled} annulés · ${stats.expired} expirés`}
                        icon={XCircle}
                    />
                </div>

                {/* Filtres */}
                <AdminToolbar
                    right={
                        hasFilters ? (
                            <AdminButton
                                variant="ghost"
                                size="sm"
                                icon={X}
                                onClick={() => {
                                    setSearch('');
                                    router.get('/admin/subscriptions');
                                }}
                            >
                                Réinitialiser
                            </AdminButton>
                        ) : undefined
                    }
                >
                    <AdminField label="Recherche" className="min-w-[220px] flex-1">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-mute)]" />
                            <input
                                type="search"
                                placeholder="nom ou e-mail…"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-9 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--paper)] pl-9 pr-3 text-sm text-[color:var(--ink)] outline-none transition-colors placeholder:text-[color:var(--ink-mute)] focus:border-[color:var(--desire)]"
                            />
                        </div>
                    </AdminField>

                    <AdminField label="Statut" className="w-[150px]">
                        <AdminSelect
                            value={filters.status ?? ''}
                            onChange={(value) => visit({ status: value })}
                        >
                            <option value="">Tous</option>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </AdminSelect>
                    </AdminField>

                    <AdminField label="Formule" className="w-[150px]">
                        <AdminSelect
                            value={filters.plan ?? ''}
                            onChange={(value) => visit({ plan: value })}
                        >
                            <option value="">Toutes</option>
                            {Object.entries(PLAN_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </AdminSelect>
                    </AdminField>
                </AdminToolbar>

                {/* Table */}
                <AdminCard padded={false}>
                    {subscriptions.data.length === 0 ? (
                        <AdminEmpty
                            icon={CreditCard}
                            title="Aucun abonnement"
                            description={
                                hasFilters
                                    ? 'Aucun abonnement ne correspond à ces critères.'
                                    : 'Aucun abonnement n’a encore été souscrit.'
                            }
                            action={
                                <AdminButton
                                    size="sm"
                                    variant="wine"
                                    icon={Plus}
                                    href="/admin/subscriptions/create"
                                >
                                    Créer un abonnement
                                </AdminButton>
                            }
                        />
                    ) : (
                        <>
                            <AdminTable>
                                <AdminThead>
                                    <AdminTh>Abonnée</AdminTh>
                                    <AdminTh
                                        onSort={() => sort('plan')}
                                        active={filters.sort_by === 'plan'}
                                        direction={filters.sort_direction}
                                    >
                                        Formule
                                    </AdminTh>
                                    <AdminTh
                                        onSort={() => sort('amount')}
                                        active={filters.sort_by === 'amount'}
                                        direction={filters.sort_direction}
                                        align="right"
                                    >
                                        Montant
                                    </AdminTh>
                                    <AdminTh
                                        onSort={() => sort('status')}
                                        active={filters.sort_by === 'status'}
                                        direction={filters.sort_direction}
                                    >
                                        Statut
                                    </AdminTh>
                                    <AdminTh
                                        onSort={() => sort('expires_at')}
                                        active={filters.sort_by === 'expires_at'}
                                        direction={filters.sort_direction}
                                    >
                                        Échéance
                                    </AdminTh>
                                    <AdminTh align="right">Actions</AdminTh>
                                </AdminThead>
                                <tbody>
                                    {subscriptions.data.map((subscription) => (
                                        <SubscriptionRow
                                            key={subscription.id}
                                            subscription={subscription}
                                            onCancel={() => setConfirming(subscription)}
                                        />
                                    ))}
                                </tbody>
                            </AdminTable>

                            <AdminPagination
                                from={subscriptions.from}
                                to={subscriptions.to}
                                total={subscriptions.total}
                                lastPage={subscriptions.last_page}
                                links={subscriptions.links}
                            />
                        </>
                    )}
                </AdminCard>
            </div>

            {/* Confirmation d'annulation */}
            <Dialog
                open={confirming !== null}
                onOpenChange={(open) => !open && setConfirming(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium italic">
                            Annuler cet abonnement
                        </DialogTitle>
                        <DialogDescription>
                            {confirming && (
                                <>
                                    L&apos;abonnement de{' '}
                                    <strong>{confirming.user.name}</strong> passera en «
                                    annulé » et le statut Premium sera retiré
                                    immédiatement, sauf si un autre abonnement actif
                                    existe.
                                    {confirming.payment_method !== 'admin' && (
                                        <span className="mt-2 block text-[color:var(--destructive)]">
                                            Attention : cet abonnement provient d&apos;un
                                            paiement ({confirming.payment_method}).
                                            L&apos;annuler ici ne résilie pas le
                                            prélèvement côté Stripe — fais-le aussi depuis
                                            le tableau de bord Stripe.
                                        </span>
                                    )}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <AdminButton onClick={() => setConfirming(null)}>
                            Revenir
                        </AdminButton>
                        <AdminButton
                            variant="danger"
                            icon={XCircle}
                            onClick={() => {
                                if (!confirming) {
                                    return;
                                }

                                router.post(
                                    `/admin/subscriptions/${confirming.id}/cancel`,
                                    {},
                                    {
                                        preserveScroll: true,
                                        onFinish: () => setConfirming(null),
                                    },
                                );
                            }}
                        >
                            Confirmer l&apos;annulation
                        </AdminButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

/* ---------------------------------------------------------------------------
 * Ligne d'abonnement
 * -------------------------------------------------------------------------*/
function SubscriptionRow({
    subscription,
    onCancel,
}: {
    subscription: Subscription;
    onCancel: () => void;
}) {
    const { days_remaining: days, status } = subscription;

    // Un abonnement « actif » dont l'échéance est dépassée n'a pas été traité
    // par la tâche d'expiration : on le signale explicitement.
    const isStale = status === 'active' && days !== null && days < 0;

    return (
        <AdminTr>
            <AdminTd>
                <Link
                    href={`/admin/users/${subscription.user.id}`}
                    className="block min-w-0"
                >
                    <div className="flex items-center gap-1.5">
                        <span className="font-display truncate text-[15px] font-semibold text-[color:var(--ink)]">
                            {subscription.user.name}
                        </span>
                        {subscription.user.is_premium && (
                            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[color:var(--gold)]" />
                        )}
                        {subscription.user.is_banned && (
                            <AdminBadge tone="danger">Bannie</AdminBadge>
                        )}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-[color:var(--ink-soft)]">
                        {subscription.user.email}
                    </div>
                </Link>
            </AdminTd>

            <AdminTd>
                <div className="text-sm font-medium text-[color:var(--ink)]">
                    {PLAN_LABELS[subscription.plan] ?? subscription.plan}
                </div>
                {subscription.payment_method && (
                    <AdminMeta>
                        {subscription.payment_method === 'admin'
                            ? 'manuel'
                            : subscription.payment_method}
                    </AdminMeta>
                )}
            </AdminTd>

            <AdminTd align="right">
                <span className="font-mono text-sm font-semibold text-[color:var(--ink)]">
                    {Number(subscription.amount).toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                    })}{' '}
                    €
                </span>
            </AdminTd>

            <AdminTd>
                {isStale ? (
                    <AdminBadge tone="danger">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Périmé
                    </AdminBadge>
                ) : (
                    <AdminBadge tone={STATUS_TONES[status] ?? 'neutral'}>
                        {STATUS_LABELS[status] ?? status}
                    </AdminBadge>
                )}
            </AdminTd>

            <AdminTd>
                {subscription.expires_at ? (
                    <>
                        <div className="text-sm text-[color:var(--ink)]">
                            {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
                        </div>
                        {status === 'active' && days !== null && (
                            <div
                                className={`text-[11px] ${
                                    days < 0
                                        ? 'font-semibold text-[color:var(--destructive)]'
                                        : days <= 7
                                          ? 'font-semibold text-[color:var(--desire)]'
                                          : 'text-[color:var(--ink-mute)]'
                                }`}
                            >
                                {days < 0
                                    ? `dépassée de ${Math.abs(days)} j`
                                    : days === 0
                                      ? "expire aujourd'hui"
                                      : `dans ${days} j`}
                            </div>
                        )}
                    </>
                ) : (
                    <AdminMeta>illimité</AdminMeta>
                )}
            </AdminTd>

            <AdminTd align="right">
                <div className="flex justify-end gap-1.5">
                    {status === 'active' ? (
                        <AdminButton
                            size="sm"
                            variant="ghost"
                            icon={XCircle}
                            onClick={onCancel}
                            title="Annuler l'abonnement"
                        >
                            Annuler
                        </AdminButton>
                    ) : (
                        <AdminButton
                            size="sm"
                            variant="ghost"
                            icon={RotateCcw}
                            onClick={() =>
                                router.post(
                                    `/admin/subscriptions/${subscription.id}/reactivate`,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            title="Réactiver l'abonnement"
                        >
                            Réactiver
                        </AdminButton>
                    )}
                    <AdminButton
                        size="sm"
                        href={`/admin/subscriptions/${subscription.id}`}
                    >
                        Ouvrir
                    </AdminButton>
                </div>
            </AdminTd>
        </AdminTr>
    );
}
