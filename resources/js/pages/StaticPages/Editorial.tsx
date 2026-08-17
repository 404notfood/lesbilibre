import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Section {
    title: string;
    text: string;
}

interface Props {
    title: string;
    intro: string;
    sections: Section[];
    ctaHref: string;
    ctaLabel: string;
}

export default function Editorial({
    title,
    intro,
    sections,
    ctaHref,
    ctaLabel,
}: Props) {
    return (
        <PublicLayout>
            <Head title={title} />

            <article className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
                <header className="max-w-3xl">
                    <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        LesbiLibre en pratique
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        {intro}
                    </p>
                </header>

                <div className="mt-12 grid gap-5 sm:grid-cols-2">
                    {sections.map((section) => (
                        <section
                            key={section.title}
                            className="rounded-2xl border border-border bg-card p-6"
                        >
                            <CheckCircle2
                                className="mb-4 h-6 w-6 text-primary"
                                aria-hidden="true"
                            />
                            <h2 className="text-xl font-semibold text-foreground">
                                {section.title}
                            </h2>
                            <p className="mt-3 leading-7 text-muted-foreground">
                                {section.text}
                            </p>
                        </section>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl bg-primary/10 p-7 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            Vous gardez toujours le contrôle
                        </h2>
                        <p className="mt-1 text-muted-foreground">
                            Vos préférences, votre visibilité et votre rythme
                            restent modifiables.
                        </p>
                    </div>
                    <Link
                        href={ctaHref}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
                    >
                        {ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </article>
        </PublicLayout>
    );
}
