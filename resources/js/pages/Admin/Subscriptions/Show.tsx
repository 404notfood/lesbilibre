import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminCardHeader,
    AdminMeta,
} from '@/layouts/admin-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarPlus,
    CreditCard,
    Pencil,
    RefreshCw,
    Trash2,
    User as UserIcon,
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

const STATUS_TONES: Record<string, 'success' | 'neutral' | 'danger' | 'wine'> = {
    active: 'success',
    canceled: 'neutral',
    expired: 'danger',
    trialing: 'wine',
};

const STATUS_LABELS: Record<string, string> = {
    active: 'Actif',
    canceled: 'Annulé',
    expired: 'Expiré',
    trialing: 'Essai',
};

const PLAN_LABELS: Record<string, string> = {
    monthly: 'Mensuel',
    yearly: 'Annuel',
};

const formatDate = (value: string | null): string =>
    value
        ? new Date(value).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : '—';

export default function Show({ subscription }: { subscription: Subscription }) {
    const [showExtend, setShowExtend] = useState(false);
    const [showCancel, setShowCancel] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [months, setMonths] = useState(1);
    const [busy, setBusy] = useState(false);

    const act = (action: () => void) => {
        setBusy(true);
        action();
    };

    const extend = (event: FormEvent) => {
        event.preventDefault();
        act(() =>
            router.post(
                `/admin/subscriptions/${subscription.id}/extend`,
                { months },
                {
                    preserveScroll: true,
                    onFinish: () => {
                        setBusy(false);
                        setShowExtend(false);
                    },
                },
            ),
        );
    };

    const isStripe = Boolean(subscription.stripe_subscription_id);
    const daysLeft = subscription.expires_at
        ? Math.ceil(
              (new Date(subscription.expires_at).getTime() - Date.now()) / 86400000,
          )
        : null;
    const isStale =
        subscription.status === 'active' && daysLeft !== null && daysLeft < 0;

    return (
        <AdminLayout
            title={`Abonnement #${subscription.id}`}
            subtitle={`${PLAN_LABELS[subscription.plan] ?? subscription.plan} · ${Number(subscription.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Abonnées', href: '/admin/subscriptions' },
                { label: `#${subscription.id}` },
            ]}
            hideSearch
            actions={
                <>
                    <AdminButton
                        icon={Pencil}
                        href={`/admin/subscriptions/${subscription.id}/edit`}
                    >
                        Modifier
                    </AdminButton>
                    <AdminButton
                        icon={CalendarPlus}
                        variant="wine"
                        onClick={() => setShowExtend(true)}
                    >
                        Prolonger
                    </AdminButton>
                    {subscription.status === 'active' ? (
                        <AdminButton
                            icon={XCircle}
                            variant="danger"
                            onClick={() => setShowCancel(true)}
                        >
                            Annuler
                        </AdminButton>
                    ) : (
                        <AdminButton
                            icon={RefreshCw}
                            variant="success"
                            disabled={busy}
                            onClick={() =>
                                act(() =>
                                    router.post(
                                        `/admin/subscriptions/${subscription.id}/reactivate`,
                                        {},
                                        {
                                            preserveScroll: true,
                                            onFinish: () => setBusy(false),
                                        },
                                    ),
                                )
                            }
                        >
                            Réactiver
                        </AdminButton>
                    )}
                    <AdminButton
                        icon={Trash2}
                        variant="ghost"
                        onClick={() => setShowDelete(true)}
                        title="Supprimer définitivement"
                    />
                </>
            }
        >
            <Head title={`Abonnement #${subscription.id} · Admin`} />

            <div className="space-y-4">
                {isStale && (
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--destructive)]/30 bg-[oklch(62%_0.19_10_/_0.08)] px-5 py-4">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-[color:var(--destructive)]" />
                        <p className="min-w-0 flex-1 text-sm text-[color:var(--ink)]">
                            Cet abonnement est encore marqué actif alors que son échéance
                            est dépassée de {Math.abs(daysLeft as number)} jour
                            {Math.abs(daysLeft as number) > 1 ? 's' : ''}. La membre garde
                            son Premium indûment.
                        </p>
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <AdminCard padded={false}>
                            <AdminCardHeader
                                title="Période et facturation"
                                icon={CreditCard}
                                action={
                                    <AdminBadge
                                        tone={
                                            STATUS_TONES[subscription.status] ?? 'neutral'
                                        }
                                    >
                                        {STATUS_LABELS[subscription.status] ??
                                            subscription.status}
                                    </AdminBadge>
                                }
                            />
                            <dl className="divide-y divide-[color:var(--line-soft)]">
                                <Row
                                    label="Formule"
                                    value={
                                        PLAN_LABELS[subscription.plan] ??
                                        subscription.plan
                                    }
                                />
                                <Row
                                    label="Montant"
                                    value={`${Number(subscription.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                                />
                                <Row
                                    label="Début"
                                    value={formatDate(subscription.starts_at)}
                                />
                                <Row
                                    label="Échéance"
                                    value={
                                        subscription.expires_at ? (
                                            <>
                                                {formatDate(subscription.expires_at)}
                                                {subscription.status === 'active' &&
                                                    daysLeft !== null && (
                                                        <span
                                                            className={`ml-2 text-xs ${
                                                                daysLeft < 0
                                                                    ? 'font-semibold text-[color:var(--destructive)]'
                                                                    : daysLeft <= 7
                                                                      ? 'font-semibold text-[color:var(--desire)]'
                                                                      : 'text-[color:var(--ink-mute)]'
                                                            }`}
                                                        >
                                                            {daysLeft < 0
                                                                ? `dépassée de ${Math.abs(daysLeft)} j`
                                                                : `dans ${daysLeft} j`}
                                                        </span>
                                                    )}
                                            </>
                                        ) : (
                                            'Illimité'
                                        )
                                    }
                                />
                                <Row
                                    label="Moyen de paiement"
                                    value={
                                        subscription.payment_method === 'admin'
                                            ? 'Créé manuellement (aucun prélèvement)'
                                            : (subscription.payment_method ?? '—')
                                    }
                                />
                                <Row
                                    label="Créé le"
                                    value={formatDate(subscription.created_at)}
                                />
                            </dl>
                        </AdminCard>

                        {isStripe && (
                            <AdminCard padded={false}>
                                <AdminCardHeader title="Références Stripe" />
                                <dl className="divide-y divide-[color:var(--line-soft)]">
                                    <Row
                                        label="Abonnement"
                                        value={
                                            <code className="font-mono text-xs">
                                                {subscription.stripe_subscription_id}
                                            </code>
                                        }
                                    />
                                    <Row
                                        label="Client"
                                        value={
                                            <code className="font-mono text-xs">
                                                {subscription.stripe_customer_id ?? '—'}
                                            </code>
                                        }
                                    />
                                    <Row
                                        label="Tarif"
                                        value={
                                            <code className="font-mono text-xs">
                                                {subscription.stripe_price_id ?? '—'}
                                            </code>
                                        }
                                    />
                                    <Row
                                        label="Période en cours"
                                        value={`${formatDate(subscription.current_period_start)} → ${formatDate(subscription.current_period_end)}`}
                                    />
                                </dl>
                                <p className="border-t border-[color:var(--line-soft)] px-5 py-3 text-xs text-[color:var(--ink-mute)]">
                                    Annuler ici ne résilie pas le prélèvement côté Stripe.
                                    Fais-le également depuis le tableau de bord Stripe.
                                </p>
                            </AdminCard>
                        )}
                    </div>

                    <AdminCard>
                        <div className="editorial-caption mb-2 text-[color:var(--ink-mute)]">
                            Abonnée
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--blush)] text-[color:var(--wine-deep)]">
                                <UserIcon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="font-display truncate text-base font-semibold text-[color:var(--ink)]">
                                    {subscription.user.name}
                                </div>
                                <div className="truncate text-xs text-[color:var(--ink-soft)]">
                                    {subscription.user.email}
                                </div>
                            </div>
                        </div>
                        <AdminButton
                            size="sm"
                            className="mt-3 w-full"
                            href={`/admin/users/${subscription.user.id}`}
                        >
                            Ouvrir la fiche
                        </AdminButton>
                        <AdminMeta>
                            <span className="mt-3 block">
                                Dernière modification :{' '}
                                {formatDate(subscription.updated_at)}
                            </span>
                        </AdminMeta>
                    </AdminCard>
                </div>
            </div>

            {/* Prolonger */}
            <Dialog open={showExtend} onOpenChange={setShowExtend}>
                <DialogContent>
                    <form onSubmit={extend}>
                        <DialogHeader>
                            <DialogTitle className="font-display text-2xl font-medium italic">
                                Prolonger l&apos;abonnement
                            </DialogTitle>
                            <DialogDescription>
                                La nouvelle échéance sera calculée à partir de la date de
                                fin actuelle ({formatDate(subscription.expires_at)}).
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                            <label className="editorial-caption mb-1.5 block text-[color:var(--ink-mute)]">
                                Nombre de mois
                            </label>
                            <Input
                                type="number"
                                min={1}
                                max={24}
                                value={months}
                                onChange={(event) =>
                                    setMonths(Number(event.target.value))
                                }
                                autoFocus
                            />
                        </div>
                        <DialogFooter>
                            <AdminButton onClick={() => setShowExtend(false)}>
                                Annuler
                            </AdminButton>
                            <AdminButton
                                type="submit"
                                variant="wine"
                                disabled={busy || months < 1}
                            >
                                {busy ? 'Prolongation…' : 'Prolonger'}
                            </AdminButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Annuler */}
            <Dialog open={showCancel} onOpenChange={setShowCancel}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium italic">
                            Annuler cet abonnement
                        </DialogTitle>
                        <DialogDescription>
                            L&apos;abonnement passera en « annulé » et le statut Premium
                            de {subscription.user.name} sera retiré immédiatement, sauf si
                            un autre abonnement actif existe.
                            {isStripe && (
                                <span className="mt-2 block text-[color:var(--destructive)]">
                                    Cet abonnement est lié à Stripe : pense à résilier
                                    aussi le prélèvement depuis le tableau de bord
                                    Stripe.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <AdminButton onClick={() => setShowCancel(false)}>
                            Revenir
                        </AdminButton>
                        <AdminButton
                            variant="danger"
                            icon={XCircle}
                            disabled={busy}
                            onClick={() =>
                                act(() =>
                                    router.post(
                                        `/admin/subscriptions/${subscription.id}/cancel`,
                                        {},
                                        {
                                            preserveScroll: true,
                                            onFinish: () => {
                                                setBusy(false);
                                                setShowCancel(false);
                                            },
                                        },
                                    ),
                                )
                            }
                        >
                            {busy ? 'Annulation…' : "Confirmer l'annulation"}
                        </AdminButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Supprimer */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-medium italic text-[color:var(--destructive)]">
                            Supprimer cet abonnement
                        </DialogTitle>
                        <DialogDescription>
                            <strong>Action irréversible.</strong> L&apos;enregistrement
                            disparaîtra de l&apos;historique de facturation. Préfère
                            l&apos;annulation si tu veux garder une trace comptable.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <AdminButton onClick={() => setShowDelete(false)}>
                            Annuler
                        </AdminButton>
                        <AdminButton
                            variant="danger"
                            icon={Trash2}
                            disabled={busy}
                            onClick={() =>
                                act(() =>
                                    router.delete(
                                        `/admin/subscriptions/${subscription.id}`,
                                        { onFinish: () => setBusy(false) },
                                    ),
                                )
                            }
                        >
                            Supprimer définitivement
                        </AdminButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-2.5">
            <dt className="editorial-caption shrink-0 text-[color:var(--ink-mute)]">
                {label}
            </dt>
            <dd className="min-w-0 text-right text-sm font-medium text-[color:var(--ink)]">
                {value}
            </dd>
        </div>
    );
}
