import { CommunityCharter } from '@/components/community-fields';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { Form, Head, Link } from '@inertiajs/react';

export default function Onboarding({
    declared,
    charterAccepted,
    photosVerified,
    restricted,
}: {
    declared: boolean;
    charterAccepted: boolean;
    photosVerified: boolean;
    restricted: boolean;
}) {
    return (
        <AuthLayout
            title="Avant de faire des rencontres"
            description="Votre âge déclaré, votre engagement et vos photos sont des repères distincts."
        >
            <Head title="Accès à la communauté" />
            <ol
                className="mb-6 space-y-3 rounded-xl border border-border bg-card p-4 text-sm"
                aria-label="Étapes d’accès"
            >
                {[
                    { label: 'Majorité déclarée', done: declared },
                    { label: 'Charte et consentement', done: charterAccepted },
                    { label: 'Examen humain des photos', done: photosVerified },
                ].map((step, index) => (
                    <li key={step.label} className="flex justify-between gap-3">
                        <span>
                            {index + 1}. {step.label}
                        </span>
                        <strong
                            className={
                                step.done ? 'text-foreground' : 'text-primary'
                            }
                        >
                            {step.done ? 'Terminé' : 'À compléter'}
                        </strong>
                    </li>
                ))}
            </ol>
            <p className="mb-4 text-sm">
                Âge déclaré 18+ : {declared ? 'renseigné' : 'à confirmer'} ·
                Photos : {photosVerified ? 'vérifiées' : 'à vérifier'}. Le
                selfie ne prouve ni la majorité ni le genre.
            </p>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                Ton selfie reste privé et sert à comparer tes photos lors de
                l’examen humain. Sa suppression est prévue 30 jours après la
                décision. Aucun délai fixe de validation n’est garanti. Pendant
                l’attente, tu peux préparer ton profil ; les échanges s’ouvrent
                quand les étapes requises sont validées.
            </p>
            {restricted ? (
                <p>
                    Votre accès aux rencontres est suspendu pendant un examen de
                    sécurité.{' '}
                    <Link href="/contact" className="underline">
                        Contacter la modération ou contester cette décision
                    </Link>
                    .
                </p>
            ) : (
                <>
                    {!declared || !charterAccepted ? (
                        <Form
                            action="/community/onboarding"
                            method="post"
                            className="space-y-4"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <label className="block">
                                        Votre date de naissance exacte (privée)
                                        <input
                                            className="mt-2 block w-full rounded border p-3"
                                            type="date"
                                            name="date_of_birth"
                                            required
                                        />
                                    </label>
                                    <p className="text-sm">
                                        Les anciennes dates étaient
                                        approximatives : confirmez votre vraie
                                        date. Elle ne sera pas affichée sur
                                        votre profil.
                                    </p>
                                    <CommunityCharter />
                                    {Object.entries(errors).map(
                                        ([key, message]) => (
                                            <p
                                                key={key}
                                                role="alert"
                                                className="text-sm text-destructive"
                                            >
                                                {message}
                                            </p>
                                        ),
                                    )}
                                    <Button disabled={processing}>
                                        Confirmer et continuer
                                    </Button>
                                </>
                            )}
                        </Form>
                    ) : (
                        <Link
                            className="underline"
                            href={
                                photosVerified ? '/dashboard' : '/verification'
                            }
                        >
                            {photosVerified
                                ? 'Accéder aux rencontres'
                                : 'Vérifier mes photos'}
                        </Link>
                    )}
                </>
            )}
            <nav className="mt-6 flex flex-wrap gap-4 text-sm">
                <Link href="/profile/edit">Préparer mon profil</Link>
                <Link href="/photos">Mes photos</Link>
                <Link href="/settings/privacy">
                    Confidentialité et suppression
                </Link>
                <Link href="/contact">Aide et recours</Link>
            </nav>
        </AuthLayout>
    );
}
