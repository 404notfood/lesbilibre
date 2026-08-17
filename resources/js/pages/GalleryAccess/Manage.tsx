import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Unlock, X, Eye, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Photo {
    path: string;
}

interface UserData {
    id: number;
    name: string;
    pseudo?: string;
    photos: Photo[];
}

interface GalleryAccess {
    id: number;
    requester: UserData;
    owner: UserData;
    created_at: string;
}

interface ManageProps {
    accessGranted: GalleryAccess[];
    accessReceived: GalleryAccess[];
}

interface AccessCardProps {
    access: GalleryAccess;
    type: 'granted' | 'received';
    processing: number | null;
    onRevoke: (requestId: number) => void;
}

function AccessCard({ access, type, processing, onRevoke }: AccessCardProps): JSX.Element {
    const user = type === 'granted' ? access.requester : access.owner;
    const isGranted = type === 'granted';

    return (
        <Card className="overflow-hidden transition-all hover:border-primary/40">
            <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                    <div className="relative flex-shrink-0">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                            {user.photos?.[0] ? (
                                <AvatarImage src={`/storage/${user.photos[0].path}`} alt={user.pseudo || user.name} />
                            ) : (
                                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-xl text-white">
                                    {(user.pseudo || user.name).slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 rounded-full p-1 ${isGranted ? 'bg-green-500' : 'bg-blue-500'}`}>
                            {isGranted ? <Unlock className="h-3 w-3 text-white" /> : <Eye className="h-3 w-3 text-white" />}
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <h3 className="text-lg font-semibold text-foreground">{user.pseudo || user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {isGranted ? 'Peut voir ta galerie privee' : 'Tu peux voir sa galerie privee'}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <UserCheck className="h-3 w-3" />
                            <span>Depuis le {format(new Date(access.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 pt-0">
                    <Button
                        variant="outline"
                        className="w-full border-red-500/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => onRevoke(access.id)}
                        disabled={processing === access.id}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Revoquer l acces
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function EmptyState({ type }: { type: 'granted' | 'received' }): JSX.Element {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-16">
            <div className="relative mb-6">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                    {type === 'granted' ? <Unlock className="h-16 w-16 text-primary/40" /> : <Eye className="h-16 w-16 text-primary/40" />}
                </div>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-foreground">
                {type === 'granted' ? 'Aucun acces accorde' : 'Aucun acces recu'}
            </h3>
            <p className="max-w-md text-center text-muted-foreground">
                {type === 'granted'
                    ? "Tu n as accorde l acces a ta galerie privee a personne pour le moment."
                    : "Tu n as acces a aucune galerie privee pour le moment."}
            </p>
        </div>
    );
}

export default function Manage({ accessGranted, accessReceived }: ManageProps) {
    const [processing, setProcessing] = useState<number | null>(null);

    const handleRevoke = (requestId: number): void => {
        if (confirm('Etes-vous sure de vouloir revoquer cet acces ?')) {
            setProcessing(requestId);
            router.delete(`/gallery-access/${requestId}`, {
                preserveScroll: true,
                onFinish: () => setProcessing(null),
            });
        }
    };

    return (
        <DatingLayout title="Gerer les acces">
            <Head title="Gerer les acces galerie" />

            <div className="space-y-6 p-6">
                <div className="space-y-2">
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                        <Lock className="h-6 w-6 text-primary" />
                        Gerer les acces galerie
                    </h2>
                    <p className="text-muted-foreground">
                        Controle qui peut voir ta galerie privee et les galeries auxquelles tu as acces.
                    </p>
                </div>

                <Tabs defaultValue="granted" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="granted" className="relative">
                            Acces accordes
                            {accessGranted.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {accessGranted.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="received" className="relative">
                            Acces recus
                            {accessReceived.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {accessReceived.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="granted" className="mt-6">
                        {accessGranted.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {accessGranted.map((access) => (
                                    <AccessCard key={access.id} access={access} type="granted" processing={processing} onRevoke={handleRevoke} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState type="granted" />
                        )}
                    </TabsContent>

                    <TabsContent value="received" className="mt-6">
                        {accessReceived.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {accessReceived.map((access) => (
                                    <AccessCard key={access.id} access={access} type="received" processing={processing} onRevoke={handleRevoke} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState type="received" />
                        )}
                    </TabsContent>
                </Tabs>

                <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 dark:border-pink-800 dark:from-pink-950/20 dark:to-purple-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-pink-500/10 p-2">
                                <Lock className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="mb-1 font-semibold text-pink-900 dark:text-pink-100">A propos de la gestion des acces</h4>
                                <ul className="space-y-1 text-sm text-pink-800 dark:text-pink-200">
                                    <li>Revoquer un acces accorde coupe immediatement la galerie privee.</li>
                                    <li>Revoquer un acces recu coupe aussi ton acces.</li>
                                    <li>Aucun remboursement n est effectue lors de la revocation.</li>
                                    <li>Tu peux accorder ou revoquer l acces a tout moment.</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DatingLayout>
    );
}
