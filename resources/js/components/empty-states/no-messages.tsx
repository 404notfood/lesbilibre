import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

export function NoMessages() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
                <MessageCircle className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">
                Aucun message
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
                Commencez une conversation avec vos matches pour briser la glace !
                Les premières impressions comptent.
            </p>
            <Button
                onClick={() => router.visit('/matches')}
                size="lg"
            >
                Voir mes matches
            </Button>
        </div>
    );
}
