import { Head, Link, router } from '@inertiajs/react';
import Echo from '@/echo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Send } from 'lucide-react';
import {
    EphemeralBubble,
    EphemeralComposer,
    type EphemeralItem,
    type EphemeralSettings,
} from '@/components/chat/ephemeral-panel';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Photo {
    path: string;
}

interface UserData {
    id: number;
    name: string;
    photos: Photo[];
}

interface Message {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
}

interface Conversation {
    id: number;
}

interface PaginatedMessages {
    data: Message[];
}

interface Props {
    conversation: Conversation;
    otherUser: UserData;
    messages: PaginatedMessages;
    canSendMessage?: boolean;
    ephemeral?: EphemeralItem[];
    ephemeralSettings: EphemeralSettings;
    auth: {
        user: {
            id: number;
        };
    };
}

export default function Show({
    conversation,
    otherUser,
    messages,
    canSendMessage = true,
    ephemeral = [],
    ephemeralSettings,
    auth,
}: Props) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [localMessages, setLocalMessages] = useState<Message[]>(messages.data);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Messages et contenus éphémères partagent un même fil chronologique.
    type TimelineEntry =
        | { kind: 'message'; at: number; message: Message }
        | { kind: 'ephemeral'; at: number; item: EphemeralItem };

    const timeline: TimelineEntry[] = [
        ...localMessages.map((m) => ({
            kind: 'message' as const,
            at: new Date(m.created_at).getTime(),
            message: m,
        })),
        ...ephemeral.map((e) => ({
            kind: 'ephemeral' as const,
            at: new Date(e.created_at).getTime(),
            item: e,
        })),
    ].sort((a, b) => a.at - b.at);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        setLocalMessages(messages.data);
    }, [messages]);

    useEffect(() => {
        scrollToBottom();
    }, [localMessages]);

    // Réception des messages en temps réel via le canal privé de la conversation
    useEffect(() => {
        const channelName = `conversation.${conversation.id}`;
        const channel = Echo.private(channelName);

        channel.listen('.MessageSent', (data: Message) => {
            setLocalMessages((prev) =>
                prev.some((msg) => msg.id === data.id) ? prev : [...prev, data],
            );
        });

        return () => {
            channel.stopListening('.MessageSent');
            Echo.leave(channelName);
        };
    }, [conversation.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) return;

        router.post(
            `/conversations/${conversation.id}/messages`,
            { content: message },
            {
                preserveScroll: true,
                onStart: () => setSending(true),
                onFinish: () => setSending(false),
                onSuccess: () => {
                    setMessage('');
                },
            }
        );
    };

    return (
        <>
            <Head title={`Chat avec ${otherUser.name}`} />

            <div className="flex h-screen flex-col bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                {/* En-tête */}
                <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <div className="container mx-auto flex items-center gap-4 px-4 py-4">
                        <Link href="/conversations">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>

                        <Link
                            href={`/profile/${otherUser.id}`}
                            className="flex items-center gap-3 hover:opacity-80"
                        >
                            <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-pink-100 to-purple-100">
                                {otherUser.photos?.[0] ? (
                                    <img
                                        src={`/storage/${otherUser.photos[0].path}`}
                                        alt={otherUser.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-lg font-bold text-pink-300">
                                        {otherUser.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {otherUser.name}
                            </h1>
                        </Link>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto">
                    <div className="container mx-auto px-4 py-6">
                        <div className="mx-auto max-w-3xl space-y-4">
                            {timeline.length > 0 ? (
                                timeline.map((entry) =>
                                    entry.kind === 'ephemeral' ? (
                                        <EphemeralBubble
                                            key={`e-${entry.item.id}`}
                                            item={entry.item}
                                            settings={ephemeralSettings}
                                        />
                                    ) : (
                                        (() => {
                                            const msg = entry.message;
                                            const isOwn = msg.sender_id === auth.user.id;
                                            return (
                                                <div
                                                    key={`m-${msg.id}`}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                                            isOwn
                                                                ? 'bg-pink-500 text-white'
                                                                : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
                                                        }`}
                                                    >
                                                        <p className="break-words">
                                                            {msg.content}
                                                        </p>
                                                        <p
                                                            className={`mt-1 text-xs ${
                                                                isOwn
                                                                    ? 'text-pink-100'
                                                                    : 'text-gray-500'
                                                            }`}
                                                        >
                                                            {format(
                                                                new Date(msg.created_at),
                                                                'HH:mm',
                                                                { locale: fr },
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ),
                                )
                            ) : (
                                <div className="py-12 text-center text-gray-500">
                                    Aucun message. Soyez la première à écrire !
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>

                {/* Zone de saisie */}
                <div className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <div className="container mx-auto px-4 py-4">
                        {canSendMessage ? (
                            <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
                                <EphemeralComposer
                                    conversationId={conversation.id}
                                    settings={ephemeralSettings}
                                />
                                <Input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    className="flex-1"
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    disabled={!message.trim() || sending}
                                    className="bg-pink-500 hover:bg-pink-600"
                                >
                                    {sending ? (
                                        <Spinner className="h-5 w-5" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <p className="mx-auto max-w-3xl rounded-lg bg-gray-100 px-4 py-3 text-center text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                Votre message a bien été envoyé. Attendez sa réponse pour
                                continuer la conversation.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
