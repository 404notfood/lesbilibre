import Brand from '@/components/brand';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useRef } from 'react';

const navigation = [
    { href: '/comment-ca-marche', label: 'Comment ça marche' },
    { href: '/securite', label: 'Notre engagement' },
    { href: '/tarifs', label: 'Tarifs' },
    { href: '/guides', label: 'Le journal' },
];

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element {
    const { url, props } = usePage<SharedData & { canRegister?: boolean }>();
    const menu = useRef<HTMLDetailsElement>(null);
    const isAuthenticated = Boolean(props.auth?.user);
    const canRegister = props.canRegister !== false;
    const accountHref = isAuthenticated
        ? '/dashboard'
        : canRegister
          ? '/register'
          : '/login';
    const accountLabel = isAuthenticated
        ? 'Mon espace'
        : canRegister
          ? 'Nous rejoindre'
          : 'Me connecter';

    return (
        <div className="public-site">
            <a href="#public-content" className="public-skip">
                Aller au contenu
            </a>
            <header className="public-header">
                <div className="public-container public-header-inner">
                    <Brand />
                    <nav
                        className="public-desktop-nav"
                        aria-label="Navigation principale"
                    >
                        {navigation.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                aria-current={
                                    url.split('?')[0] === href
                                        ? 'page'
                                        : undefined
                                }
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <div className="public-header-actions">
                        {!isAuthenticated && (
                            <Link href="/login" className="public-login">
                                Connexion
                            </Link>
                        )}
                        <Link
                            href={accountHref}
                            className="public-button public-button-small"
                        >
                            {accountLabel}
                            <ArrowUpRight size={16} aria-hidden />
                        </Link>
                    </div>
                    <details
                        className="public-mobile-menu"
                        ref={menu}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape' && menu.current) {
                                menu.current.open = false;
                                menu.current.querySelector('summary')?.focus();
                            }
                        }}
                    >
                        <summary aria-label="Menu de navigation">
                            <Menu className="menu-open" size={23} aria-hidden />
                            <X className="menu-close" size={23} aria-hidden />
                        </summary>
                        <nav aria-label="Navigation mobile">
                            <Link
                                href={accountHref}
                                onClick={() => {
                                    if (menu.current) menu.current.open = false;
                                }}
                            >
                                {accountLabel}
                                <ArrowUpRight size={16} aria-hidden />
                            </Link>
                            {navigation.map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    aria-current={
                                        url.split('?')[0] === href
                                            ? 'page'
                                            : undefined
                                    }
                                    onClick={() => {
                                        if (menu.current)
                                            menu.current.open = false;
                                    }}
                                >
                                    {label}
                                    <ArrowUpRight size={16} aria-hidden />
                                </Link>
                            ))}
                            <Link
                                href="/installer"
                                onClick={() => {
                                    if (menu.current) menu.current.open = false;
                                }}
                            >
                                Installer l’application
                                <ArrowUpRight size={16} aria-hidden />
                            </Link>
                        </nav>
                    </details>
                </div>
            </header>
            <main id="public-content" className="public-main">
                {children}
            </main>
            <footer className="public-footer">
                <div className="public-container">
                    <div className="public-footer-top">
                        <div className="public-footer-brand">
                            <Brand />
                            <p>
                                Des liens sincères.
                                <br />
                                Et la liberté d’être toi.
                            </p>
                            <span>
                                Rencontres entre femmes et personnes queer · 18+
                            </span>
                        </div>
                        <div>
                            <h2>Découvrir</h2>
                            <Link href="/comment-ca-marche">
                                Comment ça marche
                            </Link>
                            <Link href="/fonctionnalites">
                                Les fonctionnalités
                            </Link>
                            <Link href="/tarifs">Gratuit et Premium</Link>
                            <Link href="/installer">
                                Installer l’application
                            </Link>
                        </div>
                        <div>
                            <h2>Faire connaissance</h2>
                            <Link href="/about">Notre histoire</Link>
                            <Link href="/guides">Le journal</Link>
                            <Link href="/securite">Sécurité et respect</Link>
                            <Link href="/contact">Nous contacter</Link>
                        </div>
                    </div>
                    <div className="public-footer-bottom">
                        <span>© {new Date().getFullYear()} LesbiLibre</span>
                        <div>
                            <Link href="/privacy">Confidentialité</Link>
                            <Link href="/terms">Conditions</Link>
                            <Link href="/faq">FAQ</Link>
                        </div>
                        <span className="public-footer-note">
                            Libre d’être toi, ensemble.
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
