import MemberCard from '@/components/discovery/MemberCard';
import type { DiscoverySignal } from '@/domain/engagement/DiscoverySignals';
import type { RewardState } from '@/domain/engagement/RewardFeedback';

interface DiscoveryProfileCard {
    id: number;
    name: string;
    pseudo?: string;
    age: number;
    city: string;
    distance: number | null;
    bio: string;
    primary_photo: string | null;
    is_online: boolean;
    is_verified?: boolean;
    meeting_intentions?: string[];
    compatibility_score: number;
    recommendation_reasons: string[];
}

interface ProfileCardProps {
    profile: DiscoveryProfileCard;
    signals: DiscoverySignal[];
    isLiked: boolean;
    reward: RewardState | null;
    onOpen: (id: number) => void;
    onLike: (id: number) => void;
    onPass: (id: number) => void;
}

export default function ProfileCard({
    profile,
    signals,
    isLiked,
    reward,
    onOpen,
    onLike,
    onPass,
}: ProfileCardProps) {
    const activeReward = reward?.profileId === profile.id ? reward : null;
    const reason =
        profile.recommendation_reasons[0] ||
        signals.find((signal) => signal.id === 'strong-profile')?.label;

    return (
        <MemberCard
            member={{
                ...profile,
                photo: profile.primary_photo,
                isOnline: profile.is_online,
                isVerified: profile.is_verified,
                intentions: profile.meeting_intentions,
                compatibility: profile.compatibility_score,
                reason,
            }}
            isLiked={isLiked}
            onOpen={() => onOpen(profile.id)}
            onLike={() => {
                if (!isLiked) onLike(profile.id);
            }}
            onPass={() => onPass(profile.id)}
            className={activeReward?.pulseClassName}
            decoration={
                activeReward?.burstParticles ? (
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                    >
                        {Array.from(
                            { length: activeReward.burstParticles },
                            (_, index) => (
                                <span
                                    key={index}
                                    className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-[color:var(--desire)] motion-safe:animate-ping"
                                    style={{
                                        transform: `translate(${(index - 3) * 16}px, ${(index % 2 === 0 ? -1 : 1) * (10 + index * 4)}px)`,
                                        animationDelay: `${index * 45}ms`,
                                    }}
                                />
                            ),
                        )}
                    </span>
                ) : null
            }
        />
    );
}
