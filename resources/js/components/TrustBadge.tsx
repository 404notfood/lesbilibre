import { Shield, ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TrustLevel {
    level: string;
    label: string;
    color: string;
    icon: string;
}

interface TrustBadgeProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

function getTrustLevel(score: number): TrustLevel {
    if (score >= 76) {
        return { level: 'excellence', label: 'Excellence', color: '#10B981', icon: 'shield-check' };
    }
    if (score >= 51) {
        return { level: 'very_trusted', label: 'Très fiable', color: '#3B82F6', icon: 'shield' };
    }
    if (score >= 26) {
        return { level: 'trusted', label: 'Fiable', color: '#F59E0B', icon: 'shield' };
    }
    return { level: 'new', label: 'Nouveau', color: '#6B7280', icon: 'shield' };
}

const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
};

const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
};

export default function TrustBadge({ score, size = 'md', showLabel = false, className = '' }: TrustBadgeProps) {
    const trustLevel = getTrustLevel(score);
    const IconComponent = trustLevel.icon === 'shield-check' ? ShieldCheck : Shield;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`inline-flex items-center gap-1 ${className}`}>
                        <IconComponent
                            className={sizeClasses[size]}
                            style={{ color: trustLevel.color }}
                            fill={score >= 51 ? trustLevel.color : 'none'}
                            fillOpacity={score >= 51 ? 0.2 : 0}
                        />
                        {showLabel && (
                            <span className={`${textSizes[size]} font-medium`} style={{ color: trustLevel.color }}>
                                {trustLevel.label}
                            </span>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-medium">{trustLevel.label}</p>
                    <p className="text-xs text-muted-foreground">Score de confiance : {score}/100</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
