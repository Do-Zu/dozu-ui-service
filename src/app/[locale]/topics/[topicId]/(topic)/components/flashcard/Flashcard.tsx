'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Reference from '../reference/Reference';

interface FlashcardProps {
    front: React.ReactNode;
    back: React.ReactNode;
    imageUrl?: string | null | undefined;
    isFlipped: boolean;
    isAnimating?: boolean;
    onClick: () => void;
    className?: string | undefined;
    topRightActions?: React.ReactNode;
}

export default function Flashcard({
    front,
    back,
    imageUrl,
    isFlipped,
    isAnimating,
    onClick,
    className,
    topRightActions,
}: FlashcardProps) {
    return (
        <div
            className={cn('relative w-[70%] h-[70%] perspective cursor-pointer select-none', className)}
            onClick={onClick}
        >
            <div
                className={cn(
                    'absolute inset-0 transform-style-preserve-3d transition-transform duration-500',
                    isFlipped ? 'rotate-x-180' : 'rotate-x-0',
                    isAnimating === false ? 'transition-none' : '',
                )}
            >
                {/* Front Side */}
                <div className="absolute inset-0 flex flex-col bg-white dark:bg-gray-700 border rounded-xl backface-hidden shadow-md overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
                        <div className="w-full text-center text-lg whitespace-pre-wrap break-words">{front}</div>
                    </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 flex flex-col bg-white dark:bg-gray-700 border rounded-xl backface-hidden rotate-x-180 shadow-md overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                        <div className="flex flex-col items-center justify-center min-h-full gap-4 text-center">
                            {imageUrl && (
                                <div className="relative w-full max-h-[250px] min-h-[150px] shrink-0">
                                    <Image src={imageUrl} alt="Flashcard image" fill className="object-contain" />
                                </div>
                            )}
                            <div className="text-lg whitespace-pre-wrap break-words w-full">{back}</div>

                            <div onClick={(e) => e.stopPropagation()} className="mt-2 shrink-0">
                                <Reference content={`${front} : ${back}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {topRightActions && (
                <div className="absolute top-4 right-4 z-50" onClick={(e) => e.stopPropagation()}>
                    <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                        {topRightActions}
                    </div>
                </div>
            )}
        </div>
    );
}
