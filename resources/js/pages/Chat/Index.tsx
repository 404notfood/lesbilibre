import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DatingLayout from '@/layouts/dating-layout';
import { Head, Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, MessageCircle, Sparkles } from 'lucide-react';

interface UserData {
    id: number;
    name: string;
    avatar_url: string | null;
}

interface Message {
    id: number;
    content: string;
    created_at: string;
}

interface Conversation {
    id: number;
    other_user: UserData;
    last_message: Message | null;
    unread_count: number;
}

export default function Index({
    conversations,
}: {
    conversations: Conversation[];
}) {
    return (
        <DatingLayout title="Messages" showOnlineUsers={true}>
            <Head title="Conversations" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                        Tes Conversations 💬
                    </h2>
                    <p className="text-muted-foreground">
                        {conversations.length > 0
                            ? `${conversations.length} conversation${conversations.length > 1 ? 's' : ''} active${conversations.length > 1 ? 's' : ''}`
                            : 'Aucune conversation pour le moment'}
                    </p>
                </div>

                {/* Conversations List */}
                {conversations.length > 0 ? (
                    <div className="space-y-3">
                        {conversations.map((conversation) => (
                            <Link
                                key={conversation.id}
                                href={`/conversations/${conversation.id}`}
                            >
                                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:scale-[1.01] hover:border-primary/40">
                                    <div className="flex items-center gap-4 p-4">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <Avatar className="h-16 w-16 border-2 border-primary/20 transition-all group-hover:border-primary/40">
                                                {conversation.other_user
                                                    .avatar_url ? (
                                                    <AvatarImage
                                                        src={
                                                            conversation
                                                                .other_user
                                                                .avatar_url
                                                        }
                                                        alt={
                                                            conversation
                                                                .other_user.name
                                                        }
                                                    />
                                                ) : (
                                                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-xl text-white">
                                                        {conversation.other_user.name
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-hidden">
                                            <div className="mb-1 flex items-center justify-between">
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    {
                                                        conversation.other_user
                                                            .name
                                                    }
                                                </h3>
                                                {conversation.last_message && (
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                conversation.last_message.created_at,
                                                            ),
                                                            {
                                                                addSuffix: true,
                                                                locale: fr,
                                                            },
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            {conversation.last_message ? (
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {
                                                        conversation
                                                            .last_message
                                                            .content
                                                    }
                                                </p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground/60 italic">
                                                    Aucun message
                                                </p>
                                            )}
                                        </div>

                                        {/* Unread Badge */}
                                        {conversation.unread_count > 0 && (
                                            <div className="flex-shrink-0">
                                                <Badge className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-primary-foreground">
                                                    {conversation.unread_count}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center px-4 py-16">
                        <div className="relative mb-6">
                            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                                <MessageCircle className="h-16 w-16 text-primary/40" />
                            </div>
                            <div className="absolute -top-2 -right-2">
                                <Sparkles className="h-8 w-8 text-accent" />
                            </div>
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-foreground">
                            Aucune conversation
                        </h3>
                        <p className="mb-6 max-w-md text-center text-muted-foreground">
                            Matche avec des profils pour commencer à discuter !
                        </p>
                        <Link href="/dashboard">
                            <Button className="btn-gradient">
                                Découvrir des profils
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </DatingLayout>
    );
}
