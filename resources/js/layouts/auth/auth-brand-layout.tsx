import Brand from '@/components/brand';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

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
    const { flash } = usePage<{ flash: { error?: string } }>().props;
    return (
        <div className="auth-page">
            <aside className="auth-story" aria-label="Bienvenue sur LesbiLibre">
                <Brand light />
                <div className="auth-story-content">
                    <p className="public-eyebrow">
                        Rencontres lesbiennes & queer
                    </p>
                    <h2>
                        Une rencontre.
                        <br />
                        Mille façons
                        <br />
                        <em>d’être toi.</em>
                    </h2>
                    <img
                        className="auth-story-image"
                        src="/images/rencontre-cafe-photo.webp"
                        alt="Deux femmes échangent autour d’un café, visuel photoréaliste."
                        width={1200}
                        height={800}
                    />
                    <p className="auth-story-note">
                        <ShieldCheck size={19} aria-hidden />
                        <span>
                            Des envies partagées. Des limites respectées.
                            <br />
                            Et la liberté d’avancer à ton rythme.
                        </span>
                    </p>
                </div>
                <div className="auth-story-footer">
                    <span>© {new Date().getFullYear()} LesbiLibre</span>
                    <Link href="/privacy">Confidentialité</Link>
                    <Link href="/terms">Conditions</Link>
                </div>
            </aside>
            <main className="auth-form-panel">
                <Link href="/" className="auth-back">
                    <ArrowLeft size={16} aria-hidden />
                    Retour à l’accueil
                </Link>
                <div className="auth-form-content">
                    <div className="auth-mobile-brand">
                        <Brand />
                    </div>
                    <div className="auth-form-heading">
                        <p className="public-eyebrow">
                            Ton espace, à ton rythme.
                        </p>
                        <h1>{title}</h1>
                        <p>{description}</p>
                    </div>
                    {flash?.error && <p role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{flash.error}</p>}
                    {children}
                </div>
                <footer className="auth-mobile-footer">
                    <span>© {new Date().getFullYear()} LesbiLibre</span>
                    <Link href="/privacy">Confidentialité</Link>
                    <Link href="/terms">Conditions</Link>
                </footer>
            </main>
        </div>
    );
}
