import * as React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useRef, useState, useEffect } from 'react';

interface MultiSelectProps {
    options: Record<string, string>;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
}

function MultiSelect({ options, value, onChange, placeholder = 'Sélectionnez...', className }: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (key: string) => {
        if (value.includes(key)) {
            onChange(value.filter((v) => v !== key));
        } else {
            onChange([...value, key]);
        }
    };

    const selectedLabels = value.map((v) => options[v]).filter(Boolean);

    return (
        <div ref={ref} className={cn('relative', className)}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
                <span className="truncate text-left">
                    {selectedLabels.length > 0 ? (
                        <span className="text-foreground">{selectedLabels.length} sélectionné{selectedLabels.length > 1 ? 's' : ''}</span>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </button>

            {selectedLabels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                    {value.map((key) => (
                        <span
                            key={key}
                            className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700 dark:bg-pink-900 dark:text-pink-200"
                        >
                            {options[key]}
                            <button
                                type="button"
                                onClick={() => handleToggle(key)}
                                className="hover:text-pink-900 dark:hover:text-pink-100"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95">
                    <div className="max-h-60 overflow-y-auto">
                        {Object.entries(options).map(([key, label]) => (
                            <label
                                key={key}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                                <Checkbox
                                    checked={value.includes(key)}
                                    onCheckedChange={() => handleToggle(key)}
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export { MultiSelect };
