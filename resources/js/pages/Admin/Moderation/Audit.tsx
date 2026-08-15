import AdminLayout, {
    AdminBadge,
    AdminCard,
    AdminEmpty,
    AdminMeta,
    AdminPagination,
    AdminTable,
    AdminTd,
    AdminTh,
    AdminThead,
    AdminTr,
} from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { History, ShieldAlert } from 'lucide-react';

interface Action {
    id: number;
    action: string;
    reason: string | null;
    notes: string | null;
    moderator: { name: string; pseudo: string } | null;
    subject_user: { name: string; pseudo: string } | null;
    created_at: string;
}

interface Pagination {
    data: Action[];
    from: number | null;
    to: number | null;
    total: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

/**
 * Libellés lisibles des actions enregistrées par ModerationAuditService.
 * Une action inconnue retombe sur sa clé brute plutôt que de disparaître.
 */
const ACTION_LABELS: Record<string, string> = {
    user_banned: 'Compte banni',
    user_unbanned: 'Compte débanni',
    photo_marked_sensitive: 'Photo marquée sensible',
    photo_unmarked_sensitive: 'Photo marquée tout public',
    photo_deleted_by_admin: 'Photo supprimée',
    avatar_cleared: 'Avatar retiré',
};

/** Actions qui retirent ou restreignent du contenu : signalées en rouge. */
const RESTRICTIVE = new Set([
    'user_banned',
    'photo_deleted_by_admin',
    'photo_marked_sensitive',
    'avatar_cleared',
]);

export default function Audit({ actions }: { actions: Pagination }) {
    return (
        <AdminLayout
            title="Journal des décisions"
            subtitle="Historique non modifiable des actions de modération"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Modération', href: '/admin/moderation' },
                { label: 'Journal' },
            ]}
            hideSearch
        >
            <Head title="Journal de modération · Admin" />

            <AdminCard padded={false}>
                {actions.data.length === 0 ? (
                    <AdminEmpty
                        icon={History}
                        title="Aucune décision enregistrée"
                        description="Les bans, suppressions de photos et autres actions apparaîtront ici."
                    />
                ) : (
                    <>
                        <AdminTable>
                            <AdminThead>
                                <AdminTh>Date</AdminTh>
                                <AdminTh>Action</AdminTh>
                                <AdminTh>Modératrice</AdminTh>
                                <AdminTh>Compte concerné</AdminTh>
                                <AdminTh>Motif / notes</AdminTh>
                            </AdminThead>
                            <tbody>
                                {actions.data.map((item) => (
                                    <AdminTr key={item.id}>
                                        <AdminTd>
                                            <AdminMeta>
                                                {new Date(
                                                    item.created_at,
                                                ).toLocaleString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </AdminMeta>
                                        </AdminTd>
                                        <AdminTd>
                                            <AdminBadge
                                                tone={
                                                    RESTRICTIVE.has(item.action)
                                                        ? 'danger'
                                                        : 'neutral'
                                                }
                                            >
                                                {ACTION_LABELS[item.action] ??
                                                    item.action}
                                            </AdminBadge>
                                        </AdminTd>
                                        <AdminTd>
                                            <span className="text-sm text-[color:var(--ink)]">
                                                {item.moderator?.pseudo ??
                                                    item.moderator?.name ?? (
                                                        <span className="italic text-[color:var(--ink-mute)]">
                                                            compte supprimé
                                                        </span>
                                                    )}
                                            </span>
                                        </AdminTd>
                                        <AdminTd>
                                            <span className="text-sm text-[color:var(--ink)]">
                                                {item.subject_user?.pseudo ??
                                                    item.subject_user?.name ?? (
                                                        <span className="italic text-[color:var(--ink-mute)]">
                                                            compte supprimé
                                                        </span>
                                                    )}
                                            </span>
                                        </AdminTd>
                                        <AdminTd>
                                            <p className="max-w-md text-xs text-[color:var(--ink-soft)]">
                                                {item.notes ?? item.reason ?? '—'}
                                            </p>
                                        </AdminTd>
                                    </AdminTr>
                                ))}
                            </tbody>
                        </AdminTable>

                        <AdminPagination
                            from={actions.from}
                            to={actions.to}
                            total={actions.total}
                            lastPage={actions.last_page}
                            links={actions.links}
                        />
                    </>
                )}
            </AdminCard>

            <p className="mt-4 flex items-start gap-2 text-xs text-[color:var(--ink-mute)]">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Ce journal est en lecture seule : les décisions y sont conservées
                telles quelles, y compris après suppression des comptes concernés.
            </p>
        </AdminLayout>
    );
}
