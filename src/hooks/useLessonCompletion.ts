import { useState, useEffect, useCallback } from 'react';
import lessonCompletionService, { LessonCompletionStats } from '@/services/class-based-learning/lessonCompletion.service';

export function useLessonCompletion(userId?: number, classId?: number) {
    const [lessonStats, setLessonStats] = useState<LessonCompletionStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLessonStats = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);
            const stats = await lessonCompletionService.getStudentLessonStats(userId, classId);
            setLessonStats(stats);
        } catch (err) {
            console.error('Error fetching lesson completion stats:', err);
            setError('Failed to fetch lesson completion statistics');
        } finally {
            setLoading(false);
        }
    }, [userId, classId]);

    useEffect(() => {
        fetchLessonStats();
    }, [fetchLessonStats]);

    return {
        lessonStats,
        loading,
        error,
        refetch: fetchLessonStats,
    };
}

export function useClassLessonCompletion(classId?: number) {
    const [classStats, setClassStats] = useState<Map<number, LessonCompletionStats>>(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClassStats = useCallback(async () => {
        if (!classId) return;

        try {
            setLoading(true);
            setError(null);
            const stats = await lessonCompletionService.getClassLessonStats(classId);
            setClassStats(stats);
        } catch (err) {
            console.error('Error fetching class lesson completion stats:', err);
            setError('Failed to fetch class lesson completion statistics');
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetchClassStats();
    }, [fetchClassStats]);

    return {
        classStats,
        loading,
        error,
        refetch: fetchClassStats,
    };
}

export function useTopicLessonCompletion(userId?: number, topicId?: number) {
    const [topicStats, setTopicStats] = useState<{
        isCompleted: boolean;
        completionPercentage: number;
        timeSpent: number;
        lastAccessed: Date;
        score?: number;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTopicStats = useCallback(async () => {
        if (!userId || !topicId) return;

        try {
            setLoading(true);
            setError(null);
            const stats = await lessonCompletionService.getTopicLessonStats(userId, topicId);
            setTopicStats(stats);
        } catch (err) {
            console.error('Error fetching topic lesson completion stats:', err);
            setError('Failed to fetch topic lesson completion statistics');
        } finally {
            setLoading(false);
        }
    }, [userId, topicId]);

    useEffect(() => {
        fetchTopicStats();
    }, [fetchTopicStats]);

    return {
        topicStats,
        loading,
        error,
        refetch: fetchTopicStats,
    };
}

