import { useState } from 'react';

export function CookieConsent() {
    const [visible, setVisible] = useState(
        () =>
            typeof document !== 'undefined' &&
            !document.cookie.includes('cookie_preferences='),
    );

    if (!visible) return null;

    const setPreference = (value: 'essential' | 'all') => {
        document.cookie = `cookie_preferences=${value}; path=/; max-age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
        setVisible(false);
    };

    return <section role="dialog" aria-label="Préférences de cookies" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border bg-card p-5 shadow-xl">
        <p className="font-semibold">Votre vie privée compte</p>
        <p className="mt-1 text-sm text-muted-foreground">Nous utilisons les cookies nécessaires à la connexion et à la sécurité. Les mesures d’audience ne sont activées qu’avec votre accord.</p>
        <div className="mt-4 flex flex-wrap gap-2"><button className="btn-velvet" onClick={() => setPreference('essential')}>Essentiels uniquement</button><button className="btn-desire" onClick={() => setPreference('all')}>Accepter les mesures d’audience</button></div>
    </section>;
}
