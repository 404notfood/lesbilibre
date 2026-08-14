import { Sparkles } from 'lucide-react';

interface DiscoveryRailProps {
    profilesCount: number;
}

/* ---------------------------------------------------------------------------
 * DiscoveryRail — bandeau éditorial sous la barre de recherche.
 * Ton magazine, ambiance "édition du soir".
 * -------------------------------------------------------------------------*/
export default function DiscoveryRail({ profilesCount }: DiscoveryRailProps) {
    const hour = new Date().getHours();
    const moment =
        hour < 7
            ? 'Au cœur de la nuit'
            : hour < 12
              ? 'Édition du matin'
              : hour < 18
                ? 'Édition de l’après-midi'
                : hour < 22
                  ? 'Édition du soir'
                  : 'Édition de la nuit';

    return (
        <section className="relative overflow-hidden rounded-sm border border-border/40 bg-card/60">
            {/* Velvet gradient */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{
                    background:
                        'radial-gradient(70% 60% at 0% 50%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 60%), radial-gradient(60% 60% at 100% 50%, color-mix(in srgb, var(--secondary) 12%, transparent), transparent 60%)',
                }}
            />

            <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:gap-8">
                <div className="flex items-center gap-4">
                    <div className="hidden h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary md:flex">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="editorial-caption text-foreground/45">{moment}</div>
                        <h3 className="font-display mt-1 text-xl font-light italic leading-tight tracking-tight md:text-2xl">
                            Sélection du moment
                        </h3>
                    </div>
                </div>

                <div className="flex items-baseline gap-3 md:flex-col md:items-end md:gap-0">
                    <span className="font-display text-4xl font-light leading-none text-primary md:text-5xl">
                        {profilesCount}
                    </span>
                    <span className="editorial-caption text-foreground/55">
                        {profilesCount > 1 ? 'femmes à découvrir' : 'femme à découvrir'}
                    </span>
                </div>
            </div>

            {/* Bottom magenta line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </section>
    );
}
