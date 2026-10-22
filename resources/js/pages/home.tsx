import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    Heart,
    MapPin,
    MessageCircle,
    ShieldCheck,
} from 'lucide-react';

const steps = [
    {
        title: 'Présente-toi',
        text: 'Ton profil, tes envies, ta ville. Amitié ou relation : tu choisis ce que tu souhaites partager.',
    },
    {
        title: 'Prépare ton accès',
        text: 'Confirme ton e-mail, déclare ta majorité et accepte la charte. Une modératrice examine ensuite tes photos et ton selfie privé.',
    },
    {
        title: 'Découvre et échange',
        text: 'Une fois ton accès validé, découvre les profils et les intentions près de chez toi. Un like réciproque crée un match.',
    },
    {
        title: 'Garde ton rythme',
        text: 'Décide à qui répondre et quand vous rencontrer. Tu peux bloquer, signaler ou retirer un accès privé à tout moment.',
    },
];
const questions = [
    {
        title: 'À qui s’adresse LesbiLibre ?',
        text: 'Aux femmes cis et trans et aux personnes non binaires qui se reconnaissent dans cette communauté. Le service est réservé aux personnes majeures. Chaque compte représente une seule personne.',
    },
    {
        title: 'Qu’est-ce qui est gratuit ?',
        text: 'Le profil, la découverte, les matchs et les conversations sont accessibles gratuitement. Les likes et ouvertures de conversation ont des limites quotidiennes indiquées dans le service ; les réponses ne sont pas rationnées. Les tarifs détaillent les options Premium.',
    },
    {
        title: 'Que signifie le badge photo ?',
        text: 'Il indique que les photos ont été examinées avec un selfie privé. Ce contrôle ne prouve ni l’identité, ni la majorité, ni le genre. Il ne garantit pas le comportement d’une personne.',
    },
    {
        title: 'Que se passe-t-il pendant la validation ?',
        text: 'Tu peux préparer ton profil et tes photos. Les interactions restent fermées jusqu’à la validation des étapes requises. L’examen est humain : aucun délai fixe n’est garanti. Le statut et une éventuelle demande de correction sont visibles dans ton compte.',
    },
    {
        title: 'Puis-je contrôler mes contenus privés ?',
        text: 'Tu choisis à qui donner accès à ta galerie et peux retirer cet accès. Les contenus intimes demandent un consentement distinct, révocable. Les paramètres permettent aussi de gérer ta visibilité et de demander la suppression de ton compte.',
    },
];
export default function Home({
    pilot,
}: {
    pilot: { city: string; department: string };
}): JSX.Element {
    return (
        <PublicLayout>
            <Head title="Des rencontres près de chez toi, à ton rythme" />
            <section className="relative overflow-hidden border-b border-border bg-secondary/25">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/10 blur-3xl"
                />
                <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 sm:py-16 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:py-20">
                    <div>
                        <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                            Rencontres · Amitiés · Liens locaux
                        </p>
                        <h1 className="mt-5 max-w-[17ch] font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.05] tracking-tight">
                            Près de chez toi.
                            <br />
                            <span className="text-primary italic">
                                À ton rythme.
                            </span>
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/85">
                            Des rencontres entre femmes et personnes queer, avec
                            des intentions claires et la liberté de prendre ton
                            temps.
                        </p>
                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <Link
                                href="/register"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
                            >
                                Créer mon profil gratuitement{' '}
                                <ArrowUpRight className="size-5" aria-hidden />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex min-h-12 items-center rounded-xl px-4 py-3 font-medium underline underline-offset-4"
                            >
                                Me connecter
                            </Link>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Inscription sans carte bancaire · Réservé aux 18 ans
                            et plus
                        </p>
                        <p className="mt-4 max-w-xl rounded-xl border border-border bg-card/70 p-3 text-sm leading-relaxed">
                            Le pilote se prépare à{' '}
                            <strong>
                                {pilot.city} ({pilot.department})
                            </strong>
                            . Nous commençons localement, avec des retours
                            d’usage. La présence de profils compatibles dépendra
                            des inscriptions.
                        </p>
                    </div>
                    <aside
                        className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
                        aria-label="Tes repères"
                    >
                        <Heart className="size-8 text-primary" aria-hidden />
                        <h2 className="mt-4 font-display text-3xl">
                            De la place pour tes envies.
                        </h2>
                        <ul className="mt-6 space-y-5">
                            {[
                                {
                                    icon: MapPin,
                                    title: 'La proximité',
                                    text: 'Découvre par ville et distance, selon les membres disponibles.',
                                },
                                {
                                    icon: MessageCircle,
                                    title: 'Des intentions partagées',
                                    text: 'Amitié, relation, curiosité : commence par ce qui compte pour toi.',
                                },
                                {
                                    icon: ShieldCheck,
                                    title: 'Des limites respectées',
                                    text: 'Blocage, signalement et consentement restent sous ton contrôle.',
                                },
                            ].map(({ icon: Icon, title, text }) => (
                                <li key={title} className="flex gap-3">
                                    <Icon
                                        className="mt-1 size-5 shrink-0 text-primary"
                                        aria-hidden
                                    />
                                    <div>
                                        <h3 className="font-semibold">
                                            {title}
                                        </h3>
                                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                            {text}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </aside>
                </div>
            </section>
            <section
                id="how-it-works"
                className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16"
                aria-labelledby="steps-title"
            >
                <p className="text-sm font-semibold text-primary">
                    Avant la première conversation
                </p>
                <h2
                    id="steps-title"
                    className="mt-3 font-display text-3xl sm:text-4xl"
                >
                    Un parcours que tu peux suivre.
                </h2>
                <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, index) => (
                        <li
                            key={step.title}
                            className="rounded-2xl border border-border bg-card p-5"
                        >
                            <span className="font-display text-3xl text-primary">
                                0{index + 1}
                            </span>
                            <h3 className="mt-4 text-lg font-semibold">
                                {step.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {step.text}
                            </p>
                        </li>
                    ))}
                </ol>
                <Link
                    href="/securite"
                    className="mt-6 inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4"
                >
                    Comprendre la vérification et les outils de sécurité
                </Link>
            </section>
            <section className="border-y border-border bg-card/60">
                <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
                    <h2 className="font-display text-3xl sm:text-4xl">
                        Avant de nous rejoindre
                    </h2>
                    <div className="mt-7 divide-y divide-border border-y border-border">
                        {questions.map(({ title, text }) => (
                            <details key={title} className="py-1">
                                <summary className="min-h-12 cursor-pointer py-4 pr-3 text-base font-semibold">
                                    {title}
                                </summary>
                                <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                                    {text}
                                </p>
                            </details>
                        ))}
                    </div>
                    <p className="mt-5 text-sm text-muted-foreground">
                        Besoin d’aide ?{' '}
                        <Link
                            href="/contact"
                            className="font-medium text-primary underline underline-offset-4"
                        >
                            Écris à l’équipe
                        </Link>
                        .
                    </p>
                </div>
            </section>
            <section className="mx-auto max-w-3xl px-5 py-12 text-center sm:py-16">
                <h2 className="font-display text-3xl sm:text-4xl">
                    Commence par te présenter.
                </h2>
                <p className="mt-4 text-muted-foreground">
                    Quelques mots sur toi, et la suite à ton rythme.
                </p>
                <Link
                    href="/register"
                    className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
                >
                    Créer mon profil
                </Link>
                <Link
                    href="/tarifs"
                    className="mx-auto mt-2 flex min-h-11 w-fit items-center text-sm underline underline-offset-4"
                >
                    Voir le gratuit et les options Premium
                </Link>
            </section>
        </PublicLayout>
    );
}
