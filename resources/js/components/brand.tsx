import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';

export default function Brand({ light = false }: { light?: boolean }) {
    return (
        <Link
            href="/"
            className={`brand${light ? 'brand-light' : ''}`}
            aria-label="LesbiLibre, accueil"
        >
            <AppLogoIcon className="brand-icon" alt="" />
            <span>
                Lesbi<span className="brand-libre">Libre</span>
                <span className="brand-dot">.</span>
            </span>
        </Link>
    );
}
