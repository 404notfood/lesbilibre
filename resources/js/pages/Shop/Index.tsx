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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Coins,
    Crown,
    Gift,
    Package,
    Sparkles,
    Star,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

interface GiftItem {
    id: number;
    emoji: string;
    name: string;
    cost: number;
    category: 'romantic' | 'luxury' | 'fun' | 'naughty';
    popular?: boolean;
}

/** Shape served by ShopController from config/gifts.php. */
interface BackendGift {
    id: number;
    emoji: string;
    name: string;
    price: number;
    category: GiftItem['category'];
}

interface GiftRecipient {
    id: number;
    name: string;
    pseudo: string | null;
}

interface GemPackage {
    id: number;
    amount: number;
    price: number;
    bonus?: number;
    popular?: boolean;
}

interface Props {
    userGems: number;
    gemPackages: GemPackage[];
    gifts: BackendGift[];
    giftRecipient?: GiftRecipient | null;
}

export default function Index({
    userGems,
    gemPackages,
    gifts: backendGifts,
    giftRecipient = null,
}: Props) {
    const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Mapper les cadeaux du backend au format attendu par le frontend
    const gifts: GiftItem[] = backendGifts.map((gift) => ({
        id: gift.id,
        emoji: gift.emoji,
        name: gift.name,
        cost: gift.price,
        category: gift.category,
        popular: false,
    }));

    // Marquer certains cadeaux comme populaires
    const popularGiftIds = [1, 3, 6, 14];
    gifts.forEach((gift) => {
        if (popularGiftIds.includes(gift.id)) {
            gift.popular = true;
        }
    });

    const handleSendGift = (gift: GiftItem) => {
        setSelectedGift(gift);
        setIsGiftModalOpen(true);
    };

    const confirmSendGift = () => {
        if (!selectedGift || !giftRecipient) {
            return;
        }

        setIsSending(true);
        router.post(
            '/shop/gifts/send',
            {
                gift_id: selectedGift.id,
                recipient_id: giftRecipient.id,
            },
            {
                onFinish: () => {
                    setIsSending(false);
                    setIsGiftModalOpen(false);
                },
            },
        );
    };

    const handlePurchaseGems = (packageId: number) => {
        router.post('/shop/gems/purchase', {
            package_id: packageId,
        });
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'romantic':
                return 'Romantique';
            case 'luxury':
                return 'Luxe';
            case 'fun':
                return 'Fun';
            case 'naughty':
                return 'Coquin';
            default:
                return category;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'romantic':
                return 'from-pink-500 to-rose-500';
            case 'luxury':
                return 'from-purple-500 to-indigo-500';
            case 'fun':
                return 'from-amber-500 to-orange-500';
            case 'naughty':
                return 'from-red-500 to-rose-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <DatingLayout title="Boutique" showOnlineUsers={false} gems={userGems}>
            <Head title="Boutique" />

            <div className="space-y-8 p-6">
                {/* Header */}
                <div className="space-y-2 text-center">
                    <h2 className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-4xl font-bold text-transparent">
                        ✨ Boutique de Cadeaux ✨
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Envoie des cadeaux virtuels pour te démarquer et charmer
                        !
                    </p>
                    {giftRecipient && (
                        <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-1 text-base text-white">
                            <Gift className="mr-2 h-4 w-4" />
                            Cadeau pour{' '}
                            {giftRecipient.pseudo || giftRecipient.name}
                        </Badge>
                    )}
                </div>

                <Tabs defaultValue="gifts" className="w-full">
                    <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
                        <TabsTrigger
                            value="gifts"
                            className="flex items-center gap-2"
                        >
                            <Gift className="h-4 w-4" />
                            Cadeaux Virtuels
                        </TabsTrigger>
                        <TabsTrigger
                            value="gems"
                            className="flex items-center gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            Acheter des Gemmes
                        </TabsTrigger>
                    </TabsList>

                    {/* Gifts Tab */}
                    <TabsContent value="gifts" className="mt-8 space-y-6">
                        {/* Current Gems Balance */}
                        <div className="mx-auto max-w-2xl">
                            <Card className="border-2 border-amber-500/20 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                                                <Sparkles className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Ton solde
                                                </p>
                                                <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                                                    {userGems} gemmes
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="border-amber-500/50 hover:bg-amber-500/10"
                                            onClick={() =>
                                                (
                                                    document.querySelector(
                                                        '[value="gems"]',
                                                    ) as HTMLElement
                                                )?.click()
                                            }
                                        >
                                            <Coins className="mr-2 h-4 w-4" />
                                            Recharger
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Gift Categories */}
                        {(
                            ['romantic', 'luxury', 'fun', 'naughty'] as const
                        ).map((category) => (
                            <div key={category} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        className={`bg-gradient-to-r ${getCategoryColor(category)} px-4 py-1 text-base text-white`}
                                    >
                                        {getCategoryLabel(category)}
                                    </Badge>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {gifts
                                        .filter(
                                            (gift) =>
                                                gift.category === category,
                                        )
                                        .map((gift) => (
                                            <Card
                                                key={gift.id}
                                                className={`relative overflow-hidden transition-all hover:scale-105 hover:shadow-lg ${
                                                    gift.popular
                                                        ? 'border-2 border-amber-500/40'
                                                        : ''
                                                }`}
                                            >
                                                {gift.popular && (
                                                    <Badge className="absolute top-2 right-2 z-10 bg-amber-500 text-white">
                                                        <Star className="mr-1 h-3 w-3 fill-white" />
                                                        Populaire
                                                    </Badge>
                                                )}

                                                <CardHeader className="pb-3">
                                                    <div className="mb-2 text-center text-6xl">
                                                        {gift.emoji}
                                                    </div>
                                                    <CardTitle className="text-center text-lg">
                                                        {gift.name}
                                                    </CardTitle>
                                                </CardHeader>

                                                <CardContent className="space-y-3">
                                                    <div className="flex items-center justify-center gap-2 text-xl font-bold text-amber-600 dark:text-amber-400">
                                                        <Sparkles className="h-5 w-5" />
                                                        <span>{gift.cost}</span>
                                                    </div>

                                                    <Button
                                                        className={`w-full bg-gradient-to-r ${getCategoryColor(gift.category)} hover:opacity-90`}
                                                        disabled={
                                                            userGems < gift.cost
                                                        }
                                                        onClick={() =>
                                                            handleSendGift(gift)
                                                        }
                                                    >
                                                        {userGems >=
                                                        gift.cost ? (
                                                            <>
                                                                <Gift className="mr-2 h-4 w-4" />
                                                                Envoyer
                                                            </>
                                                        ) : (
                                                            'Pas assez de gemmes'
                                                        )}
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    {/* Gems Tab */}
                    <TabsContent value="gems" className="mt-8 space-y-6">
                        <div className="mx-auto max-w-4xl space-y-6">
                            {/* Premium Features */}
                            <Card className="border-2 border-purple-500/20 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                                        <Crown className="h-6 w-6" />
                                        Pourquoi acheter des gemmes ?
                                    </CardTitle>
                                    <CardDescription>
                                        Débloque des fonctionnalités exclusives
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <span className="text-sm">
                                                Envoie des cadeaux virtuels
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <span className="text-sm">
                                                Booste ta visibilité
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <span className="text-sm">
                                                Accès prioritaire
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <span className="text-sm">
                                                Démarque-toi des autres
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Gem Packages */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {gemPackages.map((pkg) => (
                                    <Card
                                        key={pkg.id}
                                        className={`relative overflow-hidden transition-all hover:scale-105 hover:shadow-xl ${
                                            pkg.popular
                                                ? 'border-gradient-to-r border-4 from-amber-500 to-orange-500'
                                                : ''
                                        }`}
                                    >
                                        {pkg.popular && (
                                            <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 py-2 text-center text-sm font-bold text-white">
                                                🔥 MEILLEURE OFFRE 🔥
                                            </div>
                                        )}

                                        <CardHeader
                                            className={
                                                pkg.popular ? 'pt-12' : ''
                                            }
                                        >
                                            <div className="space-y-2 text-center">
                                                <div className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-5xl font-bold text-transparent">
                                                    {pkg.amount}
                                                </div>
                                                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                                    <Sparkles className="h-4 w-4" />
                                                    <span className="text-sm">
                                                        gemmes
                                                    </span>
                                                </div>
                                                {pkg.bonus && pkg.bonus > 0 && (
                                                    <Badge className="bg-green-500 text-white">
                                                        <Zap className="mr-1 h-3 w-3" />
                                                        +{pkg.bonus} BONUS
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-foreground">
                                                    {pkg.price.toFixed(2)}€
                                                </div>
                                                {pkg.bonus && pkg.bonus > 0 && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Soit{' '}
                                                        {pkg.amount + pkg.bonus}{' '}
                                                        gemmes au total
                                                    </p>
                                                )}
                                            </div>

                                            <Button
                                                className={`w-full ${
                                                    pkg.popular
                                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                                                        : 'bg-gradient-to-r from-pink-500 to-purple-600'
                                                } text-white`}
                                                onClick={() =>
                                                    handlePurchaseGems(pkg.id)
                                                }
                                            >
                                                <Package className="mr-2 h-4 w-4" />
                                                Acheter maintenant
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Payment Info */}
                            <Card className="border-muted">
                                <CardContent className="pt-6">
                                    <div className="space-y-2 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            🔒 Paiement 100% sécurisé •
                                            Satisfaction garantie
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Stripe, PayPal, Carte Bancaire
                                            acceptés
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal de sélection de destinataire */}
            <Dialog open={isGiftModalOpen} onOpenChange={setIsGiftModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Envoyer un cadeau {selectedGift?.emoji}
                        </DialogTitle>
                        <DialogDescription>
                            {giftRecipient
                                ? `Pour ${giftRecipient.pseudo || giftRecipient.name}`
                                : 'Pour envoyer un cadeau, rendez-vous sur le profil de la personne et cliquez sur « Cadeau ».'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Card className="border-amber-500/20">
                            <CardContent className="p-4">
                                <div className="space-y-2 text-center">
                                    <div className="text-4xl">
                                        {selectedGift?.emoji}
                                    </div>
                                    <p className="font-semibold">
                                        {selectedGift?.name}
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                                        <Sparkles className="h-4 w-4" />
                                        <span className="font-bold">
                                            {selectedGift?.cost} gemmes
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {giftRecipient ? (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Pour accompagner votre cadeau d’un mot,
                                    utilisez la messagerie. Chaque message sera
                                    examiné par l’administration avant
                                    transmission.
                                </p>

                                {selectedGift &&
                                    userGems < selectedGift.cost && (
                                        <p className="text-center text-sm text-destructive">
                                            Solde insuffisant : il vous manque{' '}
                                            {selectedGift.cost - userGems}{' '}
                                            gemmes.
                                        </p>
                                    )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() =>
                                            setIsGiftModalOpen(false)
                                        }
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={confirmSendGift}
                                        disabled={
                                            isSending ||
                                            !selectedGift ||
                                            userGems < selectedGift.cost
                                        }
                                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
                                    >
                                        <Gift className="mr-2 h-4 w-4" />
                                        {isSending ? 'Envoi...' : 'Offrir'}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-center text-sm text-muted-foreground">
                                    <p>Pour envoyer ce cadeau :</p>
                                    <ol className="mt-2 list-inside list-decimal space-y-1">
                                        <li>
                                            Rendez-vous sur le profil d'un
                                            membre
                                        </li>
                                        <li>
                                            Cliquez sur le bouton « Cadeau »
                                        </li>
                                        <li>
                                            Sélectionnez le cadeau de votre
                                            choix
                                        </li>
                                    </ol>
                                </div>
                                <Button
                                    onClick={() => setIsGiftModalOpen(false)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Fermer
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </DatingLayout>
    );
}
