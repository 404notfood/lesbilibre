import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCircle2,
    Download,
    Laptop,
    LockKeyhole,
    RefreshCw,
    Smartphone,
    WifiOff,
} from 'lucide-react';

function secureInstallUrl(): string | null {
    if (
        typeof window === 'undefined' ||
        window.isSecureContext ||
        window.location.protocol !== 'http:'
    )
        return null;
    const url = new URL(window.location.href);
    if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return null;
    url.protocol = 'https:';
    if (url.port === '80') url.port = '';
    url.pathname = '/installer';
    url.search = '';
    url.hash = '';
    return url.href;
}

export default function Install() {
    const { auth } = usePage<{ auth?: { user?: { id: number } | null } }>()
        .props;
    const connected = Boolean(auth?.user?.id);
    const installation = usePwaInstall();
    const push = usePushNotifications(connected);
    const httpsUrl = secureInstallUrl();

    return (
        <PublicLayout>
            <Head title="Installer LesbiLibre sur téléphone et ordinateur" />
            <article className="mx-auto max-w-4xl space-y-8 px-5 py-10 sm:py-14">
                <header className="max-w-2xl">
                    <p className="text-xs font-semibold tracking-[0.16em] text-[color:var(--wine)] uppercase">
                        À portée de main
                    </p>
                    <h1 className="mt-3 font-display text-4xl leading-tight text-[color:var(--wine-deep)] sm:text-5xl">
                        LesbiLibre, depuis ton écran d’accueil
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                        Retrouve le site dans sa propre fenêtre, sur téléphone,
                        tablette ou ordinateur. L’installation est facultative
                        et gratuite ; tu peux continuer dans le navigateur.
                    </p>
                </header>

                {!installation.isSecure ? (
                    <section
                        className="rounded-2xl border border-amber-600/25 bg-amber-50/70 p-5 text-sm text-foreground dark:bg-amber-950/20"
                        aria-label="Connexion sécurisée nécessaire"
                    >
                        <p className="font-semibold">
                            Ouvre d’abord la version sécurisée du site
                        </p>
                        <p className="mt-2 leading-relaxed">
                            Cette page utilise HTTP. L’installation complète et
                            les notifications nécessitent une connexion HTTPS
                            prise en charge par ton navigateur.
                        </p>
                        {httpsUrl ? (
                            <a
                                href={httpsUrl}
                                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[color:var(--wine)] px-4 font-semibold text-white"
                            >
                                <LockKeyhole className="h-4 w-4" />
                                Ouvrir LesbiLibre en HTTPS
                            </a>
                        ) : null}
                    </section>
                ) : null}

                <section
                    className="rounded-2xl border border-border bg-card p-6 sm:p-7"
                    aria-label="Installation sur cet appareil"
                >
                    <div className="flex items-start gap-4">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color:var(--blush)] text-[color:var(--wine)]">
                            {installation.isInstalled ? (
                                <CheckCircle2 className="h-5 w-5" />
                            ) : (
                                <Download className="h-5 w-5" />
                            )}
                        </span>
                        <div className="min-w-0">
                            <h2 className="text-xl font-semibold">
                                {installation.isInstalled
                                    ? 'LesbiLibre est installée sur cet appareil'
                                    : 'Installer sur cet appareil'}
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {installation.isInstalled
                                    ? 'Garde cette icône pour retrouver LesbiLibre. Les mises à jour te sont proposées sans interrompre ta saisie.'
                                    : installation.canPrompt
                                      ? 'Ton navigateur permet l’installation. Le bouton ci-dessous ouvre sa demande de confirmation.'
                                      : 'Suis les étapes de ton appareil ci-dessous. Certains navigateurs proposent uniquement l’installation depuis leur menu.'}
                            </p>
                            {installation.canPrompt && installation.isSecure ? (
                                <Button
                                    className="mt-4 min-h-11"
                                    disabled={installation.isInstalling}
                                    onClick={() => void installation.install()}
                                >
                                    <Download className="h-4 w-4" />
                                    {installation.isInstalling
                                        ? 'Installation en cours…'
                                        : 'Installer LesbiLibre'}
                                </Button>
                            ) : null}
                            {installation.message ? (
                                <p
                                    role="status"
                                    className="mt-3 text-sm text-[color:var(--wine)]"
                                >
                                    {installation.message}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </section>

                <div className="grid gap-5 md:grid-cols-2">
                    <section className="rounded-2xl border border-border bg-card p-6">
                        <Smartphone className="mb-4 h-6 w-6 text-[color:var(--wine)]" />
                        <h2 className="text-xl font-semibold">
                            iPhone ou iPad
                        </h2>
                        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
                            <li>Ouvre LesbiLibre dans Safari.</li>
                            <li>
                                Ouvre le menu de partage, puis choisis « Sur
                                l’écran d’accueil » ou « Ajouter à l’écran
                                d’accueil ».
                            </li>
                            <li>
                                Valide l’ajout, puis ouvre la nouvelle icône. Si
                                nécessaire, connecte-toi dans cette fenêtre.
                            </li>
                        </ol>
                        {installation.isIOS && !installation.isInstalled ? (
                            <p className="mt-4 rounded-xl bg-muted p-3 text-sm">
                                Sur cet appareil, l’ajout à l’écran d’accueil
                                précède l’activation des notifications.
                            </p>
                        ) : null}
                    </section>
                    <section className="rounded-2xl border border-border bg-card p-6">
                        <Laptop className="mb-4 h-6 w-6 text-[color:var(--wine)]" />
                        <h2 className="text-xl font-semibold">
                            Android ou ordinateur
                        </h2>
                        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
                            <li>
                                Utilise le bouton « Installer LesbiLibre »
                                lorsqu’il apparaît.
                            </li>
                            <li>
                                Sinon, ouvre le menu du navigateur et cherche «
                                Installer l’application » ou « Ajouter à l’écran
                                d’accueil ». Sur Safari pour Mac, cherche «
                                Ajouter au Dock ».
                            </li>
                            <li>
                                Lance ensuite l’icône ajoutée. Si aucune option
                                n’est proposée, garde le site dans tes favoris.
                            </li>
                        </ol>
                    </section>
                </div>

                <section
                    className="rounded-2xl border border-border bg-card p-6 sm:p-7"
                    id="notifications"
                >
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <Bell className="h-5 w-5 text-[color:var(--wine)]" />
                        Notifications sur cet appareil
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Ton autorisation n’est demandée que lorsque tu choisis
                        d’activer les notifications. Tu peux les désactiver ici.
                        Elles ne contiennent pas le texte des messages ; chaque
                        message ou média attend la validation de
                        l’administration avant diffusion.
                    </p>
                    {!connected ? (
                        <Link
                            href="/login"
                            className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold"
                        >
                            Se connecter pour gérer les notifications
                        </Link>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {installation.isIOS && !installation.isInstalled ? (
                                <p className="text-sm text-muted-foreground">
                                    Ouvre d’abord LesbiLibre depuis l’icône
                                    ajoutée à l’écran d’accueil.
                                </p>
                            ) : push.permission === 'unsupported' ? (
                                <p className="text-sm text-muted-foreground">
                                    {!installation.isSecure
                                        ? 'Les notifications sont indisponibles en HTTP. Ouvre la version HTTPS.'
                                        : 'Ce navigateur ne propose pas les notifications pour cette application. Essaie un navigateur compatible.'}
                                </p>
                            ) : (
                                <>
                                    <p className="text-sm font-medium">
                                        {push.isChecking
                                            ? 'Vérification de la disponibilité…'
                                            : push.isSubscribed
                                              ? 'Notifications activées dans ce navigateur.'
                                              : push.permission === 'denied'
                                                ? 'Les notifications sont bloquées dans les réglages du navigateur ou de l’appareil.'
                                                : 'Notifications désactivées sur cet appareil.'}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {push.isSubscribed ||
                                        push.needsCleanup ? (
                                            <Button
                                                variant="outline"
                                                className="min-h-11"
                                                disabled={
                                                    push.isLoading ||
                                                    push.isChecking
                                                }
                                                onClick={() =>
                                                    void push.unsubscribe()
                                                }
                                            >
                                                {push.needsCleanup &&
                                                !push.isSubscribed
                                                    ? 'Finaliser la désactivation'
                                                    : 'Désactiver sur cet appareil'}
                                            </Button>
                                        ) : push.permission !== 'denied' &&
                                          push.isConfigured ? (
                                            <Button
                                                className="min-h-11"
                                                disabled={
                                                    push.isLoading ||
                                                    push.isChecking
                                                }
                                                onClick={() =>
                                                    void push.subscribe()
                                                }
                                            >
                                                <Bell className="h-4 w-4" />
                                                {push.isLoading
                                                    ? 'Activation en cours…'
                                                    : 'Activer les notifications'}
                                            </Button>
                                        ) : null}
                                        <Button
                                            variant="ghost"
                                            className="min-h-11"
                                            disabled={
                                                push.isLoading ||
                                                push.isChecking
                                            }
                                            onClick={() =>
                                                void push.checkAvailability()
                                            }
                                        >
                                            <RefreshCw
                                                className={`h-4 w-4 ${push.isChecking ? 'animate-spin' : ''}`}
                                            />
                                            Vérifier à nouveau
                                        </Button>
                                    </div>
                                </>
                            )}
                            {push.error ? (
                                <p
                                    role="alert"
                                    className="text-sm leading-relaxed text-destructive"
                                >
                                    {push.error}
                                </p>
                            ) : null}
                            {push.notice ? (
                                <p
                                    role="status"
                                    className="text-sm text-muted-foreground"
                                >
                                    {push.notice}
                                </p>
                            ) : null}
                            <Link
                                href="/settings/notifications"
                                className="inline-flex min-h-11 items-center text-sm font-semibold text-[color:var(--wine)] underline underline-offset-4"
                            >
                                Choisir les catégories et fréquences de
                                notification
                            </Link>
                        </div>
                    )}
                </section>

                <section className="space-y-4 rounded-2xl bg-muted/60 p-6">
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <WifiOff className="h-5 w-5" />
                        Connexion, mises à jour et confidentialité
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Les profils, messages et médias privés ne sont pas
                        conservés dans le cache de l’application. Internet reste
                        nécessaire pour les consulter et envoyer du contenu. Une
                        coupure ne programme aucun envoi automatique : garde ta
                        fenêtre ouverte et réessaie quand le réseau revient.
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Une mise à jour te propose de recharger lorsque tu es
                        prête. Termine tes saisies avant de l’accepter ; les
                        brouillons ne sont pas enregistrés sur l’appareil. La
                        fermeture du site ou de sa fenêtre peut les perdre.
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Sur un appareil partagé, déconnecte-toi après
                        utilisation. Les conversations et galeries privées
                        restent soumises à l’examen de l’administration, comme
                        dans le navigateur.
                    </p>
                </section>
                <Link
                    href="/dashboard"
                    className="inline-flex min-h-12 items-center rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
                >
                    Revenir à LesbiLibre
                </Link>
            </article>
        </PublicLayout>
    );
}
