import { Link } from '@inertiajs/react';
import { Heart } from 'lucide-react';

interface PublicLayoutProps {
    children: React.ReactNode;
}

/**
 * Layout for public content pages (about, contact, FAQ, terms, privacy).
 * Unlike the auth layout, the content area is full width so long-form copy
 * stays readable.
 */
export default function PublicLayout({
    children,
}: PublicLayoutProps): JSX.Element {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="border-b border-border/50">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <Link href="/" className="group flex items-center gap-2">
                        <Heart className="h-6 w-6 fill-current text-primary transition-transform group-hover:scale-110" />
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
                            LesbiLibre
                        </span>
                    </Link>

                    <nav
                        className="flex items-center gap-3 text-sm sm:gap-5"
                        aria-label="Navigation publique"
                    >
                        <Link
                            href="/comment-ca-marche"
                            className="hidden text-muted-foreground transition-colors hover:text-primary sm:inline"
                        >
                            Comment ça marche
                        </Link>
                        <Link
                            href="/securite"
                            className="text-muted-foreground transition-colors hover:text-primary"
                        >
                            Sécurité
                        </Link>
                        <Link
                            href="/tarifs"
                            className="text-muted-foreground transition-colors hover:text-primary"
                        >
                            Tarifs
                        </Link>
                        <Link
                            href="/guides"
                            className="hidden text-muted-foreground transition-colors hover:text-primary md:inline"
                        >
                            Guides
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-border/50">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
                    <span>© {new Date().getFullYear()} LesbiLibre</span>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                        <Link
                            href="/about"
                            className="transition-colors hover:text-primary"
                        >
                            À propos
                        </Link>
                        <Link
                            href="/fonctionnalites"
                            className="transition-colors hover:text-primary"
                        >
                            Fonctionnalités
                        </Link>
                        <Link
                            href="/faq"
                            className="transition-colors hover:text-primary"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/contact"
                            className="transition-colors hover:text-primary"
                        >
                            Contact
                        </Link>
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
            </footer>
        </div>
    );
}
