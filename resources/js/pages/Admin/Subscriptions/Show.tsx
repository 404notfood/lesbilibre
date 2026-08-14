import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Clock,
    Edit,
    RefreshCw,
    Trash2,
    XCircle,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

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
    stripe_subscription_id: string | null;
    stripe_customer_id: string | null;
    stripe_price_id: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    starts_at: string | null;
    expires_at: string | null;
    payment_method: string | null;
    created_at: string;
    updated_at: string;
}

export default function Show({ subscription }: { subscription: Subscription }) {
    const [showExtendDialog, setShowExtendDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [months, setMonths] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleExtend = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post(
            `/admin/subscriptions/${subscription.id}/extend`,
            { months },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setShowExtendDialog(false);
                },
            }
        );
    };

    const handleCancel = () => {
        setIsSubmitting(true);
        router.post(
            `/admin/subscriptions/${subscription.id}/cancel`,
            {},
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setShowCancelDialog(false);
                },
            }
        );
    };

    const handleReactivate = () => {
        setIsSubmitting(true);
        router.post(
            `/admin/subscriptions/${subscription.id}/reactivate`,
            {},
            {
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const handleDelete = () => {
        setIsSubmitting(true);
        router.delete(`/admin/subscriptions/${subscription.id}`, {
            onFinish: () => {
                setIsSubmitting(false);
                setShowDeleteDialog(false);
            },
        });
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
            title={`Abonnement #${subscription.id}`}
            subtitle={`Gérer l'abonnement de ${subscription.user.name}`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Abonnements', href: '/admin/subscriptions' },
                { label: `#${subscription.id}` },
            ]}
            actions={
                <>
                    {getStatusBadge(subscription.status)}
                    <AdminButton
                        href={`/admin/subscriptions/${subscription.id}/edit`}
                        variant="default"
                        icon={Edit}
                    >
                        Modifier
                    </AdminButton>
                </>
            }
        >
            <Head title={`Abonnement #${subscription.id}`} />

            <div className="space-y-10 max-w-4xl">
                {/* User Info */}
                <section>
                    <AdminSectionTitle
                        eyebrow="01 · Utilisatrice"
                        title="Profil concerné"
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

                {/* Subscription Details */}
                <section>
                    <AdminSectionTitle
                        eyebrow="02 · Détails"
                        title="Abonnement"
                    />
                    <AdminCard>
                        <div className="grid gap-6 md:grid-cols-2">
                            <DetailField
                                label="Plan"
                                value={subscription.plan === 'monthly' ? 'Mensuel' : 'Annuel'}
                            />
                            <DetailField
                                label="Montant"
                                value={`${subscription.amount} €`}
                                emphasized
                            />
                            <DetailField
                                label="Date de début"
                                value={
                                    subscription.starts_at
                                        ? new Date(subscription.starts_at).toLocaleDateString(
                                              'fr-FR',
                                              {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              }
                                          )
                                        : '-'
                                }
                            />
                            <DetailField
                                label="Date d'expiration"
                                value={
                                    subscription.expires_at
                                        ? new Date(subscription.expires_at).toLocaleDateString(
                                              'fr-FR',
                                              {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              }
                                          )
                                        : '-'
                                }
                            />
                            <DetailField
                                label="Méthode de paiement"
                                value={subscription.payment_method || '-'}
                            />
                            <DetailField
                                label="Créé le"
                                value={new Date(subscription.created_at).toLocaleDateString(
                                    'fr-FR',
                                    {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }
                                )}
                            />
                        </div>
                    </AdminCard>
                </section>

                {/* Stripe Info */}
                {subscription.stripe_subscription_id && (
                    <section>
                        <AdminSectionTitle
                            eyebrow="03 · Stripe"
                            title="Identifiants externes"
                        />
                        <AdminCard>
                            <div className="grid gap-6 md:grid-cols-2">
                                <DetailField
                                    label="Subscription ID"
                                    value={subscription.stripe_subscription_id}
                                    mono
                                />
                                <DetailField
                                    label="Customer ID"
                                    value={subscription.stripe_customer_id ?? '-'}
                                    mono
                                />
                                <DetailField
                                    label="Price ID"
                                    value={subscription.stripe_price_id ?? '-'}
                                    mono
                                />
                            </div>
                        </AdminCard>
                    </section>
                )}

                {/* Actions */}
                <section>
                    <AdminSectionTitle
                        eyebrow="04 · Opérations"
                        title="Actions"
                    />
                    <AdminCard>
                        <div className="flex flex-wrap gap-2">
                            {subscription.status === 'active' && (
                                <>
                                    <AdminButton
                                        onClick={() => setShowExtendDialog(true)}
                                        variant="primary"
                                        icon={Clock}
                                    >
                                        Prolonger
                                    </AdminButton>
                                    <AdminButton
                                        onClick={() => setShowCancelDialog(true)}
                                        variant="default"
                                        icon={XCircle}
                                    >
                                        Annuler
                                    </AdminButton>
                                </>
                            )}

                            {subscription.status === 'canceled' && (
                                <AdminButton
                                    onClick={handleReactivate}
                                    disabled={isSubmitting}
                                    variant="primary"
                                    icon={RefreshCw}
                                >
                                    Réactiver
                                </AdminButton>
                            )}

                            <AdminButton
                                onClick={() => setShowDeleteDialog(true)}
                                variant="danger"
                                icon={Trash2}
                            >
                                Supprimer
                            </AdminButton>
                        </div>
                    </AdminCard>
                </section>
            </div>

            {/* Extend Dialog */}
            {showExtendDialog && (
                <Dialog open={showExtendDialog} onClose={() => setShowExtendDialog(false)}>
                    <div className="p-6">
                        <h2
                            className="font-display mb-4 text-2xl font-medium"
                            style={{ color: 'var(--ink)' }}
                        >
                            Prolonger l&apos;abonnement
                        </h2>
                        <form onSubmit={handleExtend} className="space-y-4">
                            <div>
                                <Label
                                    htmlFor="months"
                                    className="editorial-caption mb-1.5 block"
                                    style={{ color: 'var(--ink-mute)' }}
                                >
                                    Nombre de mois
                                </Label>
                                <Input
                                    id="months"
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={months}
                                    onChange={(e) => setMonths(parseInt(e.target.value))}
                                />
                                <p
                                    className="mt-2 text-xs"
                                    style={{ color: 'var(--ink-mute)' }}
                                >
                                    Nouvelle date d&apos;expiration :{' '}
                                    {new Date(
                                        new Date(
                                            subscription.expires_at ||
                                                subscription.current_period_end!
                                        ).setMonth(
                                            new Date(
                                                subscription.expires_at ||
                                                    subscription.current_period_end!
                                            ).getMonth() + months
                                        )
                                    ).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <AdminButton
                                    type="submit"
                                    disabled={isSubmitting}
                                    variant="primary"
                                >
                                    {isSubmitting ? 'Prolongation...' : 'Prolonger'}
                                </AdminButton>
                                <AdminButton
                                    onClick={() => setShowExtendDialog(false)}
                                    variant="default"
                                >
                                    Annuler
                                </AdminButton>
                            </div>
                        </form>
                    </div>
                </Dialog>
            )}

            {/* Cancel Dialog */}
            {showCancelDialog && (
                <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
                    <div className="p-6">
                        <h2
                            className="font-display mb-4 text-2xl font-medium"
                            style={{ color: 'var(--ink)' }}
                        >
                            Annuler l&apos;abonnement
                        </h2>
                        <p
                            className="mb-4 text-sm"
                            style={{ color: 'var(--ink-soft)' }}
                        >
                            Êtes-vous sûre de vouloir annuler cet abonnement ?
                        </p>
                        <div className="flex gap-2">
                            <AdminButton
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                variant="danger"
                            >
                                {isSubmitting ? 'Annulation...' : "Annuler l'abonnement"}
                            </AdminButton>
                            <AdminButton
                                onClick={() => setShowCancelDialog(false)}
                                variant="default"
                            >
                                Retour
                            </AdminButton>
                        </div>
                    </div>
                </Dialog>
            )}

            {/* Delete Dialog */}
            {showDeleteDialog && (
                <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                    <div className="p-6">
                        <h2
                            className="font-display mb-4 text-2xl font-medium"
                            style={{ color: 'var(--ink)' }}
                        >
                            Supprimer l&apos;abonnement
                        </h2>
                        <p
                            className="mb-4 text-sm"
                            style={{ color: 'var(--ink-soft)' }}
                        >
                            Êtes-vous sûre de vouloir supprimer définitivement cet abonnement ?
                            Cette action est irréversible.
                        </p>
                        <div className="flex gap-2">
                            <AdminButton
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                variant="danger"
                            >
                                {isSubmitting ? 'Suppression...' : 'Supprimer définitivement'}
                            </AdminButton>
                            <AdminButton
                                onClick={() => setShowDeleteDialog(false)}
                                variant="default"
                            >
                                Annuler
                            </AdminButton>
                        </div>
                    </div>
                </Dialog>
            )}
        </AdminLayout>
    );
}

function DetailField({
    label,
    value,
    emphasized = false,
    mono = false,
}: {
    label: string;
    value: string;
    emphasized?: boolean;
    mono?: boolean;
}) {
    return (
        <div>
            <div
                className="editorial-caption mb-1"
                style={{ color: 'var(--ink-mute)' }}
            >
                {label}
            </div>
            <p
                className={`${emphasized ? 'font-display text-lg' : ''} ${mono ? 'font-mono text-sm' : ''} font-semibold`}
                style={{ color: 'var(--ink)' }}
            >
                {value}
            </p>
        </div>
    );
}
