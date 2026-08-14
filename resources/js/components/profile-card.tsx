import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MapPin, Verified } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
    user: {
        id: number;
        name: string;
        age: number;
        city?: string;
        bio?: string;
        photos?: { url: string }[];
        is_verified?: boolean;
        is_online?: boolean;
        distance?: string;
        interests?: string[];
    };
    onLike?: (userId: number) => void;
    onMessage?: (userId: number) => void;
    compact?: boolean;
}

export function ProfileCard({
    user,
    onLike,
    onMessage,
    compact = false,
}: ProfileCardProps): JSX.Element {
    const [isLiked, setIsLiked] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const mainPhoto = user.photos?.[0]?.url || '/images/default-avatar.jpg';

    const handleLike = (e: React.MouseEvent): void => {
        e.preventDefault();
        setIsLiked(!isLiked);
        onLike?.(user.id);
    };

    const handleMessage = (e: React.MouseEvent): void => {
        e.preventDefault();
        onMessage?.(user.id);
    };

    return (
        <Link
            href={`/profile/${user.id}`}
            className="block group"
        >
            <div className={cn('profile-card', compact && 'rounded-lg')}>
                {/* Image principale */}
                <div className={cn('relative aspect-[3/4]', compact && 'aspect-square')}>
                    {!imageLoaded && (
                        <div className="absolute inset-0 shimmer rounded-xl" />
                    )}
                    <img
                        src={mainPhoto}
                        alt={user.name}
                        className={cn(
                            'w-full h-full object-cover rounded-xl transition-opacity duration-300',
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                        onLoad={() => setImageLoaded(true)}
                    />

                    {/* Badge de vérification */}
                    {user.is_verified && (
                        <div className="absolute top-3 right-3 bg-primary rounded-full p-1.5">
                            <Verified className="h-4 w-4 text-primary-foreground" />
                        </div>
                    )}

                    {/* Statut en ligne */}
                    {user.is_online && (
                        <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-green-500/90 text-white border-0">
                                <span className="relative flex h-2 w-2 mr-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                </span>
                                En ligne
                            </Badge>
                        </div>
                    )}

                    {/* Overlay avec gradient */}
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <div className="space-y-2">
                            {/* Nom et âge */}
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold tracking-tight">
                                    {user.name}, {user.age}
                                </h3>
                            </div>

                            {/* Localisation */}
                            {(user.city || user.distance) && (
                                <div className="flex items-center gap-1.5 text-sm text-white/90">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>
                                        {user.city}
                                        {user.distance && ` • ${user.distance}`}
                                    </span>
                                </div>
                            )}

                            {/* Bio (mode non-compact uniquement) */}
                            {!compact && user.bio && (
                                <p className="text-sm text-white/80 line-clamp-2">
                                    {user.bio}
                                </p>
                            )}

                            {/* Centres d'intérêt */}
                            {!compact && user.interests && user.interests.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {user.interests.slice(0, 3).map((interest, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-white/20 backdrop-blur-sm text-white border-0 text-xs"
                                        >
                                            {interest}
                                        </Badge>
                                    ))}
                                    {user.interests.length > 3 && (
                                        <Badge
                                            variant="secondary"
                                            className="bg-white/20 backdrop-blur-sm text-white border-0 text-xs"
                                        >
                                            +{user.interests.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {!compact && (
                    <div className="flex gap-2 p-3 bg-card border-t border-border rounded-b-xl">
                        <Button
                            variant={isLiked ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                                'flex-1 gap-2',
                                isLiked && 'bg-primary hover:bg-primary/90'
                            )}
                            onClick={handleLike}
                        >
                            <Heart
                                className={cn(
                                    'h-4 w-4',
                                    isLiked && 'fill-current animate-heartbeat'
                                )}
                            />
                            <span>{isLiked ? 'Liké' : 'Liker'}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={handleMessage}
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span>Message</span>
                        </Button>
                    </div>
                )}
            </div>
        </Link>
    );
}
