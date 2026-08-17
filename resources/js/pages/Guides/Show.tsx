import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from 'lucide-react';

interface GuideSection {
    title: string;
    paragraphs: string[];
    bullets?: string[];
}
interface Guide {
    slug: string;
    title: string;
    description: string;
    reading_time: string;
    updated_at: string;
    sections: GuideSection[];
}
interface RelatedGuide {
    slug: string;
    title: string;
    description: string;
}

export default function GuideShow({
    guide,
    relatedGuides,
}: {
    guide: Guide;
    relatedGuides: RelatedGuide[];
}) {
    return (
        <PublicLayout>
            <Head title={guide.title} />
            <article className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
                <Link
                    href="/guides"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Tous les guides
                </Link>
                <header className="mt-7">
                    <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
                        {guide.title}
                    </h1>
                    <p className="mt-5 text-xl leading-8 text-muted-foreground">
                        {guide.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {guide.reading_time}
                        </span>
                        <span className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Mis à jour le {guide.updated_at}
                        </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Rédaction et relecture : équipe LesbiLibre
                    </p>
                </header>
                <div className="mt-12 space-y-12">
                    {guide.sections.map((section) => (
                        <section key={section.title}>
                            <h2 className="text-2xl font-semibold">
                                {section.title}
                            </h2>
                            <div className="mt-4 space-y-4 leading-8 text-foreground/80">
                                {section.paragraphs.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                            </div>
                            {section.bullets && (
                                <ul className="mt-5 space-y-3 rounded-2xl bg-muted/60 p-6">
                                    {section.bullets.map((bullet) => (
                                        <li key={bullet} className="flex gap-3">
                                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>
                <aside className="mt-14 border-t border-border pt-10">
                    <h2 className="text-2xl font-semibold">Continuer</h2>
                    <div className="mt-5 space-y-3">
                        {relatedGuides.map((item) => (
                            <Link
                                key={item.slug}
                                href={`/guides/${item.slug}`}
                                className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 transition-colors hover:border-primary"
                            >
                                <span>
                                    <strong className="block">
                                        {item.title}
                                    </strong>
                                    <span className="mt-1 block text-sm text-muted-foreground">
                                        {item.description}
                                    </span>
                                </span>
                                <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
                            </Link>
                        ))}
                    </div>
                </aside>
            </article>
        </PublicLayout>
    );
}
