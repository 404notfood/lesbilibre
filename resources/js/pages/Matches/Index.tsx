import DatingLayout from '@/layouts/dating-layout';
import { Head, Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, MapPin, Sparkles } from 'lucide-react';

interface Photo {
    id: number;
    path: string;
}

interface Profile {
    city?: string;
    age?: number;
    bio?: string;
}

interface UserData {
    id: number;
    name: string;
    is_verified: boolean;
    profile?: Profile;
    photos: Photo[];
}

interface Match {
    id: number;
    matched_at: string;
    user: UserData;
}

export default function Index({ matches }: { matches: Match[] }) {
    return (
        <DatingLayout title="Mes Matches" showOnlineUsers={true}>
            <Head title="Mes Matches" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                        Tes Matches 💕
                    </h2>
                    <p className="text-muted-foreground">
                        Vous avez {matches.length} match{matches.length > 1 ? 's' : ''} ! C'est le moment de discuter
                    </p>
                </div>

                {/* Matches Grid */}
                {matches.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {matches.map((match) => (
                            <div
                                key={match.id}
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-card to-card/50 border border-border hover:border-primary/40 transition-all hover:scale-[1.02]"
                            >
                                {/* Profile Image */}
                                <div className="relative aspect-[3/4] bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900/20 dark:to-purple-900/20">
                                    {match.user.photos?.[0] ? (
                                        <img
                                            src={`/storage/${match.user.photos[0].path}`}
                                            alt={match.user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Avatar className="h-32 w-32 border-4 border-white/50">
                                                <AvatarImage src="" />
                                                <AvatarFallback className="text-4xl bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                                                    {match.user.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    )}

                                    {/* Match Badge */}
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
                                            <Heart className="h-3 w-3 mr-1 fill-white" />
                                            Match !
                                        </Badge>
                                    </div>

                                    {/* Verified Badge */}
                                    {match.user.is_verified && (
                                        <div className="absolute top-4 right-4">
                                            <Badge className="bg-blue-500 text-white border-0">
                                                ✓ Vérifiée
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Profile Info */}
                                <div className="p-5 space-y-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">
                                            {match.user.name}, {match.user.profile?.age || 'N/A'}
                                        </h3>
                                        {match.user.profile?.city && (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{match.user.profile.city}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-foreground/80 line-clamp-2">
                                        {match.user.profile?.bio || 'Aucune bio pour le moment...'}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <Link
                                            href={`/profile/${match.user.id}`}
                                            className="flex-1"
                                        >
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="w-full"
                                            >
                                                Voir profil
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/conversations?user_id=${match.user.id}`}
                                            className="flex-1"
                                        >
                                            <Button
                                                size="lg"
                                                className="w-full btn-gradient"
                                            >
                                                <MessageCircle className="h-5 w-5 mr-2" />
                                                Message
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="relative mb-6">
                            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <Heart className="h-16 w-16 text-primary/40" />
                            </div>
                            <div className="absolute -top-2 -right-2">
                                <Sparkles className="h-8 w-8 text-accent" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                            Aucun match pour le moment
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md mb-6">
                            Continue de liker des profils pour augmenter tes chances de matcher !
                        </p>
                        <Link href="/dashboard">
                            <Button className="btn-gradient">
                                Découvrir des profils
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </DatingLayout>
    );
}
