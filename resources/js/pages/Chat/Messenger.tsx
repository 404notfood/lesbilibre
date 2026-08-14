import DatingLayout from '@/layouts/dating-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    MessageCircle,
    Clock,
    Send,
    Image as ImageIcon,
    Gift,
    Smile,
    MoreVertical,
    Phone,
    Video,
    Heart,
    MapPin,
    CheckCheck,
    Timer,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Echo from '@/echo';

interface Photo {
    path: string;
}

interface UserData {
    id: number;
    name: string;
    age?: number;
    city?: string;
    bio?: string;
    photos: Photo[];
    online?: boolean;
    lastSeen?: string;
}

interface Message {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
    read?: boolean;
}

interface Conversation {
    id: number;
    other_user: UserData;
    last_message: Message | null;
    unread_count: number;
    messages?: Message[];
}

interface Props {
    conversations: Conversation[];
    activeConversation?: Conversation;
    auth: {
        user: {
            id: number;
            name: string;
        };
    };
}

export default function Messenger({ conversations, activeConversation, auth }: Props) {
    const [message, setMessage] = useState('');
    const [selectedConversation, setSelectedConversation] = useState<Conversation | undefined>(
        activeConversation
    );
    const [localMessages, setLocalMessages] = useState<Message[]>(activeConversation?.messages || []);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [localMessages]);

    // Subscribe to real-time messages
    useEffect(() => {
        if (!selectedConversation) return;

        const channel = Echo.private(`conversation.${selectedConversation.id}`);

        channel.listen('MessageSent', (data: any) => {
            const newMessage: Message = {
                id: data.id,
                content: data.content,
                sender_id: data.sender_id,
                created_at: data.created_at,
                read: false,
            };

            setLocalMessages((prev) => [...prev, newMessage]);
        });

        return () => {
            channel.stopListening('MessageSent');
            Echo.leave(`conversation.${selectedConversation.id}`);
        };
    }, [selectedConversation?.id]);

    // Update local messages when conversation changes
    useEffect(() => {
        setLocalMessages(selectedConversation?.messages || []);
    }, [selectedConversation]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim() || !selectedConversation) return;

        router.post(
            `/conversations/${selectedConversation.id}/messages`,
            { content: message },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setMessage('');
                },
            }
        );
    };

    // Mock gifts data
    const gifts = [
        { id: 1, emoji: '❤️', name: 'Cœur', cost: 10 },
        { id: 2, emoji: '🌹', name: 'Rose', cost: 20 },
        { id: 3, emoji: '🎁', name: 'Cadeau', cost: 30 },
        { id: 4, emoji: '💎', name: 'Diamant', cost: 50 },
    ];

    return (
        <DatingLayout title="Messages" showOnlineUsers={false}>
            <Head title="Messagerie" />

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Conversations List */}
                <div className="w-96 border-r border-border flex flex-col bg-card">
                    <div className="p-4 border-b border-border">
                        <h2 className="text-xl font-bold mb-3">Mes Conversations 💬</h2>
                        <Input placeholder="Rechercher..." className="w-full" />
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.length > 0 ? (
                            <div className="p-2 space-y-1">
                                {conversations.map((conversation) => (
                                    <button
                                        key={conversation.id}
                                        onClick={() => setSelectedConversation(conversation)}
                                        className={`w-full text-left p-3 rounded-xl transition-all ${
                                            selectedConversation?.id === conversation.id
                                                ? 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-2 border-pink-500/20'
                                                : 'hover:bg-accent/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <Avatar className="h-14 w-14 border-2 border-pink-500/20">
                                                    {conversation.other_user.photos?.[0] ? (
                                                        <AvatarImage
                                                            src={`/storage/${conversation.other_user.photos[0].path}`}
                                                            alt={conversation.other_user.name}
                                                        />
                                                    ) : (
                                                        <AvatarFallback className="text-lg bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                                                            {conversation.other_user.name
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                {conversation.other_user.online && (
                                                    <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-card rounded-full" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold text-foreground">
                                                        {conversation.other_user.name}
                                                        {conversation.other_user.age && `, ${conversation.other_user.age}`}
                                                    </h3>
                                                    {conversation.last_message && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    conversation.last_message.created_at
                                                                ),
                                                                { locale: fr }
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                {conversation.last_message ? (
                                                    <p className="truncate text-sm text-muted-foreground">
                                                        {conversation.last_message.content}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm italic text-muted-foreground/60">
                                                        Aucun message
                                                    </p>
                                                )}
                                            </div>

                                            {/* Unread Badge */}
                                            {conversation.unread_count > 0 && (
                                                <Badge className="h-6 min-w-6 flex items-center justify-center rounded-full bg-pink-500 text-white px-2">
                                                    {conversation.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <MessageCircle className="h-16 w-16 text-muted-foreground/40 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Aucune conversation</h3>
                                <p className="text-sm text-muted-foreground">
                                    Commence à matcher pour discuter !
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                {selectedConversation ? (
                    <div className="flex-1 flex flex-col bg-background">
                        {/* Chat Header */}
                        <div className="h-20 border-b border-border bg-card px-6 flex items-center justify-between">
                            <Link
                                href={`/profile/${selectedConversation.other_user.id}`}
                                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                            >
                                <Avatar className="h-12 w-12 border-2 border-pink-500/20">
                                    {selectedConversation.other_user.photos?.[0] ? (
                                        <AvatarImage
                                            src={`/storage/${selectedConversation.other_user.photos[0].path}`}
                                            alt={selectedConversation.other_user.name}
                                        />
                                    ) : (
                                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                                            {selectedConversation.other_user.name
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div>
                                    <h2 className="font-bold text-lg">
                                        {selectedConversation.other_user.name}
                                        {selectedConversation.other_user.age && `, ${selectedConversation.other_user.age}`}
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm">
                                        {selectedConversation.other_user.online ? (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <span className="h-2 w-2 bg-green-600 rounded-full" />
                                                En ligne
                                            </span>
                                        ) : selectedConversation.other_user.lastSeen ? (
                                            <span className="text-muted-foreground">
                                                Vu{' '}
                                                {formatDistanceToNow(
                                                    new Date(selectedConversation.other_user.lastSeen),
                                                    {
                                                        addSuffix: true,
                                                        locale: fr,
                                                    }
                                                )}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">Hors ligne</span>
                                        )}
                                        {selectedConversation.other_user.city && (
                                            <>
                                                <span className="text-muted-foreground">•</span>
                                                <span className="flex items-center gap-1 text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    {selectedConversation.other_user.city}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Link>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon">
                                    <Phone className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Video className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-pink-50/30 to-purple-50/30 dark:from-gray-900 dark:to-gray-800">
                            <div className="max-w-4xl mx-auto space-y-4">
                                {/* Expiration Warning */}
                                <div className="flex items-center justify-center">
                                    <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                                        <Timer className="h-4 w-4" />
                                        La conversation expirera dans 48h si tu ne réponds pas
                                    </div>
                                </div>

                                {localMessages.map((msg) => {
                                    const isOwn = msg.sender_id === auth.user.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                                                    isOwn
                                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                                                        : 'bg-white dark:bg-gray-800 text-foreground border border-border'
                                                }`}
                                            >
                                                <p className="break-words">{msg.content}</p>
                                                <div
                                                    className={`flex items-center justify-end gap-1 mt-2 text-xs ${
                                                        isOwn
                                                            ? 'text-white/80'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    <span>
                                                        {format(new Date(msg.created_at), 'HH:mm', {
                                                            locale: fr,
                                                        })}
                                                    </span>
                                                    {isOwn && msg.read && (
                                                        <CheckCheck className="h-3 w-3" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-border bg-card p-4">
                            <div className="max-w-4xl mx-auto">
                                {/* Quick Gifts */}
                                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                                    <span className="text-sm text-muted-foreground">
                                        Envoyer un cadeau :
                                    </span>
                                    {gifts.map((gift) => (
                                        <button
                                            key={gift.id}
                                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-500/20 hover:from-amber-400/30 hover:to-orange-500/30 transition-all border border-amber-500/30"
                                        >
                                            <span className="text-lg">{gift.emoji}</span>
                                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                                {gift.cost}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="flex-shrink-0"
                                    >
                                        <ImageIcon className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="flex-shrink-0"
                                    >
                                        <Gift className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="flex-shrink-0"
                                    >
                                        <Smile className="h-5 w-5" />
                                    </Button>

                                    <Input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Écris ton message..."
                                        className="flex-1 h-12"
                                        autoFocus
                                    />

                                    <Button
                                        type="submit"
                                        disabled={!message.trim()}
                                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 h-12 px-6"
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* No Conversation Selected */
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-pink-50/30 to-purple-50/30 dark:from-gray-900 dark:to-gray-800">
                        <div className="text-center">
                            <MessageCircle className="h-24 w-24 text-muted-foreground/40 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold mb-2">Tes Messages</h3>
                            <p className="text-muted-foreground max-w-md">
                                Sélectionne une conversation pour commencer à discuter
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </DatingLayout>
    );
}
