import DatingLayout from '@/layouts/dating-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, TrendingUp, Gift, Star, Heart, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Transaction {
    id: number;
    amount: number;
    balance_after: number;
    type: string;
    reason: string;
    description: string | null;
    created_at: string;
}

interface Props {
    transactions: Transaction[];
    currentBalance: number;
}

export default function History({ transactions, currentBalance }: Props) {
    const getIcon = (reason: string) => {
        switch (reason) {
            case 'daily_login':
                return <Star className="h-5 w-5 text-yellow-500" />;
            case 'profile_completion':
                return <TrendingUp className="h-5 w-5 text-green-500" />;
            case 'first_match':
                return <Heart className="h-5 w-5 text-pink-500" />;
            case 'photo_upload':
                return <Zap className="h-5 w-5 text-blue-500" />;
            case 'gift_received':
                return <Gift className="h-5 w-5 text-purple-500" />;
            case 'purchase':
                return <TrendingUp className="h-5 w-5 text-green-500" />;
            default:
                return <Gem className="h-5 w-5 text-orange-500" />;
        }
    };

    const getReasonLabel = (reason: string) => {
        const labels: { [key: string]: string } = {
            daily_login: 'Connexion quotidienne',
            profile_completion: 'Profil complété',
            first_match: 'Premier match',
            photo_upload: 'Photo ajoutée',
            gift_received: 'Cadeau reçu',
            gift_sent: 'Cadeau envoyé',
            message_sent: 'Message envoyé',
            boost_profile: 'Boost de profil',
            super_like: 'Super like',
            reveal_like: 'Like révélé',
            purchase: 'Achat',
            bonus: 'Bonus Premium',
        };
        return labels[reason] || reason;
    };

    return (
        <DatingLayout title="Historique des gemmes" showOnlineUsers={false}>
            <Head title="Historique des gemmes" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Gem className="h-8 w-8 text-yellow-500" />
                        Historique des gemmes
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Consulte toutes tes transactions de gemmes
                    </p>
                </div>

                {/* Current Balance Card */}
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Solde actuel</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                                    {currentBalance} gemmes
                                </p>
                            </div>
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                                <Gem className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transactions récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <Gem className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                <p className="text-lg font-semibold mb-2">Aucune transaction</p>
                                <p className="text-muted-foreground">
                                    Tes transactions de gemmes apparaîtront ici
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                                                {getIcon(transaction.reason)}
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {transaction.description || getReasonLabel(transaction.reason)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDistanceToNow(new Date(transaction.created_at), {
                                                        addSuffix: true,
                                                        locale: fr,
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`text-lg font-bold ${
                                                    transaction.amount > 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                {transaction.amount > 0 ? '+' : ''}
                                                {transaction.amount}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Solde: {transaction.balance_after}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DatingLayout>
    );
}
