import { useEffect, useState } from 'react';
import { Bell, Heart, Users, Check } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { getEcho } from '@/echo';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface NotificationUser {
    id: number;
    name: string;
    photo: string | null;
}

interface Notification {
    id: number;
    type: 'like' | 'match';
    message: string;
    user: NotificationUser;
    created_at: string;
}

interface NotificationBellProps {
    userId: number;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // La cloche est montée dans le layout : une notification mal formée (émettrice
    // supprimée, payload d'une ancienne version) ferait tomber toutes les pages.
    // On écarte ici tout ce qui n'est pas affichable.
    const isRenderable = (notification: Notification | null | undefined): boolean =>
        Boolean(notification?.user?.id && notification.user.name);

    const fetchNotifications = async (): Promise<void> => {
        try {
            const response = await fetch('/notifications/unread');
            const data = await response.json();
            setNotifications((data.notifications ?? []).filter(isRenderable));
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        // Chargement initial depuis l'API, puis abonnement aux évènements temps réel.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchNotifications();

        // Temps réel non configuré : la cloche reste alimentée par le fetch
        // initial, sans websocket.
        const echo = getEcho();

        if (echo === null) {
            return;
        }

        const channel = echo.private(`App.Models.User.${userId}`);

        const pushNotification = (data: Notification): void => {
            if (! isRenderable(data)) {
                return;
            }

            setNotifications((prev) => [data, ...prev].slice(0, 10));
            setUnreadCount((prev) => prev + 1);
        };

        channel.listen('.LikeReceived', pushNotification);
        channel.listen('.MatchCreated', pushNotification);

        return () => {
            channel.stopListening('.LikeReceived');
            channel.stopListening('.MatchCreated');
            echo.leave(`App.Models.User.${userId}`);
        };
    }, [userId]);

    const markAllAsRead = () => {
        router.post('/notifications/mark-all-read', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setUnreadCount(0);
                fetchNotifications();
            },
        });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <Heart className="h-4 w-4 text-pink-500" />;
            case 'match':
                return <Users className="h-4 w-4 text-purple-500" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Aucune notification</p>
                    </div>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                asChild
                                className="cursor-pointer"
                            >
                                <Link
                                    href={
                                        notification.type === 'like'
                                            ? '/likes/received'
                                            : `/profile/${notification.user.id}`
                                    }
                                    className="flex items-start gap-3 px-4 py-3"
                                >
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarImage
                                            src={notification.user.photo || undefined}
                                            alt={notification.user.name}
                                        />
                                        <AvatarFallback>
                                            {notification.user.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {getNotificationIcon(notification.type)}
                                            <p className="text-sm font-medium truncate">
                                                {notification.user.name}
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(
                                                new Date(notification.created_at),
                                                { addSuffix: true, locale: fr }
                                            )}
                                        </p>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href="/notifications"
                                className="w-full text-center py-2 text-sm font-medium text-primary"
                            >
                                Voir toutes les notifications
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
