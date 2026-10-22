import { useEffect, useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
}

interface InstallState {
    isInstalled: boolean;
    isIOS: boolean;
    isSecure: boolean;
    canPrompt: boolean;
    isInstalling: boolean;
    message: string | null;
}

const initialState: InstallState = {
    isInstalled: false,
    isIOS: false,
    isSecure: true,
    canPrompt: false,
    isInstalling: false,
    message: null,
};
let state = initialState;
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let consumers = 0;
let stopTracking: (() => void) | null = null;
const listeners = new Set<() => void>();

function publish(patch: Partial<InstallState>) {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
}

function trackInstallation() {
    consumers += 1;
    if (consumers === 1) {
        const displayMode = window.matchMedia('(display-mode: standalone)');
        const iosNavigator = navigator as Navigator & { standalone?: boolean };
        const refreshInstalled = () => {
            const isInstalled =
                displayMode.matches || iosNavigator.standalone === true;
            publish({
                isInstalled,
                canPrompt: !isInstalled && Boolean(deferredPrompt),
            });
        };
        const onPrompt = (event: Event) => {
            event.preventDefault();
            deferredPrompt = event as BeforeInstallPromptEvent;
            publish({ canPrompt: !state.isInstalled, message: null });
        };
        const onInstalled = () => {
            deferredPrompt = null;
            publish({
                isInstalled: true,
                canPrompt: false,
                isInstalling: false,
                message: 'LesbiLibre a été installée sur cet appareil.',
            });
        };
        publish({
            isIOS:
                /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' &&
                    navigator.maxTouchPoints > 1),
            isSecure: window.isSecureContext,
        });
        refreshInstalled();
        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('appinstalled', onInstalled);
        displayMode.addEventListener('change', refreshInstalled);
        stopTracking = () => {
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('appinstalled', onInstalled);
            displayMode.removeEventListener('change', refreshInstalled);
        };
    }
    return () => {
        consumers -= 1;
        if (consumers === 0) {
            stopTracking?.();
            stopTracking = null;
        }
    };
}

async function install() {
    const prompt = deferredPrompt;
    if (!prompt || state.isInstalling || state.isInstalled) return;
    // The browser prompt is called directly from the user's click. It must not
    // be deferred behind a network request or triggered by an effect.
    publish({ isInstalling: true, message: null });
    deferredPrompt = null;
    publish({ canPrompt: false });
    try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (!state.isInstalled) {
            publish({
                message:
                    choice.outcome === 'accepted'
                        ? 'Installation demandée. Le navigateur termine l’ajout.'
                        : 'Installation reportée. Tu peux continuer dans le navigateur.',
            });
        }
    } catch {
        publish({
            message:
                'Le navigateur n’a pas ouvert l’installation. Utilise son menu ou les étapes ci-dessous.',
        });
    } finally {
        publish({ isInstalling: false });
    }
}

export function usePwaInstall() {
    const snapshot = useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => state,
        () => initialState,
    );
    useEffect(trackInstallation, []);
    return { ...snapshot, install };
}
