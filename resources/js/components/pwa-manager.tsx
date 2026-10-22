import type { PwaUpdateDialogProps } from '@/components/pwa-update-dialog';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { router } from '@inertiajs/react';
import { WifiOff } from 'lucide-react';
import type { ComponentType } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const UPDATE_TOAST_ID = 'pwa-update';
const DIALOG_TOAST_ID = 'pwa-update-dialog';

export function PwaManager({
    initialUserId = null,
}: {
    initialUserId?: number | null;
}) {
    usePwaInstall();
    const [online, setOnline] = useState(
        () => typeof navigator === 'undefined' || navigator.onLine,
    );
    const [updateOpen, setUpdateOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
    const reloadAllowed = useRef(false);
    const reloadReady = useRef(false);
    const updateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const changedFields = useRef(new Set<HTMLElement>());
    const busyVisit = useRef(false);
    const userId = useRef(initialUserId);
    const loadingDialog = useRef(false);
    const [UpdateDialog, setUpdateDialog] =
        useState<ComponentType<PwaUpdateDialogProps> | null>(null);

    const openUpdateDialog = useCallback(async () => {
        if (loadingDialog.current) return;
        loadingDialog.current = true;
        toast.loading('Ouverture de la mise à jour…', { id: DIALOG_TOAST_ID });
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
            const module = await Promise.race([
                import('@/components/pwa-update-dialog'),
                new Promise<never>((_, reject) => {
                    timer = setTimeout(
                        () => reject(new Error('Update dialog unavailable.')),
                        12_000,
                    );
                }),
            ]);
            setUpdateDialog(() => module.default);
            setUpdateError(null);
            setUpdateOpen(true);
            toast.dismiss(DIALOG_TOAST_ID);
        } catch {
            toast.error('La fenêtre de mise à jour n’a pas pu être chargée', {
                id: DIALOG_TOAST_ID,
                description:
                    'Vérifie ta connexion puis réessaie avec « Voir ». La page reste ouverte et ta saisie est conservée.',
                duration: 8_000,
            });
        } finally {
            if (timer) clearTimeout(timer);
            loadingDialog.current = false;
        }
    }, []);

    const hasUnsavedWork = useCallback(() => {
        for (const field of changedFields.current) {
            if (
                !field.isConnected ||
                ((field instanceof HTMLInputElement ||
                    field instanceof HTMLTextAreaElement) &&
                    field.value === '')
            )
                changedFields.current.delete(field);
        }
        return (
            changedFields.current.size > 0 ||
            Boolean(
                document.querySelector(
                    '[data-pwa-unsaved="true"], [data-pwa-busy="true"]',
                ),
            ) ||
            busyVisit.current
        );
    }, []);

    useEffect(() => {
        let active = true;
        let lastUpdateCheck = 0;
        let installingWorker: ServiceWorker | null = null;
        let hadController = Boolean(navigator.serviceWorker?.controller);
        const showUpdate = () => {
            if (!active) return;
            toast('Une mise à jour est disponible', {
                id: UPDATE_TOAST_ID,
                description:
                    'Termine ta saisie avant de recharger. Tu peux continuer pour le moment.',
                duration: Infinity,
                action: {
                    label: 'Voir',
                    onClick: () => {
                        void openUpdateDialog();
                    },
                },
                cancel: { label: 'Plus tard', onClick: () => undefined },
            });
        };
        const onControllerChange = () => {
            if (!hadController) {
                hadController = true;
                return;
            }
            reloadReady.current = true;
            if (updateTimer.current) clearTimeout(updateTimer.current);
            setUpdating(false);
            if (
                reloadAllowed.current &&
                navigator.onLine &&
                !hasUnsavedWork()
            ) {
                reloadAllowed.current = false;
                window.location.reload();
                return;
            }
            // A first install or another tab may activate a worker. Neither is
            // permission to discard the current page or an unsent message.
            reloadAllowed.current = false;
            if (registrationRef.current) showUpdate();
        };
        const onStateChange = () => {
            if (
                installingWorker?.state === 'installed' &&
                navigator.serviceWorker.controller
            )
                showUpdate();
        };
        const onUpdateFound = () => {
            installingWorker?.removeEventListener('statechange', onStateChange);
            installingWorker = registrationRef.current?.installing ?? null;
            installingWorker?.addEventListener('statechange', onStateChange);
        };
        const checkForUpdate = () => {
            if (
                !navigator.onLine ||
                document.visibilityState !== 'visible' ||
                Date.now() - lastUpdateCheck < 60_000
            )
                return;
            lastUpdateCheck = Date.now();
            void registrationRef.current?.update().catch(() => undefined);
        };
        const markChanged = (event: Event) => {
            const field = event.target;
            if (
                field instanceof HTMLElement &&
                field.closest('[data-pwa-unsaved]')
            )
                return;
            if (field instanceof HTMLInputElement) {
                if (
                    ['button', 'submit', 'reset', 'hidden'].includes(field.type)
                )
                    return;
                const hasValue =
                    field.type === 'checkbox' || field.type === 'radio'
                        ? field.checked !== field.defaultChecked
                        : field.type === 'file'
                          ? Boolean(field.files?.length)
                          : field.value !== '';
                if (hasValue) changedFields.current.add(field);
                else changedFields.current.delete(field);
            } else if (
                field instanceof HTMLTextAreaElement ||
                field instanceof HTMLSelectElement
            ) {
                if (field.value !== '') changedFields.current.add(field);
                else changedFields.current.delete(field);
            } else if (
                field instanceof HTMLElement &&
                field.isContentEditable
            ) {
                if (field.textContent?.trim()) changedFields.current.add(field);
                else changedFields.current.delete(field);
            }
        };
        const onOffline = () => setOnline(false);
        const onOnline = () => {
            setOnline(true);
            toast.success('Réseau de nouveau disponible', {
                description: 'Réessaie ton envoi si nécessaire.',
            });
            checkForUpdate();
        };
        const endSession = () => {
            router.flushAll();
            router.clearHistory();
            changedFields.current.clear();
            window.dispatchEvent(new Event('pwa:session-ended'));
            if (!('serviceWorker' in navigator)) return;
            navigator.serviceWorker.controller?.postMessage({ type: 'LOGOUT' });
            void navigator.serviceWorker
                .getRegistration('/')
                .then((registration) => {
                    registration?.active?.postMessage({ type: 'LOGOUT' });
                })
                .catch(() => undefined);
        };
        const onWorkerMessage = (event: MessageEvent) => {
            const source = event.source as ServiceWorker | null;
            if (
                event.data?.type !== 'SESSION_ENDED' ||
                !(source instanceof ServiceWorker) ||
                new URL(source.scriptURL).origin !== window.location.origin
            )
                return;
            router.flushAll();
            router.clearHistory();
            changedFields.current.clear();
            window.location.replace('/login');
        };
        const onPageShow = (event: PageTransitionEvent) => {
            if (event.persisted && userId.current !== null)
                window.location.reload();
        };
        let closingSession = false;
        const stopBefore = router.on('before', (event) => {
            const visit = event.detail.visit;
            closingSession =
                visit.url.pathname === '/logout' ||
                visit.url.pathname === '/settings/delete-account' ||
                (visit.url.pathname === '/settings/profile' &&
                    visit.method.toLowerCase() === 'delete');
        });
        const stopStart = router.on('start', () => {
            busyVisit.current = true;
        });
        const stopFinish = router.on('finish', () => {
            busyVisit.current = false;
        });
        const stopSuccess = router.on('success', (event) => {
            const props = event.detail.page.props as {
                auth?: { user?: { id?: number } | null };
            };
            if (!Object.hasOwn(props, 'auth')) return;
            const nextUserId = props.auth?.user?.id ?? null;
            if (
                (userId.current !== null && nextUserId !== userId.current) ||
                (closingSession && nextUserId === null)
            )
                endSession();
            userId.current = nextUserId;
            closingSession = false;
        });

        window.addEventListener('offline', onOffline);
        window.addEventListener('online', onOnline);
        window.addEventListener('focus', checkForUpdate);
        window.addEventListener('pageshow', onPageShow);
        document.addEventListener('input', markChanged);
        document.addEventListener('change', markChanged);

        if ('serviceWorker' in navigator && window.isSecureContext) {
            navigator.serviceWorker.addEventListener(
                'controllerchange',
                onControllerChange,
            );
            navigator.serviceWorker.addEventListener(
                'message',
                onWorkerMessage,
            );
            void navigator.serviceWorker
                .register('/sw.js', { updateViaCache: 'none' })
                .then((registration) => {
                    if (!active) return;
                    registrationRef.current = registration;
                    registration.addEventListener('updatefound', onUpdateFound);
                    if (
                        registration.waiting &&
                        navigator.serviceWorker.controller
                    )
                        showUpdate();
                })
                .catch(() => undefined);
        }
        return () => {
            active = false;
            if (updateTimer.current) clearTimeout(updateTimer.current);
            reloadAllowed.current = false;
            registrationRef.current?.removeEventListener(
                'updatefound',
                onUpdateFound,
            );
            installingWorker?.removeEventListener('statechange', onStateChange);
            navigator.serviceWorker?.removeEventListener(
                'controllerchange',
                onControllerChange,
            );
            navigator.serviceWorker?.removeEventListener(
                'message',
                onWorkerMessage,
            );
            window.removeEventListener('offline', onOffline);
            window.removeEventListener('online', onOnline);
            window.removeEventListener('focus', checkForUpdate);
            window.removeEventListener('pageshow', onPageShow);
            document.removeEventListener('input', markChanged);
            document.removeEventListener('change', markChanged);
            stopBefore();
            stopStart();
            stopFinish();
            stopSuccess();
            toast.dismiss(UPDATE_TOAST_ID);
        };
    }, [hasUnsavedWork, openUpdateDialog]);

    const applyUpdate = () => {
        if (!navigator.onLine) {
            setUpdateError(
                'Retrouve une connexion avant de recharger l’application.',
            );
            return;
        }
        if (hasUnsavedWork()) {
            setUpdateError(
                'Une saisie ou un envoi est encore en cours. Termine-le, puis quitte le formulaire avant de mettre à jour.',
            );
            return;
        }
        const waiting = registrationRef.current?.waiting;
        if (!waiting && reloadReady.current) {
            window.location.reload();
            return;
        }
        if (!waiting) {
            setUpdateError(
                'La mise à jour n’est plus en attente. Tu peux continuer et réessayer plus tard.',
            );
            return;
        }
        setUpdateError(null);
        setUpdating(true);
        reloadAllowed.current = true;
        waiting.postMessage({ type: 'SKIP_WAITING' });
        updateTimer.current = setTimeout(() => {
            reloadAllowed.current = false;
            setUpdating(false);
            setUpdateError(
                'L’activation prend plus de temps que prévu. Aucune page n’a été rechargée ; réessaie plus tard.',
            );
        }, 15_000);
    };

    return (
        <>
            {!online ? (
                <div
                    role="status"
                    className="pointer-events-none fixed inset-x-3 top-3 z-[70] mx-auto flex max-w-lg items-center gap-3 rounded-xl border border-amber-600/25 bg-card px-4 py-3 text-sm text-foreground shadow-lg"
                >
                    <WifiOff className="h-5 w-5 shrink-0 text-amber-700" />
                    <p>
                        <span className="font-semibold">Hors connexion.</span>{' '}
                        Les envois nécessitent Internet. Garde cette fenêtre
                        ouverte pour conserver ta saisie.
                    </p>
                </div>
            ) : null}
            {UpdateDialog ? (
                <UpdateDialog
                    open={updateOpen}
                    onOpenChange={(open) => {
                        if (!updating) setUpdateOpen(open);
                    }}
                    updating={updating}
                    error={updateError}
                    online={online}
                    onApply={applyUpdate}
                />
            ) : null}
        </>
    );
}
