import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminKpi,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CreditCard, DollarSign, Plus, Search, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Subscription {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    plan: string;
    amount: number;
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    starts_at: string | null;
    expires_at: string | null;
    created_at: string;
}

interface Pagination {
    current_page: number;
    data: Subscription[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
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
}

export default function Index({
    subscriptions,
    filters,
    stats,
}: {
    subscriptions: Pagination;
    filters: Filters;
    stats: Stats;
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [plan, setPlan] = useState(filters.plan || '');

    const handleSearch = () => {
        router.get(
            '/admin/subscriptions',
            { search, status, plan },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSort = (field: string) => {
        const direction =
            filters.sort_by === field && filters.sort_direction === 'asc' ? 'desc' : 'asc';

        router.get(
            '/admin/subscriptions',
            { ...filters, sort_by: field, sort_direction: direction },
            { preserveState: true, preserveScroll: true }
        );
    };

    const getStatusBadge = (status: string) => {
        const tones: Record<string, 'success' | 'neutral' | 'danger' | 'wine'> = {
            active: 'success',
            canceled: 'neutral',
            expired: 'danger',
            trialing: 'wine',
        };

        const labels: Record<string, string> = {
            active: 'Actif',
            canceled: 'Annulé',
            expired: 'Expiré',
            trialing: 'Essai',
        };

        return (
            <AdminBadge tone={tones[status] || 'neutral'}>
                {labels[status] || status}
            </AdminBadge>
        );
    };

    return (
        <AdminLayout
            title="Abonnements"
            subtitle={`${subscriptions.total} abonnement${subscriptions.total > 1 ? 's' : ''} enregistré${subscriptions.total > 1 ? 's' : ''}`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Économie', href: '/admin/subscriptions' },
                { label: 'Abonnements' },
            ]}
            actions={
                <AdminButton variant="primary" href="/admin/subscriptions/create" icon={Plus}>
                    Nouvel abonnement
                </AdminButton>
            }
        >
            <Head title="Abonnements" />

            <div className="space-y-10">
                {/* KPIs */}
                <section>
                    <AdminSectionTitle
                        eyebrow="01 · Aperçu"
                        title="Indicateurs"
                    />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <AdminKpi
                            label="Total"
                            value={stats.total}
                            icon={CreditCard}
                        />
                        <AdminKpi
                            label="Actifs"
                            value={stats.active}
                            icon={DollarSign}
                            deltaTone="positive"
                        />
                        <AdminKpi
                            label="Annulés"
                            value={stats.canceled}
                            icon={XCircle}
                            deltaTone="neutral"
                        />
                        <AdminKpi
                            label="Expirés"
                            value={stats.expired}
                            icon={CreditCard}
                            deltaTone="warning"
                        />
                    </div>
                </section>

                {/* Filters */}
                <section>
                    <AdminSectionTitle
                        eyebrow="02 · Recherche"
                        title="Filtres"
                    />
                    <AdminCard>
                        <div className="grid gap-3 md:grid-cols-5">
                            <div className="md:col-span-2">
                                <Input
                                    placeholder="Rechercher par utilisateur..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>

                            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">Tous les statuts</option>
                                <option value="active">Actifs</option>
                                <option value="canceled">Annulés</option>
                                <option value="expired">Expirés</option>
                            </Select>

                            <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
                                <option value="">Tous les plans</option>
                                <option value="monthly">Mensuel</option>
                                <option value="yearly">Annuel</option>
                            </Select>

                            <AdminButton onClick={handleSearch} variant="primary" icon={Search}>
                                Rechercher
                            </AdminButton>
                        </div>
                    </AdminCard>
                </section>

                {/* Subscriptions Table */}
                <section>
                    <AdminSectionTitle
                        eyebrow="03 · Liste"
                        title="Abonnements"
                    />
                    <AdminCard padded={false}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead
                                    className="sticky top-0 z-10"
                                    style={{
                                        background: 'var(--bg-soft)',
                                        borderBottom: '1px solid var(--line)',
                                    }}
                                >
                                    <tr>
                                        <th
                                            className="editorial-caption px-4 py-3 text-left"
                                            style={{ color: 'var(--ink-mute)' }}
                                        >
                                            Utilisateur
                                        </th>
                                        <th
                                            className="editorial-caption px-4 py-3 text-left"
                                            style={{ color: 'var(--ink-mute)' }}
                                        >
                                            Plan
                                        </th>
                                        <th
                                            className="editorial-caption px-4 py-3 text-left"
                                            style={{ color: 'var(--ink-mute)' }}
                                        >
                                            Montant
                                        </th>
                                        <th
                                            className="editorial-caption px-4 py-3 text-left"
                                            style={{ color: 'var(--ink-mute)' }}
                                        >
                                            Statut
                                        </th>
                                        <th
                                            className="editorial-caption px-4 py-3 text-left cursor-pointer transition-colors hover:text-[color:var(--wine-deep)]"
                                            style={{ color: 'var(--ink-mute)' }}
                                            onClick={() => handleSort('expires_at')}
                                        >
                                            Expiration
                                        </th>
                                        <th
                                            className="editorial-caption px-4 py-3 text-left cursor-pointer transition-colors hover:text-[color:var(--wine-deep)]"
                                            style={{ color: 'var(--ink-mute)' }}
                                            onClick={() => handleSort('created_at')}
                                        >
                                            Créé
                                        </th>
                                        <th
                                            className="editorial-caption px-4 py-3 text-right"
                                            style={{ color: 'var(--ink-mute)' }}
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions.data.map((subscription) => (
                                        <tr
                                            key={subscription.id}
                                            className="transition-colors hover:bg-[color:var(--bg-soft)]"
                                            style={{ borderTop: '1px solid var(--line-soft)' }}
                                        >
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/admin/users/${subscription.user.id}`}
                                                    className="ghost-link block font-semibold"
                                                    style={{ color: 'var(--ink)' }}
                                                >
                                                    {subscription.user.name}
                                                </Link>
                                                <p
                                                    className="text-xs"
                                                    style={{ color: 'var(--ink-mute)' }}
                                                >
                                                    {subscription.user.email}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <AdminBadge tone="neutral">
                                                    {subscription.plan === 'monthly'
                                                        ? 'Mensuel'
                                                        : 'Annuel'}
                                                </AdminBadge>
                                            </td>
                                            <td
                                                className="px-4 py-3 font-semibold"
                                                style={{ color: 'var(--ink)' }}
                                            >
                                                {subscription.amount} €
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(subscription.status)}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-xs"
                                                style={{ color: 'var(--ink-soft)' }}
                                            >
                                                {subscription.expires_at || '-'}
                                            </td>
                                            <td
                                                className="px-4 py-3 text-xs"
                                                style={{ color: 'var(--ink-soft)' }}
                                            >
                                                {subscription.created_at}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <AdminButton
                                                    href={`/admin/subscriptions/${subscription.id}`}
                                                    variant="default"
                                                    size="sm"
                                                >
                                                    Voir
                                                </AdminButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {subscriptions.last_page > 1 && (
                            <div
                                className="flex items-center justify-between px-4 py-3"
                                style={{ borderTop: '1px solid var(--line)' }}
                            >
                                <p
                                    className="font-mono text-[10px] uppercase tracking-[0.14em]"
                                    style={{ color: 'var(--ink-mute)' }}
                                >
                                    Affichage {subscriptions.from} — {subscriptions.to} sur{' '}
                                    {subscriptions.total}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {subscriptions.links.map((link, index) => (
                                        <button
                                            key={index}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="font-mono inline-flex h-7 min-w-[28px] items-center justify-center rounded-md border px-2 text-[11px] transition-colors disabled:opacity-40"
                                            style={{
                                                background: link.active
                                                    ? 'var(--ink)'
                                                    : 'var(--paper)',
                                                color: link.active
                                                    ? 'var(--bg)'
                                                    : 'var(--ink-soft)',
                                                borderColor: 'var(--line)',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </AdminCard>
                </section>
            </div>
        </AdminLayout>
    );
}
