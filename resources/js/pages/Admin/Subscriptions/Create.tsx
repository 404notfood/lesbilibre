import AdminLayout, {
    AdminButton,
    AdminCard,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

export default function Create({ user }: { user: User | null }) {
    const [userSearch, setUserSearch] = useState('');
    const [searching, setSearching] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        user_id: user?.id || '',
        plan: 'monthly',
        amount: 9.99,
        starts_at: new Date().toISOString().split('T')[0],
        duration_months: 1,
    });

    const handleUserSearch = () => {
        setSearching(true);
        router.get(
            '/admin/subscriptions/create',
            { user_id: userSearch },
            {
                preserveState: true,
                onFinish: () => setSearching(false),
            }
        );
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/subscriptions');
    };

    const handlePlanChange = (plan: string) => {
        setData('plan', plan);
        if (plan === 'monthly') {
            setData('amount', 9.99);
            setData('duration_months', 1);
        } else {
            setData('amount', 99.99);
            setData('duration_months', 12);
        }
    };

    return (
        <AdminLayout
            title="Créer un abonnement"
            subtitle="Ajouter un abonnement Premium à un compte"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Abonnements', href: '/admin/subscriptions' },
                { label: 'Création' },
            ]}
            actions={
                <AdminButton href="/admin/subscriptions" variant="default">
                    Retour
                </AdminButton>
            }
        >
            <Head title="Créer un abonnement" />

            <div className="space-y-10 max-w-3xl">
                {/* User Search */}
                {!user && (
                    <section>
                        <AdminSectionTitle
                            eyebrow="01 · Cible"
                            title="Rechercher une utilisatrice"
                        />
                        <AdminCard>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="ID de l'utilisatrice..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
                                />
                                <AdminButton
                                    onClick={handleUserSearch}
                                    disabled={searching}
                                    variant="primary"
                                    icon={Search}
                                >
                                    {searching ? 'Recherche...' : 'Rechercher'}
                                </AdminButton>
                            </div>
                        </AdminCard>
                    </section>
                )}

                {/* Selected User */}
                {user && (
                    <section>
                        <AdminSectionTitle
                            eyebrow="01 · Cible"
                            title="Utilisatrice sélectionnée"
                        />
                        <AdminCard>
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p
                                        className="font-display text-xl font-medium"
                                        style={{ color: 'var(--ink)' }}
                                    >
                                        {user.name}
                                    </p>
                                    <p
                                        className="text-sm"
                                        style={{ color: 'var(--ink-mute)' }}
                                    >
                                        {user.email}
                                    </p>
                                </div>
                                <AdminButton
                                    href="/admin/subscriptions/create"
                                    variant="default"
                                    size="sm"
                                >
                                    Changer
                                </AdminButton>
                            </div>
                        </AdminCard>
                    </section>
                )}

                {/* Subscription Form */}
                {user && (
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
                                        onChange={(e) => handlePlanChange(e.target.value)}
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

                                {/* Duration */}
                                <FormField
                                    label="Durée (mois)"
                                    error={errors.duration_months}
                                    htmlFor="duration_months"
                                    hint={`L'abonnement expirera le ${new Date(
                                        new Date(data.starts_at).setMonth(
                                            new Date(data.starts_at).getMonth() +
                                                data.duration_months
                                        )
                                    ).toLocaleDateString('fr-FR')}`}
                                >
                                    <Input
                                        id="duration_months"
                                        type="number"
                                        min="1"
                                        max="24"
                                        value={data.duration_months}
                                        onChange={(e) =>
                                            setData('duration_months', parseInt(e.target.value))
                                        }
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
                                        {processing ? 'Création...' : "Créer l'abonnement"}
                                    </AdminButton>
                                    <AdminButton
                                        href="/admin/subscriptions"
                                        variant="default"
                                    >
                                        Annuler
                                    </AdminButton>
                                </div>
                            </form>
                        </AdminCard>
                    </section>
                )}
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
