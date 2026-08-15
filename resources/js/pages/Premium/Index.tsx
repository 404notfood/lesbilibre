import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Crown,
    Check,
    Zap,
    Eye,
    MessageCircle,
    Heart,
    Star,
    TrendingUp,
    Shield,
    Sparkles,
    Infinity,
    Gift
} from 'lucide-react';
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

    const features = [
        {
            icon: Eye,
            title: 'Voir qui te like',
            description: 'Découvre toutes les personnes qui ont liké ton profil',
            color: 'text-blue-500',
        },
        {
            icon: Infinity,
            title: 'Likes illimités',
            description: 'Like autant de profils que tu veux sans restriction',
            color: 'text-purple-500',
        },
        {
            icon: Zap,
            title: 'Boost de visibilité',
            description: 'Ton profil sera mis en avant et vu 10x plus',
            color: 'text-amber-500',
        },
        {
            icon: MessageCircle,
            title: 'Messages prioritaires',
            description: 'Tes messages arrivent en premier dans la boîte de réception',
            color: 'text-green-500',
        },
        {
            icon: Star,
            title: 'Badge Premium',
            description: 'Affiche ton statut Premium sur ton profil',
            color: 'text-yellow-500',
        },
        {
            icon: TrendingUp,
            title: 'Statistiques avancées',
            description: 'Accès complet à tes stats et analytics',
            color: 'text-pink-500',
        },
        {
            icon: Gift,
            title: 'Bonus de gemmes',
            description: '+100 gemmes offertes chaque mois',
            color: 'text-orange-500',
        },
        {
            icon: Shield,
            title: 'Navigation privée',
            description: 'Consulte les profils en mode incognito',
            color: 'text-indigo-500',
        },
    ];

    return (
        <DatingLayout title="Premium" showOnlineUsers={false}>
            <Head title="Passer Premium" />

            <div className="p-6 space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-4 py-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl">
                            <Crown className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                        Passe Premium
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Débloque toutes les fonctionnalités et trouve l'amour plus rapidement
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Garantie satisfait ou remboursé 30 jours</span>
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
                                <Badge variant={isCancelled ? 'outline' : 'secondary'}>
                                    {isCancelled ? 'Résilié' : 'Actif'}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {premiumState.managed_by_stripe && (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            router.post('/premium/billing-portal')
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

                {/* Features Grid */}
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        Ce qui est inclus avec Premium
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-2 hover:border-primary/40 transition-all hover:scale-105">
                                <CardContent className="p-6 text-center space-y-3">
                                    <div className="flex justify-center">
                                        <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center ${feature.color}`}>
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <h3 className="font-semibold">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Pricing Plans */}
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        Choisis ton abonnement
                    </h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`relative overflow-hidden transition-all hover:scale-105 ${
                                    plan.popular
                                        ? 'border-4 border-gradient-to-r from-amber-500 to-orange-500 shadow-2xl'
                                        : 'hover:shadow-xl'
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 font-bold text-sm">
                                        🔥 LE PLUS POPULAIRE 🔥
                                    </div>
                                )}

                                {plan.savings > 0 && !plan.popular && (
                                    <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                                        -{plan.savings}%
                                    </Badge>
                                )}

                                <CardHeader className={plan.popular ? 'pt-12' : 'pt-6'}>
                                    <div className="text-center space-y-2">
                                        <Crown className={`h-12 w-12 mx-auto ${plan.popular ? 'text-amber-500' : 'text-primary'}`} />
                                        <CardTitle className="text-2xl">{plan.duration}</CardTitle>
                                        {plan.tagline && (
                                            <CardDescription>{plan.tagline}</CardDescription>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-6 pb-6">
                                    {/* Prix */}
                                    <div className="text-center space-y-1">
                                        <div className="text-4xl font-bold text-foreground">
                                            {plan.price.toFixed(2)}€
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Soit {plan.pricePerMonth.toFixed(2)}€/mois
                                        </div>
                                        {plan.savings > 0 && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                                <Sparkles className="h-3 w-3 mr-1" />
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
                                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                <span>{perk}</span>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span>Annulation à tout moment</span>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <Button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={!plan.available}
                                        className={`w-full ${
                                            plan.popular
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg'
                                                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                                        }`}
                                        size="lg"
                                    >
                                        <Crown className="h-5 w-5 mr-2" />
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

                {/* Social Proof */}
                <Card className="max-w-4xl mx-auto border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                    <CardContent className="p-8">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="h-6 w-6 text-amber-500 fill-amber-500" />
                                ))}
                            </div>
                            <h3 className="text-2xl font-bold">
                                Rejoins plus de 10,000 membres Premium
                            </h3>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                "Depuis que je suis passée Premium, j'ai eu 3x plus de matches et j'ai enfin trouvé
                                la personne parfaite ! Le boost de visibilité fait vraiment la différence." - Sarah, 28 ans
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* FAQ / Guarantees */}
                <div className="max-w-3xl mx-auto space-y-4">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        Pourquoi passer Premium ?
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <TrendingUp className="h-6 w-6 text-green-500 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold mb-1">+300% de matches</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Les membres Premium ont en moyenne 3x plus de matches
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <Heart className="h-6 w-6 text-pink-500 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold mb-1">Trouve l'amour plus vite</h4>
                                        <p className="text-sm text-muted-foreground">
                                            72% des couples se sont rencontrés via Premium
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <Shield className="h-6 w-6 text-blue-500 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold mb-1">100% sécurisé</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Paiement crypté et données protégées
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold mb-1">Sans engagement</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Annule à tout moment en 1 clic
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                        🔒 Paiement 100% sécurisé • Stripe, PayPal, CB acceptés
                    </p>
                </div>
            </div>

            <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Résilier ton abonnement Premium</DialogTitle>
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
                            {cancelling ? 'Résiliation…' : 'Confirmer la résiliation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DatingLayout>
    );
}
