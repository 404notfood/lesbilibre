import DatingLayout from '@/layouts/dating-layout';
import { Head, router } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Check, X, Coins } from 'lucide-react';
import { useState } from 'react';

interface Photo {
    path: string;
}

interface Requester {
    id: number;
    name: string;
    pseudo?: string;
    photos: Photo[];
}

interface GalleryAccessRequest {
    id: number;
    requester: Requester;
    gems_cost: number;
    created_at: string;
}

export default function Index({ requests }: { requests: GalleryAccessRequest[] }) {
    const [processing, setProcessing] = useState<number | null>(null);

    const handleAccept = (requestId: number) => {
        setProcessing(requestId);
        router.post(`/gallery-access/${requestId}/accept`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    const handleReject = (requestId: number) => {
        setProcessing(requestId);
        router.post(`/gallery-access/${requestId}/reject`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    return (
        <DatingLayout title="Demandes d'accès">
            <Head title="Demandes d'accès à la galerie" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Lock className="h-6 w-6 text-primary" />
                        Demandes d'accès à ta galerie privée 🔞
                    </h2>
                    <p className="text-muted-foreground">
                        {requests.length > 0
                            ? `${requests.length} demande${requests.length > 1 ? 's' : ''} en attente`
                            : 'Aucune demande en attente'}
                    </p>
                </div>

                {/* Requests List */}
                {requests.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {requests.map((request) => (
                            <Card key={request.id} className="overflow-hidden hover:border-primary/40 transition-all">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-4 p-4">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <Avatar className="h-16 w-16 border-2 border-primary/20">
                                                {request.requester.photos?.[0] ? (
                                                    <AvatarImage
                                                        src={`/storage/${request.requester.photos[0].path}`}
                                                        alt={request.requester.pseudo || request.requester.name}
                                                    />
                                                ) : (
                                                    <AvatarFallback className="text-xl bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                                                        {(request.requester.pseudo || request.requester.name).slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1">
                                                <Lock className="h-3 w-3 text-white" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="font-semibold text-foreground text-lg">
                                                {request.requester.pseudo || request.requester.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Souhaite accéder à ta galerie privée
                                            </p>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                                <Coins className="h-3 w-3" />
                                                <span>{request.gems_cost} gemmes payées</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 p-4 pt-0">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-red-500/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            onClick={() => handleReject(request.id)}
                                            disabled={processing === request.id}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Refuser
                                        </Button>
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                            onClick={() => handleAccept(request.id)}
                                            disabled={processing === request.id}
                                        >
                                            <Check className="h-4 w-4 mr-2" />
                                            Accepter
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="relative mb-6">
                            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <Lock className="h-16 w-16 text-primary/40" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                            Aucune demande en attente
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            Les utilisateurs qui souhaitent accéder à ta galerie privée apparaîtront ici.
                        </p>
                    </div>
                )}

                {/* Info Card */}
                <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-pink-500/10 rounded-lg">
                                <Lock className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-pink-900 dark:text-pink-100 mb-1">
                                    À propos des demandes d'accès
                                </h4>
                                <ul className="text-sm text-pink-800 dark:text-pink-200 space-y-1">
                                    <li>• Les utilisateurs payent 50 💎 pour demander l'accès</li>
                                    <li>• Tu peux accepter ou refuser chaque demande</li>
                                    <li>• Si tu refuses, les gemmes sont remboursées</li>
                                    <li>• Si tu acceptes, l'utilisateur peut voir tes photos privées</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DatingLayout>
    );
}
