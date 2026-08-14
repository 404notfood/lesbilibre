import AdminLayout, {
    AdminBadge,
    AdminCard,
    AdminKpi,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Coins, Sparkles, TrendingDown, Wallet } from 'lucide-react';
import { useState } from 'react';

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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    transactions: {
        data: Transaction[];
        links: PaginationLink[];
        total: number;
        from: number | null;
        to: number | null;
    };
    stats: {
        in_circulation: number;
        issued: number;
        spent: number;
        revenue: number;
    };
    byType: { type: string; movements: number; total: number }[];
    topHolders: { id: number; pseudo: string; gems: number }[];
    filters: { type: string | null; search: string | null };
}

const TYPE_LABELS: Record<string, string> = {
    purchase: 'Achat',
    admin_add: 'Crédit admin',
    admin_remove: 'Débit admin',
    gift_sent: 'Cadeau envoyé',
    gift_received: 'Cadeau reçu',
    gallery_access: 'Accès galerie',
    gallery_access_refund: 'Remboursement galerie',
    profile_completion: 'Profil complété',
    premium_monthly_bonus: 'Bonus premium',
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

    const applyFilters = (next: { type?: string | null; search?: string }) => {
        router.get(
            '/admin/gems',
            {
                type: next.type !== undefined ? next.type : filters.type,
                search: next.search !== undefined ? next.search : filters.search,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AdminLayout
            title="Économie gemmes"
            subtitle="Circulation, flux et mouvements de la monnaie interne"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Économie gemmes' },
            ]}
        >
            <Head title="Économie gemmes · Admin" />

            {/* ---- KPI ------------------------------------------------- */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <AdminKpi
                    label="En circulation"
                    value={stats.in_circulation}
                    icon={Wallet}
                />
                <AdminKpi label="Émises au total" value={stats.issued} icon={Sparkles} />
                <AdminKpi label="Dépensées" value={stats.spent} icon={TrendingDown} />
                <AdminKpi
                    label="Revenus gemmes"
                    value={`${stats.revenue.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                    })} €`}
                    icon={Coins}
                />
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
                {/* ---- Répartition par type --------------------------- */}
                <AdminCard>
                    <AdminSectionTitle eyebrow="Flux" title="Par type" />
                    {byType.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--ink-mute)' }}>
                            Aucun mouvement enregistré.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {byType.map((row) => (
                                <button
                                    key={row.type}
                                    type="button"
                                    onClick={() =>
                                        applyFilters({
                                            type:
                                                filters.type === row.type
                                                    ? null
                                                    : row.type,
                                        })
                                    }
                                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-[color:var(--wine)]"
                                    style={{
                                        borderColor:
                                            filters.type === row.type
                                                ? 'var(--wine-deep)'
                                                : 'var(--line)',
                                    }}
                                >
                                    <span className="min-w-0 flex-1 truncate">
                                        {label(row.type)}
                                    </span>
                                    <span
                                        className="font-mono text-[11px]"
                                        style={{ color: 'var(--ink-mute)' }}
                                    >
                                        {row.movements}×
                                    </span>
                                    <span
                                        className="font-mono text-xs font-semibold"
                                        style={{
                                            color:
                                                row.total >= 0
                                                    ? 'var(--success)'
                                                    : 'var(--desire-deep)',
                                        }}
                                    >
                                        {row.total > 0 ? '+' : ''}
                                        {row.total.toLocaleString('fr-FR')}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </AdminCard>

                {/* ---- Top détentrices --------------------------------- */}
                <AdminCard>
                    <AdminSectionTitle eyebrow="Soldes" title="Plus gros soldes" />
                    {topHolders.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--ink-mute)' }}>
                            Aucun solde positif.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            {topHolders.map((holder, i) => (
                                <Link
                                    key={holder.id}
                                    href={`/admin/gems/${holder.id}`}
                                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[color:var(--bg-soft)]"
                                >
                                    <span
                                        className="font-mono w-4 text-[11px]"
                                        style={{ color: 'var(--ink-mute)' }}
                                    >
                                        {i + 1}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate font-medium">
                                        {holder.pseudo}
                                    </span>
                                    <span className="font-mono text-xs font-semibold">
                                        {holder.gems.toLocaleString('fr-FR')}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </AdminCard>

                {/* ---- Recherche --------------------------------------- */}
                <AdminCard>
                    <AdminSectionTitle eyebrow="Filtrer" title="Rechercher" />
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilters({ search });
                        }}
                        className="flex flex-col gap-3"
                    >
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Pseudo, nom ou e-mail"
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                            style={{
                                borderColor: 'var(--line)',
                                background: 'var(--bg-soft)',
                                color: 'var(--ink)',
                            }}
                        />
                        <button
                            type="submit"
                            className="rounded-lg px-4 py-2 text-sm font-semibold"
                            style={{ background: 'var(--ink)', color: 'var(--bg)' }}
                        >
                            Filtrer
                        </button>
                        {(filters.type || filters.search) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    router.get('/admin/gems', {}, { replace: true });
                                }}
                                className="text-xs underline"
                                style={{ color: 'var(--ink-mute)' }}
                            >
                                Réinitialiser les filtres
                            </button>
                        )}
                    </form>
                </AdminCard>
            </div>

            {/* ---- Journal des mouvements --------------------------- */}
            <div className="mt-5">
                <AdminCard padded={false}>
                    <div className="p-6 pb-0">
                        <AdminSectionTitle
                            eyebrow={`${transactions.total} mouvement${transactions.total > 1 ? 's' : ''}`}
                            title="Journal"
                            right={
                                filters.type ? (
                                    <AdminBadge tone="wine">
                                        {label(filters.type)}
                                    </AdminBadge>
                                ) : undefined
                            }
                        />
                    </div>

                    {transactions.data.length === 0 ? (
                        <p
                            className="px-6 pb-6 text-sm"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Aucun mouvement ne correspond à ces critères.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead
                                    className="border-y"
                                    style={{
                                        borderColor: 'var(--line)',
                                        background: 'var(--bg-soft)',
                                        color: 'var(--ink-mute)',
                                    }}
                                >
                                    <tr>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">Membre</th>
                                        <th className="p-4 font-medium">Type</th>
                                        <th className="p-4 font-medium">Motif</th>
                                        <th className="p-4 text-right font-medium">
                                            Montant
                                        </th>
                                        <th className="p-4 text-right font-medium">
                                            Solde
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="border-b last:border-0"
                                            style={{ borderColor: 'var(--line-soft)' }}
                                        >
                                            <td
                                                className="whitespace-nowrap p-4 text-xs"
                                                style={{ color: 'var(--ink-mute)' }}
                                            >
                                                {new Date(
                                                    tx.created_at,
                                                ).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="p-4">
                                                {tx.user ? (
                                                    <Link
                                                        href={`/admin/gems/${tx.user.id}`}
                                                        className="font-medium underline decoration-dotted underline-offset-2"
                                                    >
                                                        {tx.user.pseudo}
                                                    </Link>
                                                ) : (
                                                    <span
                                                        style={{
                                                            color: 'var(--ink-mute)',
                                                        }}
                                                    >
                                                        Compte supprimé
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">{label(tx.type)}</td>
                                            <td
                                                className="max-w-[220px] truncate p-4"
                                                style={{ color: 'var(--ink-mute)' }}
                                            >
                                                {tx.description ?? '—'}
                                            </td>
                                            <td
                                                className="font-mono p-4 text-right font-semibold"
                                                style={{
                                                    color:
                                                        tx.amount >= 0
                                                            ? 'var(--success)'
                                                            : 'var(--desire-deep)',
                                                }}
                                            >
                                                {tx.amount > 0 ? '+' : ''}
                                                {tx.amount.toLocaleString('fr-FR')}
                                            </td>
                                            <td className="font-mono p-4 text-right">
                                                {tx.balance_after.toLocaleString(
                                                    'fr-FR',
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>

                {transactions.data.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <p
                            className="font-mono text-[11px] uppercase tracking-wider"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            {transactions.from}–{transactions.to} sur{' '}
                            {transactions.total}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {transactions.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    className="inline-grid h-8 min-w-[32px] place-items-center rounded-md border px-2 text-xs font-semibold"
                                    style={{
                                        borderColor: link.active
                                            ? 'var(--wine-deep)'
                                            : 'var(--line)',
                                        background: link.active
                                            ? 'var(--wine-deep)'
                                            : 'var(--paper)',
                                        color: link.active
                                            ? 'oklch(96% 0.02 50)'
                                            : 'var(--ink-soft)',
                                        pointerEvents: link.url ? undefined : 'none',
                                        opacity: link.url ? 1 : 0.4,
                                    }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
