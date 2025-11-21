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
}

export default function Flashcard({
    front,
    back,
    imageUrl,
    isFlipped,
    isAnimating,
    onClick,
    className,
}: FlashcardProps) {
    return (
        <div
            className={cn('relative w-[70%] h-[70%] perspective cursor-pointer select-none', className)}
            onClick={onClick}
        >
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
                {/* Back Side and image if have */}
                <div className="absolute inset-0  flex items-center flex-col gap-2 justify-center bg-white dark:bg-gray-700 border rounded-xl backface-hidden rotate-x-180 shadow-md text-center p-8 text-lg">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt="Flashcard image"
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-full h-[80%] object-contain"
                        />
                    ) : null}
                    <div>{back}</div>
                    <Reference content={`${front} : ${back}`} />
                </div>
            </div>
        </div>
    );
}
