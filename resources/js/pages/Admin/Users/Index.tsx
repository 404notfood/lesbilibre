import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
} from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { BadgeCheck, ChevronDown, ChevronUp, Search, Sparkles, UserMinus } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    pseudo: string;
    is_premium: boolean;
    is_verified: boolean;
    is_banned: boolean;
    ban_reason: string | null;
    gems_balance: number;
    badge_points: number;
    last_activity_at: string | null;
    created_at: string;
    city: string | null;
    age: number | null;
}

interface Pagination {
    current_page: number;
    data: User[];
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
    sort_by: string;
    sort_direction: string;
}

export default function Index({
    users,
    filters,
}: {
    users: Pagination;
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const submit = (overrides: Record<string, string | number> = {}) => {
        router.get(
            '/admin/users',
            { search, status, ...overrides },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSort = (field: string) => {
        const direction =
            filters.sort_by === field && filters.sort_direction === 'asc'
                ? 'desc'
                : 'asc';
        submit({ sort_by: field, sort_direction: direction });
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (filters.sort_by !== field) return null;
        return filters.sort_direction === 'asc' ? (
            <ChevronUp className="inline h-3 w-3" />
        ) : (
            <ChevronDown className="inline h-3 w-3" />
        );
    };

    return (
        <AdminLayout
            title="Utilisatrices"
            subtitle={`${users.total.toLocaleString('fr-FR')} compte${users.total > 1 ? 's' : ''} au total`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Utilisatrices' },
            ]}
        >
            <Head title="Utilisatrices · Admin" />

            <div className="space-y-6">
                {/* Filters */}
                <AdminCard>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="min-w-[260px] flex-1">
                            <label
                                className="editorial-caption mb-1.5 block"
                                style={{ color: 'var(--ink-mute)' }}
                            >
                                Recherche
                            </label>
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                                    style={{ color: 'var(--ink-mute)' }}
                                />
                                <Input
                                    type="text"
                                    placeholder="nom, email, pseudo…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="min-w-[180px]">
                            <label
                                className="editorial-caption mb-1.5 block"
                                style={{ color: 'var(--ink-mute)' }}
                            >
                                Statut
                            </label>
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    submit({ status: e.target.value });
                                }}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                style={{
                                    borderColor: 'var(--line)',
                                    color: 'var(--ink)',
                                }}
                            >
                                <option value="">Toutes</option>
                                <option value="premium">Premium</option>
                                <option value="verified">Vérifiées</option>
                                <option value="banned">Bannies</option>
                                <option value="active">Actives (7j)</option>
                            </select>
                        </div>

                        <AdminButton variant="primary" icon={Search} onClick={() => submit()}>
                            Filtrer
                        </AdminButton>

                        {(search || status) && (
                            <AdminButton
                                variant="ghost"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('');
                                    router.get('/admin/users', {});
                                }}
                            >
                                Réinitialiser
                            </AdminButton>
                        )}
                    </div>
                </AdminCard>

                {/* Table */}
                <AdminCard padded={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr
                                    className="border-b"
                                    style={{
                                        borderColor: 'var(--line)',
                                        background: 'var(--bg-soft)',
                                    }}
                                >
                                    <SortableTh
                                        label="Utilisatrice"
                                        field="name"
                                        active={filters.sort_by === 'name'}
                                        onClick={() => handleSort('name')}
                                    />
                                    <Th>Email</Th>
                                    <Th>Statut</Th>
                                    <Th>Ressources</Th>
                                    <SortableTh
                                        label="Dernière activité"
                                        field="last_activity_at"
                                        active={filters.sort_by === 'last_activity_at'}
                                        onClick={() => handleSort('last_activity_at')}
                                    />
                                    <SortableTh
                                        label="Inscription"
                                        field="created_at"
                                        active={filters.sort_by === 'created_at'}
                                        onClick={() => handleSort('created_at')}
                                    />
                                    <th className="px-4 py-3 text-right" />
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-16 text-center"
                                            style={{ color: 'var(--ink-mute)' }}
                                        >
                                            Aucune utilisatrice ne correspond à ces filtres.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b transition-colors last:border-b-0"
                                            style={{ borderColor: 'var(--line-soft)' }}
                                        >
                                            <td className="px-4 py-3.5">
                                                <div className="font-display text-base font-semibold leading-tight">
                                                    {user.name}
                                                </div>
                                                {user.pseudo && (
                                                    <div
                                                        className="font-mono text-[10px] uppercase tracking-wider"
                                                        style={{ color: 'var(--ink-mute)' }}
                                                    >
                                                        @{user.pseudo}
                                                    </div>
                                                )}
                                                {user.city && (
                                                    <div
                                                        className="mt-0.5 text-xs"
                                                        style={{ color: 'var(--ink-mute)' }}
                                                    >
                                                        {user.city}
                                                        {user.age ? ` · ${user.age} ans` : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td
                                                className="px-4 py-3.5 text-xs"
                                                style={{ color: 'var(--ink-soft)' }}
                                            >
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.is_premium && (
                                                        <AdminBadge tone="gold">Premium</AdminBadge>
                                                    )}
                                                    {user.is_verified && (
                                                        <AdminBadge tone="success">
                                                            <BadgeCheck className="h-2.5 w-2.5" />
                                                            Vérifiée
                                                        </AdminBadge>
                                                    )}
                                                    {user.is_banned && (
                                                        <AdminBadge tone="danger">
                                                            <UserMinus className="h-2.5 w-2.5" />
                                                            Bannie
                                                        </AdminBadge>
                                                    )}
                                                    {!user.is_premium &&
                                                        !user.is_verified &&
                                                        !user.is_banned && (
                                                            <AdminBadge>—</AdminBadge>
                                                        )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-4">
                                                    <span
                                                        className="font-mono inline-flex items-center gap-1 text-xs"
                                                        style={{ color: 'var(--ink-soft)' }}
                                                    >
                                                        <Sparkles
                                                            className="h-3 w-3"
                                                            style={{ color: 'var(--gold)' }}
                                                        />
                                                        {user.gems_balance}
                                                    </span>
                                                    <span
                                                        className="font-mono inline-flex items-center gap-1 text-xs"
                                                        style={{ color: 'var(--ink-soft)' }}
                                                    >
                                                        <BadgeCheck
                                                            className="h-3 w-3"
                                                            style={{ color: 'var(--wine-deep)' }}
                                                        />
                                                        {user.badge_points}
                                                    </span>
                                                </div>
                                            </td>
                                            <td
                                                className="font-mono px-4 py-3.5 text-[11px] uppercase tracking-wider"
                                                style={{ color: 'var(--ink-mute)' }}
                                            >
                                                {user.last_activity_at || '—'}
                                            </td>
                                            <td
                                                className="font-mono px-4 py-3.5 text-[11px] uppercase tracking-wider"
                                                style={{ color: 'var(--ink-mute)' }}
                                            >
                                                {user.created_at}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                    className="font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors"
                                                    style={{ color: 'var(--wine-deep)' }}
                                                >
                                                    Ouvrir →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div
                            className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4"
                            style={{
                                borderColor: 'var(--line)',
                                background: 'var(--bg-soft)',
                            }}
                        >
                            <p
                                className="editorial-caption"
                                style={{ color: 'var(--ink-mute)' }}
                            >
                                {users.from}–{users.to} sur {users.total.toLocaleString('fr-FR')}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {users.links.map((link, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        className="font-mono rounded-md px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors disabled:opacity-40"
                                        style={{
                                            background: link.active
                                                ? 'var(--ink)'
                                                : 'transparent',
                                            color: link.active ? 'var(--bg)' : 'var(--ink-soft)',
                                            border: link.active
                                                ? 'none'
                                                : '1px solid var(--line)',
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </AdminCard>
            </div>
        </AdminLayout>
    );
}

/* ---------- Sub-components ---------- */
function Th({ children }: { children: React.ReactNode }): JSX.Element {
    return (
        <th
            className="editorial-caption px-4 py-3 text-left"
            style={{ color: 'var(--ink-mute)' }}
        >
            {children}
        </th>
    );
}

function SortableTh({
    label,
    active,
    onClick,
}: {
    label: string;
    field: string;
    active: boolean;
    onClick: () => void;
}): JSX.Element {
    return (
        <th
            onClick={onClick}
            className="editorial-caption cursor-pointer px-4 py-3 text-left transition-colors hover:text-[color:var(--ink)]"
            style={{ color: active ? 'var(--ink)' : 'var(--ink-mute)' }}
        >
            {label}
        </th>
    );
}
