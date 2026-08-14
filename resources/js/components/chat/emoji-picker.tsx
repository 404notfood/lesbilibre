import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useAppearance } from '@/hooks/use-appearance';

interface EmojiPickerComponentProps {
    onEmojiSelect: (emoji: string) => void;
}

export function EmojiPickerComponent({
    onEmojiSelect,
}: EmojiPickerComponentProps) {
    const [open, setOpen] = useState(false);
    const { appearance } = useAppearance();

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onEmojiSelect(emojiData.emoji);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="h-9 w-9"
                >
                    <Smile className="h-5 w-5" />
                    <span className="sr-only">Ajouter un emoji</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="end">
                <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={
                        appearance === 'dark'
                            ? Theme.DARK
                            : Theme.LIGHT
                    }
                    width="100%"
                    height={400}
                    searchPlaceHolder="Rechercher..."
                    previewConfig={{
                        showPreview: false,
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
