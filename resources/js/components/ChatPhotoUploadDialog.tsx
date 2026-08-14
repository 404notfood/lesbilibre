import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Gem } from 'lucide-react';
import { useState } from 'react';

interface ChatPhotoUploadDialogProps {
    conversationId: number;
    isPremium: boolean;
    currentGems: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ChatPhotoUploadDialog({
    conversationId,
    isPremium,
    currentGems,
    open,
    onOpenChange,
}: ChatPhotoUploadDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const gemsCost = 5;
    const hasEnoughGems = isPremium || currentGems >= gemsCost;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleUpload = () => {
        if (!selectedFile || !hasEnoughGems) return;

        const formData = new FormData();
        formData.append('photo', selectedFile);
        formData.append('conversation_id', conversationId.toString());

        setUploading(true);

        router.post(`/conversations/${conversationId}/photos`, formData, {
            forceFormData: true,
            onFinish: () => {
                setUploading(false);
                setSelectedFile(null);
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(null);
                onOpenChange(false);
            },
        });
    };

    const handleCancel = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Envoyer une photo</DialogTitle>
                </DialogHeader>

                {!selectedFile ? (
                    <div className="py-8">
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-pink-500 dark:border-gray-700">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Cliquez pour sélectionner une photo
                                </p>
                                <p className="mt-2 text-xs text-gray-500">
                                    Max 5 Mo (JPG, PNG, GIF)
                                </p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg,image/gif"
                                onChange={handleFileSelect}
                            />
                        </label>
                    </div>
                ) : (
                    <>
                        {previewUrl && (
                            <div className="aspect-square overflow-hidden rounded-lg">
                                <img src={previewUrl} alt="Aperçu" className="h-full w-full object-cover" />
                            </div>
                        )}

                        {!isPremium && (
                            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 p-4 dark:from-pink-950/20 dark:to-purple-950/20">
                                <div className="flex items-center gap-2">
                                    <Gem className="h-5 w-5 text-pink-500" />
                                    <span className="text-sm font-medium">
                                        Coût : {gemsCost} gemmes
                                    </span>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Vous avez : {currentGems} 💎
                                </span>
                            </div>
                        )}

                        {isPremium && (
                            <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-4 dark:from-yellow-950/20 dark:to-orange-950/20">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    ⭐ Gratuit avec Premium
                                </p>
                            </div>
                        )}

                        {!hasEnoughGems && (
                            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    Vous n'avez pas assez de gemmes. Il vous faut {gemsCost} gemmes.
                                </p>
                            </div>
                        )}
                    </>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel} disabled={uploading}>
                        Annuler
                    </Button>
                    <Button onClick={handleUpload} disabled={!selectedFile || !hasEnoughGems || uploading}>
                        {uploading ? 'Envoi...' : 'Envoyer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
