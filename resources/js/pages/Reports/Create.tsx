import DatingLayout from '@/layouts/dating-layout';
import { Form, Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Flag, ShieldAlert } from 'lucide-react';

interface ReportedUser {
    id: number;
    name: string;
    pseudo: string;
}

const REASONS: { value: string; label: string; hint: string }[] = [
    {
        value: 'harassment',
        label: 'Harcèlement',
        hint: 'Insultes, menaces, messages insistants après un refus.',
    },
    {
        value: 'inappropriate_content',
        label: 'Contenu inapproprié',
        hint: 'Photos ou propos à caractère choquant ou non consenti.',
    },
    {
        value: 'fake_profile',
        label: 'Faux profil',
        hint: 'Usurpation d’identité, photos volées, profil trompeur.',
    },
    {
        value: 'spam',
        label: 'Spam ou arnaque',
        hint: 'Publicité, démarchage, tentative d’escroquerie.',
    },
    {
        value: 'other',
        label: 'Autre',
        hint: 'Précisez la situation dans la description.',
    },
];

export default function Create({ reportedUser }: { reportedUser: ReportedUser }) {
    return (
        <DatingLayout title="Signaler un profil" showOnlineUsers={false}>
            <Head title={`Signaler ${reportedUser.pseudo}`} />

            <main className="container-responsive max-w-2xl py-8">
                <Link
                    href={`/profile/${reportedUser.id}`}
                    className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour au profil
                </Link>

                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="bg-destructive/10 text-destructive grid h-10 w-10 shrink-0 place-items-center rounded-full">
                                <Flag className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle>
                                    Signaler {reportedUser.pseudo}
                                </CardTitle>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Votre signalement est confidentiel. La personne
                                    concernée n’est pas informée de votre identité.
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Form action="/reports" method="post" resetOnSuccess>
                            {({ errors, processing }) => (
                                <div className="flex flex-col gap-6">
                                    <input
                                        type="hidden"
                                        name="reported_user_id"
                                        value={reportedUser.id}
                                    />

                                    <fieldset className="flex flex-col gap-3">
                                        <legend className="mb-2 text-sm font-semibold">
                                            Motif du signalement
                                        </legend>

                                        {REASONS.map((reason) => (
                                            <label
                                                key={reason.value}
                                                className="hover:bg-muted/50 has-[:checked]:border-primary flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
                                            >
                                                <input
                                                    type="radio"
                                                    name="reason"
                                                    value={reason.value}
                                                    required
                                                    className="mt-1"
                                                />
                                                <span>
                                                    <span className="block text-sm font-medium">
                                                        {reason.label}
                                                    </span>
                                                    <span className="text-muted-foreground block text-xs">
                                                        {reason.hint}
                                                    </span>
                                                </span>
                                            </label>
                                        ))}

                                        {errors.reason && (
                                            <p className="text-destructive text-sm">
                                                {errors.reason}
                                            </p>
                                        )}
                                    </fieldset>

                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="description"
                                            className="text-sm font-semibold"
                                        >
                                            Que s’est-il passé ?
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={5}
                                            required
                                            minLength={10}
                                            maxLength={1000}
                                            className="border-input bg-background w-full rounded-lg border p-3 text-sm"
                                            placeholder="Décrivez la situation le plus précisément possible : dates, messages reçus, contenu concerné…"
                                        />
                                        <p className="text-muted-foreground text-xs">
                                            10 caractères minimum. Ces détails aident
                                            notre équipe à traiter le signalement
                                            rapidement.
                                        </p>
                                        {errors.description && (
                                            <p className="text-destructive text-sm">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="bg-muted/50 text-muted-foreground flex items-start gap-2 rounded-lg p-3 text-xs">
                                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                        <p>
                                            En cas de danger immédiat, contactez les
                                            secours. Vous pouvez aussi bloquer cette
                                            personne depuis son profil pour couper tout
                                            contact sans attendre notre réponse.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Envoi…'
                                                : 'Envoyer le signalement'}
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href={`/profile/${reportedUser.id}`}>
                                                Annuler
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </DatingLayout>
    );
}
