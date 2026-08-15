import AdminLayout, {
    AdminBadge,
    AdminCard,
    AdminCardHeader,
} from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle,
    Cog,
    CreditCard,
    Server,
    Wrench,
} from 'lucide-react';
import { ReactNode } from 'react';

interface Settings {
    app_name: string;
    app_url: string;
    app_env: string;
    app_debug: boolean;
    php_version: string;
    laravel_version: string;
    timezone: string;
    locale: string;
}

interface Services {
    mailer: string;
    mail_from: string | null;
    queue: string;
    cache: string;
    session: string;
    filesystem: string;
    broadcast: string;
    stripe_configured: boolean;
    stripe_webhook_configured: boolean;
}

interface Health {
    stale_subscriptions: number;
    failed_jobs: number;
    pending_jobs: number;
    debug_in_production: boolean;
    storage_linked: boolean;
}

interface Props {
    settings: Settings;
    services: Services;
    health: Health;
}

/** Une anomalie détectée, avec son explication et le geste correctif. */
interface Issue {
    tone: 'danger' | 'warning';
    title: string;
    detail: ReactNode;
}

export default function Index({ settings, services, health }: Props) {
    const issues: Issue[] = [];

    if (health.debug_in_production) {
        issues.push({
            tone: 'danger',
            title: 'Mode debug actif en production',
            detail: (
                <>
                    Les traces d&apos;erreur exposent le code et la configuration aux
                    visiteurs. Passe <code className="font-mono">APP_DEBUG=false</code>{' '}
                    dans le fichier <code className="font-mono">.env</code> du serveur.
                </>
            ),
        });
    }

    if (health.stale_subscriptions > 0) {
        issues.push({
            tone: 'danger',
            title: `${health.stale_subscriptions} abonnement${health.stale_subscriptions > 1 ? 's' : ''} périmé${health.stale_subscriptions > 1 ? 's' : ''} encore actif${health.stale_subscriptions > 1 ? 's' : ''}`,
            detail: (
                <>
                    Ces comptes gardent leur Premium indûment. La tâche{' '}
                    <code className="font-mono">subscriptions:expire</code> doit tourner
                    chaque nuit : vérifie que le cron Laravel (
                    <code className="font-mono">schedule:run</code>) est bien actif sur le
                    serveur.
                </>
            ),
        });
    }

    if (!health.storage_linked) {
        issues.push({
            tone: 'danger',
            title: 'Lien de stockage absent',
            detail: (
                <>
                    Les photos envoyées ne s&apos;afficheront pas. Lance{' '}
                    <code className="font-mono">php artisan storage:link</code> sur le
                    serveur.
                </>
            ),
        });
    }

    if (!services.stripe_configured) {
        issues.push({
            tone: 'warning',
            title: 'Stripe non configuré',
            detail: 'Aucune clé secrète Stripe : les paiements sont impossibles.',
        });
    } else if (!services.stripe_webhook_configured) {
        issues.push({
            tone: 'warning',
            title: 'Webhook Stripe non configuré',
            detail:
                'Sans secret de webhook, les renouvellements et résiliations effectués côté Stripe ne remonteront pas dans la plateforme.',
        });
    }

    if (health.failed_jobs > 0) {
        issues.push({
            tone: 'warning',
            title: `${health.failed_jobs} tâche${health.failed_jobs > 1 ? 's' : ''} en échec`,
            detail: (
                <>
                    Des traitements de fond ont échoué. Inspecte-les avec{' '}
                    <code className="font-mono">php artisan queue:failed</code>.
                </>
            ),
        });
    }

    if (services.mailer === 'log') {
        issues.push({
            tone: 'warning',
            title: 'Les e-mails ne partent pas',
            detail: (
                <>
                    Le pilote de messagerie est <code className="font-mono">log</code> :
                    les messages sont écrits dans les journaux au lieu d&apos;être
                    envoyés. Normal en développement, à corriger en production.
                </>
            ),
        });
    }

    const envTone =
        settings.app_env === 'production'
            ? 'success'
            : settings.app_env === 'local'
              ? 'wine'
              : 'warning';

    return (
        <AdminLayout
            title="Réglages"
            subtitle="Configuration et état de santé de la plateforme"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Réglages' },
            ]}
            hideSearch
        >
            <Head title="Réglages · Admin" />

            <div className="space-y-4">
                {/* Diagnostic */}
                {issues.length === 0 ? (
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] px-5 py-4">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[oklch(60%_0.16_160_/_0.15)]">
                            <CheckCircle className="h-4 w-4 text-[color:var(--success)]" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="font-display text-base font-semibold">
                                Aucune anomalie détectée
                            </p>
                            <p className="text-sm text-[color:var(--ink-mute)]">
                                Configuration, paiements et traitements de fond sont en
                                ordre.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {issues.map((issue) => (
                            <div
                                key={issue.title}
                                className={`flex items-start gap-3 rounded-2xl border px-5 py-4 ${
                                    issue.tone === 'danger'
                                        ? 'border-[color:var(--destructive)]/30 bg-[oklch(62%_0.19_10_/_0.08)]'
                                        : 'border-[color:var(--gold)]/40 bg-[oklch(80%_0.13_75_/_0.1)]'
                                }`}
                            >
                                <AlertTriangle
                                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                                        issue.tone === 'danger'
                                            ? 'text-[color:var(--destructive)]'
                                            : 'text-[oklch(52%_0.13_75)]'
                                    }`}
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[color:var(--ink)]">
                                        {issue.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[color:var(--ink-soft)]">
                                        {issue.detail}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Application */}
                    <AdminCard padded={false}>
                        <AdminCardHeader title="Application" icon={Cog} />
                        <dl className="divide-y divide-[color:var(--line-soft)]">
                            <Row label="Nom" value={settings.app_name} />
                            <Row label="URL" value={settings.app_url} mono />
                            <Row
                                label="Environnement"
                                node={
                                    <AdminBadge tone={envTone}>
                                        {settings.app_env}
                                    </AdminBadge>
                                }
                            />
                            <Row
                                label="Mode debug"
                                node={
                                    <AdminBadge
                                        tone={settings.app_debug ? 'warning' : 'success'}
                                    >
                                        {settings.app_debug ? 'Activé' : 'Désactivé'}
                                    </AdminBadge>
                                }
                            />
                            <Row label="Fuseau horaire" value={settings.timezone} mono />
                            <Row label="Langue" value={settings.locale} mono />
                        </dl>
                    </AdminCard>

                    {/* Services */}
                    <AdminCard padded={false}>
                        <AdminCardHeader title="Services" icon={Server} />
                        <dl className="divide-y divide-[color:var(--line-soft)]">
                            <Row label="Messagerie" value={services.mailer} mono />
                            <Row
                                label="Expéditeur"
                                value={services.mail_from ?? '—'}
                                mono
                            />
                            <Row label="File d'attente" value={services.queue} mono />
                            <Row label="Cache" value={services.cache} mono />
                            <Row label="Sessions" value={services.session} mono />
                            <Row label="Stockage" value={services.filesystem} mono />
                            <Row label="Diffusion" value={services.broadcast} mono />
                        </dl>
                    </AdminCard>

                    {/* Paiements */}
                    <AdminCard padded={false}>
                        <AdminCardHeader title="Paiements" icon={CreditCard} />
                        <dl className="divide-y divide-[color:var(--line-soft)]">
                            <Row
                                label="Clé secrète Stripe"
                                node={
                                    <AdminBadge
                                        tone={
                                            services.stripe_configured
                                                ? 'success'
                                                : 'danger'
                                        }
                                    >
                                        {services.stripe_configured
                                            ? 'Configurée'
                                            : 'Absente'}
                                    </AdminBadge>
                                }
                            />
                            <Row
                                label="Secret de webhook"
                                node={
                                    <AdminBadge
                                        tone={
                                            services.stripe_webhook_configured
                                                ? 'success'
                                                : 'warning'
                                        }
                                    >
                                        {services.stripe_webhook_configured
                                            ? 'Configuré'
                                            : 'Absent'}
                                    </AdminBadge>
                                }
                            />
                            <Row
                                label="Abonnements périmés"
                                node={
                                    <AdminBadge
                                        tone={
                                            health.stale_subscriptions > 0
                                                ? 'danger'
                                                : 'success'
                                        }
                                    >
                                        {health.stale_subscriptions}
                                    </AdminBadge>
                                }
                            />
                        </dl>
                    </AdminCard>

                    {/* Traitements de fond */}
                    <AdminCard padded={false}>
                        <AdminCardHeader title="Traitements de fond" icon={Wrench} />
                        <dl className="divide-y divide-[color:var(--line-soft)]">
                            <Row
                                label="Tâches en attente"
                                value={String(health.pending_jobs)}
                                mono
                            />
                            <Row
                                label="Tâches en échec"
                                node={
                                    <AdminBadge
                                        tone={
                                            health.failed_jobs > 0 ? 'danger' : 'success'
                                        }
                                    >
                                        {health.failed_jobs}
                                    </AdminBadge>
                                }
                            />
                            <Row
                                label="Lien de stockage"
                                node={
                                    <AdminBadge
                                        tone={
                                            health.storage_linked ? 'success' : 'danger'
                                        }
                                    >
                                        {health.storage_linked ? 'En place' : 'Absent'}
                                    </AdminBadge>
                                }
                            />
                            <Row label="PHP" value={settings.php_version} mono />
                            <Row label="Laravel" value={settings.laravel_version} mono />
                        </dl>
                    </AdminCard>
                </div>

                <p className="text-xs text-[color:var(--ink-mute)]">
                    Ces valeurs proviennent des fichiers de configuration du serveur et ne
                    sont pas modifiables depuis cette page.
                </p>
            </div>
        </AdminLayout>
    );
}

function Row({
    label,
    value,
    node,
    mono = false,
}: {
    label: string;
    value?: string;
    node?: ReactNode;
    mono?: boolean;
}) {
    return (
        <div className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-2.5">
            <dt className="editorial-caption shrink-0 text-[color:var(--ink-mute)]">
                {label}
            </dt>
            <dd className="min-w-0 text-right">
                {node ?? (
                    <span
                        className={
                            mono
                                ? 'font-mono break-all text-xs text-[color:var(--ink)]'
                                : 'text-sm font-semibold text-[color:var(--ink)]'
                        }
                    >
                        {value}
                    </span>
                )}
            </dd>
        </div>
    );
}
