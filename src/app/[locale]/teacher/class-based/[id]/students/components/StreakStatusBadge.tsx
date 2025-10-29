'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Flame, AlertTriangle, Coins } from 'lucide-react';
import { useGamification } from '@/contexts/gamification/GamificationContext';
import { useToast } from '@/hooks/use-toast';

interface StreakStatusBadgeProps {
    currentStreak: number;
    streakFreezeActive: boolean;
    streakFreezeCount: number;
    lastStudyDate: Date | null;
    currentPoints?: number;
    userId?: number;
    onPurchaseSuccess?: () => void;
    className?: string;
}

export default function StreakStatusBadge({
    currentStreak,
    streakFreezeActive,
    streakFreezeCount,
    lastStudyDate,
    currentPoints = 0,
    userId,
    onPurchaseSuccess,
    className = '',
}: StreakStatusBadgeProps) {
    const [isPurchasing, setIsPurchasing] = useState(false);
    const { buyStreakFreeze, buyStreakFreezeForStudent } = useGamification();
    const { toast } = useToast();

    const freezeCost = 100;
    const canAfford = currentPoints >= freezeCost;

    const handleBuyStreakFreeze = async () => {
        if (!userId) return;
        
        try {
            setIsPurchasing(true);
            // Use the teacher API to buy streak freeze for student
            const success = await buyStreakFreezeForStudent(userId, freezeCost);
            if (success) {
                toast({
                    title: "Streak Freeze Purchased!",
                    description: "Student's streak is now protected for 24 hours",
                });
                onPurchaseSuccess?.();
            } else {
                toast({
                    title: "Purchase Failed",
                    description: "Insufficient points to buy streak freeze",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to purchase streak freeze",
                variant: "destructive",
            });
        } finally {
            setIsPurchasing(false);
        }
    };

    // Check if streak should be reset
    const shouldResetStreak = () => {
        if (!lastStudyDate) return currentStreak === 0;
        
        const today = new Date();
        const lastStudy = new Date(lastStudyDate);
        const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
        
        // If more than 1 day has passed and no streak freeze is active
        return daysDiff > 1 && !streakFreezeActive;
    };

    const shouldReset = shouldResetStreak();
    const displayStreak = currentStreak;

    if (streakFreezeActive) {
        return (
            <Badge 
                variant="default" 
                className={`bg-blue-100 text-blue-800 border-blue-200 ${className}`}
            >
                <Shield className="w-3 h-3 mr-1" />
                Protected ({streakFreezeCount})
            </Badge>
        );
    }

    if (currentStreak > 0) {
        return (
            <Badge 
                variant="default" 
                className={`bg-orange-100 text-orange-800 border-orange-200 ${className}`}
            >
                <Flame className="w-3 h-3 mr-1" />
                {displayStreak} days
            </Badge>
        );
    }

    if (shouldReset) {
        return (
            <div className="flex items-center gap-2">
                <Badge 
                    variant="destructive" 
                    className={`bg-red-100 text-red-800 border-red-200 ${className}`}
                >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Reset
                </Badge>
                {userId && !streakFreezeActive && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBuyStreakFreeze}
                        disabled={!canAfford || isPurchasing}
                        className="h-6 px-2 text-xs"
                    >
                        {isPurchasing ? (
                            "Buying..."
                        ) : (
                            <>
                                <Coins className="w-3 h-3 mr-1" />
                                {freezeCost} pts
                            </>
                        )}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <Badge 
            variant="secondary" 
            className={`bg-gray-100 text-gray-600 border-gray-200 ${className}`}
        >
            <Flame className="w-3 h-3 mr-1" />
            No Streak
        </Badge>
    );
}
