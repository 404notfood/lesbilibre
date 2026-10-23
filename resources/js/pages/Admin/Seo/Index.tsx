import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout, {
    AdminCard,
    AdminCardHeader,
} from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, Search, ShieldCheck } from 'lucide-react';

const secretFields = [
    {
        key: 'google_pagespeed_api_key',
        label: 'Clé API Google PageSpeed Insights',
    },
    {
        key: 'google_search_console_credentials',
        label: 'Google Search Console — JSON du compte de service',
    },
    { key: 'semrush_api_key', label: 'Clé API Semrush' },
    { key: 'google_client_id', label: 'Google OAuth — Client ID' },
    { key: 'google_client_secret', label: 'Google OAuth — Client secret' },
] as const;
type SecretField = (typeof secretFields)[number]['key'];
type IntegrationForm = Record<SecretField, string> &
    Record<`remove_${SecretField}`, boolean> & {
        google_login_enabled: boolean;
        google_search_console_property: string;
    };
interface Props {
    seoSettings: {
        indexingEnabled: boolean;
        customRobots: boolean;
        robotsContent: string;
        effectiveRobots: string;
    };
    integrations: {
        credentials: Record<
            SecretField,
            { configured: boolean; source: string }
        >;
        googleEnabled: boolean;
        searchConsoleProperty: string;
        callbackUrl: string;
    };
}

