import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Sparkles,
    Coins,
    Gift,
    Heart,
    Star,
    Crown,
    Zap,
    CheckCircle2,
    Package,
} from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface GiftItem {
    id: number;
    emoji: string;
    name: string;
    cost: number;
    category: 'romantic' | 'luxury' | 'fun' | 'special';
    popular?: boolean;
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
    gifts: any[];
}

export default function Index({ userGems, gemPackages, gifts: backendGifts }: Props) {
    const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

    // Mapper les cadeaux du backend au format attendu par le frontend
    const gifts: GiftItem[] = backendGifts.map((gift: any) => ({
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
            case 'special':
                return 'Spécial';
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
            case 'special':
                return 'from-cyan-500 to-blue-500';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <DatingLayout title="Boutique" showOnlineUsers={false} gems={userGems}>
            <Head title="Boutique" />

            <div className="p-6 space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                        ✨ Boutique de Cadeaux ✨
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Envoie des cadeaux virtuels pour te démarquer et charmer !
                    </p>
                </div>

                <Tabs defaultValue="gifts" className="w-full">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                        <TabsTrigger value="gifts" className="flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            Cadeaux Virtuels
                        </TabsTrigger>
                        <TabsTrigger value="gems" className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Acheter des Gemmes
                        </TabsTrigger>
                    </TabsList>

                    {/* Gifts Tab */}
                    <TabsContent value="gifts" className="space-y-6 mt-8">
                        {/* Current Gems Balance */}
                        <div className="max-w-2xl mx-auto">
                            <Card className="border-2 border-amber-500/20 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
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
                                                (document.querySelector(
                                                    '[value="gems"]'
                                                ) as HTMLElement)?.click()
                                            }
                                        >
                                            <Coins className="h-4 w-4 mr-2" />
                                            Recharger
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Gift Categories */}
                        {(['romantic', 'luxury', 'fun', 'special'] as const).map((category) => (
                            <div key={category} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        className={`bg-gradient-to-r ${getCategoryColor(category)} text-white px-4 py-1 text-base`}
                                    >
                                        {getCategoryLabel(category)}
                                    </Badge>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {gifts
                                        .filter((gift) => gift.category === category)
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
                                                    <Badge className="absolute top-2 right-2 bg-amber-500 text-white z-10">
                                                        <Star className="h-3 w-3 mr-1 fill-white" />
                                                        Populaire
                                                    </Badge>
                                                )}

                                                <CardHeader className="pb-3">
                                                    <div className="text-6xl mb-2 text-center">
                                                        {gift.emoji}
                                                    </div>
                                                    <CardTitle className="text-center text-lg">
                                                        {gift.name}
                                                    </CardTitle>
                                                </CardHeader>

                                                <CardContent className="space-y-3">
                                                    <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xl">
                                                        <Sparkles className="h-5 w-5" />
                                                        <span>{gift.cost}</span>
                                                    </div>

                                                    <Button
                                                        className={`w-full bg-gradient-to-r ${getCategoryColor(gift.category)} hover:opacity-90`}
                                                        disabled={userGems < gift.cost}
                                                        onClick={() => handleSendGift(gift)}
                                                    >
                                                        {userGems >= gift.cost ? (
                                                            <>
                                                                <Gift className="h-4 w-4 mr-2" />
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
                    <TabsContent value="gems" className="space-y-6 mt-8">
                        <div className="max-w-4xl mx-auto space-y-6">
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
                                            <span className="text-sm">Booste ta visibilité</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <span className="text-sm">Accès prioritaire</span>
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
                                                ? 'border-4 border-gradient-to-r from-amber-500 to-orange-500'
                                                : ''
                                        }`}
                                    >
                                        {pkg.popular && (
                                            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 font-bold text-sm">
                                                🔥 MEILLEURE OFFRE 🔥
                                            </div>
                                        )}

                                        <CardHeader className={pkg.popular ? 'pt-12' : ''}>
                                            <div className="text-center space-y-2">
                                                <div className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                                    {pkg.amount}
                                                </div>
                                                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                                    <Sparkles className="h-4 w-4" />
                                                    <span className="text-sm">gemmes</span>
                                                </div>
                                                {pkg.bonus && pkg.bonus > 0 && (
                                                    <Badge className="bg-green-500 text-white">
                                                        <Zap className="h-3 w-3 mr-1" />+{pkg.bonus}{' '}
                                                        BONUS
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
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Soit {pkg.amount + pkg.bonus} gemmes au total
                                                    </p>
                                                )}
                                            </div>

                                            <Button
                                                className={`w-full ${
                                                    pkg.popular
                                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                                                        : 'bg-gradient-to-r from-pink-500 to-purple-600'
                                                } text-white`}
                                                onClick={() => handlePurchaseGems(pkg.id)}
                                            >
                                                <Package className="h-4 w-4 mr-2" />
                                                Acheter maintenant
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Payment Info */}
                            <Card className="border-muted">
                                <CardContent className="pt-6">
                                    <div className="text-center space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            🔒 Paiement 100% sécurisé • Satisfaction garantie
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Stripe, PayPal, Carte Bancaire acceptés
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
                        <DialogTitle>Envoyer un cadeau {selectedGift?.emoji}</DialogTitle>
                        <DialogDescription>
                            Pour envoyer un cadeau, vous devez d'abord sélectionner un destinataire depuis son profil.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Card className="border-amber-500/20">
                            <CardContent className="p-4">
                                <div className="text-center space-y-2">
                                    <div className="text-4xl">{selectedGift?.emoji}</div>
                                    <p className="font-semibold">{selectedGift?.name}</p>
                                    <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                                        <Sparkles className="h-4 w-4" />
                                        <span className="font-bold">{selectedGift?.cost} gemmes</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="text-sm text-muted-foreground text-center">
                            <p>Pour envoyer ce cadeau :</p>
                            <ol className="list-decimal list-inside mt-2 space-y-1">
                                <li>Rendez-vous sur le profil d'un utilisateur</li>
                                <li>Cliquez sur le bouton "Envoyer un cadeau"</li>
                                <li>Sélectionnez le cadeau de votre choix</li>
                            </ol>
                        </div>
                        <Button
                            onClick={() => setIsGiftModalOpen(false)}
                            variant="outline"
                            className="w-full"
                        >
                            Fermer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </DatingLayout>
    );
}
