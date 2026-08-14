import AdminLayout, {
    AdminButton,
    AdminCard,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/subscriptions/${subscription.id}`);
    };

    return (
        <AdminLayout
            title="Modifier l'abonnement"
            subtitle={`Modifier l'abonnement de ${subscription.user.name}`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Abonnements', href: '/admin/subscriptions' },
                {
                    label: `#${subscription.id}`,
                    href: `/admin/subscriptions/${subscription.id}`,
                },
                { label: 'Édition' },
            ]}
            actions={
                <AdminButton
                    href={`/admin/subscriptions/${subscription.id}`}
                    variant="default"
                >
                    Retour
                </AdminButton>
            }
        >
            <Head title="Modifier l'abonnement" />

            <div className="space-y-10 max-w-3xl">
                {/* User Info */}
                <section>
                    <AdminSectionTitle
                        eyebrow="01 · Cible"
                        title="Utilisatrice"
                    />
                    <AdminCard>
                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p
                                    className="font-display text-xl font-medium"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    {subscription.user.name}
                                </p>
                                <p
                                    className="text-sm"
                                    style={{ color: 'var(--ink-mute)' }}
                                >
                                    {subscription.user.email}
                                </p>
                            </div>
                            <AdminButton
                                href={`/admin/users/${subscription.user.id}`}
                                variant="default"
                                size="sm"
                            >
                                Voir le profil
                            </AdminButton>
                        </div>
                    </AdminCard>
                </section>

                {/* Edit Form */}
                <section>
                    <AdminSectionTitle
                        eyebrow="02 · Détails"
                        title="Configuration de l'abonnement"
                    />
                    <AdminCard>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Plan */}
                            <FormField label="Plan" error={errors.plan} htmlFor="plan">
                                <Select
                                    id="plan"
                                    value={data.plan}
                                    onChange={(e) => setData('plan', e.target.value)}
                                >
                                    <option value="monthly">Mensuel</option>
                                    <option value="yearly">Annuel</option>
                                </Select>
                            </FormField>

                            {/* Amount */}
                            <FormField label="Montant (€)" error={errors.amount} htmlFor="amount">
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={data.amount}
                                    onChange={(e) =>
                                        setData('amount', parseFloat(e.target.value))
                                    }
                                />
                            </FormField>

                            {/* Start Date */}
                            <FormField
                                label="Date de début"
                                error={errors.starts_at}
                                htmlFor="starts_at"
                            >
                                <Input
                                    id="starts_at"
                                    type="date"
                                    value={data.starts_at}
                                    onChange={(e) => setData('starts_at', e.target.value)}
                                />
                            </FormField>

                            {/* Expiration Date */}
                            <FormField
                                label="Date d'expiration"
                                error={errors.expires_at}
                                htmlFor="expires_at"
                                hint={`Durée: ${Math.ceil(
                                    (new Date(data.expires_at).getTime() -
                                        new Date(data.starts_at).getTime()) /
                                        (1000 * 60 * 60 * 24 * 30)
                                )} mois (approximatif)`}
                            >
                                <Input
                                    id="expires_at"
                                    type="date"
                                    value={data.expires_at}
                                    onChange={(e) => setData('expires_at', e.target.value)}
                                />
                            </FormField>

                            {/* Actions */}
                            <div
                                className="flex gap-2 pt-4"
                                style={{ borderTop: '1px solid var(--line-soft)' }}
                            >
                                <AdminButton
                                    type="submit"
                                    disabled={processing}
                                    variant="primary"
                                >
                                    {processing ? 'Modification...' : "Modifier l'abonnement"}
                                </AdminButton>
                                <AdminButton
                                    href={`/admin/subscriptions/${subscription.id}`}
                                    variant="default"
                                >
                                    Annuler
                                </AdminButton>
                            </div>
                        </form>
                    </AdminCard>
                </section>
            </div>
        </AdminLayout>
    );
}

function FormField({
    label,
    error,
    htmlFor,
    hint,
    children,
}: {
    label: string;
    error?: string;
    htmlFor: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <Label
                htmlFor={htmlFor}
                className="editorial-caption mb-1.5 block"
                style={{ color: 'var(--ink-mute)' }}
            >
                {label}
            </Label>
            {children}
            {hint && (
                <p
                    className="mt-1.5 text-xs"
                    style={{ color: 'var(--ink-mute)' }}
                >
                    {hint}
                </p>
            )}
            {error && (
                <p
                    className="mt-1.5 text-xs font-medium"
                    style={{ color: 'var(--destructive)' }}
                >
                    {error}
                </p>
            )}
        </div>
    );
}
