import { useState, useCallback } from 'react';
import { streakProgressService, StreakProgressData } from '@/services/gamification/streakProgress.service';
import { ContentType, ProgressStatus } from '@/types/progress';

export interface StreakProgressResult {
    progressUpdated: boolean;
    streakUpdated: boolean;
    message: string;
}

export interface LearningStreakData {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: Date | null;
    streakActive: boolean;
}

export const useStreakProgress = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Track general learning activity
     */
    const trackLearningActivity = useCallback(async (data: StreakProgressData): Promise<StreakProgressResult> => {
        try {
            setLoading(true);
            setError(null);
            const result = await streakProgressService.trackLearningActivity(data);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to track learning activity';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Track flashcard learning session
     */
    const trackFlashcardSession = useCallback(async (
        userId: string,
        topicId: string,
        flashcardsStudied: number,
        accuracy: number,
        timeSpent: number
    ): Promise<StreakProgressResult> => {
        try {
            setLoading(true);
            setError(null);
            const result = await streakProgressService.trackFlashcardSession(
                userId,
                topicId,
                flashcardsStudied,
                accuracy,
                timeSpent
            );
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to track flashcard session';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Track quiz completion
     */
    const trackQuizCompletion = useCallback(async (
        userId: string,
        quizId: string,
        score: number,
        timeSpent: number
    ): Promise<StreakProgressResult> => {
        try {
            setLoading(true);
            setError(null);
            const result = await streakProgressService.trackQuizCompletion(
                userId,
                quizId,
                score,
                timeSpent
            );
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to track quiz completion';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get user's learning streak based on progress
     */
    const getUserLearningStreak = useCallback(async (userId: string): Promise<LearningStreakData> => {
        try {
            setLoading(true);
            setError(null);
            const result = await streakProgressService.getUserLearningStreak(userId);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get learning streak';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        trackLearningActivity,
        trackFlashcardSession,
        trackQuizCompletion,
        getUserLearningStreak,
        loading,
        error
    };
};

// Convenience hooks for specific use cases
export const useFlashcardStreakTracking = () => {
    const { trackFlashcardSession, loading, error } = useStreakProgress();
    
    return {
        trackFlashcardSession,
        loading,
        error
    };
};

export const useQuizStreakTracking = () => {
    const { trackQuizCompletion, loading, error } = useStreakProgress();
    
    return {
        trackQuizCompletion,
        loading,
        error
    };
};

export const useLearningStreak = () => {
    const { getUserLearningStreak, loading, error } = useStreakProgress();
    
    return {
        getUserLearningStreak,
        loading,
        error
    };
};

