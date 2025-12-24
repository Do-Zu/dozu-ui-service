import { Loader } from 'lucide-react';
import React from 'react';

export default function RenderProgress({ message, isProcessing = false }: { message: string; isProcessing?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            {isProcessing && <Loader className="h-4 w-4 animate-spin" />}
            <span>{message}</span>
        </div>
    );
}
