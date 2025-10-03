import React, { useState, useEffect } from 'react';
import { Flame, Shield, Clock, Trophy, Zap } from 'lucide-react';
import { gamificationService, StreakData } from '@/services/gamification/gamificationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface StreakDisplayProps {
    userId?: number;
    showFreezeOption?: boolean;
    compact?: boolean;
}

export function StreakDisplay({ userId, showFreezeOption = true, compact = false }: StreakDisplayProps) {
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [loading, setLoading] = useState(true);
    const [freezing, setFreezing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchStreakData();
    }, [userId]);

    const fetchStreakData = async () => {
        try {
            setLoading(true);
            const data = await gamificationService.getUserStreak();
            setStreakData(data);
        } catch (error) {
            console.error('Error fetching streak data:', error);
            toast({
                title: "Error",
                description: "Failed to load streak data",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBuyStreakFreeze = async () => {
        try {
            setFreezing(true);
            const success = await gamificationService.buyStreakFreeze(100);
            if (success) {
                toast({
                    title: "Streak Freeze Activated!",
                    description: "Your streak is protected for 24 hours",
                });
                await fetchStreakData();
            } else {
                toast({
                    title: "Insufficient Points",
                    description: "You need 100 points to buy a streak freeze",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to buy streak freeze",
                variant: "destructive",
            });
        } finally {
            setFreezing(false);
        }
    };

    const getStreakMilestone = (streak: number) => {
        if (streak >= 365) return { name: "Legendary", color: "text-purple-600", icon: Trophy };
        if (streak >= 100) return { name: "Master", color: "text-red-600", icon: Flame };
        if (streak >= 30) return { name: "Expert", color: "text-orange-600", icon: Zap };
        if (streak >= 7) return { name: "Dedicated", color: "text-blue-600", icon: Clock };
        return { name: "Getting Started", color: "text-gray-600", icon: Clock };
    };

    if (loading) {
        return (
            <Card className={compact ? "p-4" : ""}>
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
            </Card>
        );
    }

    if (!streakData) {
        return (
            <Card className={compact ? "p-4" : ""}>
                <div className="text-center py-4 text-gray-500">
                    <Flame className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No streak data available</p>
                </div>
            </Card>
        );
    }

    const milestone = getStreakMilestone(streakData.currentStreak);
    const MilestoneIcon = milestone.icon;

    if (compact) {
        return (
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{streakData.currentStreak}</span>
                        <span className="text-sm text-gray-600">day streak</span>
                        {streakData.streakFreezeActive && (
                            <Shield className="w-4 h-4 text-blue-500" />
                        )}
                    </div>
                    <div className="text-xs text-gray-500">
                        Best: {streakData.longestStreak} days
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Learning Streak
                    {streakData.streakFreezeActive && (
                        <Badge variant="secondary" className="ml-2">
                            <Shield className="w-3 h-3 mr-1" />
                            Protected
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Flame className="w-8 h-8 text-orange-500" />
                        <span className="text-4xl font-bold text-orange-600">
                            {streakData.currentStreak}
                        </span>
                        <span className="text-lg text-gray-600">days</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <MilestoneIcon className={`w-5 h-5 ${milestone.color}`} />
                        <span className={`font-semibold ${milestone.color}`}>
                            {milestone.name}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                            <div className="font-semibold text-gray-900">
                                {streakData.longestStreak}
                            </div>
                            <div className="text-gray-600">Best Streak</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-gray-900">
                                {streakData.streakFreezeCount}
                            </div>
                            <div className="text-gray-600">Freezes Used</div>
                        </div>
                    </div>
                </div>

                {streakData.currentStreak > 0 && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Next milestone</span>
                            <span>{Math.ceil(streakData.currentStreak / 7) * 7} days</span>
                        </div>
                        <Progress 
                            value={(streakData.currentStreak % 7) * 14.28} 
                            className="h-2"
                        />
                    </div>
                )}

                {showFreezeOption && !streakData.streakFreezeActive && (
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-sm">Streak Freeze</div>
                                <div className="text-xs text-gray-600">
                                    Protect your streak for 24 hours
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={handleBuyStreakFreeze}
                                disabled={freezing}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {freezing ? "Buying..." : "100 pts"}
                            </Button>
                        </div>
                    </div>
                )}

                {streakData.streakFreezeActive && (
                    <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Your streak is protected for 24 hours
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

