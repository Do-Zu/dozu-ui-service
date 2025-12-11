import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Flame, Star, TrendingUp, Users, Calendar } from 'lucide-react';
import { StreakDisplay } from './StreakDisplay';
import { PointSystem } from './PointSystem';
import { Leaderboard } from './Leaderboard';
import { gamificationService } from '@/services/gamification/gamification.service';
import { GamificationStats } from '@/types/streaks/gamification.type';
import { leaderboardService } from '@/services/gamification/leaderboard.service';

interface GamificationDashboardProps {
    classId?: number;
    userId?: number;
    showPersonalStats?: boolean;
    showLeaderboard?: boolean;
}

export function GamificationDashboard({ 
    classId, 
    userId, 
    showPersonalStats = true, 
    showLeaderboard = true 
}: GamificationDashboardProps) {
    const [personalStats, setPersonalStats] = useState<GamificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchPersonalStats();
    }, [userId, classId]);

    const fetchPersonalStats = async () => {
        if (!userId || !classId) {
            setLoading(false);
            return;
        }
        
        try {
            setError(null);
            setLoading(true);
            const stats = await gamificationService.getUserGamificationStats(userId, classId);
            setPersonalStats(stats);
        } catch (error) {
            console.error('Error fetching personal stats:', error);
            setError('Failed to load gamification data. Please try again.');
        } finally {
            setLoading(false);
        }
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
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-red-600 text-xl">⚠️</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <Button 
                                    onClick={fetchPersonalStats}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Retry
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="personal">Personal Stats</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {showPersonalStats && personalStats && (
                            <>
                                <StreakDisplay userId={userId} classId={classId} compact={false} />
                                <PointSystem userId={userId} classId={classId} compact={false} />
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5" />
                                            Quick Stats
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Level</span>
                                            <Badge className={getLevelColor(personalStats.level)}>
                                                {personalStats.level}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Lessons</span>
                                            <span className="font-semibold">{personalStats.totalLessonsCompleted}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Quizzes</span>
                                            <span className="font-semibold">{personalStats.totalQuizzesCompleted}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Flashcards</span>
                                            <span className="font-semibold">{personalStats.totalFlashcardsCompleted}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Avg Score</span>
                                            <span className="font-semibold">{personalStats.averageScore.toFixed(1)}%</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="personal" className="space-y-4">
                    {showPersonalStats ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <StreakDisplay userId={userId} classId={classId} showFreezeOption={true} />
                            <PointSystem userId={userId} classId={classId} showHistory={true} />
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>Personal stats not available</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="leaderboard" className="space-y-4">
                    {showLeaderboard ? (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveTab('leaderboard')}
                                    className="flex items-center gap-2"
                                >
                                    <Trophy className="w-4 h-4" />
                                    Weekly Leaderboard
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveTab('leaderboard')}
                                    className="flex items-center gap-2"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Monthly Leaderboard
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <Leaderboard 
                                    classId={classId} 
                                    timeRange="week" 
                                    limit={10}
                                />
                                <Leaderboard 
                                    classId={classId} 
                                    timeRange="month" 
                                    limit={10}
                                />
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center text-gray-500">
                                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>Leaderboard not available</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

