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
import { useTranslations } from 'next-intl';

interface UserProfile {
    userId: number;
    username: string;
    fullName: string | null;
    email: string;
    avatarUrl: string;
    bio?: string | null;
    location?: string | null;
    university?: string | null;
    major?: string | null;
    enrolledAt: Date;
    
    // Gamification stats
    gamificationStats?: {
        totalPoints: number;
        currentStreak: number;
        longestStreak: number;
        level: number;
        experiencePoints: number;
        nextLevelExperience: number;
        achievements: Achievement[];
        weeklyActivity: number[];
        totalLessonsCompleted: number;
        totalQuizzesCompleted: number;
        totalFlashcardsReviewed: number;
        averageScore: number;
    };
}

interface Achievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: UserProfile | null;
    loading?: boolean;
}

export default function StudentProfileModal({
    isOpen,
    onClose,
    student,
    loading = false,
}: StudentProfileModalProps) {
    const tProfile = useTranslations('studentProfile');
    const tCommon = useTranslations('common');
    const tUser = useTranslations('user');

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

    if (!student) return null;

    const { gamificationStats } = student;
    const progressPercentage = gamificationStats ? 
        Math.round((gamificationStats.experiencePoints / gamificationStats.nextLevelExperience) * 100) : 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        {tProfile('title')}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                                        
                                        {gamificationStats && (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <Star className="h-3 w-3" />
                                                    Level {gamificationStats.level}
                                                </Badge>
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <Trophy className="h-3 w-3" />
                                                    {gamificationStats.totalPoints} điểm
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
                                        <span>Tham gia lớp: {new Date(student.enrolledAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    
                                    {student.bio && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Bio:</p>
                                                <p className="text-sm">{student.bio}</p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Middle & Right Columns - Gamification Stats */}
                        {gamificationStats && (
                            <div className="lg:col-span-2 space-y-4">
                                {/* Level Progress */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Tiến độ Level
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Level {gamificationStats.level}</span>
                                                <span>{gamificationStats.experiencePoints}/{gamificationStats.nextLevelExperience} XP</span>
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
                                                    <p className="text-sm text-muted-foreground">Streak hiện tại</p>
                                                    <p className="text-2xl font-bold">{gamificationStats.currentStreak}</p>
                                                </div>
                                                <Flame className="h-8 w-8 text-orange-500" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Streak dài nhất</p>
                                                    <p className="text-2xl font-bold">{gamificationStats.longestStreak}</p>
                                                </div>
                                                <Target className="h-8 w-8 text-green-500" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Bài học</p>
                                                    <p className="text-2xl font-bold">{gamificationStats.totalLessonsCompleted}</p>
                                                </div>
                                                <BookOpen className="h-8 w-8 text-blue-500" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Điểm TB</p>
                                                    <p className="text-2xl font-bold">{gamificationStats.averageScore.toFixed(1)}</p>
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
                                        <CardDescription>Thống kê hoạt động học tập</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {gamificationStats.totalLessonsCompleted}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Bài học hoàn thành</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {gamificationStats.totalQuizzesCompleted}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Quiz đã làm</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {gamificationStats.totalFlashcardsReviewed}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Flashcards ôn tập</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Achievements */}
                                {gamificationStats.achievements.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Award className="h-5 w-5" />
                                                Thành tích ({gamificationStats.achievements.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {gamificationStats.achievements.map((achievement) => (
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
                                                                Đạt được: {new Date(achievement.earnedAt).toLocaleDateString('vi-VN')}
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
