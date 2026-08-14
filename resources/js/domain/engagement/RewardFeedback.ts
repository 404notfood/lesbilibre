export type RewardType = 'like' | 'pass';

export interface RewardState {
    type: RewardType;
    profileId: number;
    pulseClassName: string;
    burstParticles: number;
    startedAt: number;
    expiresAt: number;
}

export class RewardFeedback {
    private readonly durationMs: number;
    private readonly vibrationPattern: number[];

    public constructor(durationMs = 850, vibrationPattern: number[] = [16, 28, 14]) {
        this.durationMs = durationMs;
        this.vibrationPattern = vibrationPattern;
    }

    public create(type: RewardType, profileId: number): RewardState {
        const startedAt = Date.now();
        return {
            type,
            profileId,
            pulseClassName: type === 'like' ? 'match-glow animate-heartbeat' : 'opacity-80',
            burstParticles: type === 'like' ? 7 : 0,
            startedAt,
            expiresAt: startedAt + this.durationMs,
        };
    }

    public maybeVibrate(type: RewardType): void {
        if (typeof window === 'undefined' || !('navigator' in window)) {
            return;
        }

        const canVibrate = typeof navigator.vibrate === 'function';
        if (!canVibrate) {
            return;
        }

        if (type === 'like') {
            navigator.vibrate(this.vibrationPattern);
        } else {
            navigator.vibrate(8);
        }
    }

    public isActive(state: RewardState | null): boolean {
        return !!state && Date.now() < state.expiresAt;
    }
}
