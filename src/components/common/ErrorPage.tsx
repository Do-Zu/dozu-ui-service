import React from 'react';
import { Button } from '../ui/button';

interface ErrorPageProps {
    message?: string | null;
    onRetry?: () => void;
}

export default function ErrorPage({ message = 'Something went wrong.', onRetry }: ErrorPageProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-700 mb-4">{message}</p>

            {onRetry && (
                <Button
                    onClick={onRetry}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                    Try Again
                </Button>
            )}
        </div>
    );
}
