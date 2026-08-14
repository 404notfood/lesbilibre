import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

export function NoMatches() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
                <Heart className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">
                Aucun match pour le moment
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
                Continuez à explorer les profils et à liker les personnes qui
                vous plaisent. Un match se produit quand c'est réciproque !
            </p>
            <Button
                onClick={() => router.visit('/dashboard')}
                size="lg"
            >
                Explorer les profils
            </Button>
        </div>
    );
}
