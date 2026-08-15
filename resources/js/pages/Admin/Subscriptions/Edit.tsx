import AdminLayout, {
    AdminButton,
    AdminCard,
    AdminCardHeader,
    AdminField,
    AdminSelect,
} from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { User as UserIcon } from 'lucide-react';
import { FormEvent } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Subscription {
    id: number;
    user: User;
    plan: string;
    amount: number;
    starts_at: string;
    expires_at: string;
}

export default function Edit({ subscription }: { subscription: Subscription }) {
    const { data, setData, put, processing, errors } = useForm({
        plan: subscription.plan,
        amount: subscription.amount,
        starts_at: subscription.starts_at,
        expires_at: subscription.expires_at,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put(`/admin/subscriptions/${subscription.id}`);
    };

    return (
        <AdminLayout
            title="Modifier l'abonnement"
            subtitle={`Abonnement #${subscription.id} · ${subscription.user.name}`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Abonnées', href: '/admin/subscriptions' },
                {
                    label: `#${subscription.id}`,
                    href: `/admin/subscriptions/${subscription.id}`,
                },
                { label: 'Édition' },
            ]}
            hideSearch
            actions={
                <AdminButton href={`/admin/subscriptions/${subscription.id}`}>
                    Retour
                </AdminButton>
            }
        >
            <Head title="Modifier l'abonnement · Admin" />

            <div className="max-w-3xl space-y-4">
                <AdminCard>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--bg-soft)] text-[color:var(--ink-mute)]">
                                <UserIcon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="font-display truncate text-lg font-medium text-[color:var(--ink)]">
                                    {subscription.user.name}
                                </p>
                                <p className="truncate text-sm text-[color:var(--ink-mute)]">
                                    {subscription.user.email}
                                </p>
                            </div>
                        </div>
                        <AdminButton
                            size="sm"
                            href={`/admin/users/${subscription.user.id}`}
                        >
                            Fiche du compte
                        </AdminButton>
                    </div>
                </AdminCard>

                <AdminCard padded={false}>
                    <AdminCardHeader title="Détails de l'abonnement" />
                    <form onSubmit={submit} className="space-y-4 p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <AdminField label="Formule" error={errors.plan}>
                                <AdminSelect
                                    value={data.plan}
                                    onChange={(value) => setData('plan', value)}
                                >
                                    <option value="monthly">Mensuel</option>
                                    <option value="yearly">Annuel</option>
                                </AdminSelect>
                            </AdminField>

                            <AdminField label="Montant (€)" error={errors.amount}>
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

                            <AdminField label="Date de début" error={errors.starts_at}>
                                <Input
                                    type="date"
                                    value={data.starts_at}
                                    onChange={(event) =>
                                        setData('starts_at', event.target.value)
                                    }
                                />
                            </AdminField>

                            <AdminField
                                label="Date de fin"
                                error={errors.expires_at}
                                hint="Doit être postérieure à la date de début"
                            >
                                <Input
                                    type="date"
                                    value={data.expires_at}
                                    onChange={(event) =>
                                        setData('expires_at', event.target.value)
                                    }
                                />
                            </AdminField>
                        </div>

                        <div className="rounded-lg bg-[color:var(--bg-soft)] px-3 py-2.5 text-xs text-[color:var(--ink-mute)]">
                            Enregistrer réactive le statut Premium du compte et aligne sa
                            date d&apos;expiration sur la date de fin choisie ici.
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <AdminButton
                                type="submit"
                                variant="wine"
                                disabled={processing}
                            >
                                {processing ? 'Enregistrement…' : 'Enregistrer'}
                            </AdminButton>
                            <Link
                                href={`/admin/subscriptions/${subscription.id}`}
                                className="inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-semibold text-[color:var(--ink-soft)] transition-colors hover:bg-[color:var(--bg-soft)]"
                            >
                                Annuler
                            </Link>
                        </div>
                    </form>
                </AdminCard>
            </div>
        </AdminLayout>
    );
}
