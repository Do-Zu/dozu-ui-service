'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Star, Users, Target, BookOpen, Zap } from 'lucide-react';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { PointSystem } from '@/components/gamification/PointSystem';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { useGamification } from '@/hooks/useGamification';

export default function GamificationDemoPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [demoUserId] = useState(1); // Demo user ID
    const [demoClassId] = useState(1); // Demo class ID

    const { 
        currentStreak, 
        totalPoints, 
        level, 
        updateStreak, 
        awardPoints,
        loading 
    } = useGamification(demoUserId);

    const handleDemoAction = async (action: string) => {
        try {
            switch (action) {
                case 'updateStreak':
                    await updateStreak();
                    break;
                case 'awardPoints':
                    await awardPoints({
                        action: 'lesson_completed',
                        points: 10,
                        metadata: { demo: true }
                    });
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Demo action failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Gamification System Demo
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Experience our comprehensive learning gamification system with streaks, points, leaderboards, and achievements.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Current Streak</p>
                                    <p className="text-2xl font-bold text-orange-600">{currentStreak}</p>
                                </div>
                                <Flame className="h-8 w-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Points</p>
                                    <p className="text-2xl font-bold text-yellow-600">{totalPoints}</p>
                                </div>
                                <Star className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Level</p>
                                    <p className="text-2xl font-bold text-blue-600">{level}</p>
                                </div>
                                <Trophy className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Class Rank</p>
                                    <p className="text-2xl font-bold text-green-600">#3</p>
                                </div>
                                <Users className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Demo Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Demo Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <Button 
                                onClick={() => handleDemoAction('updateStreak')}
                                className="flex items-center gap-2"
                                disabled={loading}
                            >
                                <Flame className="w-4 h-4" />
                                Update Streak
                            </Button>
                            <Button 
                                onClick={() => handleDemoAction('awardPoints')}
                                className="flex items-center gap-2"
                                disabled={loading}
                                variant="outline"
                            >
                                <Star className="w-4 h-4" />
                                Award Points
                            </Button>
                            <Button 
                                onClick={() => setActiveTab('leaderboard')}
                                className="flex items-center gap-2"
                                variant="outline"
                            >
                                <Trophy className="w-4 h-4" />
                                View Leaderboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="streaks">Streaks</TabsTrigger>
                        <TabsTrigger value="points">Points</TabsTrigger>
                        <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <GamificationDashboard 
                            classId={demoClassId}
                            userId={demoUserId}
                            showPersonalStats={true}
                            showLeaderboard={true}
                        />
                    </TabsContent>

                    <TabsContent value="streaks" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <StreakDisplay 
                                userId={demoUserId} 
                                showFreezeOption={true}
                                compact={false}
                            />
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="w-5 h-5" />
                                        Streak Milestones
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { days: 7, name: "Week Warrior", reward: "50 points" },
                                        { days: 30, name: "Monthly Master", reward: "200 points" },
                                        { days: 100, name: "Century Scholar", reward: "500 points" },
                                        { days: 365, name: "Year Legend", reward: "1000 points" },
                                    ].map((milestone, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                            <div>
                                                <div className="font-medium">{milestone.name}</div>
                                                <div className="text-sm text-gray-600">{milestone.days} days</div>
                                            </div>
                                            <Badge variant="secondary">{milestone.reward}</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="points" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <PointSystem 
                                userId={demoUserId}
                                showHistory={true}
                                compact={false}
                            />
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5" />
                                        Point Rewards
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { action: "Complete Lesson", points: 10, icon: "📚" },
                                        { action: "High Quiz Score", points: 20, icon: "🎯" },
                                        { action: "Maintain Streak", points: 5, icon: "🔥" },
                                        { action: "Review Flashcards", points: 2, icon: "💳" },
                                        { action: "Daily Login", points: 1, icon: "🌅" },
                                    ].map((reward, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{reward.icon}</span>
                                                <span className="font-medium">{reward.action}</span>
                                            </div>
                                            <Badge className="bg-yellow-100 text-yellow-800">
                                                +{reward.points} pts
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="leaderboard" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Leaderboard 
                                classId={demoClassId}
                                timeRange="week"
                                limit={10}
                            />
                            <Leaderboard 
                                classId={demoClassId}
                                timeRange="month"
                                limit={10}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Features Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-orange-500" />
                                    Learning Streaks
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Maintain daily study habits with streak tracking, freeze options, and milestone rewards.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                    Point System
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Earn points for various activities with level progression and achievement unlocks.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-blue-500" />
                                    Leaderboards
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Compete with classmates on weekly and monthly leaderboards with detailed rankings.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

