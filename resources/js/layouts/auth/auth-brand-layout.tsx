import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';

interface AuthBrandLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

export default function AuthBrandLayout({
    children,
    title,
    description,
}: AuthBrandLayoutProps): JSX.Element {
    return (
        <div className="flex min-h-screen">
            {/* Colonne de gauche - Branding */}
            <div className="hero-gradient relative hidden overflow-hidden lg:flex lg:w-1/2">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />

                {/* Décoration avec cercles flous */}
                <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

                <div className="relative z-10 flex w-full flex-col justify-between p-12 text-foreground">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-3">
                        <AppLogoIcon
                            className="size-12 rounded-xl transition-transform group-hover:scale-110"
                            alt=""
                        />
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-bold text-transparent">
                            LesbiLibre
                        </span>
                    </Link>

                    {/* Contenu central */}
                    <div className="max-w-md space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">
                                    Femmes et personnes queer
                                </span>
                            </div>

                            <h1 className="text-4xl leading-tight font-bold md:text-5xl">
                                Trouvez l'amour{' '}
                                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                    authentique
                                </span>
                            </h1>

                            <p className="text-lg text-muted-foreground">
                                Rejoignez une communauté bienveillante de femmes
                                qui partagent vos valeurs et cherchent à créer
                                des connexions sincères.
                            </p>
                        </div>

                        <p className="rounded-xl border border-border bg-card/70 p-5 text-sm leading-relaxed text-muted-foreground">
                            Un profil personnel, des photos examinées et des
                            outils pour garder la main sur tes échanges. Le
                            badge photo ne prouve ni l’identité ni la majorité.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>© {new Date().getFullYear()} LesbiLibre</span>
                        <div className="flex gap-4">
                            <Link
                                href="/privacy"
                                className="transition-colors hover:text-primary"
                            >
                                Confidentialité
                            </Link>
                            <Link
                                href="/terms"
                                className="transition-colors hover:text-primary"
                            >
                                Conditions
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Colonne de droite - Formulaire */}
            <div className="flex flex-1 items-center justify-center bg-background p-8">
                <div className="w-full max-w-md">
                    {/* Logo mobile */}
                    <div className="mb-8 text-center lg:hidden">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2"
                        >
                            <AppLogoIcon className="size-9 rounded-lg" alt="" />
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
                                LesbiLibre
                            </span>
                        </Link>
                    </div>

                    {/* Formulaire */}
                    <div className="space-y-6">
                        <div className="space-y-2 text-center lg:text-left">
                            <h2 className="text-3xl font-bold tracking-tight">
                                {title}
                            </h2>
                            <p className="text-muted-foreground">
                                {description}
                            </p>
                        </div>

                        {children}
                    </div>

                    {/* Footer mobile */}
                    <div className="mt-8 text-center text-sm text-muted-foreground lg:hidden">
                        <div className="mb-4 flex items-center justify-center gap-4">
                            <Link
                                href="/privacy"
                                className="transition-colors hover:text-primary"
                            >
                                Confidentialité
                            </Link>
                            <span>•</span>
                            <Link
                                href="/terms"
                                className="transition-colors hover:text-primary"
                            >
                                Conditions
                            </Link>
                        </div>
                        <span>© 2025 LesbiLibre</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
