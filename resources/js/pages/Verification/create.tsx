import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Shield,
    Upload,
    CheckCircle,
    AlertCircle,
    Camera,
    Video,
    FileImage,
    X,
    Sparkles,
    Check,
    Clock,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface VerificationStatus {
    has_pending?: boolean;
    is_verified?: boolean;
    rejected_reason?: string;
}

type UploadType = 'photo' | 'video';

export default function Create({ status }: { status: VerificationStatus }): JSX.Element {
    const [uploadType, setUploadType] = useState<UploadType>('photo');
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = (): void => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append(uploadType === 'photo' ? 'photo' : 'video', selectedFile);
        formData.append('type', uploadType);

        setUploading(true);
        router.post('/verification', formData, {
            forceFormData: true,
            onFinish: () => {
                setUploading(false);
            },
            onSuccess: () => {
                setSelectedFile(null);
                setPreviewUrl(null);
            },
        });
    };

    const handleReset = (): void => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    return (
        <>
            <Head title="Vérification d'identité" />

            <div className="min-h-screen bg-background py-12">
                <div className="container-responsive">
                    {/* Header */}
                    <div className="mb-8 text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">
                                Vérification d'identité
                            </h1>
                            <p className="mt-2 text-lg text-muted-foreground">
                                Obtenez le badge vérifié pour plus de confiance et de visibilité
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto max-w-4xl space-y-8">
                        {/* Statut actuel */}
                        {status.is_verified && (
                            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                                <CardContent className="flex items-center gap-4 py-6">
                                    <div className="flex-shrink-0">
                                        <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-green-900 dark:text-green-100 flex items-center gap-2">
                                            <Sparkles className="h-5 w-5" />
                                            Profil vérifié avec succès !
                                        </h3>
                                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                            Votre identité a été confirmée. Vous avez maintenant le badge vérifié sur votre profil.
                                        </p>
                                    </div>
                                    <Badge className="bg-green-600 hover:bg-green-700">
                                        <Check className="h-3 w-3 mr-1" />
                                        Vérifié
                                    </Badge>
                                </CardContent>
                            </Card>
                        )}

                        {status.has_pending && !status.is_verified && (
                            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
                                <CardContent className="flex items-center gap-4 py-6">
                                    <div className="flex-shrink-0">
                                        <Clock className="h-12 w-12 text-yellow-600 dark:text-yellow-500 animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                                            Vérification en cours
                                        </h3>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                            Votre demande est en cours d'examen. Vous recevrez une réponse sous 24-48h.
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="border-yellow-600 text-yellow-700">
                                        En attente
                                    </Badge>
                                </CardContent>
                            </Card>
                        )}

                        {status.rejected_reason && (
                            <Card className="border-destructive bg-destructive/5">
                                <CardContent className="flex items-center gap-4 py-6">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-12 w-12 text-destructive" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-destructive">
                                            Vérification refusée
                                        </h3>
                                        <p className="text-sm text-destructive/80 mt-1">
                                            {status.rejected_reason}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Vous pouvez soumettre une nouvelle demande ci-dessous.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {!status.has_pending && !status.is_verified && (
                            <>
                                {/* Choix du type */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Choisissez votre méthode de vérification</CardTitle>
                                        <CardDescription>
                                            Sélectionnez photo ou vidéo pour prouver votre identité
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setUploadType('photo')}
                                                className={cn(
                                                    'relative p-6 rounded-xl border-2 transition-all',
                                                    'hover:shadow-md cursor-pointer group',
                                                    uploadType === 'photo'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                )}
                                            >
                                                <div className="flex flex-col items-center gap-3 text-center">
                                                    <div
                                                        className={cn(
                                                            'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
                                                            uploadType === 'photo'
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted group-hover:bg-primary/10'
                                                        )}
                                                    >
                                                        <Camera className="h-7 w-7" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">Photo selfie</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Rapide et simple
                                                        </p>
                                                    </div>
                                                </div>
                                                {uploadType === 'photo' && (
                                                    <div className="absolute top-4 right-4">
                                                        <Check className="h-5 w-5 text-primary" />
                                                    </div>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => setUploadType('video')}
                                                className={cn(
                                                    'relative p-6 rounded-xl border-2 transition-all',
                                                    'hover:shadow-md cursor-pointer group',
                                                    uploadType === 'video'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                )}
                                            >
                                                <div className="flex flex-col items-center gap-3 text-center">
                                                    <div
                                                        className={cn(
                                                            'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
                                                            uploadType === 'video'
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted group-hover:bg-primary/10'
                                                        )}
                                                    >
                                                        <Video className="h-7 w-7" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">
                                                            Vidéo courte
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Plus sécurisé (5-10 sec)
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs">
                                                        Recommandé
                                                    </Badge>
                                                </div>
                                                {uploadType === 'video' && (
                                                    <div className="absolute top-4 right-4">
                                                        <Check className="h-5 w-5 text-primary" />
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Upload zone */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {uploadType === 'photo' ? (
                                                <>
                                                    <FileImage className="h-5 w-5" />
                                                    Télécharger votre photo
                                                </>
                                            ) : (
                                                <>
                                                    <Video className="h-5 w-5" />
                                                    Télécharger votre vidéo
                                                </>
                                            )}
                                        </CardTitle>
                                        <CardDescription>
                                            {uploadType === 'photo'
                                                ? 'Format JPG ou PNG, maximum 10 MB'
                                                : 'Format MP4 ou MOV, durée 5-10 secondes, maximum 50 MB'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {previewUrl && selectedFile ? (
                                            <div className="space-y-4">
                                                <div className="relative mx-auto max-w-md">
                                                    {uploadType === 'photo' ? (
                                                        <img
                                                            src={previewUrl}
                                                            alt="Preview"
                                                            className="w-full rounded-xl border-2 border-border"
                                                        />
                                                    ) : (
                                                        <video
                                                            src={previewUrl}
                                                            controls
                                                            className="w-full rounded-xl border-2 border-border"
                                                        />
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="absolute top-2 right-2"
                                                        onClick={handleReset}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button
                                                        className="flex-1 btn-gradient text-white"
                                                        size="lg"
                                                        onClick={handleUpload}
                                                        disabled={uploading}
                                                    >
                                                        {uploading ? (
                                                            <>
                                                                <Clock className="mr-2 h-4 w-4 animate-spin" />
                                                                Envoi en cours...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="mr-2 h-4 w-4" />
                                                                Envoyer pour vérification
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="lg"
                                                        onClick={handleReset}
                                                    >
                                                        Annuler
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12 transition-colors hover:border-primary hover:bg-primary/5">
                                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                                <p className="text-center font-medium">
                                                    {uploading
                                                        ? 'Chargement en cours...'
                                                        : `Cliquez pour sélectionner ${uploadType === 'photo' ? 'une photo' : 'une vidéo'}`}
                                                </p>
                                                <p className="mt-2 text-center text-sm text-muted-foreground">
                                                    {uploadType === 'photo'
                                                        ? 'JPG, PNG (max 10 MB)'
                                                        : 'MP4, MOV - 5 à 10 secondes (max 50 MB)'}
                                                </p>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept={
                                                        uploadType === 'photo'
                                                            ? 'image/jpeg,image/png'
                                                            : 'video/mp4,video/quicktime'
                                                    }
                                                    onChange={handleFileSelect}
                                                    disabled={uploading}
                                                />
                                            </label>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Instructions */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Instructions</CardTitle>
                                    <CardDescription>
                                        Suivez ces étapes pour une vérification réussie
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            {
                                                step: 1,
                                                title: 'Choisissez photo ou vidéo',
                                                desc: 'La vidéo est recommandée pour plus de sécurité',
                                            },
                                            {
                                                step: 2,
                                                title: 'Montrez votre visage clairement',
                                                desc: 'Assurez-vous d\'un bon éclairage et d\'une image nette',
                                            },
                                            {
                                                step: 3,
                                                title: 'Envoyez votre fichier',
                                                desc: 'Notre équipe examinera sous 24-48 heures',
                                            },
                                        ].map((item) => (
                                            <div key={item.step} className="flex gap-3">
                                                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                                    {item.step}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{item.title}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Conseils</CardTitle>
                                    <CardDescription>
                                        Pour une validation garantie
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex gap-2 items-start">
                                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">
                                                Visage clairement visible
                                            </span>
                                        </div>
                                        <div className="flex gap-2 items-start">
                                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">Bon éclairage</span>
                                        </div>
                                        <div className="flex gap-2 items-start">
                                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">Image ou vidéo nette</span>
                                        </div>

                                        <Separator className="my-3" />

                                        <div className="flex gap-2 items-start">
                                            <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">Pas de filtres</span>
                                        </div>
                                        <div className="flex gap-2 items-start">
                                            <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">
                                                Pas de lunettes de soleil
                                            </span>
                                        </div>
                                        <div className="flex gap-2 items-start">
                                            <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">Pas de photos de groupe</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pourquoi se vérifier */}
                        <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Pourquoi se faire vérifier ?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-3 gap-6">
                                    <div className="text-center space-y-2">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                            <Shield className="h-6 w-6 text-primary" />
                                        </div>
                                        <h4 className="font-semibold">Plus de confiance</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Les profils vérifiés inspirent plus confiance
                                        </p>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                            <Sparkles className="h-6 w-6 text-primary" />
                                        </div>
                                        <h4 className="font-semibold">Plus de visibilité</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Votre profil apparaît en priorité
                                        </p>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                            <CheckCircle className="h-6 w-6 text-primary" />
                                        </div>
                                        <h4 className="font-semibold">Badge vérifié</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Badge affiché sur votre profil
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
