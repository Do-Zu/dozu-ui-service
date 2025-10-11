import { useState, useCallback } from 'react';
import { learningStatsService, LearningStats } from '@/services/progress/learningStats.service';

export const useLearningStats = () => {
    // Per-operation loading states
    const [loadingUser, setLoadingUser] = useState(false);
    const [loadingClass, setLoadingClass] = useState(false);
    const [loadingTopic, setLoadingTopic] = useState(false);
    const [loadingWeekly, setLoadingWeekly] = useState(false);
    
    // Per-operation error states
    const [errorUser, setErrorUser] = useState<string | null>(null);
    const [errorClass, setErrorClass] = useState<string | null>(null);
    const [errorTopic, setErrorTopic] = useState<string | null>(null);
    const [errorWeekly, setErrorWeekly] = useState<string | null>(null);

    /**
     * Get user's learning statistics
     */
    const getUserLearningStats = useCallback(async (userId: string): Promise<LearningStats> => {
        try {
            setLoadingUser(true);
            setErrorUser(null);
            const result = await learningStatsService.getUserLearningStats(userId);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get learning stats';
            setErrorUser(errorMessage);
            throw err;
        } finally {
            setLoadingUser(false);
        }
    }, []);

    /**
     * Get class learning statistics
     */
    const getClassLearningStats = useCallback(async (userId: string, classId: number): Promise<LearningStats> => {
        try {
            setLoadingClass(true);
            setErrorClass(null);
            const result = await learningStatsService.getClassLearningStats(userId, classId);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get class learning stats';
            setErrorClass(errorMessage);
            throw err;
        } finally {
            setLoadingClass(false);
        }
    }, []);

    /**
     * Get topic learning statistics
     */
    const getTopicLearningStats = useCallback(async (userId: string, topicId: string): Promise<LearningStats> => {
        try {
            setLoadingTopic(true);
            setErrorTopic(null);
            const result = await learningStatsService.getTopicLearningStats(userId, topicId);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get topic learning stats';
            setErrorTopic(errorMessage);
            throw err;
        } finally {
            setLoadingTopic(false);
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
            setLoadingWeekly(true);
            setErrorWeekly(null);
            const result = await learningStatsService.getWeeklyLearningActivity(userId);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get weekly learning activity';
            setErrorWeekly(errorMessage);
            throw err;
        } finally {
            setLoadingWeekly(false);
        }
    }, []);

    return {
        getUserLearningStats,
        getClassLearningStats,
        getTopicLearningStats,
        getWeeklyLearningActivity,
        // Per-operation loading states
        loadingUser,
        loadingClass,
        loadingTopic,
        loadingWeekly,
        // Per-operation error states
        errorUser,
        errorClass,
        errorTopic,
        errorWeekly,
        // Convenience properties for backward compatibility
        loading: loadingUser || loadingClass || loadingTopic || loadingWeekly,
        error: errorUser || errorClass || errorTopic || errorWeekly
    };
};

