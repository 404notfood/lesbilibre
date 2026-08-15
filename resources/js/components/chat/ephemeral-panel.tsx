import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    Eye,
    EyeOff,
    Flag,
    Flame,
    Loader2,
    Lock,
    Play,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface EphemeralItem {
    id: number;
    type: 'photo' | 'video';
    is_naughty: boolean;
    is_mine: boolean;
    processing: boolean;
    failed: boolean;
    opened: boolean;
    replayed: boolean;
    replay_open: boolean;
    can_open: boolean;
    created_at: string;
}

export interface EphemeralSettings {
    replay_cost: number;
    free_replays: boolean;
    video_enabled: boolean;
    max_video_seconds: number;
}

/* ---------------------------------------------------------------------------
 * Composeur — bouton d'envoi éphémère
 * -------------------------------------------------------------------------*/
export function EphemeralComposer({
    conversationId,
    settings,
}: {
    conversationId: number;
    settings: EphemeralSettings;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [sensitive, setSensitive] = useState(false);
    const [sending, setSending] = useState(false);
    const [open, setOpen] = useState(false);

    const send = (file: File) => {
        const data = new FormData();
        data.append('file', file);
        data.append('is_naughty', sensitive ? '1' : '0');

        setSending(true);
        router.post(`/conversations/${conversationId}/ephemeral`, data, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setSending(false);
                setOpen(false);
                setSensitive(false);
                if (inputRef.current) inputRef.current.value = '';
            },
        });
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                disabled={sending}
                title="Envoyer un contenu éphémère"
                aria-label="Envoyer un contenu éphémère"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors disabled:opacity-50"
                style={{ background: 'var(--blush)', color: 'var(--wine-deep)' }}
            >
                {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Flame className="h-4 w-4" />
                )}
            </button>

            {open && (
                <div
                    className="absolute bottom-12 left-0 z-20 w-72 rounded-2xl border p-4 shadow-lg"
                    style={{
                        borderColor: 'var(--line)',
                        background: 'var(--paper)',
                    }}
                >
                    <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold">Envoi éphémère</h3>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Fermer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <p
                        className="mb-3 text-xs leading-relaxed"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        Visible une seule fois. Elle pourra le revoir une fois dans
                        les 24 h qui suivent son ouverture.
                    </p>

                    <label
                        className="mb-3 flex cursor-pointer items-center gap-2 text-xs"
                        style={{ color: 'var(--ink-soft)' }}
                    >
                        <input
                            type="checkbox"
                            checked={sensitive}
                            onChange={(e) => setSensitive(e.target.checked)}
                        />
                        <EyeOff className="h-3.5 w-3.5" />
                        Contenu coquin
                    </label>

                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="w-full rounded-lg px-3 py-2 text-sm font-semibold"
                        style={{ background: 'var(--ink)', color: 'var(--bg)' }}
                    >
                        Choisir un fichier
                    </button>

                    <p
                        className="mt-2 text-[11px]"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        {settings.video_enabled
                            ? `Photo ou vidéo (${settings.max_video_seconds} s max)`
                            : 'Photo uniquement'}
                    </p>

                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept={
                            settings.video_enabled
                                ? 'image/jpeg,image/png,video/mp4,video/quicktime'
                                : 'image/jpeg,image/png'
                        }
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) send(file);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

/* ---------------------------------------------------------------------------
 * Bulle — un contenu éphémère dans le fil
 * -------------------------------------------------------------------------*/
export function EphemeralBubble({
    item,
    settings,
}: {
    item: EphemeralItem;
    settings: EphemeralSettings;
}) {
    const [viewing, setViewing] = useState(false);

    const label = item.type === 'video' ? 'Vidéo éphémère' : 'Photo éphémère';

    // Côté expéditrice : on montre l'état, jamais le contenu.
    if (item.is_mine) {
        return (
            <div className="flex justify-end">
                <div
                    className="max-w-[70%] rounded-2xl rounded-br-sm px-4 py-3 text-sm"
                    style={{ background: 'var(--bg-soft)', color: 'var(--ink-soft)' }}
                >
                    <div className="flex items-center gap-2 font-medium">
                        <Flame className="h-3.5 w-3.5" />
                        {label}
                    </div>
                    <p className="mt-1 text-xs" style={{ color: 'var(--ink-mute)' }}>
                        {item.processing
                            ? 'Préparation en cours…'
                            : item.failed
                              ? 'Échec de l’envoi'
                              : item.replayed
                                ? 'Vue et revue'
                                : item.opened
                                  ? 'Vue'
                                  : 'Pas encore ouverte'}
                    </p>
                </div>
            </div>
        );
    }

    const spent = item.opened && (item.replayed || !item.replay_open);
    const isReplay = item.opened && !item.replayed && item.replay_open;

    return (
        <>
            <div className="flex justify-start">
                <button
                    type="button"
                    disabled={!item.can_open || item.processing}
                    onClick={() => setViewing(true)}
                    className={cn(
                        'max-w-[70%] rounded-2xl rounded-bl-sm px-4 py-3 text-left text-sm transition-transform',
                        item.can_open && 'hover:-translate-y-px',
                    )}
                    style={{
                        background: spent ? 'var(--bg-soft)' : 'var(--blush)',
                        color: spent ? 'var(--ink-mute)' : 'var(--wine-deep)',
                        opacity: item.can_open ? 1 : 0.75,
                    }}
                >
                    <span className="flex items-center gap-2 font-semibold">
                        {spent ? (
                            <Lock className="h-3.5 w-3.5" />
                        ) : item.type === 'video' ? (
                            <Play className="h-3.5 w-3.5" />
                        ) : (
                            <Eye className="h-3.5 w-3.5" />
                        )}
                        {label}
                        {item.is_naughty && (
                            <EyeOff className="h-3 w-3" aria-label="Contenu coquin" />
                        )}
                    </span>

                    <span className="mt-1 block text-xs">
                        {item.processing
                            ? 'Préparation en cours…'
                            : item.failed
                              ? 'Ce contenu n’a pas pu être préparé'
                              : spent
                                ? 'Plus disponible'
                                : isReplay
                                  ? settings.free_replays
                                    ? 'Revoir (inclus dans votre abonnement)'
                                    : `Revoir pour ${settings.replay_cost} gemmes`
                                  : 'Appuyez pour ouvrir — une seule fois'}
                    </span>
                </button>
            </div>

            {viewing && (
                <EphemeralViewer
                    item={item}
                    settings={settings}
                    isReplay={isReplay}
                    onClose={() => setViewing(false)}
                />
            )}
        </>
    );
}

/* ---------------------------------------------------------------------------
 * Visionneuse plein écran
 * -------------------------------------------------------------------------*/
function EphemeralViewer({
    item,
    settings,
    isReplay,
    onClose,
}: {
    item: EphemeralItem;
    settings: EphemeralSettings;
    isReplay: boolean;
    onClose: () => void;
}) {
    // Une revoyure payante doit être confirmée : personne ne dépense de
    // gemmes par un appui accidentel.
    const [confirmed, setConfirmed] = useState(
        !isReplay || settings.free_replays,
    );

    const report = () => {
        const reason = prompt(
            'Décrivez ce qui pose problème (10 caractères minimum) :',
        );
        if (!reason || reason.trim().length < 10) return;

        router.post(
            `/ephemeral/${item.id}/report`,
            { reason },
            { preserveScroll: true, onSuccess: onClose },
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'oklch(0% 0 0 / 0.92)' }}
            onContextMenu={(e) => e.preventDefault()}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-white"
                style={{ background: 'oklch(100% 0 0 / 0.15)' }}
            >
                <X className="h-5 w-5" />
            </button>

            {!confirmed ? (
                <div
                    className="w-full max-w-sm rounded-2xl p-6 text-center"
                    style={{ background: 'var(--paper)' }}
                >
                    <div
                        className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full"
                        style={{ background: 'var(--blush)', color: 'var(--wine-deep)' }}
                    >
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-xl font-medium">
                        Revoir ce contenu ?
                    </h2>
                    <p
                        className="mt-2 text-sm"
                        style={{ color: 'var(--ink-mute)' }}
                    >
                        Cela coûte {settings.replay_cost} gemmes et ne pourra plus
                        être fait ensuite.
                    </p>
                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setConfirmed(true)}
                            className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold"
                            style={{ background: 'var(--ink)', color: 'var(--bg)' }}
                        >
                            Revoir
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border px-4 py-2 text-sm font-semibold"
                            style={{ borderColor: 'var(--line)' }}
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex max-h-full w-full max-w-2xl flex-col items-center gap-3">
                    {item.type === 'video' ? (
                        <video
                            src={`/ephemeral/${item.id}`}
                            autoPlay
                            controls
                            controlsList="nodownload"
                            disablePictureInPicture
                            onContextMenu={(e) => e.preventDefault()}
                            className="max-h-[75vh] w-full rounded-xl"
                        />
                    ) : (
                        <img
                            src={`/ephemeral/${item.id}`}
                            alt=""
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                            className="max-h-[75vh] w-full select-none rounded-xl object-contain"
                        />
                    )}

                    <div className="flex items-center gap-3">
                        <p className="text-xs text-white/70">
                            {isReplay
                                ? 'Dernière visualisation'
                                : 'Vous pourrez le revoir une fois dans les 24 h'}
                        </p>
                        <button
                            type="button"
                            onClick={report}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                            style={{ background: 'oklch(100% 0 0 / 0.15)' }}
                        >
                            <Flag className="h-3 w-3" />
                            Signaler
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
