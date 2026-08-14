import { Skeleton } from '@/components/ui/skeleton';

export function MessageSkeleton() {
    return (
        <div className="flex items-start gap-3 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    );
}

export function MessageListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-1">
            {Array.from({ length: count }).map((_, i) => (
                <MessageSkeleton key={i} />
            ))}
        </div>
    );
}
