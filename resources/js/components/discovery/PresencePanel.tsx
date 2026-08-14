import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface PresenceUser {
    id: number;
    name: string;
    subtitle: string;
    avatar: string | null;
    online: boolean;
}

interface PresencePanelProps {
    users: PresenceUser[];
}

export default function PresencePanel({ users }: PresencePanelProps) {
    return (
        <aside className="hidden w-80 flex-col border-l border-border bg-card/70 p-5 backdrop-blur-sm xl:flex">
            <h2 className="text-lg font-semibold text-foreground">Presence vivante</h2>
            <p className="mt-1 text-sm text-muted-foreground">Signaux sociaux en direct</p>

            <div className="mt-5 space-y-3 overflow-y-auto">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="surface-glass soft-shadow flex items-center gap-3 rounded-2xl px-3 py-2.5"
                    >
                        <div className="relative">
                            <Avatar className="h-11 w-11 border border-border">
                                <AvatarImage src={user.avatar || undefined} />
                                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span
                                className={cn(
                                    'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card',
                                    user.online ? 'bg-success' : 'bg-muted',
                                )}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
