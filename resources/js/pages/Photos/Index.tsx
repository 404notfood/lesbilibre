import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Star, Trash2, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface Photo {
    id: number;
    path: string;
    is_primary: boolean;
    is_approved: boolean;
    is_naughty: boolean;
    order: number;
}

export default function Index({ photos }: { photos: Photo[] }) {
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        setUploading(true);
        router.post('/photos', formData, {
            forceFormData: true,
            onFinish: () => {
                setUploading(false);
                e.target.value = '';
            },
        });
    };

    const setPrimary = (photoId: number) => {
        router.post(`/photos/${photoId}/primary`);
    };

    const deletePhoto = (photoId: number) => {
        if (confirm('Êtes-vous sûre de vouloir supprimer cette photo ?')) {
            router.delete(`/photos/${photoId}`);
        }
    };

    const approvedPhotos = photos.filter((p) => p.is_approved);
    const pendingPhotos = photos.filter((p) => !p.is_approved);

    return (
        <>
            <Head title="Mes Photos" />

            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
                <div className="container mx-auto px-4">
                    <div className="mb-8 text-center">
                        <h1 className="flex items-center justify-center gap-2 text-4xl font-bold text-gray-900 dark:text-white">
                            <ImageIcon className="h-8 w-8 text-pink-500" />
                            Mes Photos
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Gérez votre galerie de photos ({photos.length}/10)
                        </p>
                    </div>

                    <div className="mx-auto max-w-4xl">
                        {/* Bouton d'upload */}
                        {photos.length < 10 && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Ajouter une photo</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-pink-500 dark:border-gray-700">
                                        <Upload className="h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                            {uploading
                                                ? 'Téléchargement en cours...'
                                                : 'Cliquez pour sélectionner une photo'}
                                        </p>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            disabled={uploading}
                                        />
                                    </label>
                                </CardContent>
                            </Card>
                        )}

                        {/* Photos approuvées */}
                        {approvedPhotos.length > 0 && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Photos publiées</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {approvedPhotos.map((photo) => (
                                            <div
                                                key={photo.id}
                                                className="group relative aspect-square overflow-hidden rounded-lg"
                                            >
                                                <img
                                                    src={`/storage/${photo.path}`}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />

                                                {/* Badge photo principale */}
                                                {photo.is_primary && (
                                                    <div className="absolute left-2 top-2 rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-white">
                                                        <Star className="inline h-3 w-3" /> Principale
                                                    </div>
                                                )}

                                                {/* Badge naughty */}
                                                {photo.is_naughty && (
                                                    <div className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                                                        🔞
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                    {!photo.is_primary && (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => setPrimary(photo.id)}
                                                        >
                                                            <Star className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => deletePhoto(photo.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Photos en attente */}
                        {pendingPhotos.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Photos en attente de validation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {pendingPhotos.map((photo) => (
                                            <div
                                                key={photo.id}
                                                className="group relative aspect-square overflow-hidden rounded-lg"
                                            >
                                                <img
                                                    src={`/storage/${photo.path}`}
                                                    alt=""
                                                    className="h-full w-full object-cover opacity-60"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <span className="text-sm font-bold text-white">
                                                        En attente
                                                    </span>
                                                </div>

                                                {/* Action supprimer */}
                                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => deletePhoto(photo.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {photos.length === 0 && (
                            <div className="py-12 text-center">
                                <ImageIcon className="mx-auto h-16 w-16 text-gray-300" />
                                <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                                    Aucune photo
                                </p>
                                <p className="mt-2 text-gray-500">
                                    Ajoutez des photos pour compléter votre profil
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
