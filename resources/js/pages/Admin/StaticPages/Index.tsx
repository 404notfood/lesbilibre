import AdminLayout, {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminSectionTitle,
} from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { ExternalLink, Plus } from 'lucide-react';

interface StaticPage {
    name: string;
    slug: string;
    url: string;
}

interface Props {
    pages: StaticPage[];
}

export default function Index({ pages }: Props) {
    return (
        <AdminLayout
            title="Pages statiques"
            subtitle={`${pages.length} page${pages.length > 1 ? 's' : ''} publiée${pages.length > 1 ? 's' : ''}`}
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Contenu', href: '/admin/static-pages' },
                { label: 'Pages statiques' },
            ]}
            actions={
                <AdminButton
                    href="/admin/static-pages/create"
                    variant="primary"
                    icon={Plus}
                >
                    Nouvelle page
                </AdminButton>
            }
        >
            <Head title="Pages statiques" />

            <section>
                <AdminSectionTitle
                    eyebrow="01 · Inventaire"
                    title="Contenu éditorial"
                />
                <AdminCard padded={false}>
                    {pages.length === 0 ? (
                        <div
                            className="px-6 py-12 text-center text-sm"
                            style={{ color: 'var(--ink-mute)' }}
                        >
                            Aucune page statique pour le moment.
                        </div>
                    ) : (
                        <ul>
                            {pages.map((page, idx) => (
                                <li
                                    key={page.slug}
                                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[color:var(--bg-soft)]"
                                    style={{
                                        borderTop:
                                            idx === 0
                                                ? 'none'
                                                : '1px solid var(--line-soft)',
                                    }}
                                >
                                    <div className="min-w-0">
                                        <p
                                            className="font-semibold"
                                            style={{ color: 'var(--ink)' }}
                                        >
                                            {page.name}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <AdminBadge tone="neutral">
                                                {page.slug}
                                            </AdminBadge>
                                        </div>
                                    </div>
                                    <Link
                                        href={page.url}
                                        className="ghost-link font-mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em]"
                                        style={{ color: 'var(--wine-deep)' }}
                                    >
                                        Voir la page
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </AdminCard>
            </section>
        </AdminLayout>
    );
}
