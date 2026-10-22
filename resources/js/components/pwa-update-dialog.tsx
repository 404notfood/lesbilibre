import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { RefreshCw } from 'lucide-react';

export interface PwaUpdateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    updating: boolean;
    error: string | null;
    online: boolean;
    onApply: () => void;
}

export default function PwaUpdateDialog({
    open,
    onOpenChange,
    updating,
    error,
    online,
    onApply,
}: PwaUpdateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mettre LesbiLibre à jour</DialogTitle>
                    <DialogDescription>
                        La mise à jour recharge cette fenêtre. Termine tes
                        messages et enregistre tes formulaires avant de
                        continuer. Les brouillons privés ne sont pas conservés
                        sur l’appareil.
                    </DialogDescription>
                </DialogHeader>
                {error ? (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                ) : null}
                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={updating}
                        onClick={() => onOpenChange(false)}
                    >
                        Plus tard
                    </Button>
                    <Button disabled={updating || !online} onClick={onApply}>
                        {updating ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : null}
                        {updating
                            ? 'Activation en cours…'
                            : 'Mettre à jour et recharger'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
