import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Calendar } from 'lucide-react';
import { LeaderboardEntry, WeeklyLeaderboard, MonthlyLeaderboard } from '@/types/leaderboard.types';
import { leaderboardService } from '@/services/gamification/leaderboardService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardProps {
    classId?: number;
    timeRange: 'week' | 'month';
    limit?: number;
}

export function Leaderboard({ classId, timeRange, limit = 10 }: LeaderboardProps) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLeaderboard();
    }, [classId, timeRange, limit]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            let data: LeaderboardEntry[] = [];
            
            if (classId) {
                const result = timeRange === 'week' 
                    ? await leaderboardService.getWeeklyLeaderboard(classId)
                    : await leaderboardService.getMonthlyLeaderboard(classId);
                data = result?.entries || [];
            } else {
                data = await leaderboardService.getGlobalLeaderboard({
                    timeRange,
                    limit,
                    activityType: 'all'
                });
            }
            
            setLeaderboard(data);
        } catch (err) {
            setError('Failed to load leaderboard');
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="w-6 h-6 text-yellow-500" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 3:
                return <Trophy className="w-6 h-6 text-amber-600" />;
            default:
                return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</span>;
        }
    };

    const getRankBadgeColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 2:
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 3:
                return 'bg-amber-100 text-amber-800 border-amber-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        {timeRange === 'week' ? 'Weekly' : 'Monthly'} Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        {timeRange === 'week' ? 'Weekly' : 'Monthly'} Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-red-600">
                        {error}
                        <Button onClick={fetchLeaderboard} className="mt-4" variant="outline">
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {timeRange === 'week' ? 'Weekly' : 'Monthly'} Leaderboard
                    {classId && <Badge variant="secondary">Class</Badge>}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {leaderboard.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No data available</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.map((entry, index) => (
                            <div
                                key={entry.userId}
                                className={`flex items-center justify-between p-4 rounded-lg border ${
                                    entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' : 'bg-white border-gray-200'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8">
                                        {getRankIcon(entry.rank)}
                                    </div>
                                    
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={entry.avatarUrl} />
                                        <AvatarFallback>
                                            {entry.fullName ? entry.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : entry.username[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {entry.fullName || entry.username}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span>{entry.points} points</span>
                                            <span>•</span>
                                            <span>{entry.streak} day streak</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <Badge className={getRankBadgeColor(entry.rank)}>
                                        #{entry.rank}
                                    </Badge>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            {entry.lessonsCompleted} lessons
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3" />
                                            {entry.quizzesCompleted} quizzes
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

