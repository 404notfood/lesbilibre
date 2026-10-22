import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function PasswordInput({
    className,
    ...props
}: Omit<InputProps, 'type'>) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <Input
                {...props}
                type={visible ? 'text' : 'password'}
                className={cn('pr-12', className)}
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground hover:text-primary"
                aria-label={
                    visible
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                }
                aria-pressed={visible}
                aria-controls={props.id}
                disabled={props.disabled}
                onClick={() => setVisible((value) => !value)}
            >
                {visible ? (
                    <EyeOff size={18} aria-hidden />
                ) : (
                    <Eye size={18} aria-hidden />
                )}
            </button>
        </div>
    );
}
