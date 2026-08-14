import { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Sparkles } from 'lucide-react';
import { router } from '@inertiajs/react';
import Confetti from 'react-confetti';

interface MatchModalProps {
    show: boolean;
    matchedUser: {
        id: number;
        name: string;
        photo?: string;
    } | null;
    currentUser: {
        photo?: string;
    };
    onClose: () => void;
}

export function MatchModal({
    show,
    matchedUser,
    currentUser,
    onClose,
}: MatchModalProps): JSX.Element {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const shouldShowConfetti = useMemo(() => show, [show]);

    useEffect(() => {
        const handleResize = (): void => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSendMessage = (): void => {
        if (matchedUser) {
            router.visit(`/chat/${matchedUser.id}`);
        }
    };

    const handleKeepSwiping = (): void => {
        onClose();
    };

    if (!matchedUser) {
        return <></>;
    }

    return (
        <>
            {shouldShowConfetti && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                    colors={[
                        'oklch(0.7 0.25 320)',
                        'oklch(0.75 0.28 290)',
                        'oklch(0.65 0.18 145)',
                        'oklch(0.8 0.12 310)',
                    ]}
                />
            )}

            <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center space-y-2">
                        <div className="flex justify-center">
                            <div className="relative">
                                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-accent animate-pulse" />
                                <Heart className="h-16 w-16 text-primary fill-current animate-heartbeat" />
                            </div>
                        </div>
                        <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                            C'est un Match !
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Vous et {matchedUser.name} vous êtes mutuellement likées
                        </DialogDescription>
                    </DialogHeader>

                    {/* Photos avec coeur au milieu */}
                    <div className="relative flex items-center justify-center gap-4 py-8">
                        {/* Photo utilisateur courant */}
                        <div className="relative">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary overflow-hidden match-glow">
                                <img
                                    src={currentUser.photo || '/images/default-avatar.jpg'}
                                    alt="Vous"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Coeur central */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                            <div className="bg-background rounded-full p-3 match-glow">
                                <Heart className="h-8 w-8 text-primary fill-current animate-heartbeat" />
                            </div>
                        </div>

                        {/* Photo utilisateur matché */}
                        <div className="relative">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary overflow-hidden match-glow">
                                <img
                                    src={matchedUser.photo || '/images/default-avatar.jpg'}
                                    alt={matchedUser.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <Button
                            size="lg"
                            className="w-full btn-gradient text-white gap-2"
                            onClick={handleSendMessage}
                        >
                            <MessageCircle className="h-5 w-5" />
                            Envoyer un message
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full"
                            onClick={handleKeepSwiping}
                        >
                            Continuer à swiper
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
