import React, { useState, useEffect } from 'react';
import { Star, Trophy } from 'lucide-react';
import { gamificationService, PointsData } from '@/services/gamification/gamificationService';
import { leaderboardService } from '@/services/gamification/leaderboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface PointSystemProps {
    userId?: number;
    showHistory?: boolean;
    compact?: boolean;
}


export function PointSystem({ userId, showHistory = false, compact = false }: PointSystemProps) {
    const [pointsData, setPointsData] = useState<PointsData | null>(null);
    const [userRank, setUserRank] = useState<{ rank: number; totalUsers: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPointsData();
    }, [userId]);

    const fetchPointsData = async () => {
        try {
            setLoading(true);
            const [points, rank] = await Promise.all([
                gamificationService.getUserPoints(),
                userId ? leaderboardService.getUserRank(userId) : null
            ]);
            setPointsData(points);
            setUserRank(rank);
        } catch (error) {
            console.error('Error fetching points data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLevelProgress = () => {
        if (!pointsData) return 0;
        
        // Calculate level from points if level is 0 or invalid
        const calculatedLevel = Math.max(1, Math.floor(pointsData.totalPoints / 200) + 1);
        const currentLevel = pointsData.level > 0 ? pointsData.level : calculatedLevel;
        const currentLevelXP = pointsData.experiencePoints || (pointsData.totalPoints % 200);
        const nextLevelXP = pointsData.nextLevelExperience || 200;
        const previousLevelXP = (currentLevel - 1) * 200;
        
        const progressInLevel = currentLevelXP - previousLevelXP;
        const totalLevelXP = nextLevelXP - previousLevelXP;
        
        return Math.min((progressInLevel / totalLevelXP) * 100, 100);
    };

    const getLevelColor = (level: number) => {
        if (level >= 50) return 'text-purple-600';
        if (level >= 25) return 'text-red-600';
        if (level >= 10) return 'text-orange-600';
        if (level >= 5) return 'text-blue-600';
        return 'text-green-600';
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

    if (!pointsData) {
        return (
            <Card className={compact ? "p-4" : ""}>
                <div className="text-center py-4 text-gray-500">
                    <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No points data available</p>
                </div>
            </Card>
        );
    }

    if (compact) {
        return (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-lg">{pointsData.totalPoints}</span>
                    <span className="text-sm text-gray-600">points</span>
                </div>
                <div className="h-6 w-px bg-gray-300" />
                <div className="text-sm">
                    <div className="font-semibold">Level {pointsData.level}</div>
                    <div className="text-gray-600">
                        {pointsData.experiencePoints}/{pointsData.nextLevelExperience} XP
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Points & Level
                        {userRank && (
                            <Badge variant="secondary" className="ml-2">
                                Rank #{userRank.rank}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-4xl font-bold text-yellow-600">
                                {pointsData.totalPoints}
                            </span>
                            <span className="text-lg text-gray-600">points</span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Trophy className={`w-6 h-6 ${getLevelColor(pointsData.level > 0 ? pointsData.level : Math.max(1, Math.floor(pointsData.totalPoints / 200) + 1))}`} />
                            <span className={`text-xl font-bold ${getLevelColor(pointsData.level > 0 ? pointsData.level : Math.max(1, Math.floor(pointsData.totalPoints / 200) + 1))}`}>
                                Level {pointsData.level > 0 ? pointsData.level : Math.max(1, Math.floor(pointsData.totalPoints / 200) + 1)}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress to Level {(pointsData.level > 0 ? pointsData.level : Math.max(1, Math.floor(pointsData.totalPoints / 200) + 1)) + 1}</span>
                                <span>{pointsData.experiencePoints || (pointsData.totalPoints % 200)}/{pointsData.nextLevelExperience || 200} XP</span>
                            </div>
                            <Progress value={getLevelProgress()} className="h-3" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                            <div className="font-semibold text-gray-900">
                                {pointsData.availablePoints}
                            </div>
                            <div className="text-gray-600">Available</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-gray-900">
                                {pointsData.nextLevelExperience - pointsData.experiencePoints}
                            </div>
                            <div className="text-gray-600">XP to Next Level</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

