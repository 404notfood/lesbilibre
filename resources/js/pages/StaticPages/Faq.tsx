import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const sections = [
    {
        category: 'Compte et profil',
        questions: [
            {
                q: 'Qui peut créer un compte ?',
                a: 'LesbiLibre est réservé aux personnes majeures correspondant au public défini dans les conditions d’utilisation. Une adresse e-mail valide est nécessaire pour activer le compte.',
            },
            {
                q: 'Comment améliorer mes recommandations ?',
                a: 'Complétez votre bio, vos intentions, vos centres d’intérêt, votre localisation approximative et vos préférences. Les profils proposés peuvent ensuite être expliqués par des éléments concrets comme les intérêts communs, la proximité ou une intention compatible.',
            },
            {
                q: 'Comment supprimer mon compte ?',
                a: 'Dans Paramètres > Confidentialité, vous pouvez demander la suppression. Les médias et données de profil sont supprimés, les messages déjà envoyés sont anonymisés pour préserver la cohérence des conversations, puis le compte est désactivé et anonymisé.',
            },
        ],
    },
    {
        category: 'Photos, vidéos et messages',
        questions: [
            {
                q: 'Quels médias puis-je ajouter à ma galerie ?',
                a: 'La galerie accepte les images JPEG ou PNG et les vidéos MP4, MOV ou WebM, dans la limite de 100 Mo par fichier. Une image choisie comme photo principale doit être validée par la modération.',
            },
            {
                q: 'Que sont les médias éphémères ?',
                a: 'Une photo ou une vidéo éphémère est envoyée dans une conversation et servie sans URL publique partageable. Elle reste soumise au signalement et aux limites techniques : aucun service ne peut empêcher absolument une capture avec un autre appareil.',
            },
            {
                q: 'Qui voit ma galerie privée ?',
                a: 'Uniquement les membres auxquelles vous avez accordé un accès. Vous pouvez consulter et révoquer ces accès depuis la gestion de votre galerie.',
            },
        ],
    },
    {
        category: 'Vérification et sécurité',
        questions: [
            {
                q: 'Comment fonctionne la vérification ?',
                a: 'Vous réalisez un selfie selon une consigne affichée. Le média de vérification n’est pas publié sur votre profil. Après validation, un badge vérifié est ajouté au compte.',
            },
            {
                q: 'Comment bloquer ou signaler un compte ?',
                a: 'Les actions sont disponibles depuis le profil concerné. Le blocage coupe les interactions. Le signalement transmet le motif et votre description à la modération ; décrivez les faits sans publier de données sensibles.',
            },
            {
                q: 'Un badge vérifié garantit-il la sécurité ?',
                a: 'Non. Il constitue un repère supplémentaire, mais ne garantit ni les intentions ni le comportement futur d’une personne. Prenez votre temps et suivez les conseils du centre de sécurité.',
            },
        ],
    },
    {
        category: 'Premium, gemmes et notifications',
        questions: [
            {
                q: 'Que puis-je faire gratuitement ?',
                a: 'Créer et compléter un profil, découvrir des membres, liker, matcher, discuter et utiliser les outils essentiels de sécurité. Les options payantes et leur prix sont présentés sur la page Tarifs.',
            },
            {
                q: 'Puis-je choisir les notifications reçues ?',
                a: 'Oui. Dans Paramètres > Notifications, choisissez séparément la fréquence des messages, likes, matchs, demandes de galerie et nouvelles inscriptions.',
            },
            {
                q: 'Comment résilier Premium ?',
                a: 'La page Premium permet de gérer ou résilier un abonnement. Lorsqu’un paiement récurrent est géré par Stripe, la résiliation passe par son portail sécurisé. L’accès déjà payé reste actif jusqu’à l’échéance affichée.',
            },
        ],
    },
];

export default function Faq() {
    const [open, setOpen] = useState<string | null>(null);

    return (
        <PublicLayout>
            <Head title="FAQ" />
            <main className="mx-auto max-w-4xl px-4 py-14 sm:py-20">
                <header>
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        Aide
                    </p>
                    <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                        Questions fréquentes
                    </h1>
                    <p className="mt-5 text-lg text-muted-foreground">
                        Des réponses alignées sur le fonctionnement actuel du
                        site. Pour les situations sensibles, consultez aussi le{' '}
                        <Link
                            href="/securite"
                            className="font-semibold text-primary"
                        >
                            centre de sécurité
                        </Link>
                        .
                    </p>
                </header>
                <div className="mt-12 space-y-10">
                    {sections.map((section) => (
                        <section key={section.category}>
                            <h2 className="mb-4 text-2xl font-semibold">
                                {section.category}
                            </h2>
                            <div className="space-y-3">
                                {section.questions.map((item) => {
                                    const id = `${section.category}-${item.q}`;
                                    const expanded = open === id;

                                    return (
                                        <div
                                            key={id}
                                            className="overflow-hidden rounded-xl border border-border bg-card"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpen(
                                                        expanded ? null : id,
                                                    )
                                                }
                                                aria-expanded={expanded}
                                                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
                                            >
                                                <span>{item.q}</span>
                                                <ChevronDown
                                                    className={`h-5 w-5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                            {expanded && (
                                                <div className="border-t border-border px-5 py-4 leading-7 text-muted-foreground">
                                                    {item.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
                <div className="mt-12 rounded-2xl bg-primary/10 p-6">
                    <h2 className="text-xl font-semibold">
                        Une autre question ?
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        La page Contact indique l’adresse de support configurée
                        pour cet environnement.
                    </p>
                    <Link
                        href="/contact"
                        className="mt-4 inline-flex font-semibold text-primary"
                    >
                        Contacter LesbiLibre
                    </Link>
                </div>
            </main>
        </PublicLayout>
    );
}