export default function Index({ seoSettings, integrations }: Props) {
    const robots = useForm({
        indexing_enabled: seoSettings.indexingEnabled,
        custom_robots: seoSettings.customRobots,
        robots_content: seoSettings.robotsContent,
    });
    const keys = useForm<IntegrationForm>({
        google_pagespeed_api_key: '',
        google_search_console_credentials: '',
        semrush_api_key: '',
        google_client_id: '',
        google_client_secret: '',
        remove_google_pagespeed_api_key: false,
        remove_google_search_console_credentials: false,
        remove_semrush_api_key: false,
        remove_google_client_id: false,
        remove_google_client_secret: false,
        google_login_enabled: integrations.googleEnabled,
        google_search_console_property: integrations.searchConsoleProperty,
    });

    return (
        <AdminLayout
            title="SEO et intégrations"
            subtitle="Indexation, robots.txt et identifiants des services"
            hideSearch
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'SEO et intégrations' },
            ]}
        >
            <Head title="SEO et intégrations · Admin" />
            <div className="space-y-6">
                <AdminCard>
                    <AdminCardHeader
                        title="Référencement et robots.txt"
                        icon={Search}
                    />
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            robots.put('/admin/seo/robots', {
                                preserveScroll: true,
                            });
                        }}
                    >
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={robots.data.indexing_enabled}
                                onChange={(e) =>
                                    robots.setData(
                                        'indexing_enabled',
                                        e.target.checked,
                                    )
                                }
                            />
                            Autoriser l’indexation des pages publiques
                        </label>
                        <p className="text-sm text-muted-foreground">
                            Ce réglage agit à la fois sur robots.txt et sur les
                            directives noindex. Les espaces membres restent
                            exclus.
                        </p>
                        <InputError message={robots.errors.indexing_enabled} />
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={robots.data.custom_robots}
                                onChange={(e) =>
                                    robots.setData(
                                        'custom_robots',
                                        e.target.checked,
                                    )
                                }
                            />
                            Utiliser un robots.txt personnalisé
                        </label>
                        <div className="space-y-2">
                            <Label htmlFor="robots_content">
                                Contenu du robots.txt
                            </Label>
                            <Textarea
                                id="robots_content"
                                rows={14}
                                className="font-mono text-sm"
                                value={robots.data.robots_content}
                                disabled={!robots.data.custom_robots}
                                onChange={(e) =>
                                    robots.setData(
                                        'robots_content',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={robots.errors.robots_content}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Quand l’indexation est désactivée, le site publie
                            toujours Disallow: /. Le contenu personnalisé est
                            conservé pour la réouverture. Décoche la
                            personnalisation pour revenir au modèle automatique.
                        </p>
                        <details className="rounded-xl border p-3">
                            <summary className="cursor-pointer font-medium">
                                Contenu actuellement publié
                            </summary>
                            <pre className="mt-3 overflow-auto text-sm whitespace-pre-wrap">
                                {seoSettings.effectiveRobots}
                            </pre>
                            <a
                                href="/robots.txt"
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm underline"
                            >
                                Ouvrir robots.txt
                            </a>
                            {' · '}
                            <a
                                href="/sitemap.xml"
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm underline"
                            >
                                Ouvrir le sitemap
                            </a>
                        </details>
                        <Button disabled={robots.processing}>
                            Enregistrer le SEO et robots.txt
                        </Button>
                        {robots.recentlySuccessful && (
                            <p role="status" className="text-sm">
                                Réglages SEO enregistrés.
                            </p>
                        )}
                    </form>
                </AdminCard>

                <AdminCard>
                    <AdminCardHeader
                        title="Google et Semrush"
                        icon={KeyRound}
                    />
                    <p className="mb-5 text-sm text-muted-foreground">
                        Les secrets sont chiffrés et ne sont jamais réaffichés.
                        Un champ vide conserve la valeur existante. Les clés
                        configurent les services ; cette page ne lance aucun
                        appel ni rapport payant.
                    </p>
                    <form
                        className="space-y-6"
                        autoComplete="off"
                        onSubmit={(event) => {
                            event.preventDefault();
                            keys.put('/admin/seo/integrations', {
                                preserveScroll: true,
                                onSuccess: () => {
                                    for (const field of secretFields) {
                                        keys.setData(field.key, '');
                                        keys.setData(
                                            `remove_${field.key}`,
                                            false,
                                        );
                                    }
                                },
                            });
                        }}
                    >
                        {secretFields.map(({ key, label }) => {
                            const status = integrations.credentials[key];
                            return (
                                <div key={key} className="space-y-2">
                                    <Label htmlFor={key}>{label}</Label>
                                    <p className="text-xs text-muted-foreground">
                                        {status.configured
                                            ? `Configuré · ${status.source === 'database' ? 'enregistré dans l’administration' : 'fourni par le serveur'}`
                                            : 'Non configuré'}
                                    </p>
                                    {key ===
                                    'google_search_console_credentials' ? (
                                        <Textarea
                                            id={key}
                                            rows={5}
                                            value={keys.data[key]}
                                            onChange={(e) =>
                                                keys.setData(
                                                    key,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Coller le JSON du compte de service"
                                            spellCheck={false}
                                        />
                                    ) : (
                                        <Input
                                            id={key}
                                            type="password"
                                            autoComplete="new-password"
                                            value={keys.data[key]}
                                            onChange={(e) =>
                                                keys.setData(
                                                    key,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Saisir une nouvelle valeur"
                                        />
                                    )}
                                    <InputError message={keys.errors[key]} />
                                    {status.source === 'database' && (
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    keys.data[`remove_${key}`]
                                                }
                                                onChange={(e) =>
                                                    keys.setData(
                                                        `remove_${key}`,
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            Supprimer la valeur enregistrée
                                        </label>
                                    )}
                                </div>
                            );
                        })}
                        <div className="space-y-2">
                            <Label htmlFor="google_search_console_property">
                                Propriété Search Console
                            </Label>
                            <Input
                                id="google_search_console_property"
                                value={keys.data.google_search_console_property}
                                onChange={(e) =>
                                    keys.setData(
                                        'google_search_console_property',
                                        e.target.value,
                                    )
                                }
                                placeholder="sc-domain:lesbi-libre.fr"
                            />
                            <InputError
                                message={
                                    keys.errors.google_search_console_property
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Ajoute l’adresse du compte de service comme
                                utilisateur de cette propriété dans Search
                                Console, avec les droits nécessaires à la
                                consultation.
                            </p>
                        </div>
                        <div className="space-y-3 rounded-xl border p-4">
                            <h2 className="flex items-center gap-2 font-semibold">
                                <ShieldCheck className="h-4 w-4" />
                                Inscription et connexion Google
                            </h2>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={keys.data.google_login_enabled}
                                    onChange={(e) =>
                                        keys.setData(
                                            'google_login_enabled',
                                            e.target.checked,
                                        )
                                    }
                                />
                                Activer le bouton « Continuer avec Google »
                            </label>
                            <InputError
                                message={keys.errors.google_login_enabled}
                            />
                            <p className="text-sm text-muted-foreground">
                                Crée un client OAuth de type application Web
                                dans Google Cloud et ajoute exactement cette URI
                                de redirection autorisée :
                            </p>
                            <code className="block rounded bg-muted p-3 text-xs break-all">
                                {integrations.callbackUrl}
                            </code>
                            <p className="text-xs text-muted-foreground">
                                La clé PageSpeed et le compte de service Search
                                Console sont distincts du Client ID et du Client
                                secret utilisés pour la connexion. Aucune donnée
                                de rencontre n’est envoyée à Google.
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Si une valeur est aussi définie sur le serveur,
                            supprimer sa copie enregistrée réactive la valeur du
                            serveur.
                        </p>
                        <Button disabled={keys.processing}>
                            Enregistrer les intégrations
                        </Button>
                        {keys.recentlySuccessful && (
                            <p role="status" className="text-sm">
                                Intégrations enregistrées.
                            </p>
                        )}
                    </form>
                </AdminCard>
            </div>
        </AdminLayout>
    );
}
