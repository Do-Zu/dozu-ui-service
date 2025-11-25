'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StarButtonProps {
    isStarred: boolean;
    onToggle: (e: React.MouseEvent) => void;
    size?: number;
    buttonSize?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function StarButton({
    isStarred,
    onToggle,
    size = 20,
    buttonSize = 'md',
    className,
}: StarButtonProps) {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
    };

    return (
        <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
                e.stopPropagation();
                onToggle(e);
            }}
            className={cn(
                sizeClasses[buttonSize],
                'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full',
                isStarred && 'text-yellow-500',
                className
            )}
            aria-label={isStarred ? 'Unstar flashcard' : 'Star flashcard'}
        >
            <Star
                size={size}
                className={cn(
                    isStarred
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-gray-400'
                )}
            />
        </Button>
    );
}

