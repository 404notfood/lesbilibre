import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BlockedUser {
    id: number;
    blocked_at: string;
    reason?: string;
    user: {
        id: number;
        name: string;
        age?: number;
        city?: string;
        photo?: string;
    };
}

interface BlockedUsersProps {
    blockedUsers: BlockedUser[];
}

export default function BlockedUsers({ blockedUsers }: BlockedUsersProps) {
    const handleUnblock = (blockId: number) => {
        if (confirm('Êtes-vous sûre de vouloir débloquer cette utilisatrice ?')) {
            router.delete(`/block/${blockId}`);
        }
    };

    return (
        <DatingLayout title="Utilisateurs bloqués" showOnlineUsers={false}>
            <Head title="Utilisateurs bloqués" />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Utilisateurs bloqués</h1>
                        <p className="text-sm text-muted-foreground">
                            Gérez la liste des utilisatrices que vous avez bloquées
                        </p>
                    </div>
                </div>

                {blockedUsers.length === 0 ? (
                    <Card>
                        <CardContent className="pt-12 pb-12 text-center">
                            <UserX className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Aucun utilisateur bloqué</h3>
                            <p className="text-sm text-muted-foreground">
                                Vous n'avez bloqué aucune utilisatrice pour le moment.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {blockedUsers.length} utilisatrice{blockedUsers.length > 1 ? 's' : ''} bloquée{blockedUsers.length > 1 ? 's' : ''}
                        </p>

                        {blockedUsers.map((block) => (
                            <Card key={block.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={block.user.photo || ''} />
                                                <AvatarFallback className="text-lg bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                                                    {block.user.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {block.user.name}
                                                    {block.user.age && `, ${block.user.age}`}
                                                </h3>
                                                {block.user.city && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {block.user.city}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Bloquée {formatDistanceToNow(new Date(block.blocked_at), {
                                                        addSuffix: true,
                                                        locale: fr
                                                    })}
                                                </p>
                                                {block.reason && (
                                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                                        Raison : {block.reason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => handleUnblock(block.id)}
                                            variant="outline"
                                            className="border-primary/30 hover:bg-primary/10"
                                        >
                                            Débloquer
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="pt-4">
                    <Button
                        onClick={() => router.visit('/dashboard')}
                        variant="ghost"
                    >
                        ← Retour au tableau de bord
                    </Button>
                </div>
            </div>
        </DatingLayout>
    );
}
