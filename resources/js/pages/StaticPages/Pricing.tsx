import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { Check, Gem, Heart } from 'lucide-react';

interface Plan {
    name: string;
    tagline: string | null;
    price: number;
    durationMonths: number;
    pricePerMonth: number;
    perks: string[];
    featured: boolean;
}

interface GemPackage {
    name: string;
    gems: number;
    price: number;
}

export default function Pricing({
    plans,
    gemPackages,
}: {
    plans: Plan[];
    gemPackages: GemPackage[];
}) {
    return (
        <PublicLayout>
            <Head title="Tarifs" />
            <main className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
                <header className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        Des prix lisibles
                    </p>
                    <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                        Gratuit pour rencontrer, Premium pour aller plus loin
                    </h1>
                    <p className="mt-5 text-lg leading-8 text-muted-foreground">
                        Créer son profil, découvrir des membres, matcher et
                        discuter restent accessibles gratuitement. Les options
                        payantes sont annoncées avant toute validation.
                    </p>
                </header>

                <section className="mt-12 rounded-2xl border border-primary/30 bg-primary/5 p-7">
                    <div className="flex items-center gap-3">
                        <Heart className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-semibold">
                            Compte gratuit
                        </h2>
                    </div>
                    <ul className="mt-5 grid gap-3 text-muted-foreground sm:grid-cols-2">
                        {[
                            'Profil et préférences',
                            'Découverte et recherche',
                            'Likes, matchs et conversations',
                            'Blocage, signalement et contrôles de confidentialité',
                        ].map((item) => (
                            <li key={item} className="flex gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mt-12" aria-labelledby="premium-title">
                    <h2 id="premium-title" className="text-3xl font-bold">
                        Formules Premium
                    </h2>
                    {plans.length > 0 ? (
                        <div className="mt-6 grid gap-5 md:grid-cols-3">
                            {plans.map((plan) => (
                                <article
                                    key={`${plan.name}-${plan.durationMonths}`}
                                    className={`rounded-2xl border bg-card p-6 ${plan.featured ? 'border-primary ring-2 ring-primary/15' : 'border-border'}`}
                                >
                                    {plan.featured && (
                                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                                            La plus choisie
                                        </span>
                                    )}
                                    <h3 className="mt-4 text-2xl font-semibold">
                                        {plan.name}
                                    </h3>
                                    {plan.tagline && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {plan.tagline}
                                        </p>
                                    )}
                                    <p className="mt-5 text-3xl font-bold">
                                        {plan.price.toLocaleString('fr-FR', {
                                            style: 'currency',
                                            currency: 'EUR',
                                        })}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        soit{' '}
                                        {plan.pricePerMonth.toLocaleString(
                                            'fr-FR',
                                            {
                                                style: 'currency',
                                                currency: 'EUR',
                                            },
                                        )}{' '}
                                        / mois
                                    </p>
                                    <ul className="mt-5 space-y-2 text-sm">
                                        {plan.perks.map((perk) => (
                                            <li
                                                key={perk}
                                                className="flex gap-2"
                                            >
                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                {perk}
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-5 rounded-xl border border-border bg-card p-5 text-muted-foreground">
                            Les formules Premium seront affichées ici dès que
                            leur catalogue sera ouvert.
                        </p>
                    )}
                </section>

                <section className="mt-12" aria-labelledby="gems-title">
                    <div className="flex items-center gap-3">
                        <Gem className="h-6 w-6 text-primary" />
                        <h2 id="gems-title" className="text-3xl font-bold">
                            Gemmes
                        </h2>
                    </div>
                    <p className="mt-3 max-w-3xl text-muted-foreground">
                        Les gemmes servent aux cadeaux et options ponctuelles.
                        Leur coût est affiché avant chaque dépense.
                    </p>
                    {gemPackages.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-3">
                            {gemPackages.map((pack) => (
                                <div
                                    key={`${pack.name}-${pack.gems}`}
                                    className="rounded-xl border border-border bg-card px-5 py-4"
                                >
                                    <strong>
                                        {pack.gems.toLocaleString('fr-FR')}{' '}
                                        gemmes
                                    </strong>
                                    <span className="ml-3 text-muted-foreground">
                                        {pack.price.toLocaleString('fr-FR', {
                                            style: 'currency',
                                            currency: 'EUR',
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className="mt-12 text-center">
                    <Link
                        href="/register"
                        className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
                    >
                        Créer mon profil gratuitement
                    </Link>
                </div>
            </main>
        </PublicLayout>
    );
}
