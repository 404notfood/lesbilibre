import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export function CookieConsent() {
    const [visible, setVisible] = useState(
        () =>
            typeof document !== 'undefined' &&
            !document.cookie
                .split(';')
                .some((cookie) =>
                    cookie.trim().startsWith('cookie_preferences='),
                ),
    );
    if (!visible) return null;

    const setPreference = (value: 'essential' | 'all') => {
        document.cookie = `cookie_preferences=${value}; path=/; max-age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
        setVisible(false);
    };

    return (
        <section
            role="dialog"
            aria-label="Préférences de cookies"
            aria-describedby="cookie-description"
            className="cookie-panel"
        >
            <h2 className="cookie-heading">
                <ShieldCheck size={17} aria-hidden />
                Ta vie privée a sa place ici.
            </h2>
            <p id="cookie-description">
                Les cookies nécessaires font fonctionner le site. Les mesures
                d’audience restent désactivées sans ton accord.{' '}
                <a href="/privacy">En savoir plus</a>
            </p>
            <div className="cookie-actions">
                <button
                    type="button"
                    onClick={() => setPreference('essential')}
                >
                    Essentiels uniquement
                </button>
                <button type="button" onClick={() => setPreference('all')}>
                    Accepter l’audience
                </button>
            </div>
        </section>
    );
}
