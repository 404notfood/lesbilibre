import {
    EphemeralBubble,
    EphemeralComposer,
    type EphemeralItem,
    type EphemeralSettings,
} from '@/components/chat/ephemeral-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { getEcho } from '@/echo';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Send } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UserData {
    id: number;
    name: string;
    avatar_url: string | null;
}
interface Message {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
    read_at?: string | null;
    moderation_status?: 'pending' | 'approved' | 'rejected';
    moderation_reason?: string | null;
}
interface Props {
    conversation: { id: number };
    otherUser: UserData;
    messages: { data: Message[]; next_page_url?: string | null };
    messageCursor?: number;
    archived?: boolean;
    canSendMessage?: boolean;
    intimateConsent?: boolean;
    recipientIntimateConsent?: boolean;
    ephemeral?: EphemeralItem[];
    ephemeralSettings: EphemeralSettings;
    auth: { user: { id: number } };
}
interface SyncResponse {
    messages: Message[];
    has_more: boolean;
    cursor: number;
    canSendMessage: boolean;
    intimateConsent: boolean;
    recipientIntimateConsent: boolean;
    ephemeral: EphemeralItem[];
}
const emptyEphemeral: EphemeralItem[] = [];
const mergeMessages = (previous: Message[], incoming: Message[]): Message[] =>
    [
        ...new Map(
            [...previous, ...incoming].map((item) => [item.id, item]),
        ).values(),
    ].sort((a, b) => a.id - b.id);
