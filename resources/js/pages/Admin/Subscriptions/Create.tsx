import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminCardHeader,
    AdminField,
    AdminSelect,
} from '@/layouts/admin-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Search, UserCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    is_premium?: boolean;
}

interface Candidate extends User {
    pseudo: string;
}

/** Tarifs proposés par défaut selon la formule choisie. */
const PLAN_DEFAULTS: Record<string, { amount: number; months: number }> = {
    monthly: { amount: 9.99, months: 1 },
    yearly: { amount: 99.99, months: 12 },
};

export default function Create({
    user,
    candidates = [],
    search: initialSearch,
}: {
    user: User | null;
    candidates?: Candidate[];
    search?: string | null;
}) {
    const [search, setSearch] = useState(initialSearch ?? '');
    const [searching, setSearching] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        user_id: user?.id ?? '',
        plan: 'monthly',
        amount: 9.99,
        starts_at: new Date().toISOString().split('T')[0],
        duration_months: 1,
    });

    const runSearch = () => {
        if (!search.trim()) {
            return;
        }

        setSearching(true);
        router.get(
            '/admin/subscriptions/create',
            { search },
            { preserveState: true, onFinish: () => setSearching(false) },
        );
    };

    const changePlan = (plan: string) => {
        const preset = PLAN_DEFAULTS[plan];

        setData((current) => ({
            ...current,
            plan,
            amount: preset?.amount ?? current.amount,
            duration_months: preset?.months ?? current.duration_months,
        }));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/admin/subscriptions');
    };

    // Aperçu de l'échéance, calculé comme côté serveur (addMonths).
    const expiresAt = (() => {
        const start = new Date(data.starts_at);

        if (Number.isNaN(start.getTime())) {
            return null;
        }

        const end = new Date(start);
        end.setMonth(end.getMonth() + Number(data.duration_months || 0));

        return end;
    })();

    return (
        <AdminLayout
            title="Créer un abonnement"
            subtitle="Accorder un accès Premium à un compte, sans passer par un paiement"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Abonnées', href: '/admin/subscriptions' },
                { label: 'Création' },
            ]}
            hideSearch
            actions={<AdminButton href="/admin/subscriptions">Retour</AdminButton>}
        >
            <Head title="Créer un abonnement · Admin" />

            <div className="max-w-3xl space-y-4">
                {/* Étape 1 — choisir le compte */}
                {!user ? (
                    <AdminCard padded={false}>
                        <AdminCardHeader
                            title="1. Choisir le compte"
                            icon={Search}
                        />
                        <div className="p-5">
                            <div className="flex flex-wrap gap-2">
                                <Input
                                    placeholder="Nom, pseudo ou e-mail…"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    onKeyDown={(event) =>
                                        event.key === 'Enter' && runSearch()
                                    }
                                    className="min-w-[240px] flex-1"
                                    autoFocus
                                />
                                <AdminButton
                                    onClick={runSearch}
                                    disabled={searching || !search.trim()}
                                    variant="primary"
                                    icon={Search}
                                >
                                    {searching ? 'Recherche…' : 'Rechercher'}
                                </AdminButton>
                            </div>

                            {candidates.length > 0 && (
                                <ul className="mt-4 divide-y divide-[color:var(--line-soft)] overflow-hidden rounded-xl border border-[color:var(--line)]">
                                    {candidates.map((candidate) => (
                                        <li key={candidate.id}>
                                            <Link
                                                href={`/admin/subscriptions/create?user_id=${candidate.id}`}
                                                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[color:var(--bg-soft)]"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="truncate text-sm font-semibold text-[color:var(--ink)]">
                                                            {candidate.name}
                                                        </span>
                                                        {candidate.is_premium && (
                                                            <AdminBadge tone="gold">
                                                                Déjà Premium
                                                            </AdminBadge>
                                                        )}
                                                    </div>
                                                    <div className="truncate text-xs text-[color:var(--ink-soft)]">
                                                        {candidate.email}
                                                        {candidate.pseudo &&
                                                            ` · @${candidate.pseudo}`}
                                                    </div>
                                                </div>
                                                <span className="font-mono shrink-0 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--wine-deep)]">
                                                    Choisir →
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {initialSearch && candidates.length === 0 && (
                                <p className="mt-4 text-sm text-[color:var(--ink-mute)]">
                                    Aucun compte ne correspond à « {initialSearch} ».
                                </p>
                            )}
                        </div>
                    </AdminCard>
                ) : (
                    <AdminCard>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[oklch(60%_0.16_160_/_0.15)] text-[color:var(--success)]">
                                    <UserCheck className="h-4 w-4" />
                                </span>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-display truncate text-lg font-medium text-[color:var(--ink)]">
                                            {user.name}
                                        </p>
                                        {user.is_premium && (
                                            <AdminBadge tone="gold">
                                                Déjà Premium
                                            </AdminBadge>
                                        )}
                                    </div>
                                    <p className="truncate text-sm text-[color:var(--ink-mute)]">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <AdminButton href="/admin/subscriptions/create" size="sm">
                                Changer
                            </AdminButton>
                        </div>

                        {user.is_premium && (
                            <p className="mt-3 rounded-lg bg-[oklch(80%_0.13_75_/_0.15)] px-3 py-2 text-xs text-[oklch(42%_0.13_75)]">
                                Ce compte a déjà un abonnement actif. En créer un nouveau
                                annulera automatiquement le précédent.
                            </p>
                        )}
                    </AdminCard>
                )}

                {/* Étape 2 — configurer */}
                {user && (
                    <AdminCard padded={false}>
                        <AdminCardHeader title="2. Configurer l'abonnement" />
                        <form onSubmit={submit} className="space-y-4 p-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <AdminField label="Formule" error={errors.plan}>
                                    <AdminSelect
                                        value={data.plan}
                                        onChange={changePlan}
                                    >
                                        <option value="monthly">Mensuel</option>
                                        <option value="yearly">Annuel</option>
                                    </AdminSelect>
                                </AdminField>

                                <AdminField
                                    label="Montant (€)"
                                    error={errors.amount}
                                    hint="0 € pour un accès offert"
                                >
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.amount}
                                        onChange={(event) =>
                                            setData(
                                                'amount',
                                                parseFloat(event.target.value) || 0,
                                            )
                                        }
                                    />
                                </AdminField>

                                <AdminField
                                    label="Date de début"
                                    error={errors.starts_at}
                                >
                                    <Input
                                        type="date"
                                        value={data.starts_at}
                                        onChange={(event) =>
                                            setData('starts_at', event.target.value)
                                        }
                                    />
                                </AdminField>

                                <AdminField
                                    label="Durée (mois)"
                                    error={errors.duration_months}
                                    hint={
                                        expiresAt
                                            ? `Expire le ${expiresAt.toLocaleDateString('fr-FR')}`
                                            : undefined
                                    }
                                >
                                    <Input
                                        type="number"
                                        min={1}
                                        max={24}
                                        value={data.duration_months}
                                        onChange={(event) =>
                                            setData(
                                                'duration_months',
                                                Number(event.target.value),
                                            )
                                        }
                                    />
                                </AdminField>
                            </div>

                            <div className="rounded-lg bg-[color:var(--bg-soft)] px-3 py-2.5 text-xs text-[color:var(--ink-mute)]">
                                Cet abonnement est créé manuellement : aucun prélèvement
                                ne sera effectué et il ne se renouvellera pas
                                automatiquement. À l&apos;échéance, la tâche{' '}
                                <code className="font-mono">subscriptions:expire</code>{' '}
                                retirera le statut Premium.
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <AdminButton
                                    type="submit"
                                    variant="wine"
                                    disabled={processing}
                                >
                                    {processing ? 'Création…' : "Créer l'abonnement"}
                                </AdminButton>
                                <AdminButton href="/admin/subscriptions" variant="ghost">
                                    Annuler
                                </AdminButton>
                            </div>
                        </form>
                    </AdminCard>
                )}
            </div>
        </AdminLayout>
    );
}
