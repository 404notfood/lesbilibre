import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen } from 'lucide-react';

interface Guide {
    slug: string;
    title: string;
    description: string;
    readingTime: string;
    updatedAt: string;
}

export default function GuidesIndex({ guides }: { guides: Guide[] }) {
    return (
        <PublicLayout>
            <Head title="Guides" />
            <main className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
                <header className="max-w-3xl">
                    <div className="flex items-center gap-2 text-primary">
                        <BookOpen className="h-5 w-5" />
                        <span className="text-sm font-semibold tracking-[0.18em] uppercase">
                            Ressources LesbiLibre
                        </span>
                    </div>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                        Des rencontres plus sincères et plus sûres
                    </h1>
                    <p className="mt-5 text-lg leading-8 text-muted-foreground">
                        Des conseils pratiques, relus et datés. Aucun faux
                        témoignage, aucune promesse de résultat.
                    </p>
                </header>
                <div className="mt-12 grid gap-5 md:grid-cols-2">
                    {guides.map((guide) => (
                        <article
                            key={guide.slug}
                            className="flex flex-col rounded-2xl border border-border bg-card p-6"
                        >
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                {guide.readingTime} · mis à jour le{' '}
                                {guide.updatedAt}
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold">
                                <Link
                                    href={`/guides/${guide.slug}`}
                                    className="hover:text-primary"
                                >
                                    {guide.title}
                                </Link>
                            </h2>
                            <p className="mt-3 flex-1 leading-7 text-muted-foreground">
                                {guide.description}
                            </p>
                            <Link
                                href={`/guides/${guide.slug}`}
                                className="mt-5 inline-flex items-center gap-2 font-semibold text-primary"
                            >
                                Lire le guide <ArrowRight className="h-4 w-4" />
                            </Link>
                        </article>
                    ))}
                </div>
            </main>
        </PublicLayout>
    );
}
