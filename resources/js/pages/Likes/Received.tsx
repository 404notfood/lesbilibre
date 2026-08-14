import DatingLayout from '@/layouts/dating-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Crown, Lock } from 'lucide-react';

interface User {
    id: number;
    name: string;
    pseudo: string;
    profile: {
        age: number;
        city: string;
        bio: string;
    };
    photos: Array<{
        path: string;
    }>;
}

interface Like {
    id: number;
    user: User;
    created_at: string;
}

interface Pagination {
    current_page: number;
    data: Like[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface ReceivedProps {
    likes: Pagination;
    isPremium: boolean;
    auth: { user: { is_premium: boolean } };
}

export default function Received({ likes, isPremium }: ReceivedProps) {
    const blurredLikes = likes.data.slice(0, 3);

    return (
        <DatingLayout title="Likes recus" showOnlineUsers={false}>
            <Head title="Likes recus" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Heart className="h-8 w-8 text-pink-500" />
                            Likes recus
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            {likes.total} personne{likes.total > 1 ? 's' : ''} {likes.total > 1 ? 'ont' : 'a'} like ton profil
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

                {/* Non-premium: blurred preview cards */}
                {!isPremium ? (
                    <div className="space-y-6">
                        {/* Blurred cards grid */}
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {blurredLikes.map((like) => (
                                <Card key={like.id} className="overflow-hidden">
                                    <div className="aspect-[3/4] relative">
                                        {/* Blurred photo */}
                                        {like.user.photos.length > 0 ? (
                                            <img
                                                src={`/storage/${like.user.photos[0].path}`}
                                                alt=""
                                                className="w-full h-full object-cover blur-md"
                                                draggable={false}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900 blur-md flex items-center justify-center">
                                                <Heart className="h-16 w-16 text-white/50" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        {/* Blurred name */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                            <h3 className="font-semibold text-lg blur-md select-none">
                                                {like.user.name}, {like.user.profile?.age || '?'}
                                            </h3>
                                            {like.user.profile?.city && (
                                                <div className="flex items-center gap-1 text-sm opacity-90 blur-md select-none">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{like.user.profile.city}</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Lock icon overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="rounded-full bg-black/30 p-3 backdrop-blur-sm">
                                                <Lock className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <Badge className="bg-pink-500 text-white">
                                                <Heart className="h-3 w-3 mr-1 fill-white" />
                                                Like
                                            </Badge>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Premium CTA overlay */}
                        <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                            <CardContent className="p-8 text-center space-y-5">
                                <div className="flex justify-center">
                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                                        <Crown className="h-10 w-10 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                                        {likes.total} personne{likes.total > 1 ? 's' : ''} t'ont likee
                                    </h2>
                                    <p className="text-muted-foreground max-w-lg mx-auto">
                                        Passe en Premium pour voir qui t'a likee et commence a discuter avec elles !
                                    </p>
                                </div>
                                <Link href="/premium">
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg text-lg px-8 py-6"
                                    >
                                        <Crown className="h-5 w-5 mr-2" />
                                        Passer en Premium pour les voir
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <>
                        {/* Premium: full likes grid */}
                        {likes.data.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">
                                        Aucun like pour le moment
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Continue a completer ton profil et a etre active !
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {likes.data.map((like) => (
                                    <Link key={like.id} href={`/profile/${like.user.id}`}>
                                        <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                                            <div className="aspect-[3/4] relative">
                                                {like.user.photos.length > 0 ? (
                                                    <img
                                                        src={`/storage/${like.user.photos[0].path}`}
                                                        alt={like.user.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900 flex items-center justify-center">
                                                        <Heart className="h-16 w-16 text-white/50" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                                    <h3 className="font-semibold text-lg">
                                                        {like.user.name}, {like.user.profile?.age || '?'}
                                                    </h3>
                                                    {like.user.profile?.city && (
                                                        <div className="flex items-center gap-1 text-sm opacity-90">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>{like.user.profile.city}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    <Badge className="bg-pink-500 text-white">
                                                        <Heart className="h-3 w-3 mr-1 fill-white" />
                                                        Like
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {likes.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                {likes.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                window.location.href = link.url;
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </DatingLayout>
    );
}
