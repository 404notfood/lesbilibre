export interface DiscoveryProfile {
    id: number;
    is_online: boolean;
    compatibility_score: number;
    photo_count: number;
}

export interface DiscoverySignal {
    id: string;
    label: string;
    tone: 'primary' | 'secondary' | 'accent';
}

export class DiscoverySignals {
    public buildSignals(profile: DiscoveryProfile): DiscoverySignal[] {
        const signals: DiscoverySignal[] = [];

        if (profile.compatibility_score >= 85) {
            signals.push({
                id: 'match-imminent',
                label: `Match imminent ${profile.compatibility_score}%`,
                tone: 'primary',
            });
        }

        if (profile.is_online) {
            signals.push({
                id: 'active-now',
                label: 'En ligne',
                tone: 'secondary',
            });
        }

        if (profile.photo_count >= 3 && profile.compatibility_score >= 70) {
            signals.push({
                id: 'strong-profile',
                label: 'Profil complet',
                tone: 'accent',
            });
        }

        return signals.slice(0, 2);
    }
}
