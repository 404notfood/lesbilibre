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
export default function PublicLayout({ children }: PublicLayoutProps): JSX.Element {
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

                    <nav className="flex items-center gap-6 text-sm">
                        <Link
                            href="/about"
                            className="text-muted-foreground transition-colors hover:text-primary"
                        >
                            À propos
                        </Link>
                        <Link
                            href="/faq"
                            className="text-muted-foreground transition-colors hover:text-primary"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/contact"
                            className="text-muted-foreground transition-colors hover:text-primary"
                        >
                            Contact
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-border/50">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
                    <span>© 2025 LesbiLibre</span>
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
            </footer>
        </div>
    );
}
