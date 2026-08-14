import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';

interface ChatBubbleProps {
    message: {
        id: number;
        content: string;
        created_at: string;
        is_read?: boolean;
    };
    isSent: boolean;
    showAvatar?: boolean;
    avatarUrl?: string;
}

function formatMessageTime(date: string): string {
    const messageDate = new Date(date);

    if (isToday(messageDate)) {
        return format(messageDate, 'HH:mm', { locale: fr });
    }

    if (isYesterday(messageDate)) {
        return `Hier ${format(messageDate, 'HH:mm', { locale: fr })}`;
    }

    return format(messageDate, 'dd MMM HH:mm', { locale: fr });
}

export function ChatBubble({
    message,
    isSent,
    showAvatar = false,
    avatarUrl,
}: ChatBubbleProps): JSX.Element {
    return (
        <div className={cn('flex gap-2 mb-3', isSent && 'flex-row-reverse')}>
            {/* Avatar */}
            {showAvatar && (
                <div className="flex-shrink-0">
                    {!isSent && avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8" />
                    )}
                </div>
            )}

            {/* Message content */}
            <div className={cn('flex flex-col', isSent ? 'items-end' : 'items-start')}>
                <div
                    className={cn(
                        'max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5',
                        isSent
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                    )}
                >
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                    </p>
                </div>

                {/* Timestamp et statut de lecture */}
                <div
                    className={cn(
                        'flex items-center gap-1 mt-1 px-1',
                        isSent ? 'flex-row' : 'flex-row-reverse'
                    )}
                >
                    <span className="text-xs text-muted-foreground">
                        {formatMessageTime(message.created_at)}
                    </span>

                    {isSent && (
                        <span className="text-muted-foreground">
                            {message.is_read ? (
                                <CheckCheck className="h-3.5 w-3.5 text-primary" />
                            ) : (
                                <Check className="h-3.5 w-3.5" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
