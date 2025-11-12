// ✅ NEW FILE: Flashcard.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Reference from '../reference/Reference';

interface FlashcardProps {
    front: React.ReactNode;
    back: React.ReactNode;
    isFlipped: boolean;
    isAnimating?: boolean;
    onClick: () => void;
}

export default function Flashcard({ front, back, isFlipped, isAnimating, onClick }: FlashcardProps) {
    return (
        <div className="relative w-[55%] h-[70%] perspective cursor-pointer select-none" onClick={onClick}>
            <div
                className={cn(
                    'absolute inset-0 transform-style-preserve-3d',
                    isFlipped ? 'rotate-x-180' : 'rotate-x-0',
                    isAnimating === undefined || isAnimating ? 'transition-transform duration-500' : '',
                )}
            >
                {/* Front Side */}
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-700 border rounded-xl backface-hidden shadow-md text-center p-8 text-lg">
                    {front}
                </div>
                {/* Back Side */}
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-700 border rounded-xl backface-hidden rotate-x-180 shadow-md text-center p-8 text-lg">
                    {back}
                    <Reference content={`${front} : ${back}`} />
                </div>
            </div>
        </div>
    );
}
