'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
    title?: string;
    description?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ title, description }) => {
    const hasTitle = Boolean(title);

    return (
        <div className={`fixed inset-0 bg-black/20 z-50 flex items-center justify-center`}>
            {hasTitle ? (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    {title && <p className="text-lg font-medium">{title}</p>}
                    {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>}
                </div>
            ) : (
                <div className="p-6 rounded-lg flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                </div>
            )}
        </div>
    );
};

export default LoadingOverlay;
