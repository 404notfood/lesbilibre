import { Skeleton } from '@/components/ui/skeleton';

export function ConversationSkeleton() {
    return (
        <div className="flex items-center gap-3 p-4 border-b">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-3 w-12" />
        </div>
    );
}

export function ConversationListSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div>
            {Array.from({ length: count }).map((_, i) => (
                <ConversationSkeleton key={i} />
            ))}
        </div>
    );
}
