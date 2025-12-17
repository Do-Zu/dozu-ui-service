'use client';

import { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageCellProps {
    imageUrl: string | null;
}

export function ImageCell({ imageUrl }: ImageCellProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!imageUrl) {
        return (
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-muted text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="relative w-12 h-12 rounded-md overflow-hidden border hover:ring-2 hover:ring-primary transition-all cursor-pointer group"
            >
                <img
                    src={imageUrl}
                    alt="Feedback attachment"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <img
                            src={imageUrl}
                            alt="Feedback attachment"
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
