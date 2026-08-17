import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { HelpCircle, Mail, Shield } from 'lucide-react';

export default function Contact({ supportEmail }: { supportEmail: string }) {
    return (
        <PublicLayout>
            <Head title="Contact" />
            <main className="mx-auto max-w-4xl px-4 py-14 sm:py-20">
                <header>
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        Contact
                    </p>
                    <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                        Parlons de votre demande
                    </h1>
                    <p className="mt-5 text-lg leading-8 text-muted-foreground">
                        Une adresse unique évite qu’une demande soit perdue
                        entre plusieurs boîtes. Indiquez l’adresse e-mail du
                        compte sans transmettre votre mot de passe ni un code de
                        connexion.
                    </p>
                </header>
                <div className="mt-12 grid gap-5 sm:grid-cols-2">
                    <section className="rounded-2xl border border-border bg-card p-6">
                        <Mail className="h-6 w-6 text-primary" />
                        <h2 className="mt-4 text-xl font-semibold">
                            Compte, paiement ou confidentialité
                        </h2>
                        <p className="mt-3 leading-7 text-muted-foreground">
                            Décrivez le problème, la page concernée et, si
                            possible, l’heure approximative. N’envoyez pas de
                            pièce d’identité par e-mail sans consigne explicite.
                        </p>
                        <a
                            href={`mailto:${supportEmail}`}
                            className="mt-5 inline-flex font-semibold text-primary"
                        >
                            {supportEmail}
                        </a>
                    </section>
                    <section className="rounded-2xl border border-border bg-card p-6">
                        <Shield className="h-6 w-6 text-primary" />
                        <h2 className="mt-4 text-xl font-semibold">
                            Harcèlement ou comportement dangereux
                        </h2>
                        <p className="mt-3 leading-7 text-muted-foreground">
                            Depuis le profil, utilisez d’abord Signaler pour
                            joindre le compte et les éléments utiles. Bloquez-le
                            si vous ne souhaitez plus d’interaction. En cas de
                            danger immédiat, contactez les services d’urgence.
                        </p>
                        <Link
                            href="/securite"
                            className="mt-5 inline-flex font-semibold text-primary"
                        >
                            Consulter le centre de sécurité
                        </Link>
                    </section>
                </div>
                <div className="mt-8 flex items-center gap-3 rounded-xl bg-muted/60 p-5 text-muted-foreground">
                    <HelpCircle className="h-5 w-5 shrink-0" />
                    <p>
                        Une réponse existe peut-être déjà dans la{' '}
                        <Link
                            href="/faq"
                            className="font-semibold text-primary"
                        >
                            FAQ mise à jour
                        </Link>
                        .
                    </p>
                </div>
            </main>
        </PublicLayout>
    );
}
