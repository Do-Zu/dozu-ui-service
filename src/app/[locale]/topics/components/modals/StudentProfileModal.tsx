'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Trophy,
    Flame,
    Star,
    BookOpen,
    Target,
    Award,
    TrendingUp,
    User,
    Mail,
    BarChart3,
    Clock,
    CheckCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { gamificationService } from '@/services/gamification/gamification.service';
import { GamificationStats } from '@/types/streaks/gamification.type';
// import lessonCompletionService, { LessonCompletionStats } from '@/services/class-based-learning/lessonCompletion.service';
import useFetch from '@/hooks/useFetch';
import { useLearningStreak, LearningStreakData } from '@/hooks/useStreakProgress';
import { useLearningStats } from '@/hooks/useLearningStats';
import { LearningStats } from '@/services/progress/learningStats.service';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import { Button } from '@/components/ui/button';
import { Shield, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId?: number;
}

export default function StudentProfileModal({
    isOpen,
    onClose,
    classId,
}: StudentProfileModalProps) {
    const { user } = useAuth();
    const t = useTranslations('common');
    const { getUserLearningStreak } = useLearningStreak();
    const { getUserLearningStats } = useLearningStats();
    const { 
        buyStreakFreeze, 
        refreshData,
        streakData,
        pointsData,
        loading: gamificationLoading,
        error: gamificationError
    } = useGamification();

    // Create gamification stats from useGamification hook data
    const gamificationStats = pointsData && streakData ? {
        totalPoints: pointsData.totalPoints,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        level: Math.max(1, Math.floor(pointsData.totalPoints / 200) + 1), // Calculate level from points
        experiencePoints: pointsData.totalPoints % 200, // Calculate XP within current level
        nextLevelExperience: 200, // Fixed XP needed per level
        streakFreezeCount: streakData.streakFreezeCount,
        streakFreezeActive: streakData.streakFreezeActive,
        totalLessonsCompleted: 0, // Will be filled by learning stats
        totalQuizzesCompleted: 0, // Will be filled by learning stats
        totalFlashcardsReviewed: 0, // Will be filled by learning stats
        averageScore: 0, // Will be filled by learning stats
        achievements: [] // Empty for now
    } : null;

    // Use gamification loading and error from useGamification hook

    // Fetch learning streak based on progress data
    const {
        data: learningStreakData,
        loading: learningStreakLoading,
        error: learningStreakError,
    } = useFetch<LearningStreakData>(() => {
        if (!user) {
            return Promise.resolve(null);
        }
        return getUserLearningStreak(user.userId.toString());
    });

    // Fetch learning statistics from progress data
    const {
        data: learningStats,
        loading: learningStatsLoading,
        error: learningStatsError,
    } = useFetch<LearningStats>(() => {
        if (!user) {
            return Promise.resolve(null);
        }
        return getUserLearningStats(user.userId.toString());
    });

    // const {
    //     data: lessonStats,
    //     loading: lessonStatsLoading,
    //     error: lessonStatsError,
    // } = useFetch<LessonCompletionStats>(() => {
    //     try {
    //         console.log('StudentProfileModal: Fetching lesson stats for user:', user?.userId, 'classId:', classId);
    //         return user ? lessonCompletionService.getStudentLessonStats(Number(user.userId), classId) : Promise.resolve(null);
    //     } catch (error) {
    //         console.error('StudentProfileModal: Error in lesson stats fetch:', error);
    //         return Promise.resolve(null);
    //     }
    // });

    // Create enhanced gamification stats with real learning data
    const enhancedGamificationStats = gamificationStats ? {
        ...gamificationStats,
        // Use learning stats for real data, fallback to zero when data is unavailable
        totalLessonsCompleted: learningStats?.totalLessonsCompleted || 0,
        totalQuizzesCompleted: learningStats?.totalQuizzesCompleted || 0,
        totalFlashcardsReviewed: learningStats?.totalFlashcardsReviewed || 0,
        averageScore: learningStats?.averageScore || 0,
    } : null;

    // Check if we have any errors
    const hasErrors = gamificationError || learningStreakError || learningStatsError;
    const errorMessages = [];
    if (gamificationError) errorMessages.push('Failed to load gamification data');
    if (learningStreakError) errorMessages.push('Failed to load streak data');
    if (learningStatsError) errorMessages.push('Failed to load learning statistics');

    const isLoading = gamificationLoading || learningStreakLoading || learningStatsLoading;

    if (!user) {
        return null;
    }

    const getInitials = (name: string | null, username: string) => {
        try {
            if (name && name.trim()) {
                return name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();
            }
            if (username && username.trim()) {
                return username.substring(0, 2).toUpperCase();
            }
            return 'U';
        } catch (error) {
            console.error('Error getting initials:', error);
            return 'U';
        }
    };

    const handleBuyStreakFreeze = async () => {
        try {
            await buyStreakFreeze(100); // 100 points for 1 streak freeze
            toast({
                title: "Success!",
                description: "You've successfully purchased a streak freeze!",
            });
            // Refresh data to show updated points and freeze count
            await refreshData();
        } catch (error) {
            console.error('Error buying streak freeze:', error);
            toast({
                title: "Error",
                description: "Failed to purchase streak freeze. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
                        <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        My Learning Progress
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 overflow-y-auto max-h-[70vh]">
                    {/* User Info Header */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatarUrl} alt={user.username} />
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold text-lg">
                                {getInitials(user.fullName, user.username)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {user.fullName || user.username || 'User'}
                            </h3>
                            {user.username && user.username !== user.fullName && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                            )}

                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email || 'No email'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                        Joined {user.createdAt 
                                            ? new Date(user.createdAt).toLocaleDateString() 
                                            : user.lastLoginAt
                                                ? new Date(user.lastLoginAt).toLocaleDateString()
                                                : 'Recently'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Streak Badge */}
                        <div className="text-center">
                            <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full">
                                <Flame className="w-4 h-4" />
                                <span className="font-semibold">
                                    {enhancedGamificationStats?.currentStreak || learningStreakData?.currentStreak || 0}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {learningStreakData?.streakActive ? 'Active Streak' : 'Day Streak'}
                            </p>
                        </div>
                    </div>

                    {/* Error State */}
                    {hasErrors && !isLoading ? (
                        <div className="space-y-3">
                            {errorMessages.map((message, index) => (
                                <div key={index} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Some data may not be available. Please try refreshing the page.
                                </p>
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-300">Loading your progress...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Gamification Overview */}
                            {enhancedGamificationStats && (
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Level Card */}
                                    <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Level</p>
                                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{enhancedGamificationStats?.level || 0}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {enhancedGamificationStats?.experiencePoints || 0}/{enhancedGamificationStats?.nextLevelExperience || 100} XP
                                                    </p>
                                                </div>
                                                <Trophy className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                                            </div>
                                            <Progress 
                                                value={enhancedGamificationStats?.nextLevelExperience ? (enhancedGamificationStats.experiencePoints / enhancedGamificationStats.nextLevelExperience) * 100 : 0} 
                                                className="mt-2 h-1"
                                            />
                                        </CardContent>
                                    </Card>

                                    {/* Streak Card */}
                                    <Card className="border-l-4 border-l-orange-500 dark:border-l-orange-400">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Streak</p>
                                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                        {enhancedGamificationStats?.currentStreak || learningStreakData?.currentStreak || 0}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Best: {enhancedGamificationStats?.longestStreak || learningStreakData?.longestStreak || 0}
                                                    </p>
                                                </div>
                                                <Flame className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Points Card */}
                                    <Card className="border-l-4 border-l-green-500 dark:border-l-green-400">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Points</p>
                                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{enhancedGamificationStats?.totalPoints || 0}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                                </div>
                                                <Star className="h-6 w-6 text-green-500 dark:text-green-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Learning Statistics */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                                        <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        Learning Statistics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-2">
                                                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                                {learningStats?.totalLessonsCompleted || 0}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Lessons</div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-2">
                                                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                                {learningStats?.totalQuizzesCompleted || 0}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Quizzes</div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full mx-auto mb-2">
                                                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                                {learningStats?.totalFlashcardsReviewed || 0}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Flashcards</div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mx-auto mb-2">
                                                <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                                {(learningStats?.averageScore || 0).toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Score</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Streak Freeze Management */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        Streak Protection
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Current Streak Status */}
                                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                            <div className="flex items-center justify-center mb-2">
                                                <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                {enhancedGamificationStats?.currentStreak || learningStreakData?.currentStreak || 0}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
                                            <div className="mt-2">
                                                {learningStreakData?.streakActive ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                                        <RotateCcw className="w-3 h-3 mr-1" />
                                                        Reset
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Available Points */}
                                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <div className="flex items-center justify-center mb-2">
                                                <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {enhancedGamificationStats?.totalPoints || 0}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Available Points</div>
                                        </div>

                                        {/* Streak Freeze Count */}
                                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                            <div className="flex items-center justify-center mb-2">
                                                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                {enhancedGamificationStats?.streakFreezeCount || 0}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Freeze Available</div>
                                        </div>
                                    </div>

                                    {/* Purchase Button */}
                                    <div className="mt-6 text-center">
                                        <Button
                                            onClick={handleBuyStreakFreeze}
                                            disabled={(enhancedGamificationStats?.totalPoints || 0) < 100}
                                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Shield className="w-4 h-4 mr-2" />
                                            Buy Streak Freeze (100 pts)
                                        </Button>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Protect your streak from being reset when you miss a day
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
