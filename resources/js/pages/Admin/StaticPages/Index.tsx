import AdminLayout, {
    AdminBadge,
    AdminCard,
    AdminCardHeader,
    AdminEmpty,
} from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { ExternalLink, FileText, Info } from 'lucide-react';

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
                { label: 'Pages statiques' },
            ]}
            hideSearch
        >
            <Head title="Pages statiques · Admin" />

            <div className="max-w-3xl space-y-4">
                <AdminCard padded={false}>
                    <AdminCardHeader title="Contenu éditorial" icon={FileText} />
                    {pages.length === 0 ? (
                        <AdminEmpty
                            icon={FileText}
                            title="Aucune page statique"
                            description="Aucune page légale n’est déclarée."
                        />
                    ) : (
                        <ul className="divide-y divide-[color:var(--line-soft)]">
                            {pages.map((page) => (
                                <li
                                    key={page.slug}
                                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold text-[color:var(--ink)]">
                                            {page.name}
                                        </p>
                                        <div className="mt-1">
                                            <AdminBadge>{page.slug}</AdminBadge>
                                        </div>
                                    </div>
                                    <a
                                        href={page.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ghost-link font-mono inline-flex shrink-0 items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[color:var(--wine-deep)]"
                                    >
                                        Voir la page
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </AdminCard>

                <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-soft)] px-5 py-4">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--ink-mute)]" />
                    <p className="text-xs text-[color:var(--ink-soft)]">
                        Ces pages sont rendues par des gabarits du code source : leur
                        contenu se modifie dans les fichiers du projet, pas depuis cette
                        console. Cette liste sert de rappel de ce qui est publié et de
                        raccourci pour vérifier le rendu.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
