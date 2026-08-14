import { User, MapPin, Calendar, Heart, Briefcase, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfilePreviewCardProps {
    profile: {
        bio?: string;
        age?: number;
        city?: string;
        sexual_orientation?: string;
        relationship_status?: string;
        occupation?: string;
        education?: string;
        interests?: string[];
        looking_for?: string;
    };
    user: {
        name: string;
        pseudo: string;
        avatar_url?: string;
    };
    className?: string;
}

export default function ProfilePreviewCard({ profile, user, className }: ProfilePreviewCardProps) {
    return (
        <div className={cn('bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg', className)}>
            <div className="flex items-start gap-4">
                <div className="relative">
                    {user.avatar_url ? (
                        <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="w-20 h-20 rounded-full object-cover ring-4 ring-pink-500/20"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center ring-4 ring-pink-500/20">
                            <User className="h-10 w-10 text-white" />
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full p-1.5">
                        <Heart className="h-3 w-3 fill-current" />
                    </div>
                </div>

                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">@{user.pseudo}</p>

                    {profile.age && profile.city && (
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-pink-500" />
                                {profile.age} ans
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-pink-500" />
                                {profile.city}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {profile.bio && (
                <p className="mt-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {profile.bio}
                </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
                {profile.occupation && (
                    <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-pink-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 truncate">
                            {profile.occupation}
                        </span>
                    </div>
                )}
                {profile.education && (
                    <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-pink-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 truncate">
                            {profile.education}
                        </span>
                    </div>
                )}
            </div>

            {profile.interests && profile.interests.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Centres d'intérêt
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {profile.interests.slice(0, 6).map((interest, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 text-xs font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full"
                            >
                                {interest}
                            </span>
                        ))}
                        {profile.interests.length > 6 && (
                            <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                                +{profile.interests.length - 6}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {profile.looking_for && (
                <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Recherche
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{profile.looking_for}</p>
                </div>
            )}
        </div>
    );
}
