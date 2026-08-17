import AdminLayout, {
    AdminBadge,
    AdminCard,
    AdminCardHeader,
    AdminKpi,
    AdminPagination,
    AdminTable,
    AdminTd,
    AdminTh,
    AdminThead,
    AdminTr,
} from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Gem, Hourglass, UserPlus } from 'lucide-react';

interface Person {
    id: number;
    pseudo: string;
    email: string;
    is_verified?: boolean;
}

interface Referral {
    id: number;
    status: 'pending' | 'rewarded';
    code: string;
    referrer_reward: number;
    referred_reward: number;
    created_at: string;
    rewarded_at: string | null;
    referrer: Person | null;
    referred_user: Person | null;
}

interface Props {
    referrals: {
        data: Referral[];
        from: number | null;
        to: number | null;
        total: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats: {
        total: number;
        pending: number;
        rewarded: number;
        gems_distributed: number;
    };
    monthly: Array<{ month: string; total: number }>;
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

export default function Index({ referrals, stats, monthly }: Props) {
    const conversion = stats.total > 0 ? Math.round((stats.rewarded / stats.total) * 100) : 0;

    return (
        <AdminLayout
            title="Parrainages"
            subtitle="Invitations, activations vérifiées et récompenses"
            breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Parrainages' }]}
            hideSearch
        >
            <Head title="Parrainages · Admin" />

            <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminKpi label="Invitations" value={stats.total} hint="Attributions enregistrées" icon={UserPlus} />
                    <AdminKpi label="En attente" value={stats.pending} hint="Profil non encore vérifié" icon={Hourglass} />
                    <AdminKpi label="Récompensées" value={stats.rewarded} hint={`${conversion} % de conversion`} icon={CheckCircle2} />
                    <AdminKpi label="Gemmes versées" value={stats.gems_distributed} hint="Marraines et filleules" icon={Gem} />
                </div>

                {monthly.length > 0 ? (
                    <AdminCard padded={false}>
                        <AdminCardHeader title="Invitations sur les six derniers mois" icon={UserPlus} />
                        <div className="grid gap-2 p-5 sm:grid-cols-3 xl:grid-cols-6">
                            {monthly.map((item) => (
                                <div key={item.month} className="rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-soft)] p-3">
                                    <p className="font-mono text-xs text-[color:var(--ink-mute)]">{item.month}</p>
                                    <p className="mt-1 text-xl font-semibold text-[color:var(--ink)]">{item.total}</p>
                                </div>
                            ))}
                        </div>
                    </AdminCard>
                ) : null}

                <AdminCard padded={false}>
                    <AdminCardHeader title="Journal des parrainages" />
                    {referrals.data.length === 0 ? (
                        <div className="p-8 text-center text-sm text-[color:var(--ink-mute)]">
                            Aucun parrainage enregistré.
                        </div>
                    ) : (
                        <AdminTable>
                            <AdminThead>
                                <AdminTr>
                                    <AdminTh>Marraine</AdminTh>
                                    <AdminTh>Filleule</AdminTh>
                                    <AdminTh>Code</AdminTh>
                                    <AdminTh>Statut</AdminTh>
                                    <AdminTh>Récompenses</AdminTh>
                                    <AdminTh>Date</AdminTh>
                                </AdminTr>
                            </AdminThead>
                            <tbody>
                                {referrals.data.map((referral) => (
                                    <AdminTr key={referral.id}>
                                        <AdminTd>
                                            {referral.referrer ? (
                                                <Link href={`/admin/users/${referral.referrer.id}`} className="font-medium hover:underline">
                                                    {referral.referrer.pseudo}
                                                </Link>
                                            ) : 'Compte supprimé'}
                                        </AdminTd>
                                        <AdminTd>
                                            {referral.referred_user ? (
                                                <Link href={`/admin/users/${referral.referred_user.id}`} className="font-medium hover:underline">
                                                    {referral.referred_user.pseudo}
                                                </Link>
                                            ) : 'Compte supprimé'}
                                        </AdminTd>
                                        <AdminTd><span className="font-mono text-xs">{referral.code}</span></AdminTd>
                                        <AdminTd>
                                            <AdminBadge tone={referral.status === 'rewarded' ? 'success' : 'warning'}>
                                                {referral.status === 'rewarded' ? 'Récompensé' : 'En attente'}
                                            </AdminBadge>
                                        </AdminTd>
                                        <AdminTd>
                                            {referral.status === 'rewarded'
                                                ? `${referral.referrer_reward} + ${referral.referred_reward}`
                                                : '—'}
                                        </AdminTd>
                                        <AdminTd>{dateFormatter.format(new Date(referral.created_at))}</AdminTd>
                                    </AdminTr>
                                ))}
                            </tbody>
                        </AdminTable>
                    )}
                    <AdminPagination
                        from={referrals.from}
                        to={referrals.to}
                        total={referrals.total}
                        lastPage={referrals.last_page}
                        links={referrals.links}
                    />
                </AdminCard>
            </div>
        </AdminLayout>
    );
}
