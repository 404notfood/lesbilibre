import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';

export interface OnboardingStep {
    id: string;
    label: string;
    description: string;
    href: string;
    completed: boolean;
}

export interface OnboardingState {
    steps: OnboardingStep[];
    completed: number;
    total: number;
}

export default function OnboardingChecklist({
    onboarding,
}: {
    onboarding: OnboardingState | null;
}) {
    if (!onboarding || onboarding.completed >= onboarding.total) return null;

    const nextStep = onboarding.steps.find((step) => !step.completed);
    const progress = Math.round(
        (onboarding.completed / onboarding.total) * 100,
    );

    return (
        <section
            className="mb-8 rounded-2xl border border-border bg-card p-5 sm:p-6"
            aria-labelledby="onboarding-title"
        >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="editorial-eyebrow text-[color:var(--desire-deep)]">
                        Bien démarrer
                    </p>
                    <h2
                        id="onboarding-title"
                        className="mt-2 font-display text-2xl font-semibold italic"
                    >
                        Votre profil prend forme
                    </h2>
                    <p className="mt-1 text-sm text-foreground/60">
                        {onboarding.completed} étape
                        {onboarding.completed > 1 ? 's' : ''} sur{' '}
                        {onboarding.total}. Chaque étape améliore vos chances
                        d’avoir un échange utile.
                    </p>
                </div>
                {nextStep && (
                    <Link
                        href={nextStep.href}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--desire-deep)]"
                    >
                        Continuer : {nextStep.label}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                )}
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-[color:var(--desire)] transition-[width]"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {onboarding.steps.map((step) => {
                    const Icon = step.completed ? CheckCircle2 : Circle;
                    return (
                        <Link
                            key={step.id}
                            href={step.href}
                            className={`flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${step.completed ? 'border-transparent bg-muted/45 text-foreground/55' : 'border-border hover:border-[color:var(--desire)]'}`}
                        >
                            <Icon
                                className={`mt-0.5 h-4 w-4 shrink-0 ${step.completed ? 'text-emerald-600' : 'text-[color:var(--desire-deep)]'}`}
                            />
                            <span>
                                <strong className="block text-sm font-semibold text-foreground">
                                    {step.label}
                                </strong>
                                <span className="mt-0.5 block text-xs leading-5">
                                    {step.description}
                                </span>
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
