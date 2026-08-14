import AdminLayout, {
    AdminBadge,
    AdminCard,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';

interface Settings {
    app_name: string;
    app_url: string;
    app_env: string;
    app_debug: boolean;
}

interface Props {
    settings: Settings;
}

export default function Index({ settings }: Props) {
    const envTone: 'success' | 'warning' | 'wine' =
        settings.app_env === 'production'
            ? 'success'
            : settings.app_env === 'local'
              ? 'wine'
              : 'warning';

    return (
        <AdminLayout
            title="Réglages"
            subtitle="Paramètres globaux de l'application"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Système', href: '/admin/settings' },
                { label: 'Réglages' },
            ]}
        >
            <Head title="Réglages" />

            <section>
                <AdminSectionTitle
                    eyebrow="01 · Application"
                    title="Configuration générale"
                />
                <AdminCard>
                    <dl className="grid gap-6 md:grid-cols-2">
                        <SettingRow
                            label="Nom de l'application"
                            value={settings.app_name}
                        />
                        <SettingRow
                            label="URL de l'application"
                            value={settings.app_url}
                            mono
                        />
                        <SettingRow
                            label="Environnement"
                            valueNode={
                                <AdminBadge tone={envTone}>
                                    {settings.app_env}
                                </AdminBadge>
                            }
                        />
                        <SettingRow
                            label="Mode debug"
                            valueNode={
                                <AdminBadge tone={settings.app_debug ? 'warning' : 'neutral'}>
                                    {settings.app_debug ? 'Activé' : 'Désactivé'}
                                </AdminBadge>
                            }
                        />
                    </dl>
                </AdminCard>
            </section>
        </AdminLayout>
    );
}

function SettingRow({
    label,
    value,
    valueNode,
    mono = false,
}: {
    label: string;
    value?: string;
    valueNode?: React.ReactNode;
    mono?: boolean;
}) {
    return (
        <div>
            <dt
                className="editorial-caption mb-1"
                style={{ color: 'var(--ink-mute)' }}
            >
                {label}
            </dt>
            <dd>
                {valueNode ? (
                    valueNode
                ) : (
                    <span
                        className={mono ? 'font-mono text-sm' : 'font-semibold'}
                        style={{ color: 'var(--ink)' }}
                    >
                        {value}
                    </span>
                )}
            </dd>
        </div>
    );
}
