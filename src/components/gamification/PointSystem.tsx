import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Star, Trophy } from 'lucide-react';
import { gamificationService } from '@/services/gamification/gamification.service';
import { PointsData } from '@/types/streaks/gamification.type';
import { leaderboardService } from '@/services/gamification/leaderboard.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface PointSystemProps {
    userId?: number;
    classId?: number;
    showHistory?: boolean;
    compact?: boolean;
}


export function PointSystem({ userId, classId, showHistory = false, compact = false }: PointSystemProps) {
    const [pointsData, setPointsData] = useState<PointsData | null>(null);
    const [userRank, setUserRank] = useState<{ rank: number; totalUsers: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper function to get display level with fallback logic
    const getDisplayLevel = (data: PointsData) => {
        return data.level > 0 ? data.level : Math.max(1, Math.floor(data.totalPoints / 200) + 1);
    };

    // Memoized computed level to ensure all references use the same value
    const displayLevel = useMemo(() => {
        return pointsData ? getDisplayLevel(pointsData) : 1;
    }, [pointsData]);

    const fetchPointsData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null); // Clear any previous errors
            
            // Only fetch points if classId is provided (points are class-specific)
            let points: PointsData;
            if (classId) {
                const fetchedPoints = await gamificationService.getUserPoints(classId);
                if (fetchedPoints) {
                    points = fetchedPoints;
                } else {
                    // Fallback to default data if API returns null
                    points = {
                        totalPoints: 0,
                        availablePoints: 0,
                        level: 1,
                        experiencePoints: 0,
                        nextLevelExperience: 200
                    };
                }
            } else {
                // Return default data when classId is not provided
                points = {
                    totalPoints: 0,
                    availablePoints: 0,
                    level: 1,
                    experiencePoints: 0,
                    nextLevelExperience: 200
                };
            }
            
            const rank = userId ? await leaderboardService.getUserRank(userId) : null;
            
            setPointsData(points);
            setUserRank(rank);
        } catch (error) {
            console.error('Error fetching points data:', error);
            setError(error instanceof Error ? error.message : 'Failed to load points');
        } finally {
            setLoading(false);
        }
    }, [userId, classId]);

    useEffect(() => {
        fetchPointsData();
    }, [fetchPointsData]);

    const getLevelProgress = () => {
        if (!pointsData) return 0;
        
        const currentLevel = displayLevel;
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

    if (error) {
        return (
            <Card className={compact ? "p-4" : ""}>
                <div className="text-center py-4">
                    <div className="text-red-500 mb-2">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <p className="text-red-600 font-medium mb-3">{error}</p>
                    <Button 
                        onClick={fetchPointsData} 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                        Try Again
                    </Button>
                </div>
            </Card>
        );
    }

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
        const currentLevel = displayLevel;
        const currentLevelXP = pointsData.experiencePoints || (pointsData.totalPoints % 200);
        const nextLevelXP = pointsData.nextLevelExperience || 200;
        
        return (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-lg">{pointsData.totalPoints}</span>
                    <span className="text-sm text-gray-600">points</span>
                </div>
                <div className="h-6 w-px bg-gray-300" />
                <div className="text-sm">
                    <div className="font-semibold">Level {currentLevel}</div>
                    <div className="text-gray-600">
                        {currentLevelXP}/{nextLevelXP} XP
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
                            <Trophy className={`w-6 h-6 ${getLevelColor(displayLevel)}`} />
                            <span className={`text-xl font-bold ${getLevelColor(displayLevel)}`}>
                                Level {displayLevel}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress to Level {displayLevel + 1}</span>
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
                                {(() => {
                                    const xpToNextLevel = pointsData.nextLevelExperience - pointsData.experiencePoints;
                                    return Math.max(0, xpToNextLevel);
                                })()}
                            </div>
                            <div className="text-gray-600">XP to Next Level</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

