import DatingLayout from '@/layouts/dating-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    Gem,
    Heart,
    Lock,
    MessageCircle,
    Shield,
    Trash2,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    data: Record<string, unknown> | null;
    is_read: boolean;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    notifications: {
        data: Notification[];
        links: PaginationLink[];
        total: number;
    };
    unreadCount: number;
}

const TYPE_ICONS: Record<string, typeof Bell> = {
    like: Heart,
    match: Sparkles,
    message: MessageCircle,
    gallery_access: Lock,
    gems: Gem,
    verification: Shield,
};

export default function Index({ notifications, unreadCount }: Props) {
    const markAllAsRead = () => {
        router.post('/notifications/mark-all-read', {}, { preserveScroll: true });
    };

    const markAsRead = (id: number) => {
        router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
    };

    const destroy = (id: number) => {
        router.delete(`/notifications/${id}`, { preserveScroll: true });
    };

    return (
        <DatingLayout title="Notifications" showOnlineUsers={false}>
            <Head title="Notifications" />

            <main className="container-responsive max-w-3xl py-8">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="editorial-eyebrow text-muted-foreground">
                            {notifications.total} au total
                        </p>
                        <h1 className="mt-1 text-3xl font-semibold">Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="text-muted-foreground mt-1 text-sm">
                                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllAsRead}>
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>

                {notifications.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <div className="bg-muted text-muted-foreground grid h-14 w-14 place-items-center rounded-full">
                                <BellOff className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-semibold">
                                Aucune notification
                            </h2>
                            <p className="text-muted-foreground max-w-sm text-sm">
                                Vos likes, matchs et messages apparaîtront ici.
                            </p>
                            <Button asChild className="mt-2">
                                <Link href="/dashboard">Découvrir des profils</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex flex-col gap-2">
                        {notifications.data.map((notification) => {
                            const Icon = TYPE_ICONS[notification.type] ?? Bell;

                            return (
                                <Card
                                    key={notification.id}
                                    className={cn(
                                        'transition-colors',
                                        !notification.is_read && 'border-primary/40',
                                    )}
                                >
                                    <CardContent className="flex items-start gap-3 p-4">
                                        <div
                                            className={cn(
                                                'grid h-10 w-10 shrink-0 place-items-center rounded-full',
                                                notification.is_read
                                                    ? 'bg-muted text-muted-foreground'
                                                    : 'bg-primary/10 text-primary',
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h2 className="truncate text-sm font-semibold">
                                                    {notification.title}
                                                </h2>
                                                {!notification.is_read && (
                                                    <span
                                                        className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full"
                                                        aria-label="Non lue"
                                                    />
                                                )}
                                            </div>
                                            <p className="text-muted-foreground mt-0.5 text-sm">
                                                {notification.message}
                                            </p>
                                            <p className="text-muted-foreground mt-2 text-xs">
                                                {new Date(
                                                    notification.created_at,
                                                ).toLocaleString('fr-FR')}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 gap-1">
                                            {!notification.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        markAsRead(notification.id)
                                                    }
                                                    aria-label="Marquer comme lue"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => destroy(notification.id)}
                                                aria-label="Supprimer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {notifications.links.length > 3 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-1">
                        {notifications.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() =>
                                    link.url && router.visit(link.url, { preserveScroll: true })
                                }
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </main>
        </DatingLayout>
    );
}
