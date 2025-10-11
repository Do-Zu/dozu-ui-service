'use client';

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
    Trophy,
    Flame,
    Star,
    BookOpen,
    Target,
    Award,
    TrendingUp,
    User,
    Mail,
    MapPin,
    GraduationCap,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { gamificationService } from '@/services/gamification/gamification.service';
import { GamificationStats } from '@/types/streaks/gamification.type';
import { IUserProfile } from '@/types/profile';
// import lessonCompletionService, { LessonCompletionStats } from '@/services/class-based-learning/lessonCompletion.service';
import useFetch from '@/hooks/useFetch';

type Achievement = NonNullable<IUserProfile['gamificationStats']>['achievements'][number];

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: IUserProfile | null;
    loading?: boolean;
    classId?: number;
}

export default function StudentProfileModal({
    isOpen,
    onClose,
    student,
    loading = false,
    classId,
}: StudentProfileModalProps) {
    const tProfile = useTranslations('studentProfile');
    const locale = useLocale();
    const tCommon = useTranslations('common');
    const tUser = useTranslations('user');
    
    // Fetch real gamification stats for the student
    const {
        data: realGamificationStats,
        loading: gamificationLoading,
        error: gamificationError,
    } = useFetch<GamificationStats>(() => 
        student ? gamificationService.getUserGamificationStats(student.userId) : Promise.resolve(null)
    );

    // Fetch real lesson completion stats for the student
    // const {
    //     data: lessonStats,
    //     loading: lessonStatsLoading,
    //     error: lessonStatsError,
    // } = useFetch<LessonCompletionStats>(() => 
    //     student ? lessonCompletionService.getStudentLessonStats(student.userId, classId) : Promise.resolve(null)
    // );

    const getInitials = (name: string | null, username: string) => {
        return (
            name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase() || username.substring(0, 2).toUpperCase()
        );
    };

    const getRarityColor = (rarity: Achievement['rarity']) => {
        switch (rarity) {
            case 'common': return 'bg-gray-100 text-gray-800';
            case 'rare': return 'bg-blue-100 text-blue-800';
            case 'epic': return 'bg-purple-100 text-purple-800';
            case 'legendary': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Merge real data with fallback to student's mock data
    const gamificationStats = realGamificationStats || student?.gamificationStats;
    
    // Create enhanced gamification stats with real lesson completion data
    const enhancedGamificationStats = gamificationStats ? {
        ...gamificationStats,
        // Calculate level from points if level is 0 or invalid
        level: gamificationStats.level > 0
            ? gamificationStats.level
            : Math.max(1, Math.floor(gamificationStats.totalPoints / 200) + 1),
        experiencePoints:
            gamificationStats.level > 0
                ? gamificationStats.experiencePoints ?? (gamificationStats.totalPoints % 200)
                : gamificationStats.totalPoints % 200,
        nextLevelExperience: gamificationStats.nextLevelExperience ?? 200,
        // Use gamification data directly, fallback to calculated values from points
        totalLessonsCompleted: gamificationStats.totalLessonsCompleted ?? Math.floor(gamificationStats.totalPoints / 10),
        totalQuizzesCompleted: gamificationStats.totalQuizzesCompleted ?? Math.floor(gamificationStats.totalPoints / 20),
        totalFlashcardsReviewed: gamificationStats.totalFlashcardsReviewed ?? Math.floor(gamificationStats.totalPoints / 2),
        averageScore: gamificationStats.averageScore ?? Math.min(95, 60 + (gamificationStats.totalPoints / 10)),
    } : null;    
    const progressPercentage = enhancedGamificationStats ? 
        Math.round((enhancedGamificationStats.experiencePoints / enhancedGamificationStats.nextLevelExperience) * 100) : 0;
    
    // Show loading state if we're fetching any data
    const isLoading = loading || gamificationLoading; // || lessonStatsLoading;
    
    // Don't return null during loading or when modal is open - show the modal with loading state
    if (!student && !isLoading && !isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        {tProfile('title')}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : !student ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">{tProfile('noStudentData') || 'No student data available'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Basic Info */}
                        <div className="space-y-4">
                            {/* Profile Header */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={student.avatarUrl} alt={student.username} />
                                            <AvatarFallback className="text-lg">
                                                {getInitials(student.fullName, student.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-xl font-semibold">
                                                {student.fullName || student.username}
                                            </h3>
                                            <p className="text-muted-foreground">@{student.username}</p>
                                        </div>
                                        
                                        {enhancedGamificationStats && (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <Star className="h-3 w-3" />
                                                    {tProfile('level')} {enhancedGamificationStats.level}
                                                </Badge>
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <Trophy className="h-3 w-3" />
                                                    {enhancedGamificationStats.totalPoints} {tProfile('points')}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">{tProfile('personalInfo')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{student.email}</span>
                                    </div>
                                    
                                    {student.location && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{student.location}</span>
                                        </div>
                                    )}
                                    
                                    {student.university && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                            <span>{student.university}</span>
                                        </div>
                                    )}
                                    
                                    {student.major && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            <span>{student.major}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{tProfile('joinedClass')}: {new Date(student.enrolledAt).toLocaleDateString(locale)}</span>
                                    </div>
                                    
                                    {student.bio && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{tProfile('bio')}:</p>
                                                <p className="text-sm">{student.bio}</p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Middle & Right Columns - Gamification Stats */}
                        {enhancedGamificationStats && (
                            <div className="lg:col-span-2 space-y-4">
                                {/* Show error message if gamification data failed to load */}
                                {gamificationError && (
                                    <Card className="border-orange-200 bg-orange-50">
                                        <CardContent className="pt-4">
                                            <p className="text-sm text-orange-700">
                                                {tProfile('gamificationDataError') || 'Unable to load learning statistics. Showing cached data.'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                                {/* Level Progress */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            {tProfile('levelProgress')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>{tProfile('level')} {enhancedGamificationStats.level}</span>
                                                <span>{enhancedGamificationStats.experiencePoints}/{enhancedGamificationStats.nextLevelExperience} XP</span>
                                            </div>
                                            <Progress value={progressPercentage} className="h-2" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Stats Overview */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">{tProfile('currentStreak')}</p>
                                                    <p className="text-2xl font-bold">{enhancedGamificationStats.currentStreak}</p>
                                                </div>
                                                <Flame className="h-8 w-8 text-orange-500" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">{tProfile('longestStreak')}</p>
                                                    <p className="text-2xl font-bold">{enhancedGamificationStats.longestStreak}</p>
                                                </div>
                                                <Target className="h-8 w-8 text-green-500" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">{tProfile('lessonsCompleted')}</p>
                                                    <p className="text-2xl font-bold">{enhancedGamificationStats.totalLessonsCompleted}</p>
                                                </div>
                                                <BookOpen className="h-8 w-8 text-blue-500" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">{tProfile('averageScore')}</p>
                                                    <p className="text-2xl font-bold">{enhancedGamificationStats.averageScore.toFixed(1)}</p>
                                                </div>
                                                <Star className="h-8 w-8 text-yellow-500" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Learning Activities */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{tProfile('learningStats')}</CardTitle>
                                        <CardDescription>{tProfile('learningStatsDescription')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {enhancedGamificationStats.totalLessonsCompleted}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{tProfile('lessonsCompleted')}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {enhancedGamificationStats.totalQuizzesCompleted}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{tProfile('quizzesCompleted')}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {enhancedGamificationStats.totalFlashcardsReviewed}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{tProfile('flashcardsReviewed')}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Achievements */}
                                {enhancedGamificationStats.achievements.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Award className="h-5 w-5" />
                                                {tProfile('achievements')} ({enhancedGamificationStats.achievements.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {enhancedGamificationStats.achievements.map((achievement) => (
                                                    <div
                                                        key={achievement.id}
                                                        className="flex items-center gap-3 p-3 rounded-lg border"
                                                    >
                                                        <div className="text-2xl">{achievement.icon}</div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium">{achievement.name}</h4>
                                                                <Badge 
                                                                    className={`text-xs ${getRarityColor(achievement.rarity)}`}
                                                                >
                                                                    {achievement.rarity}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {achievement.description}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {tProfile('earnedAt')}: {new Date(achievement.earnedAt).toLocaleDateString(locale)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
