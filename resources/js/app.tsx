import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CookieConsent } from './components/cookie-consent';
import { PwaManager } from './components/pwa-manager';
import SeoHead, { pageTitle, type SeoMetadata } from './components/seo-head';
import { Toaster } from './components/ui/toaster';
import { initializeTheme } from './hooks/use-appearance';

createInertiaApp({
    title: pageTitle,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props}>
                    {({ Component, key, props: pageProps }) => (
                        <>
                            <Component key={key} {...pageProps} />
                            <SeoHead seo={pageProps.seo as SeoMetadata} />
                        </>
                    )}
                </App>
                <PwaManager
                    initialUserId={
                        (
                            props.initialPage.props.auth as
                                | { user?: { id?: number } | null }
                                | undefined
                        )?.user?.id ?? null
                    }
                />
                <Toaster />
                <CookieConsent />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
