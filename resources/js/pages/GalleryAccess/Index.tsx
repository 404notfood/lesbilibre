import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DatingLayout from '@/layouts/dating-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Check, Coins, Lock, ShieldCheck, Trash2, X } from 'lucide-react';
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

interface IndexProps {
    requests: GalleryAccessRequest[];
    accessGranted: GalleryAccessRequest[];
}

export default function Index({ requests, accessGranted }: IndexProps) {
    const [processing, setProcessing] = useState<number | null>(null);

    const handleAccept = (requestId: number) => {
        setProcessing(requestId);
        router.post(
            `/gallery-access/${requestId}/accept`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(null),
            },
        );
    };

    const handleReject = (requestId: number) => {
        setProcessing(requestId);
        router.post(
            `/gallery-access/${requestId}/reject`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(null),
            },
        );
    };

    const handleRevoke = (requestId: number) => {
        if (
            !window.confirm(
                "Retirer immédiatement l'accès à ta galerie privée ?",
            )
        ) {
            return;
        }

        setProcessing(requestId);
        router.delete(`/gallery-access/${requestId}`, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    return (
        <DatingLayout title="Demandes d'accès">
            <Head title="Demandes d'accès à la galerie" />

            <div className="space-y-8 p-6">
                {/* Header */}
                <div className="space-y-2">
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
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
                            <Card
                                key={request.id}
                                className="overflow-hidden transition-all hover:border-primary/40"
                            >
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-4 p-4">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <Avatar className="h-16 w-16 border-2 border-primary/20">
                                                {request.requester
                                                    .photos?.[0] ? (
                                                    <AvatarImage
                                                        src={`/storage/${request.requester.photos[0].path}`}
                                                        alt={
                                                            request.requester
                                                                .pseudo ||
                                                            request.requester
                                                                .name
                                                        }
                                                    />
                                                ) : (
                                                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-xl text-white">
                                                        {(
                                                            request.requester
                                                                .pseudo ||
                                                            request.requester
                                                                .name
                                                        )
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div className="absolute -right-1 -bottom-1 rounded-full bg-orange-500 p-1">
                                                <Lock className="h-3 w-3 text-white" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="text-lg font-semibold text-foreground">
                                                {request.requester.pseudo ||
                                                    request.requester.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Souhaite accéder à ta galerie
                                                privée
                                            </p>
                                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                <Coins className="h-3 w-3" />
                                                <span>
                                                    {request.gems_cost} gemmes
                                                    payées
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 p-4 pt-0">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-red-500/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            onClick={() =>
                                                handleReject(request.id)
                                            }
                                            disabled={processing === request.id}
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Refuser
                                        </Button>
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                            onClick={() =>
                                                handleAccept(request.id)
                                            }
                                            disabled={processing === request.id}
                                        >
                                            <Check className="mr-2 h-4 w-4" />
                                            Accepter
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center px-4 py-16">
                        <div className="relative mb-6">
                            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                                <Lock className="h-16 w-16 text-primary/40" />
                            </div>
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-foreground">
                            Aucune demande en attente
                        </h3>
                        <p className="max-w-md text-center text-muted-foreground">
                            Les utilisateurs qui souhaitent accéder à ta galerie
                            privée apparaîtront ici.
                        </p>
                    </div>
                )}

                <section
                    className="space-y-4"
                    aria-labelledby="active-access-heading"
                >
                    <div className="space-y-1">
                        <h2
                            id="active-access-heading"
                            className="flex items-center gap-2 text-xl font-bold text-foreground"
                        >
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            Personnes autorisées
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {accessGranted.length > 0
                                ? `${accessGranted.length} personne${accessGranted.length > 1 ? 's peuvent' : ' peut'} voir tes médias privés.`
                                : "Personne n'a actuellement accès à ta galerie privée."}
                        </p>
                    </div>

                    {accessGranted.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {accessGranted.map((access) => {
                                const displayName =
                                    access.requester.pseudo ||
                                    access.requester.name;

                                return (
                                    <Card
                                        key={access.id}
                                        className="overflow-hidden transition-colors hover:border-primary/40"
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <Link
                                                    href={`/profile/${access.requester.id}`}
                                                    aria-label={`Voir le profil de ${displayName}`}
                                                    className="shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                                >
                                                    <Avatar className="h-14 w-14 border-2 border-emerald-500/30">
                                                        {access.requester
                                                            .photos?.[0] ? (
                                                            <AvatarImage
                                                                src={`/storage/${access.requester.photos[0].path}`}
                                                                alt={
                                                                    displayName
                                                                }
                                                            />
                                                        ) : (
                                                            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-lg text-white">
                                                                {displayName
                                                                    .slice(0, 2)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                </Link>

                                                <div className="min-w-0 flex-1">
                                                    <Link
                                                        href={`/profile/${access.requester.id}`}
                                                        className="font-semibold text-foreground hover:text-primary"
                                                    >
                                                        {displayName}
                                                    </Link>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Peut voir tes photos et
                                                        vidéos privées
                                                    </p>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="shrink-0 border-red-500/40 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                                                    onClick={() =>
                                                        handleRevoke(access.id)
                                                    }
                                                    disabled={
                                                        processing === access.id
                                                    }
                                                    aria-label={`Retirer l'accès de ${displayName}`}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Retirer
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
                                <Lock className="h-5 w-5 text-primary/60" />
                                Ta galerie reste entièrement privée tant que tu
                                n&apos;acceptes aucune demande.
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Info Card */}
                <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 dark:border-pink-800 dark:from-pink-950/20 dark:to-purple-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-pink-500/10 p-2">
                                <Lock className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="mb-1 font-semibold text-pink-900 dark:text-pink-100">
                                    À propos des demandes d'accès
                                </h4>
                                <ul className="space-y-1 text-sm text-pink-800 dark:text-pink-200">
                                    <li>
                                        • Les utilisateurs payent 50 💎 pour
                                        demander l'accès
                                    </li>
                                    <li>
                                        • Tu peux accepter ou refuser chaque
                                        demande
                                    </li>
                                    <li>
                                        • Si tu refuses, les gemmes sont
                                        remboursées
                                    </li>
                                    <li>
                                        • Si tu acceptes, l'utilisateur peut
                                        voir tes photos privées
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DatingLayout>
    );
}
