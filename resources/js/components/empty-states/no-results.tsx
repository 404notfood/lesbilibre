import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoResultsProps {
    onReset?: () => void;
    message?: string;
}

export function NoResults({ onReset, message }: NoResultsProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <div className="rounded-full bg-muted p-6 mb-6">
                <SearchX className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">
                Aucun résultat
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
                {message ||
                    "Nous n'avons trouvé aucun profil correspondant à vos critères. Essayez d'élargir votre recherche."}
            </p>
            {onReset && (
                <Button onClick={onReset} size="lg" variant="outline">
                    Réinitialiser les filtres
                </Button>
            )}
        </div>
    );
}
