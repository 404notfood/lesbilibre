import { useEffect } from 'react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
}

const INSTALL_TOAST_ID = 'pwa-install';
const UPDATE_TOAST_ID = 'pwa-update';

export function PwaManager(): null {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) {
            return;
        }

        let active = true;
        let refreshing = false;
        let registration: ServiceWorkerRegistration | null = null;
        let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

        const showUpdateToast = (
            currentRegistration: ServiceWorkerRegistration,
        ) => {
            toast('Une nouvelle version est prête', {
                id: UPDATE_TOAST_ID,
                description:
                    'Recharge LesbiLibre pour profiter des dernières améliorations.',
                duration: Infinity,
                action: {
                    label: 'Mettre à jour',
                    onClick: () => {
                        currentRegistration.waiting?.postMessage({
                            type: 'SKIP_WAITING',
                        });
                    },
                },
            });
        };

        const handleControllerChange = () => {
            if (refreshing) {
                return;
            }

            refreshing = true;
            window.location.reload();
        };

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            deferredInstallPrompt = event as BeforeInstallPromptEvent;

            toast('Installe LesbiLibre sur ton appareil', {
                id: INSTALL_TOAST_ID,
                description:
                    "L'application s'ouvrira comme une vraie app, sans passer par le navigateur.",
                duration: Infinity,
                action: {
                    label: 'Installer',
                    onClick: async () => {
                        if (!deferredInstallPrompt) {
                            return;
                        }

                        await deferredInstallPrompt.prompt();
                        await deferredInstallPrompt.userChoice;
                        deferredInstallPrompt = null;
                        toast.dismiss(INSTALL_TOAST_ID);
                    },
                },
            });
        };

        const handleAppInstalled = () => {
            deferredInstallPrompt = null;
            toast.dismiss(INSTALL_TOAST_ID);
            toast.success('LesbiLibre est installée');
        };

        const handleUpdateFound = () => {
            const installingWorker = registration?.installing;

            if (!installingWorker) {
                return;
            }

            installingWorker.addEventListener('statechange', () => {
                if (
                    active &&
                    installingWorker.state === 'installed' &&
                    navigator.serviceWorker.controller &&
                    registration
                ) {
                    showUpdateToast(registration);
                }
            });
        };

        const checkForUpdate = () => {
            void registration?.update();
        };

        navigator.serviceWorker.addEventListener(
            'controllerchange',
            handleControllerChange,
        );
        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt,
        );
        window.addEventListener('appinstalled', handleAppInstalled);
        window.addEventListener('focus', checkForUpdate);

        void navigator.serviceWorker
            .register('/sw.js', { updateViaCache: 'none' })
            .then((currentRegistration) => {
                if (!active) {
                    return;
                }

                registration = currentRegistration;
                registration.addEventListener('updatefound', handleUpdateFound);

                if (
                    registration.waiting &&
                    navigator.serviceWorker.controller
                ) {
                    showUpdateToast(registration);
                }
            })
            .catch((error: unknown) => {
                console.error('Service worker registration failed:', error);
            });

        return () => {
            active = false;
            registration?.removeEventListener('updatefound', handleUpdateFound);
            navigator.serviceWorker.removeEventListener(
                'controllerchange',
                handleControllerChange,
            );
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt,
            );
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('focus', checkForUpdate);
        };
    }, []);

    return null;
}
