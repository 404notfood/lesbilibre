import DatingLayout from '@/layouts/dating-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    TrendingUp,
    Heart,
    Users,
    MessageCircle,
    Eye,
    Award,
    Crown,
    Lock,
    BarChart,
    Gem,
    Gift
} from 'lucide-react';

interface Stats {
    profile_views: {
        total: number;
        this_week: number;
        this_month: number;
    };
    likes: {
        given: number;
        received: number;
        ratio: number;
        weekly_received: number;
    };
    matches: {
        total: number;
        this_week: number;
        this_month: number;
    };
    messages: {
        sent: number;
        received: number;
        conversations: number;
        avg_response_time: string;
    };
    activity: {
        daily_likes_remaining: string;
        badges_earned: number;
        gems: number;
        total_gifts_received: number;
    };
    weekly_performance: Array<{
        day: string;
        likes: number;
        matches: number;
    }>;
}

export default function Index({
    isPremium,
    stats
}: {
    isPremium: boolean;
    stats?: Stats;
}) {
    return (
        <DatingLayout title="Statistiques" showOnlineUsers={false}>
            <Head title="Statistiques avancées" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <BarChart className="h-8 w-8 text-purple-500" />
                            Statistiques avancées
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            {isPremium
                                ? 'Analyse détaillée de ton activité'
                                : 'Fonctionnalité réservée aux membres Premium'}
                        </p>
                    </div>
                    {!isPremium && (
                        <Link href="/premium">
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                                <Crown className="h-4 w-4 mr-2" />
                                Passer Premium
                            </Button>
                        </Link>
                    )}
                </div>

                {!isPremium ? (
                    /* Premium Wall */
                    <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                        <CardContent className="p-12 text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl">
                                    <Lock className="h-12 w-12 text-white" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                                    Fonctionnalité Premium
                                </h2>
                                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                    Accède à des statistiques détaillées et à des analyses approfondies de ton activité
                                    en passant Premium !
                                </p>
                            </div>

                            {/* Preview features */}
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto">
                                {[
                                    { icon: Eye, label: 'Vues de profil', value: '???' },
                                    { icon: Heart, label: 'Likes reçus', value: '???' },
                                    { icon: Users, label: 'Matches', value: '???' },
                                    { icon: TrendingUp, label: 'Performance', value: '???' },
                                ].map((item, i) => (
                                    <div key={i} className="relative">
                                        <Card className="border-2 blur-sm">
                                            <CardContent className="p-6 text-center">
                                                <item.icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                <div className="text-2xl font-bold">{item.value}</div>
                                                <div className="text-sm text-muted-foreground">{item.label}</div>
                                            </CardContent>
                                        </Card>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Lock className="h-6 w-6 text-gray-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link href="/premium">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg text-lg px-8 py-6"
                                >
                                    <Crown className="h-5 w-5 mr-2" />
                                    Débloquer les statistiques
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    stats && (
                        <>
                            {/* Profile Views */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Eye className="h-5 w-5 text-blue-500" />
                                            Vues de profil
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="text-3xl font-bold">{stats.profile_views.total}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {stats.profile_views.this_week} cette semaine
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Heart className="h-5 w-5 text-pink-500" />
                                            Likes reçus
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="text-3xl font-bold">{stats.likes.received}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {stats.likes.weekly_received} cette semaine
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Users className="h-5 w-5 text-purple-500" />
                                            Matches
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="text-3xl font-bold">{stats.matches.total}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {stats.matches.this_week} cette semaine
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detailed Stats */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Activité Likes</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Donnés</span>
                                            <span className="font-semibold">{stats.likes.given}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Reçus</span>
                                            <span className="font-semibold">{stats.likes.received}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Ratio</span>
                                            <span className="font-semibold">1:{stats.likes.ratio}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageCircle className="h-5 w-5" />
                                            Messages
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Envoyés</span>
                                            <span className="font-semibold">{stats.messages.sent}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Reçus</span>
                                            <span className="font-semibold">{stats.messages.received}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Temps de réponse moyen
                                            </span>
                                            <span className="font-semibold">{stats.messages.avg_response_time}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Activity Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Résumé d'activité</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <div className="flex flex-col items-center text-center p-4">
                                            <Heart className="h-8 w-8 text-pink-500 mb-2" />
                                            <div className="text-2xl font-bold">
                                                {stats.activity.daily_likes_remaining}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Likes restants</div>
                                        </div>
                                        <div className="flex flex-col items-center text-center p-4">
                                            <Award className="h-8 w-8 text-purple-500 mb-2" />
                                            <div className="text-2xl font-bold">{stats.activity.badges_earned}</div>
                                            <div className="text-sm text-muted-foreground">Badges obtenus</div>
                                        </div>
                                        <div className="flex flex-col items-center text-center p-4">
                                            <Gem className="h-8 w-8 text-yellow-500 mb-2" />
                                            <div className="text-2xl font-bold">{stats.activity.gems}</div>
                                            <div className="text-sm text-muted-foreground">Gemmes</div>
                                        </div>
                                        <div className="flex flex-col items-center text-center p-4">
                                            <Gift className="h-8 w-8 text-orange-500 mb-2" />
                                            <div className="text-2xl font-bold">
                                                {stats.activity.total_gifts_received}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Cadeaux reçus</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Weekly Performance */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Performance cette semaine
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {stats.weekly_performance.map((day, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="w-12 text-sm font-medium">{day.day}</div>
                                                <div className="flex-1 flex items-center gap-2">
                                                    <div className="flex-1 h-8 bg-pink-100 dark:bg-pink-900/20 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-pink-400 to-pink-600"
                                                            style={{ width: `${Math.min(day.likes * 10, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="w-16 text-sm text-right">
                                                        {day.likes} likes
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex items-center gap-2">
                                                    <div className="flex-1 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                                                            style={{ width: `${Math.min(day.matches * 33, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="w-20 text-sm text-right">
                                                        {day.matches} matches
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )
                )}
            </div>
        </DatingLayout>
    );
}
