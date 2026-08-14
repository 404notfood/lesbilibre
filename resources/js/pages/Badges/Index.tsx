import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Trophy, Star, Sparkles, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface Badge {
    id: number;
    slug: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    rarity_color: string;
    points: number;
    progress: number;
    awarded_at: string | null;
    is_awarded: boolean;
}

interface Stats {
    total_badges: number;
    earned_badges: number;
    total_points: number;
    progress_percentage: number;
}

interface BadgesByRarity {
    common?: Badge[];
    rare?: Badge[];
    epic?: Badge[];
    legendary?: Badge[];
}

export default function Index({
    badges,
    badgesByRarity,
    stats,
}: {
    badges: Badge[];
    badgesByRarity: BadgesByRarity;
    stats: Stats;
}) {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        router.post('/badges/refresh', {}, {
            preserveScroll: true,
            onFinish: () => {
                setRefreshing(false);
                router.reload({ only: ['badges', 'badgesByRarity', 'stats'] });
            },
        });
    };

    const getRarityLabel = (rarity: string) => {
        const labels = {
            common: 'Commun',
            rare: 'Rare',
            epic: 'Épique',
            legendary: 'Légendaire',
        };
        return labels[rarity as keyof typeof labels] || rarity;
    };

    const getRarityIcon = (rarity: string) => {
        switch (rarity) {
            case 'legendary':
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 'epic':
                return <Award className="h-5 w-5 text-purple-500" />;
            case 'rare':
                return <Star className="h-5 w-5 text-blue-500" />;
            default:
                return <Sparkles className="h-5 w-5 text-gray-400" />;
        }
    };

    return (
        <DatingLayout title="Badges & Récompenses" showOnlineUsers={false}>
            <Head title="Badges" />

            <div className="p-6 space-y-6">
                {/* Header avec stats */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Trophy className="h-8 w-8 text-yellow-500" />
                                Badges & Récompenses
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Déverrouillez des badges en utilisant la plateforme
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Vérifier
                        </Button>
                    </div>

                    {/* Stats cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Badges obtenus</p>
                                        <p className="text-2xl font-bold">
                                            {stats.earned_badges}/{stats.total_badges}
                                        </p>
                                    </div>
                                    <Award className="h-8 w-8 text-purple-500" />
                                </div>
                                <Progress value={stats.progress_percentage} className="mt-3" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Points totaux</p>
                                        <p className="text-2xl font-bold">{stats.total_points}</p>
                                    </div>
                                    <Sparkles className="h-8 w-8 text-yellow-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Progression</p>
                                        <p className="text-2xl font-bold">{stats.progress_percentage}%</p>
                                    </div>
                                    <Trophy className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">En progression</p>
                                        <p className="text-2xl font-bold">
                                            {badges.filter((b) => b.progress > 0 && !b.is_awarded).length}
                                        </p>
                                    </div>
                                    <RefreshCw className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Badges par rareté */}
                {(['legendary', 'epic', 'rare', 'common'] as const).map((rarity) => {
                    const rarityBadges = badgesByRarity[rarity] || [];
                    if (rarityBadges.length === 0) return null;

                    return (
                        <div key={rarity}>
                            <div className="flex items-center gap-3 mb-4">
                                {getRarityIcon(rarity)}
                                <h2 className="text-2xl font-bold">{getRarityLabel(rarity)}</h2>
                                <BadgeComponent variant="secondary">
                                    {rarityBadges.filter((b) => b.is_awarded).length}/{rarityBadges.length}
                                </BadgeComponent>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {rarityBadges.map((badge) => (
                                    <Card
                                        key={badge.id}
                                        className={`transition-all hover:shadow-lg ${
                                            badge.is_awarded
                                                ? 'border-2'
                                                : 'opacity-60 grayscale hover:grayscale-0'
                                        }`}
                                        style={{
                                            borderColor: badge.is_awarded ? badge.rarity_color : undefined,
                                        }}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="text-4xl">{badge.icon}</div>
                                                {badge.is_awarded && (
                                                    <BadgeComponent
                                                        className="text-white border-0"
                                                        style={{ backgroundColor: badge.rarity_color }}
                                                    >
                                                        Obtenu
                                                    </BadgeComponent>
                                                )}
                                            </div>
                                            <CardTitle className="mt-2">{badge.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {badge.description}
                                            </p>

                                            {!badge.is_awarded && badge.progress > 0 && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Progression</span>
                                                        <span>{badge.progress}%</span>
                                                    </div>
                                                    <Progress value={badge.progress} />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                                <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                                    <Sparkles className="h-4 w-4" />
                                                    {badge.points} points
                                                </div>
                                                {badge.is_awarded && badge.awarded_at && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(badge.awarded_at).toLocaleDateString('fr-FR')}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Empty state */}
                {badges.length === 0 && (
                    <div className="text-center py-16">
                        <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Aucun badge disponible</h3>
                        <p className="text-muted-foreground">
                            Les badges seront bientôt disponibles !
                        </p>
                    </div>
                )}
            </div>
        </DatingLayout>
    );
}
