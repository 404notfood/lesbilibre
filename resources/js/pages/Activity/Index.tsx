import DatingLayout from '@/layouts/dating-layout';
import { Head, Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Heart,
    Eye,
    Gift,
    Star,
    Trophy,
    MessageCircle,
    Sparkles,
    Crown,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Activity {
    id: number;
    type: 'visit' | 'like' | 'match' | 'gift';
    user: {
        id: number;
        name: string;
        age: number;
        photo?: string;
        online?: boolean;
    };
    created_at: string;
    gift?: {
        emoji: string;
        name: string;
    };
}

interface TopUser {
    id: number;
    name: string;
    age: number;
    photo?: string;
    likes_count: number;
    rank: number;
}

interface Props {
    activities?: Activity[];
    visits?: Activity[];
    likes_received?: Activity[];
    likes_sent?: Activity[];
    matches?: Activity[];
    top_users?: TopUser[];
}

export default function Index({
    activities = [],
    visits = [],
    likes_received = [],
    likes_sent: _likes_sent = [],
    matches = [],
    top_users = [],
}: Props) {
    const displayActivities = activities || [];
    const displayTopUsers = top_users || [];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'visit':
                return <Eye className="h-5 w-5 text-blue-500" />;
            case 'like':
                return <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />;
            case 'match':
                return <Star className="h-5 w-5 text-amber-500 fill-amber-500" />;
            case 'gift':
                return <Gift className="h-5 w-5 text-purple-500" />;
            default:
                return <Sparkles className="h-5 w-5 text-gray-500" />;
        }
    };

    const getActivityText = (activity: Activity) => {
        switch (activity.type) {
            case 'visit':
                return 'a visité ton profil';
            case 'like':
                return 't\'a liké';
            case 'match':
                return 'C\'est un match !';
            case 'gift':
                return `t'a envoyé ${activity.gift?.emoji} ${activity.gift?.name}`;
            default:
                return '';
        }
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1)
            return (
                <div className="absolute -top-2 -right-2 h-10 w-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="h-5 w-5 text-white" />
                </div>
            );
        if (rank === 2)
            return (
                <div className="absolute -top-2 -right-2 h-10 w-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg">
                    <Trophy className="h-5 w-5 text-white" />
                </div>
            );
        if (rank === 3)
            return (
                <div className="absolute -top-2 -right-2 h-10 w-10 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="h-5 w-5 text-white fill-white" />
                </div>
            );
        return null;
    };

    return (
        <DatingLayout title="Activité" showOnlineUsers={false}>
            <Head title="Activité" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                        Ton Activité 🔥
                    </h2>
                    <p className="text-muted-foreground">
                        Suis toutes tes interactions en un coup d'œil
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-2 border-pink-500/20 bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/20 dark:to-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                Likes Reçus
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-pink-600">
                                {likes_received.length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Likes reçus au total
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Visites
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {visits.length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Visites de profil
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Matches
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-600">
                                {matches.length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Matches réalisés
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                Activités
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">
                                {displayActivities.length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Activités récentes
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Activity Timeline */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-pink-500" />
                                    Activité Récente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="all" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="all">Tout</TabsTrigger>
                                        <TabsTrigger value="likes">Likes</TabsTrigger>
                                        <TabsTrigger value="visits">Visites</TabsTrigger>
                                        <TabsTrigger value="matches">Matches</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="all" className="space-y-3 mt-4">
                                        {displayActivities.map((activity) => (
                                            <Link
                                                key={activity.id}
                                                href={`/profile/${activity.user.id}`}
                                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-all group"
                                            >
                                                <div className="relative">
                                                    <Avatar className="h-14 w-14 border-2 border-primary/20 group-hover:border-primary/40 transition-all">
                                                        {activity.user.photo ? (
                                                            <AvatarImage
                                                                src={activity.user.photo}
                                                                alt={activity.user.name}
                                                            />
                                                        ) : (
                                                            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                                                                {activity.user.name
                                                                    .slice(0, 2)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                    {activity.user.online && (
                                                        <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-card rounded-full" />
                                                    )}
                                                    <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-1">
                                                        {getActivityIcon(activity.type)}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-foreground">
                                                        {activity.user.name}, {activity.user.age}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {getActivityText(activity)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatDistanceToNow(
                                                            new Date(activity.created_at),
                                                            {
                                                                addSuffix: true,
                                                                locale: fr,
                                                            }
                                                        )}
                                                    </p>
                                                </div>

                                                {activity.type === 'match' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-gradient-to-r from-pink-500 to-purple-600"
                                                    >
                                                        <MessageCircle className="h-4 w-4 mr-2" />
                                                        Discuter
                                                    </Button>
                                                )}
                                            </Link>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="likes">
                                        <p className="text-center text-muted-foreground py-8">
                                            Filtre par likes uniquement
                                        </p>
                                    </TabsContent>

                                    <TabsContent value="visits">
                                        <p className="text-center text-muted-foreground py-8">
                                            Filtre par visites uniquement
                                        </p>
                                    </TabsContent>

                                    <TabsContent value="matches">
                                        <p className="text-center text-muted-foreground py-8">
                                            Filtre par matches uniquement
                                        </p>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Hall of Fame */}
                    <div>
                        <Card className="border-2 border-amber-500/20">
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <Trophy className="h-5 w-5" />
                                    Temple de la Renommée
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                {displayTopUsers.map((user) => (
                                    <Link
                                        key={user.id}
                                        href={`/profile/${user.id}`}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/50 transition-all group relative"
                                    >
                                        <div className="flex-shrink-0 w-8 text-center font-bold text-2xl text-muted-foreground">
                                            {user.rank}
                                        </div>

                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-amber-500/40 group-hover:border-amber-500 transition-all">
                                                {user.photo ? (
                                                    <AvatarImage
                                                        src={user.photo}
                                                        alt={user.name}
                                                    />
                                                ) : (
                                                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                                                        {user.name.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            {getRankBadge(user.rank)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-foreground truncate">
                                                {user.name}, {user.age}
                                            </p>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Heart className="h-3 w-3 text-pink-500 fill-pink-500" />
                                                <span>{user.likes_count} likes</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                <Button variant="outline" className="w-full mt-4">
                                    Voir le classement complet
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DatingLayout>
    );
}
