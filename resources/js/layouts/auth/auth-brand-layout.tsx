import AppLogo from '@/components/app-logo';
import { Link } from '@inertiajs/react';
import { Heart, Sparkles } from 'lucide-react';

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
        <div className="min-h-screen flex">
            {/* Colonne de gauche - Branding */}
            <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />

                {/* Décoration avec cercles flous */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col justify-between p-12 text-foreground w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <Heart className="h-8 w-8 text-primary fill-current group-hover:scale-110 transition-transform" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            LesbiLibre
                        </span>
                    </Link>

                    {/* Contenu central */}
                    <div className="space-y-8 max-w-md">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">
                                    Plateforme 100% féminine
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                Trouvez l'amour{' '}
                                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                    authentique
                                </span>
                            </h1>

                            <p className="text-lg text-muted-foreground">
                                Rejoignez une communauté bienveillante de femmes qui partagent
                                vos valeurs et cherchent à créer des connexions sincères.
                            </p>
                        </div>

                        {/* Témoignages ou statistiques */}
                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50">
                            <div>
                                <div className="text-3xl font-bold text-primary">2.5K+</div>
                                <div className="text-sm text-muted-foreground">Membres</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-accent">340+</div>
                                <div className="text-sm text-muted-foreground">En ligne</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-green-600">1.8K+</div>
                                <div className="text-sm text-muted-foreground">Matches</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>© 2025 LesbiLibre</span>
                        <div className="flex gap-4">
                            <Link href="/privacy" className="hover:text-primary transition-colors">
                                Confidentialité
                            </Link>
                            <Link href="/terms" className="hover:text-primary transition-colors">
                                Conditions
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Colonne de droite - Formulaire */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md">
                    {/* Logo mobile */}
                    <div className="lg:hidden mb-8 text-center">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <Heart className="h-6 w-6 text-primary fill-current" />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
                    <div className="lg:hidden mt-8 text-center text-sm text-muted-foreground">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <Link href="/privacy" className="hover:text-primary transition-colors">
                                Confidentialité
                            </Link>
                            <span>•</span>
                            <Link href="/terms" className="hover:text-primary transition-colors">
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
