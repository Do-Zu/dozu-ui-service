import { useState, useCallback } from 'react';
import { learningStatsService, LearningStats } from '@/services/progress/learningStats.service';

export const useLearningStats = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Get user's learning statistics
     */
    const getUserLearningStats = useCallback(async (userId: string): Promise<LearningStats> => {
        try {
            setLoading(true);
            setError(null);
            const result = await learningStatsService.getUserLearningStats(userId);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get learning stats';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get class learning statistics
     */
    const getClassLearningStats = useCallback(async (userId: string, classId: number): Promise<LearningStats> => {
        try {
            setLoading(true);
            setError(null);
            const result = await learningStatsService.getClassLearningStats(userId, classId);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get class learning stats';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get topic learning statistics
     */
    const getTopicLearningStats = useCallback(async (userId: string, topicId: string): Promise<LearningStats> => {
        try {
            setLoading(true);
            setError(null);
            const result = await learningStatsService.getTopicLearningStats(userId, topicId);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get topic learning stats';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get weekly learning activity
     */
    const getWeeklyLearningActivity = useCallback(async (userId: string): Promise<{
        week: Array<{ day: string; count: number; date: string }>;
        totalThisWeek: number;
    }> => {
        try {
            setLoading(true);
            setError(null);
            const result = await learningStatsService.getWeeklyLearningActivity(userId);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get weekly learning activity';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        getUserLearningStats,
        getClassLearningStats,
        getTopicLearningStats,
        getWeeklyLearningActivity,
        loading,
        error
    };
};

