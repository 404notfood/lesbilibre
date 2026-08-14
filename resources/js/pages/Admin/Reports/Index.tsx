import AdminLayout, { AdminCard } from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { Flag, ShieldAlert } from 'lucide-react';

export default function Index() {
    return (
        <AdminLayout
            title="Signalements"
            subtitle="Liste complète des signalements ouverts et résolus"
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Signalements' },
            ]}
        >
            <Head title="Signalements · Admin" />

            <AdminCard>
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <div
                        className="grid h-14 w-14 place-items-center rounded-full"
                        style={{
                            background: 'var(--blush)',
                            color: 'var(--wine-deep)',
                        }}
                    >
                        <Flag className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="font-display text-2xl font-medium italic">
                            Interface en construction
                        </h2>
                        <p
                            className="mt-2 max-w-md text-sm"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            En attendant, les signalements ouverts apparaissent dans le centre
                            de modération avec actions directes.
                        </p>
                    </div>
                    <Link
                        href="/admin/moderation"
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
                        style={{
                            background: 'var(--ink)',
                            color: 'var(--bg)',
                        }}
                    >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Aller à la modération
                    </Link>
                </div>
            </AdminCard>
        </AdminLayout>
    );
}
