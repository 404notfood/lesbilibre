import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Photo {
    id: number;
    path: string;
    is_primary: boolean;
    is_approved: boolean;
    is_naughty: boolean;
}

interface GalleryTabsProps {
    photos: Photo[];
    user: {
        id: number;
        name: string;
        is_verified: boolean;
        is_premium?: boolean;
    };
    onPhotoClick?: (index: number, isNaughty: boolean) => void;
}

interface PhotoCarouselProps {
    photos: Photo[];
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    isNaughty: boolean;
    userName: string;
    onPhotoClick?: (index: number, isNaughty: boolean) => void;
    isVerified: boolean;
    isPremium?: boolean;
}

function PhotoCarousel({
    photos,
    currentIndex,
    setCurrentIndex,
    isNaughty,
    userName,
    onPhotoClick,
    isVerified,
    isPremium,
}: PhotoCarouselProps) {
    if (photos.length === 0) {
        return (
            <div className="relative flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                <p className="text-gray-500">Aucune photo</p>
            </div>
        );
    }

    const currentPhoto = photos[currentIndex];

    const nextPhoto = (): void => {
        setCurrentIndex((currentIndex + 1) % photos.length);
    };

    const prevPhoto = (): void => {
        setCurrentIndex((currentIndex - 1 + photos.length) % photos.length);
    };

    return (
        <>
            <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                <img
                    src={`/storage/${currentPhoto.path}`}
                    alt={userName}
                    className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                    onClick={() => onPhotoClick?.(currentIndex, isNaughty)}
                />

                {photos.length > 1 && (
                    <>
                        <button
                            onClick={prevPhoto}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/70"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={nextPhoto}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/70"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                {photos.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                        {currentIndex + 1} / {photos.length}
                    </div>
                )}

                <div className="absolute left-3 top-3 flex flex-col gap-2">
                    {isVerified && <Badge className="bg-blue-500">✓ Verifiee</Badge>}
                    {isPremium && <Badge className="bg-yellow-500">Premium</Badge>}
                </div>

                {isNaughty && <Badge className="absolute right-3 top-3 bg-red-500">18+</Badge>}
            </div>

            {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3">
                    {photos.map((photo, idx) => (
                        <button
                            key={photo.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg ${
                                idx === currentIndex ? 'ring-2 ring-pink-500' : 'opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img src={`/storage/${photo.path}`} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}

export default function GalleryTabs({ photos, user, onPhotoClick }: GalleryTabsProps) {
    const [publicPhotoIndex, setPublicPhotoIndex] = useState(0);
    const [privatePhotoIndex, setPrivatePhotoIndex] = useState(0);

    const publicPhotos = photos.filter((p) => !p.is_naughty);
    const privatePhotos = photos.filter((p) => p.is_naughty);

    return (
        <Card className="mb-4 overflow-hidden">
            <CardContent className="p-0">
                <Tabs defaultValue="public" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 rounded-none">
                        <TabsTrigger value="public" className="relative">
                            Photos publiques
                            {publicPhotos.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {publicPhotos.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="private" className="relative">
                            Galerie privée 🔞
                            {privatePhotos.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {privatePhotos.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="public" className="m-0">
                        <PhotoCarousel
                            photos={publicPhotos}
                            currentIndex={publicPhotoIndex}
                            setCurrentIndex={setPublicPhotoIndex}
                            isNaughty={false}
                            userName={user.name}
                            onPhotoClick={onPhotoClick}
                            isVerified={user.is_verified}
                            isPremium={user.is_premium}
                        />
                    </TabsContent>

                    <TabsContent value="private" className="m-0">
                        <PhotoCarousel
                            photos={privatePhotos}
                            currentIndex={privatePhotoIndex}
                            setCurrentIndex={setPrivatePhotoIndex}
                            isNaughty={true}
                            userName={user.name}
                            onPhotoClick={onPhotoClick}
                            isVerified={user.is_verified}
                            isPremium={user.is_premium}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
