'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTopicLessonCompletion } from '@/hooks/useLessonCompletion';

interface LessonCompletionTrackerProps {
    userId: number;
    topicId: number;
    topicName: string;
    totalLessons?: number;
    className?: string;
}

export default function LessonCompletionTracker({
    userId,
    topicId,
    topicName,
    totalLessons = 0,
    className = '',
}: LessonCompletionTrackerProps) {
    const t = useTranslations('topic');
    const tCommon = useTranslations('common');
    
    const { topicStats, loading, error } = useTopicLessonCompletion(userId, topicId);

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="pt-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={`border-red-200 bg-red-50 ${className}`}>
                <CardContent className="pt-4">
                    <p className="text-sm text-red-700">
                        {tCommon('error')}: {error}
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (!topicStats) {
        return null;
    }

    const { isCompleted, completionPercentage, timeSpent, lastAccessed, score } = topicStats;
    
    const formatTime = (milliseconds: number) => {
        const minutes = Math.floor(milliseconds / 60000);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m`;
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5" />
                    {t('lessonProgress') || 'Lesson Progress'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Completion Status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <Target className="h-5 w-5 text-blue-500" />
                        )}
                        <span className="font-medium">
                            {isCompleted 
                                ? (t('completed') || 'Completed')
                                : (t('inProgress') || 'In Progress')
                            }
                        </span>
                    </div>
                    <Badge variant={isCompleted ? 'default' : 'secondary'}>
                        {completionPercentage.toFixed(0)}%
                    </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{t('progress') || 'Progress'}</span>
                        <span>{completionPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {t('timeSpent') || 'Time Spent'}
                        </div>
                        <p className="font-medium">{formatTime(timeSpent)}</p>
                    </div>
                    
                    {score !== undefined && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Target className="h-4 w-4" />
                                {t('score') || 'Score'}
                            </div>
                            <p className="font-medium">{score.toFixed(1)}%</p>
                        </div>
                    )}
                </div>

                {/* Last Accessed */}
                <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                        {t('lastAccessed') || 'Last accessed'}: {formatDate(lastAccessed)}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

