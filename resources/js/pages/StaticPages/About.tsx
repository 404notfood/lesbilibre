import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { Eye, HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react';

const commitments = [
    {
        icon: HeartHandshake,
        title: 'Des échanges sincères',
        text: 'LesbiLibre aide les femmes qui aiment les femmes à se découvrir selon leurs envies, leurs centres d’intérêt et leur rythme.',
    },
    {
        icon: ShieldCheck,
        title: 'Des repères de confiance',
        text: 'Vérification par selfie, modération des médias, blocage et signalement donnent des outils concrets sans promettre un risque zéro.',
    },
    {
        icon: LockKeyhole,
        title: 'Une confidentialité choisie',
        text: 'Galeries privées, médias éphémères et réglages de visibilité permettent de décider ce qui est partagé et avec qui.',
    },
    {
        icon: Eye,
        title: 'Un produit transparent',
        text: 'Les raisons de recommandation, les limites des outils et les options payantes doivent être compréhensibles avant d’agir.',
    },
];

export default function About() {
    return (
        <PublicLayout>
            <Head title="À propos" />
            <main className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
                <header className="max-w-3xl">
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        À propos
                    </p>
                    <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                        LesbiLibre, des rencontres entre femmes sans détour
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Le projet est né en 2025 avec une idée simple : créer un
                        espace de rencontre lisible, confidentiel et centré sur
                        la qualité des échanges plutôt que sur l’accumulation de
                        fonctions sociales.
                    </p>
                </header>
                <div className="mt-12 grid gap-5 sm:grid-cols-2">
                    {commitments.map(({ icon: Icon, title, text }) => (
                        <section
                            key={title}
                            className="rounded-2xl border border-border bg-card p-6"
                        >
                            <Icon className="h-6 w-6 text-primary" />
                            <h2 className="mt-4 text-xl font-semibold">
                                {title}
                            </h2>
                            <p className="mt-3 leading-7 text-muted-foreground">
                                {text}
                            </p>
                        </section>
                    ))}
                </div>
                <section className="mt-12 rounded-2xl bg-muted/60 p-7">
                    <h2 className="text-2xl font-semibold">
                        Ce que nous ne faisons pas
                    </h2>
                    <p className="mt-3 leading-7 text-muted-foreground">
                        Les profils membres ne sont pas publiés sur le Web pour
                        attirer du trafic. Les données privées ne deviennent pas
                        du contenu SEO. Les scores de compatibilité restent des
                        indications et ne prédisent jamais une relation.
                    </p>
                </section>
                <div className="mt-10 flex flex-wrap gap-3">
                    <Link
                        href="/comment-ca-marche"
                        className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
                    >
                        Comprendre le fonctionnement
                    </Link>
                    <Link
                        href="/securite"
                        className="rounded-xl border border-border px-5 py-3 font-semibold"
                    >
                        Voir le centre de sécurité
                    </Link>
                </div>
            </main>
        </PublicLayout>
    );
}
