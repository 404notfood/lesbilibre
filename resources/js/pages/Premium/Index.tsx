import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import { Check, Crown, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface Plan {
    id: number;
    duration: string;
    tagline: string | null;
    price: number;
    pricePerMonth: number;
    savings: number;
    popular: boolean;
    perks: string[];
    available: boolean;
}

interface CurrentSubscription {
    id: number;
    plan: string;
    amount: number;
    status: string;
    expires_at: string | null;
    managed_by_stripe: boolean;
}

/**
 * État du premium tel que la membre le vit. Un compte peut être premium sans
 * ligne d'abonnement (accès accordé à la main), d'où cet objet distinct.
 */
interface PremiumState {
    expires_at: string | null;
    managed_by_stripe: boolean;
    has_subscription: boolean;
}

export default function Index({
    isPremium = false,
    plans = [],
    currentSubscription = null,
    premiumState = null,
    canCancel = false,
}: {
    isPremium?: boolean;
    plans?: Plan[];
    currentSubscription?: CurrentSubscription | null;
    premiumState?: PremiumState | null;
    canCancel?: boolean;
}) {
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const isCancelled = currentSubscription?.status === 'canceled';

    const handleSubscribe = (planId: number) => {
        router.post('/premium/subscribe', {
            plan_id: planId,
        });
    };

    const handleCancel = () => {
        setCancelling(true);
        router.post(
            '/premium/cancel',
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setCancelling(false);
                    setConfirmCancel(false);
                },
            },
        );
    };

    return (
        <DatingLayout title="Premium" showOnlineUsers={false}>
            <Head title="Passer Premium" />

            <div className="space-y-8 p-6">
                {/* Hero Section */}
                <div className="space-y-4 py-8 text-center">
                    <div className="mb-4 flex items-center justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl">
                            <Crown className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <h1 className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-5xl font-bold text-transparent">
                        Passe Premium
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                        Des options pour adapter la découverte à tes envies. Les
                        avantages inclus sont détaillés dans chaque formule.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>
                            Profil, matchs et conversations accessibles
                            gratuitement
                        </span>
                    </div>
                </div>

                {/* Gestion de l'abonnement en cours */}
                {isPremium && premiumState && (
                    <Card className="mx-auto max-w-2xl border-2">
                        <CardContent className="space-y-4 p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="text-lg font-bold">
                                        Ton abonnement Premium
                                    </h2>
                                    {premiumState.expires_at ? (
                                        <p className="text-sm text-muted-foreground">
                                            {isCancelled
                                                ? 'Résilié — accès conservé jusqu’au '
                                                : 'Prochaine échéance le '}
                                            {new Date(
                                                premiumState.expires_at,
                                            ).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Accès Premium sans date de fin.
                                        </p>
                                    )}
                                </div>
                                <Badge
                                    variant={
                                        isCancelled ? 'outline' : 'secondary'
                                    }
                                >
                                    {isCancelled ? 'Résilié' : 'Actif'}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {premiumState.managed_by_stripe && (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            router.post(
                                                '/premium/billing-portal',
                                            )
                                        }
                                    >
                                        Gérer mon abonnement et mes factures
                                    </Button>
                                )}

                                {canCancel && !isCancelled && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setConfirmCancel(true)}
                                    >
                                        Résilier mon abonnement
                                    </Button>
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground">
                                {premiumState.managed_by_stripe
                                    ? 'La résiliation s’effectue depuis le portail de paiement : elle arrête le prélèvement et tu gardes l’accès jusqu’à la fin de la période payée.'
                                    : premiumState.expires_at
                                      ? 'En cas de résiliation, tu conserves ton accès Premium jusqu’à la fin de la période déjà réglée.'
                                      : 'Ton accès n’a pas de date de fin : la résiliation prend effet immédiatement.'}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Pricing Plans */}
                <div className="mx-auto max-w-5xl">
                    <h2 className="mb-6 text-center text-2xl font-bold">
                        Choisis ton abonnement
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`relative overflow-hidden transition-all ${
                                    plan.popular
                                        ? 'border-gradient-to-r border-4 from-amber-500 to-orange-500 shadow-2xl'
                                        : 'hover:shadow-xl'
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 py-2 text-center text-sm font-bold text-white">
                                        Les mêmes avantages
                                    </div>
                                )}

                                {plan.savings > 0 && !plan.popular && (
                                    <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                                        -{plan.savings}%
                                    </Badge>
                                )}

                                <CardHeader
                                    className={plan.popular ? 'pt-12' : 'pt-6'}
                                >
                                    <div className="space-y-2 text-center">
                                        <Crown
                                            className={`mx-auto h-12 w-12 ${plan.popular ? 'text-amber-500' : 'text-primary'}`}
                                        />
                                        <CardTitle className="text-2xl">
                                            {plan.duration}
                                        </CardTitle>
                                        {plan.tagline && (
                                            <CardDescription>
                                                {plan.tagline}
                                            </CardDescription>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-6 pb-6">
                                    {/* Prix */}
                                    <div className="space-y-1 text-center">
                                        <div className="text-4xl font-bold text-foreground">
                                            {plan.price.toFixed(2)}€
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Montant total de la période · soit{' '}
                                            {plan.pricePerMonth.toLocaleString(
                                                'fr-FR',
                                                {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                },
                                            )}{' '}
                                            / mois
                                        </div>
                                        {plan.savings > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                            >
                                                <Sparkles className="mr-1 h-3 w-3" />
                                                Économise {plan.savings}%
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Avantages du plan */}
                                    <div className="space-y-2">
                                        {plan.perks.map((perk) => (
                                            <div
                                                key={perk}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                                                <span>{perk}</span>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                                            <span>
                                                Annulation à tout moment
                                            </span>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <Button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={!plan.available}
                                        className={`w-full ${
                                            plan.popular
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-600 hover:to-orange-600'
                                                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
                                        }`}
                                        size="lg"
                                    >
                                        <Crown className="mr-2 h-5 w-5" />
                                        {!plan.available
                                            ? 'Bientôt disponible'
                                            : plan.popular
                                              ? 'Choisir ce plan'
                                              : 'Souscrire'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Paiement via Stripe. Renouvellement selon la période
                        choisie, résiliation depuis cette page. Les limites et
                        le consentement de la destinataire restent applicables.
                    </p>
                </div>
            </div>

            <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Résilier ton abonnement Premium
                        </DialogTitle>
                        <DialogDescription>
                            {premiumState?.expires_at
                                ? `Tu gardes l'accès à toutes les fonctionnalités Premium jusqu'au ${new Date(
                                      premiumState.expires_at,
                                  ).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                  })}. Passé cette date, ton compte repassera en gratuit. Tu peux te réabonner quand tu veux.`
                                : 'Ton accès Premium prendra fin immédiatement. Tu peux te réabonner quand tu veux.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmCancel(false)}
                        >
                            Garder mon Premium
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={cancelling}
                        >
                            {cancelling
                                ? 'Résiliation…'
                                : 'Confirmer la résiliation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DatingLayout>
    );
}
