'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarWithStreakProps {
    src?: string;
    fallback: string;
    streak?: number;
    size?: 'sm' | 'md' | 'lg';
    showStreak?: boolean;
    className?: string;
}

export default function AvatarWithStreak({
    src,
    fallback,
    streak = 0,
    size = 'md',
    showStreak = true,
    className,
}: AvatarWithStreakProps) {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10', 
        lg: 'h-12 w-12',
    };

    const streakBadgeClasses = {
        sm: 'h-4 w-4 text-[10px]',
        md: 'h-5 w-5 text-xs',
        lg: 'h-6 w-6 text-sm',
    };

    const streakBadgePosition = {
        sm: '-top-1 -right-1',
        md: '-top-1 -right-1', 
        lg: '-top-2 -right-2',
    };

    return (
        <div className={cn("relative inline-block", className)}>
            <Avatar className={sizeClasses[size]}>
                <AvatarImage src={src} alt="User avatar" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {fallback}
                </AvatarFallback>
            </Avatar>
            
            {showStreak && streak > 0 && (
                <Badge 
                    className={cn(
                        `absolute ${streakBadgePosition[size]} ${streakBadgeClasses[size]} flex items-center justify-center border-2 border-white shadow-lg`,
                        'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                    )}
                    variant="default"
                >
                    <div className="flex items-center gap-0.5">
                        <Flame className="h-2 w-2" />
                        <span className="font-bold leading-none">{streak}</span>
                    </div>
                </Badge>
            )}
        </div>
    );
}