const createClientUuid = (): string => {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = [...bytes]
        .map((value) => value.toString(16).padStart(2, '0'))
        .join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export default function Show({
    conversation,
    otherUser,
    messages,
    messageCursor = 0,
    archived = false,
    canSendMessage = true,
    intimateConsent = false,
    recipientIntimateConsent = false,
    ephemeral = emptyEphemeral,
    ephemeralSettings,
    auth,
}: Props) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [syncError, setSyncError] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [online, setOnline] = useState(
        () => typeof navigator === 'undefined' || navigator.onLine,
    );
    const [localMessages, setLocalMessages] = useState(messages.data);
    const [localEphemeral, setLocalEphemeral] = useState(ephemeral);
    const [allowed, setAllowed] = useState(canSendMessage);
    const [unavailable, setUnavailable] = useState(archived);
    const [myConsent, setMyConsent] = useState(intimateConsent);
    const [theirConsent, setTheirConsent] = useState(recipientIntimateConsent);
    const [hasOlder, setHasOlder] = useState(Boolean(messages.next_page_url));
    const [loadingOlder, setLoadingOlder] = useState(false);
    const currentId = useRef(conversation.id);
    const syncedId = useRef(conversation.id);
    const changeCursor = useRef(messageCursor);
    const syncingRef = useRef(false);
    const clientAttempt = useRef<{ uuid: string; content: string } | null>(
        null,
    );
    const acknowledged = useRef(new Set<number>());
    const scrollPanel = useRef<HTMLDivElement>(null);
    const stickToBottom = useRef(true);
    const messagesEnd = useRef<HTMLDivElement>(null);
    currentId.current = conversation.id;

    useEffect(() => {
        const changed = syncedId.current !== conversation.id;
        if (changed) {
            syncedId.current = conversation.id;
            acknowledged.current.clear();
            changeCursor.current = messageCursor;
            clientAttempt.current = null;
            stickToBottom.current = true;
        }
        setLocalMessages((previous) =>
            changed ? messages.data : mergeMessages(previous, messages.data),
        );
        setAllowed(canSendMessage);
        setUnavailable(archived);
        setMyConsent(intimateConsent);
        setTheirConsent(recipientIntimateConsent);
        if (changed) setHasOlder(Boolean(messages.next_page_url));
    }, [
        conversation.id,
        messages,
        messageCursor,
        canSendMessage,
        archived,
        intimateConsent,
        recipientIntimateConsent,
    ]);

    useEffect(() => setLocalEphemeral(ephemeral), [conversation.id, ephemeral]);

    const syncMessages = useCallback(async () => {
        if (
            archived ||
            syncingRef.current ||
            !navigator.onLine ||
            document.visibilityState !== 'visible'
        )
            return;
        syncingRef.current = true;
        setSyncing(true);
        const id = conversation.id;
        let after = changeCursor.current;
        try {
            let more = true;
            while (more && currentId.current === id) {
                const response = await fetch(
                    `/conversations/${id}/messages/sync?after_change_id=${after}`,
                    {
                        headers: { Accept: 'application/json' },
                        cache: 'no-store',
                    },
                );
                if (response.status === 403 || response.status === 404) {
                    setUnavailable(true);
                    setAllowed(false);
                    return;
                }
                if (!response.ok) throw new Error('sync failed');
                const data: SyncResponse = await response.json();
                if (currentId.current !== id) return;
                setLocalMessages((previous) =>
                    mergeMessages(previous, data.messages),
                );
                setAllowed(data.canSendMessage);
                setMyConsent(data.intimateConsent);
                setTheirConsent(data.recipientIntimateConsent);
                setLocalEphemeral(data.ephemeral);
                setSyncError('');
                const next = Math.max(after, data.cursor);
                more = data.has_more && next > after;
                after = next;
                changeCursor.current = Math.max(changeCursor.current, next);
            }
        } catch {
            if (currentId.current === id)
                setSyncError(
                    'Synchronisation interrompue. Ton texte est conservé ; réessaie pour retrouver les derniers messages.',
                );
        } finally {
            syncingRef.current = false;
            if (currentId.current === id) setSyncing(false);
        }
    }, [archived, conversation.id]);

    useEffect(() => {
        const recover = () => {
            setOnline(navigator.onLine);
            void syncMessages();
        };
        const offline = () => setOnline(false);
        window.addEventListener('online', recover);
        window.addEventListener('offline', offline);
        window.addEventListener('focus', recover);
        document.addEventListener('visibilitychange', recover);
        const timer = window.setInterval(recover, 30000);
        const echo = getEcho();
        const channelName = `conversation.${conversation.id}`;
        const channel = !archived ? echo?.private(channelName) : undefined;
        const connection = echo?.connector.pusher.connection;
        channel?.listen('.MessageSent', (data: Message) => {
            if (currentId.current !== conversation.id) return;
            setLocalMessages((previous) => mergeMessages(previous, [data]));
            void syncMessages();
        });
        connection?.bind('connected', recover);
        void syncMessages();
        return () => {
            window.removeEventListener('online', recover);
            window.removeEventListener('offline', offline);
            window.removeEventListener('focus', recover);
            document.removeEventListener('visibilitychange', recover);
            window.clearInterval(timer);
            connection?.unbind('connected', recover);
            channel?.stopListening('.MessageSent');
            if (channel) echo?.leave(channelName);
        };
    }, [archived, conversation.id, syncMessages]);

    useEffect(() => {
        if (stickToBottom.current)
            messagesEnd.current?.scrollIntoView({ behavior: 'auto' });
    }, [localMessages]);

    useEffect(() => {
        if (archived || unavailable || !scrollPanel.current) return;
        const pending = new Set<number>();
        let timer: ReturnType<typeof setTimeout> | undefined;
        const flush = async () => {
            if (
                document.visibilityState !== 'visible' ||
                !navigator.onLine ||
                !pending.size
            )
                return;
            const ids = [...pending].slice(0, 100);
            pending.clear();
            const token =
                document.querySelector<HTMLMetaElement>(
                    'meta[name="csrf-token"]',
                )?.content ?? '';
            try {
                const response = await fetch(
                    `/conversations/${conversation.id}/messages/read`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            'X-CSRF-TOKEN': token,
                        },
                        body: JSON.stringify({ ids }),
                    },
                );
                if (response.ok)
                    ids.forEach((id) => acknowledged.current.add(id));
            } catch {
                /* The next visible observation can retry; reading never blocks the chat. */
            }
        };
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const id = Number(
                        (entry.target as HTMLElement).dataset.messageId,
                    );
                    if (
                        entry.isIntersecting &&
                        entry.intersectionRatio >= 0.6 &&
                        !acknowledged.current.has(id)
                    )
                        pending.add(id);
                }
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => void flush(), 200);
            },
            { root: scrollPanel.current, threshold: 0.6 },
        );
        scrollPanel.current
            .querySelectorAll<HTMLElement>('[data-message-id]')
            .forEach((element) => observer.observe(element));
        return () => {
            observer.disconnect();
            if (timer) clearTimeout(timer);
        };
    }, [archived, unavailable, conversation.id, localMessages]);

    const loadOlder = async () => {
        if (!localMessages.length || loadingOlder || (unavailable && !archived))
            return;
        setLoadingOlder(true);
        const panel = scrollPanel.current;
        const previousHeight = panel?.scrollHeight ?? 0;
        stickToBottom.current = false;
        try {
            const before = Math.min(...localMessages.map((item) => item.id));
            const response = await fetch(
                `/conversations/${conversation.id}/messages/sync?before_id=${before}`,
                { headers: { Accept: 'application/json' }, cache: 'no-store' },
            );
            if (!response.ok) throw new Error('history failed');
            const data: SyncResponse = await response.json();
            setLocalMessages((previous) =>
                mergeMessages(previous, data.messages),
            );
            setHasOlder(data.has_more);
            requestAnimationFrame(() => {
                if (panel)
                    panel.scrollTop += panel.scrollHeight - previousHeight;
            });
        } catch {
            setSyncError(
                'Les messages précédents n’ont pas pu être chargés. Réessaie.',
            );
        } finally {
            setLoadingOlder(false);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!message.trim() || sending || !online || !allowed || unavailable)
            return;
        if (!clientAttempt.current || clientAttempt.current.content !== message)
            clientAttempt.current = {
                uuid: createClientUuid(),
                content: message,
            };
        setSendError('');
        stickToBottom.current = true;
        const submittedContent = message;
        router.post(
            `/conversations/${conversation.id}/messages`,
            { content: message, client_uuid: clientAttempt.current.uuid },
            {
                preserveScroll: true,
                onStart: () => setSending(true),
                onFinish: () => setSending(false),
                onSuccess: (page) => {
                    const flash = page.props.flash as
                        | { error?: string }
                        | undefined;
                    if (flash?.error) setSendError(flash.error);
                    else {
                        setMessage((draft) =>
                            draft === submittedContent ? '' : draft,
                        );
                        if (clientAttempt.current?.content === submittedContent)
                            clientAttempt.current = null;
                    }
                },
                onError: (errors) =>
                    setSendError(
                        errors.content ||
                            'Le message n’a pas pu être envoyé. Ton texte est conservé ; tu peux réessayer.',
                    ),
            },
        );
    };

    type Entry =
        | { kind: 'message'; at: number; message: Message }
        | { kind: 'ephemeral'; at: number; item: EphemeralItem };
    const timeline: Entry[] = [
        ...localMessages.map((item) => ({
            kind: 'message' as const,
            at: new Date(item.created_at).getTime(),
            message: item,
        })),
        ...localEphemeral.map((item) => ({
            kind: 'ephemeral' as const,
            at: new Date(item.created_at).getTime(),
            item,
        })),
    ].sort(
        (a, b) =>
            a.at - b.at ||
            (a.kind === 'message' && b.kind === 'message'
                ? a.message.id - b.message.id
                : 0),
    );

    return (
        <>
            <Head title={`Chat avec ${otherUser.name}`} />
            <div className="flex h-dvh flex-col bg-background text-foreground">
                <header className="shrink-0 border-b border-border bg-card">
                    <div className="container mx-auto flex items-center gap-4 px-4 py-4">
                        <Link
                            href="/conversations"
                            aria-label="Revenir aux conversations"
                            className="inline-flex min-h-11 min-w-11 items-center justify-center"
                        >
                            <ArrowLeft className="size-5" />
                        </Link>
                        <div className="flex min-w-0 items-center gap-3">
                            {otherUser.avatar_url ? (
                                <img
                                    src={otherUser.avatar_url}
                                    alt=""
                                    className="size-10 rounded-full object-cover"
                                />
                            ) : (
                                <span
                                    aria-hidden
                                    className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground"
                                >
                                    {otherUser.name.slice(0, 1)}
                                </span>
                            )}
                            {archived ? (
                                <h1 className="truncate text-lg font-semibold">
                                    Compte supprimé
                                </h1>
                            ) : (
                                <Link
                                    href={`/profile/${otherUser.id}`}
                                    className="truncate text-lg font-semibold"
                                >
                                    {otherUser.name}
                                </Link>
                            )}
                        </div>
                    </div>
                </header>
                {!unavailable && (
                    <div className="mx-auto w-full max-w-3xl shrink-0 border-b border-border p-4 text-sm">
                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={myConsent}
                                onChange={(event) =>
                                    router.put(
                                        `/conversations/${conversation.id}/intimate-consent`,
                                        { accepted: event.target.checked },
                                        { preserveScroll: true },
                                    )
                                }
                            />
                            J’autorise cette personne à m’envoyer des médias
                            intimes. Je peux retirer cette autorisation à tout
                            moment.
                        </label>
                        <p className="mt-2 text-muted-foreground">
                            {theirConsent
                                ? 'Votre interlocutrice autorise la réception de médias intimes, dans le respect de ses limites.'
                                : 'Votre interlocutrice n’a pas autorisé la réception de médias intimes.'}
                        </p>
                    </div>
                )}
                <div
                    ref={scrollPanel}
                    className="min-h-0 flex-1 overflow-y-auto"
                    onScroll={() => {
                        const panel = scrollPanel.current;
                        if (panel)
                            stickToBottom.current =
                                panel.scrollHeight -
                                    panel.scrollTop -
                                    panel.clientHeight <
                                100;
                    }}
                >
                    <div className="container mx-auto px-4 py-6">
                        <div className="mx-auto max-w-3xl space-y-4">
                            {hasOlder && (!unavailable || archived) && (
                                <Button
                                    variant="outline"
                                    onClick={() => void loadOlder()}
                                    disabled={loadingOlder}
                                >
                                    {loadingOlder
                                        ? 'Chargement…'
                                        : 'Charger les messages précédents'}
                                </Button>
                            )}
                            {timeline.length ? (
                                timeline.map((entry) =>
                                    entry.kind === 'ephemeral' ? (
                                        <EphemeralBubble
                                            key={`e-${entry.item.id}`}
                                            item={entry.item}
                                            settings={ephemeralSettings}
                                        />
                                    ) : (
                                        <div
                                            key={`m-${entry.message.id}`}
                                            data-message-id={
                                                entry.message.sender_id !==
                                                    auth.user.id &&
                                                entry.message
                                                    .moderation_status ===
                                                    'approved'
                                                    ? entry.message.id
                                                    : undefined
                                            }
                                            className={`flex ${entry.message.sender_id === auth.user.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-2xl px-4 py-2 sm:max-w-[70%] ${entry.message.sender_id === auth.user.id ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-card-foreground'}`}
                                            >
                                                <p className="break-words whitespace-pre-wrap">
                                                    {entry.message.content}
                                                </p>
                                                <p className="mt-1 text-xs opacity-75">
                                                    {format(
                                                        new Date(
                                                            entry.message.created_at,
                                                        ),
                                                        'HH:mm',
                                                        { locale: fr },
                                                    )}
                                                </p>
                                                {entry.message.sender_id ===
                                                    auth.user.id &&
                                                    entry.message
                                                        .moderation_status !==
                                                        'approved' && (
                                                        <p
                                                            role="status"
                                                            className="mt-2 text-xs font-semibold"
                                                        >
                                                            {entry.message
                                                                .moderation_status ===
                                                            'rejected'
                                                                ? 'Refusé par la modération — non transmis'
                                                                : 'En attente de validation — non transmis'}
                                                            {entry.message
                                                                .moderation_reason
                                                                ? ` : ${entry.message.moderation_reason}`
                                                                : ''}
                                                        </p>
                                                    )}
                                            </div>
                                        </div>
                                    ),
                                )
                            ) : (
                                <p className="py-12 text-center text-muted-foreground">
                                    Aucun message. Soyez la première à écrire !
                                </p>
                            )}
                            <div ref={messagesEnd} />
                        </div>
                    </div>
                </div>
                <div className="shrink-0 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
                    <div className="container mx-auto px-4 py-4">
                        {!unavailable && (
                            <p className="mx-auto mb-3 max-w-3xl text-sm text-muted-foreground">
                                Chaque message est soumis à validation
                                administrative avant d’être visible par sa
                                destinataire. Aucun e-mail ne peut être partagé
                                ; utilisez uniquement vos pseudos.
                            </p>
                        )}
                        {(!online || sendError || syncError) && (
                            <p
                                role="status"
                                className="mx-auto mb-3 max-w-3xl text-sm text-destructive"
                            >
                                {!online
                                    ? 'Connexion interrompue. Ton texte reste ici ; tu pourras l’envoyer une fois reconnectée.'
                                    : sendError || syncError}
                            </p>
                        )}
                        {syncError && online && !unavailable && (
                            <Button
                                variant="outline"
                                className="mb-3"
                                onClick={() => void syncMessages()}
                                disabled={syncing}
                            >
                                Resynchroniser les messages
                            </Button>
                        )}
                        {unavailable ? (
                            <p className="mx-auto max-w-3xl text-center text-sm text-muted-foreground">
                                {archived
                                    ? 'Ce compte a été supprimé. La conversation est archivée et aucun nouvel envoi n’est possible.'
                                    : 'Cette conversation n’est plus disponible pour de nouveaux échanges.'}
                            </p>
                        ) : allowed ? (
                            <form
                                onSubmit={handleSubmit}
                                data-pwa-unsaved={Boolean(message.trim())}
                                data-pwa-busy={sending}
                                className="mx-auto flex max-w-3xl gap-2"
                            >
                                <EphemeralComposer
                                    conversationId={conversation.id}
                                    settings={ephemeralSettings}
                                />
                                <Input
                                    value={message}
                                    onChange={(event) =>
                                        setMessage(event.target.value)
                                    }
                                    placeholder="Écrivez votre message..."
                                    aria-label="Ton message"
                                    className="flex-1"
                                    maxLength={5000}
                                />
                                <Button
                                    type="submit"
                                    disabled={
                                        !message.trim() || sending || !online
                                    }
                                    aria-label={
                                        sending
                                            ? 'Envoi en cours'
                                            : 'Envoyer le message'
                                    }
                                    className="min-h-11 min-w-11"
                                >
                                    {sending ? (
                                        <Spinner className="size-5" />
                                    ) : (
                                        <Send className="size-5" />
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <p className="mx-auto max-w-3xl text-center text-sm text-muted-foreground">
                                {localMessages.some(
                                    (item) =>
                                        item.sender_id === auth.user.id &&
                                        item.moderation_status === 'pending',
                                )
                                    ? 'Ton introduction attend la validation de l’administration. Elle reste invisible pour la destinataire jusque-là.'
                                    : 'Ton introduction a été validée. Attends sa réponse pour continuer ; une absence de réponse ne t’oblige pas à relancer.'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
