import AdminLayout, {
    AdminBadge,
    AdminBarList,
    AdminButton,
    AdminCard,
    AdminCardHeader,
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
import { Head, Link, router } from '@inertiajs/react';
import { Coins, Search, Sparkles, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TransactionUser {
    id: number;
    name: string;
    pseudo: string;
}

interface Transaction {
    id: number;
    type: string;
    amount: number;
    balance_after: number;
    description: string | null;
    user: TransactionUser | null;
    created_at: string;
}

interface Props {
    transactions: {
        data: Transaction[];
        from: number | null;
        to: number | null;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats: {
        in_circulation: number;
        issued: number;
        spent: number;
        revenue: number;
    };
    byType: Array<{ type: string; movements: number; total: number }>;
    topHolders: Array<{ id: number; pseudo: string; gems: number }>;
    filters: { type: string | null; search: string | null };
}

const TYPE_LABELS: Record<string, string> = {
    purchase: 'Achat',
    expense: 'Dépense',
    gift: 'Cadeau',
    admin_add: 'Ajout admin',
    admin_remove: 'Retrait admin',
    reward: 'Récompense',
    refund: 'Remboursement',
};

const label = (type: string): string => TYPE_LABELS[type] ?? type;

export default function Index({
    transactions,
    stats,
    byType,
    topHolders,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRender = useRef(true);

    const visit = (params: Record<string, string>) => {
        router.get(
            '/admin/gems',
            {
                search: params.search ?? search,
                type: params.type ?? filters.type ?? '',
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

    const hasFilters = Boolean(filters.search || filters.type);

    return (
        <AdminLayout
            title="Économie des gemmes"
            subtitle="Circulation, flux et mouvements récents"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Économie gemmes' },
            ]}
            hideSearch
        >
            <Head title="Économie gemmes · Admin" />

            <div className="space-y-4">
                {/* Indicateurs */}
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminKpi
                        label="En circulation"
                        value={stats.in_circulation}
                        hint="Soldes cumulés des comptes"
                        icon={Sparkles}
                    />
                    <AdminKpi
                        label="Émises"
                        value={stats.issued}
                        hint="Achats, cadeaux, récompenses"
                        icon={TrendingUp}
                    />
                    <AdminKpi
                        label="Dépensées"
                        value={stats.spent}
                        hint="Sorties de circulation"
                        icon={TrendingDown}
                    />
                    <AdminKpi
                        label="Revenus générés"
                        value={`${stats.revenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`}
                        hint="Ventes de packs"
                        icon={Coins}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Répartition par type */}
                    <AdminCard padded={false}>
                        <AdminCardHeader title="Mouvements par type" />
                        <div className="p-5">
                            {byType.length === 0 ? (
                                <p className="text-sm text-[color:var(--ink-mute)]">
                                    Aucun mouvement enregistré.
                                </p>
                            ) : (
                                <AdminBarList
                                    items={byType.map((row) => ({
                                        label: `${label(row.type)} · ${row.movements} mvt`,
                                        value: Math.abs(row.total),
                                    }))}
                                />
                            )}
                        </div>
                    </AdminCard>

                    {/* Plus gros soldes */}
                    <AdminCard padded={false} className="lg:col-span-2">
                        <AdminCardHeader
                            title="Plus gros soldes"
                            icon={Sparkles}
                            action={<AdminMeta>Top 10</AdminMeta>}
                        />
                        {topHolders.length === 0 ? (
                            <AdminEmpty
                                icon={Sparkles}
                                title="Aucun solde"
                                description="Personne ne détient encore de gemmes."
                            />
                        ) : (
                            <ul className="divide-y divide-[color:var(--line-soft)]">
                                {topHolders.map((holder, index) => (
                                    <li key={holder.id}>
                                        <Link
                                            href={`/admin/gems/${holder.id}`}
                                            className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-[color:var(--bg-soft)]"
                                        >
                                            <span className="font-mono w-5 shrink-0 text-xs text-[color:var(--ink-mute)]">
                                                {index + 1}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-[color:var(--ink)]">
                                                {holder.pseudo}
                                            </span>
                                            <span className="font-mono inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[color:var(--ink)]">
                                                <Sparkles className="h-3 w-3 text-[color:var(--gold)]" />
                                                {holder.gems.toLocaleString('fr-FR')}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </AdminCard>
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
                                    router.get('/admin/gems');
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
                                placeholder="pseudo, nom, e-mail…"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-9 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--paper)] pl-9 pr-3 text-sm text-[color:var(--ink)] outline-none transition-colors placeholder:text-[color:var(--ink-mute)] focus:border-[color:var(--desire)]"
                            />
                        </div>
                    </AdminField>

                    <AdminField label="Type de mouvement" className="w-[180px]">
                        <AdminSelect
                            value={filters.type ?? ''}
                            onChange={(value) => visit({ type: value })}
                        >
                            <option value="">Tous</option>
                            {byType.map((row) => (
                                <option key={row.type} value={row.type}>
                                    {label(row.type)}
                                </option>
                            ))}
                        </AdminSelect>
                    </AdminField>
                </AdminToolbar>

                {/* Journal des mouvements */}
                <AdminCard padded={false}>
                    <AdminCardHeader
                        title={`Mouvements · ${transactions.total.toLocaleString('fr-FR')}`}
                        icon={Coins}
                    />
                    {transactions.data.length === 0 ? (
                        <AdminEmpty
                            icon={Coins}
                            title="Aucun mouvement"
                            description={
                                hasFilters
                                    ? 'Aucun mouvement ne correspond à ces critères.'
                                    : 'Aucune transaction de gemmes enregistrée.'
                            }
                        />
                    ) : (
                        <>
                            <AdminTable>
                                <AdminThead>
                                    <AdminTh>Compte</AdminTh>
                                    <AdminTh>Type</AdminTh>
                                    <AdminTh>Motif</AdminTh>
                                    <AdminTh align="right">Montant</AdminTh>
                                    <AdminTh align="right">Solde après</AdminTh>
                                    <AdminTh>Date</AdminTh>
                                </AdminThead>
                                <tbody>
                                    {transactions.data.map((transaction) => (
                                        <AdminTr key={transaction.id}>
                                            <AdminTd>
                                                {transaction.user ? (
                                                    <Link
                                                        href={`/admin/gems/${transaction.user.id}`}
                                                        className="text-sm font-semibold text-[color:var(--ink)] hover:underline"
                                                    >
                                                        {transaction.user.pseudo ||
                                                            transaction.user.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-sm italic text-[color:var(--ink-mute)]">
                                                        compte supprimé
                                                    </span>
                                                )}
                                            </AdminTd>
                                            <AdminTd>
                                                <AdminBadge
                                                    tone={
                                                        transaction.amount >= 0
                                                            ? 'success'
                                                            : 'neutral'
                                                    }
                                                >
                                                    {label(transaction.type)}
                                                </AdminBadge>
                                            </AdminTd>
                                            <AdminTd>
                                                <p className="max-w-xs truncate text-xs text-[color:var(--ink-soft)]">
                                                    {transaction.description ?? '—'}
                                                </p>
                                            </AdminTd>
                                            <AdminTd align="right">
                                                <span
                                                    className={`font-mono text-sm font-semibold ${
                                                        transaction.amount >= 0
                                                            ? 'text-[color:var(--success)]'
                                                            : 'text-[color:var(--destructive)]'
                                                    }`}
                                                >
                                                    {transaction.amount > 0 ? '+' : ''}
                                                    {transaction.amount.toLocaleString(
                                                        'fr-FR',
                                                    )}
                                                </span>
                                            </AdminTd>
                                            <AdminTd align="right">
                                                <span className="font-mono text-xs text-[color:var(--ink-soft)]">
                                                    {transaction.balance_after.toLocaleString(
                                                        'fr-FR',
                                                    )}
                                                </span>
                                            </AdminTd>
                                            <AdminTd>
                                                <AdminMeta>
                                                    {new Date(
                                                        transaction.created_at,
                                                    ).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: '2-digit',
                                                    })}
                                                </AdminMeta>
                                            </AdminTd>
                                        </AdminTr>
                                    ))}
                                </tbody>
                            </AdminTable>

                            <AdminPagination
                                from={transactions.from}
                                to={transactions.to}
                                total={transactions.total}
                                lastPage={transactions.last_page}
                                links={transactions.links}
                            />
                        </>
                    )}
                </AdminCard>
            </div>
        </AdminLayout>
    );
}
