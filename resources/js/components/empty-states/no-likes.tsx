import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

export function NoLikes() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
                <Heart className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">
                Personne ne vous a encore liké
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
                Ne vous découragez pas ! Assurez-vous que votre profil est
                complet avec de belles photos et une description attrayante.
            </p>
            <div className="flex gap-3">
                <Button
                    onClick={() => router.visit('/profile/edit')}
                    variant="outline"
                    size="lg"
                >
                    Compléter mon profil
                </Button>
                <Button
                    onClick={() => router.visit('/dashboard')}
                    size="lg"
                >
                    Explorer
                </Button>
            </div>
        </div>
    );
}
