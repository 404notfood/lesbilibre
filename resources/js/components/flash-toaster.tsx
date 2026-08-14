import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface FlashMessages {
    success?: string;
    error?: string;
    info?: string;
}

export function FlashToaster() {
    const { flash } = usePage<{ flash: FlashMessages }>().props;
    const shownRef = useRef<string | null>(null);

    useEffect(() => {
        const key = JSON.stringify(flash);

        // Avoid showing the same flash twice on re-renders
        if (key === shownRef.current || !flash) {
            return;
        }

        shownRef.current = key;

        if (flash.success) {
            toast.success(flash.success);
        }

        if (flash.error) {
            toast.error(flash.error);
        }

        if (flash.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return null;
}
