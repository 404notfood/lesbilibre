import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NaughtyInterest {
    id: number;
    name: string;
    slug: string;
    category: string;
    emoji: string;
}

interface InterestSelectorProps {
    interests: NaughtyInterest[];
    selectedIds: number[];
    onToggle: (interestId: number) => void;
    categoryLabels?: Record<string, string>;
}

const defaultCategoryLabels: Record<string, string> = {
    practices: 'Pratiques',
    positions: 'Positions',
    anatomy: 'Anatomie & Préférences',
    toys: 'Jouets & Accessoires',
    bdsm: 'BDSM',
    fetish: 'Fétichisme',
    ambiance: 'Ambiances & Contextes',
};

export default function InterestSelector({
    interests,
    selectedIds,
    onToggle,
    categoryLabels = defaultCategoryLabels,
}: InterestSelectorProps) {
    const groupedInterests = interests.reduce(
        (acc, interest) => {
            if (!acc[interest.category]) {
                acc[interest.category] = [];
            }
            acc[interest.category].push(interest);
            return acc;
        },
        {} as Record<string, NaughtyInterest[]>,
    );

    const isSelected = (interestId: number) => selectedIds.includes(interestId);

    return (
        <div className="space-y-8">
            {Object.entries(groupedInterests).map(([category, categoryInterests]) => (
                <div key={category}>
                    <h3 className="text-lg font-semibold text-pink-600 dark:text-pink-400 mb-4">
                        {categoryLabels[category] || category}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {categoryInterests.map((interest) => (
                            <button
                                key={interest.id}
                                type="button"
                                onClick={() => onToggle(interest.id)}
                                className={cn(
                                    'relative p-4 rounded-xl border-2 transition-all duration-200',
                                    'flex flex-col items-center justify-center gap-2',
                                    'hover:scale-105 active:scale-95',
                                    'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2',
                                    isSelected(interest.id)
                                        ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700',
                                )}
                            >
                                {isSelected(interest.id) && (
                                    <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full p-1">
                                        <Check className="h-3 w-3" />
                                    </div>
                                )}
                                <span className="text-3xl" role="img" aria-label={interest.name}>
                                    {interest.emoji}
                                </span>
                                <span
                                    className={cn(
                                        'text-xs font-medium text-center leading-tight',
                                        isSelected(interest.id)
                                            ? 'text-pink-700 dark:text-pink-300'
                                            : 'text-gray-700 dark:text-gray-300',
                                    )}
                                >
                                    {interest.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
