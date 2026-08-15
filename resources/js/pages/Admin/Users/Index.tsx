import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminEmpty,
    AdminField,
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
import { Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    Search,
    Sparkles,
    UserMinus,
    Users as UsersIcon,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface UserRow {
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
    data: UserRow[];
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
    sort_by: string;
    sort_direction: string;
}

const STATUS_LABELS: Record<string, string> = {
    premium: 'Premium',
    verified: 'Vérifiées',
    banned: 'Bannies',
    active: 'Actives (7 j)',
};

export default function Index({
    users,
    filters,
}: {
    users: Pagination;
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRender = useRef(true);

    const visit = (params: Record<string, string>) => {
        router.get(
            '/admin/users',
            {
                search: params.search ?? search,
                status: params.status ?? filters.status ?? '',
                sort_by: params.sort_by ?? filters.sort_by,
                sort_direction: params.sort_direction ?? filters.sort_direction,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Recherche au fil de la frappe, sans marteler le serveur.
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

    const hasFilters = Boolean(filters.search || filters.status);

    return (
        <AdminLayout
            title="Utilisatrices"
            subtitle={`${users.total.toLocaleString('fr-FR')} compte${users.total > 1 ? 's' : ''}${hasFilters ? ' correspondant aux filtres' : ' au total'}`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Utilisatrices' },
            ]}
            hideSearch
        >
            <div className="space-y-4">
                <AdminToolbar
                    right={
                        hasFilters ? (
                            <AdminButton
                                variant="ghost"
                                size="sm"
                                icon={X}
                                onClick={() => {
                                    setSearch('');
                                    router.get('/admin/users');
                                }}
                            >
                                Réinitialiser
                            </AdminButton>
                        ) : undefined
                    }
                >
                    <AdminField label="Recherche" className="min-w-[240px] flex-1">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-mute)]" />
                            <input
                                type="search"
                                autoFocus
                                placeholder="nom, e-mail, pseudo…"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-9 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--paper)] pl-9 pr-3 text-sm text-[color:var(--ink)] outline-none transition-colors placeholder:text-[color:var(--ink-mute)] focus:border-[color:var(--desire)]"
                            />
                        </div>
                    </AdminField>

                    <AdminField label="Statut" className="w-[170px]">
                        <AdminSelect
                            value={filters.status ?? ''}
                            onChange={(value) => visit({ status: value })}
                        >
                            <option value="">Toutes</option>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </AdminSelect>
                    </AdminField>
                </AdminToolbar>

                <AdminCard padded={false}>
                    {users.data.length === 0 ? (
                        <AdminEmpty
                            icon={UsersIcon}
                            title="Aucune utilisatrice trouvée"
                            description={
                                hasFilters
                                    ? 'Aucun compte ne correspond à ces critères. Essaie d’élargir la recherche.'
                                    : 'La plateforme ne compte encore aucun profil.'
                            }
                            action={
                                hasFilters ? (
                                    <AdminButton
                                        size="sm"
                                        onClick={() => {
                                            setSearch('');
                                            router.get('/admin/users');
                                        }}
                                    >
                                        Réinitialiser les filtres
                                    </AdminButton>
                                ) : undefined
                            }
                        />
                    ) : (
                        <>
                            <AdminTable>
                                <AdminThead>
                                    <AdminTh
                                        onSort={() => sort('name')}
                                        active={filters.sort_by === 'name'}
                                        direction={filters.sort_direction}
                                    >
                                        Utilisatrice
                                    </AdminTh>
                                    <AdminTh>Statut</AdminTh>
                                    <AdminTh align="right">Gemmes</AdminTh>
                                    <AdminTh
                                        onSort={() => sort('last_activity_at')}
                                        active={filters.sort_by === 'last_activity_at'}
                                        direction={filters.sort_direction}
                                    >
                                        Dernière activité
                                    </AdminTh>
                                    <AdminTh
                                        onSort={() => sort('created_at')}
                                        active={filters.sort_by === 'created_at'}
                                        direction={filters.sort_direction}
                                    >
                                        Inscription
                                    </AdminTh>
                                    <AdminTh align="right">Action</AdminTh>
                                </AdminThead>
                                <tbody>
                                    {users.data.map((user) => (
                                        <AdminTr key={user.id}>
                                            <AdminTd>
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                    className="block"
                                                >
                                                    <div className="font-display text-[15px] font-semibold leading-tight text-[color:var(--ink)]">
                                                        {user.name}
                                                    </div>
                                                    <div className="mt-0.5 truncate text-xs text-[color:var(--ink-soft)]">
                                                        {user.email}
                                                    </div>
                                                    <div className="mt-0.5 text-[11px] text-[color:var(--ink-mute)]">
                                                        {user.pseudo && `@${user.pseudo}`}
                                                        {user.city &&
                                                            `${user.pseudo ? ' · ' : ''}${user.city}`}
                                                        {user.age ? ` · ${user.age} ans` : ''}
                                                    </div>
                                                </Link>
                                            </AdminTd>
                                            <AdminTd>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.is_premium && (
                                                        <AdminBadge tone="gold">
                                                            Premium
                                                        </AdminBadge>
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
                                                            <span className="text-xs text-[color:var(--ink-mute)]">
                                                                —
                                                            </span>
                                                        )}
                                                </div>
                                                {user.is_banned && user.ban_reason && (
                                                    <p
                                                        className="mt-1 max-w-[220px] truncate text-[11px] text-[color:var(--ink-mute)]"
                                                        title={user.ban_reason}
                                                    >
                                                        {user.ban_reason}
                                                    </p>
                                                )}
                                            </AdminTd>
                                            <AdminTd align="right">
                                                <span className="font-mono inline-flex items-center gap-1 text-xs text-[color:var(--ink-soft)]">
                                                    <Sparkles className="h-3 w-3 text-[color:var(--gold)]" />
                                                    {user.gems_balance.toLocaleString('fr-FR')}
                                                </span>
                                            </AdminTd>
                                            <AdminTd>
                                                <AdminMeta>
                                                    {user.last_activity_at ?? 'jamais'}
                                                </AdminMeta>
                                            </AdminTd>
                                            <AdminTd>
                                                <AdminMeta>{user.created_at}</AdminMeta>
                                            </AdminTd>
                                            <AdminTd align="right">
                                                <AdminButton
                                                    size="sm"
                                                    href={`/admin/users/${user.id}`}
                                                >
                                                    Ouvrir
                                                </AdminButton>
                                            </AdminTd>
                                        </AdminTr>
                                    ))}
                                </tbody>
                            </AdminTable>

                            <AdminPagination
                                from={users.from}
                                to={users.to}
                                total={users.total}
                                lastPage={users.last_page}
                                links={users.links}
                            />
                        </>
                    )}
                </AdminCard>
            </div>
        </AdminLayout>
    );
}
