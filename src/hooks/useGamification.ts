 import { useState, useEffect, useCallback } from 'react';
import { gamificationService, StreakData, PointsData, GamificationStats } from '@/services/gamification/gamificationService';
import { leaderboardService } from '@/services/gamification/leaderboardService';
import { LeaderboardEntry } from '@/types/leaderboard.types';

export function useGamification(userId?: number) {
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [pointsData, setPointsData] = useState<PointsData | null>(null);
    const [gamificationStats, setGamificationStats] = useState<GamificationStats | null>(null);
    const [rank, setRank] = useState<number | null>(null);
    const [freeze, setFreeze] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Only fetch streak and points data for current user
            // Don't fetch getUserGamificationStats as it requires teacher role
            const [streak, points] = await Promise.all([
                gamificationService.getUserStreak(),
                gamificationService.getUserPoints()
            ]);

            setStreakData(streak);
            setPointsData(points);
            setGamificationStats(null); // Don't fetch stats for current user
            
            // Set freeze count from streak data
            setFreeze(streak?.streakFreezeCount || 0);
            
            // Set rank to null for now (can be fetched from leaderboard if needed)
            setRank(null);
        } catch (err) {
            console.error('Error fetching gamification data:', err);
            setError('Failed to load gamification data');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStreak = useCallback(async () => {
        try {
            const result = await gamificationService.updateStreak();
            if (result) {
                await fetchAllData(); // Refresh all data
                return result;
            }
        } catch (err) {
            console.error('Error updating streak:', err);
            throw err;
        }
    }, [fetchAllData]);

    const buyStreakFreeze = useCallback(async (cost: number = 100) => {
        try {
            const success = await gamificationService.buyStreakFreeze(cost);
            if (success) {
                // Update freeze count immediately
                setFreeze(prev => prev + 1);
                await fetchAllData(); // Refresh all data
            }
            return success;
        } catch (err) {
            console.error('Error buying streak freeze:', err);
            throw err;
        }
    }, [fetchAllData]);

    const awardPoints = useCallback(async (activity: {
        action: 'lesson_completed' | 'quiz_high_score' | 'streak_maintained' | 'flashcard_reviewed' | 'daily_login';
        points: number;
        metadata?: any;
    }) => {
        try {
            const success = await leaderboardService.awardPoints({
                userId: userId!,
                ...activity
            });
            if (success) {
                await fetchAllData(); // Refresh all data
            }
            return success;
        } catch (err) {
            console.error('Error awarding points:', err);
            throw err;
        }
    }, [userId, fetchAllData]);

    const fetchRank = useCallback(async (classId?: number) => {
        try {
            
            let leaderboardData: LeaderboardEntry[] = [];
            
            if (classId) {
                const result = await leaderboardService.getWeeklyLeaderboard(classId);
                leaderboardData = result?.entries || [];
            } else {
                leaderboardData = await leaderboardService.getGlobalLeaderboard({
                    timeRange: 'week',
                    activityType: 'all',
                    limit: 50
                });
            }
            
            // Find user's rank in leaderboard
            const userIndex = leaderboardData.findIndex(entry => entry.userId === userId);
            if (userIndex !== -1) {
                setRank(userIndex + 1); // Rank is 1-based
            } else {
                setRank(null);
            }
        } catch (err) {
            console.error('Error fetching rank:', err);
            setRank(null);
        }
    }, [userId]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    return {
        // Data
        streakData,
        pointsData,
        gamificationStats,
        rank,
        freeze,
        loading,
        error,
        
        // Actions
        updateStreak,
        buyStreakFreeze,
        awardPoints,
        fetchRank,
        refreshData: fetchAllData,
        
        // Computed values
        currentStreak: streakData?.currentStreak || 0,
        totalPoints: pointsData?.totalPoints || 0,
        level: pointsData?.level || 1,
        longestStreak: streakData?.longestStreak || 0,
        streakFreezeActive: streakData?.streakFreezeActive || false,
    };
}

export function useLeaderboard(classId?: number, timeRange: 'week' | 'month' = 'week') {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaderboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let data: LeaderboardEntry[] = [];
            
            if (classId) {
                const result = timeRange === 'week' 
                    ? await leaderboardService.getWeeklyLeaderboard(classId)
                    : await leaderboardService.getMonthlyLeaderboard(classId);
                data = result?.entries || [];
            } else {
                data = await leaderboardService.getGlobalLeaderboard({
                    timeRange,
                    activityType: 'all',
                    limit: 50
                });
            }
            
            setLeaderboard(data);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setError('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    }, [classId, timeRange]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    return {
        leaderboard,
        loading,
        error,
        refresh: fetchLeaderboard
    };
}

export function usePointSystem() {
    const POINT_REWARDS = {
        lesson_completed: 10,
        quiz_high_score: 20,
        streak_maintained: 5,
        flashcard_reviewed: 2,
        daily_login: 1,
    };

    const calculatePoints = (action: keyof typeof POINT_REWARDS, multiplier: number = 1) => {
        return POINT_REWARDS[action] * multiplier;
    };

    const getActionDescription = (action: keyof typeof POINT_REWARDS) => {
        const descriptions = {
            lesson_completed: 'Complete a lesson',
            quiz_high_score: 'High score in quiz',
            streak_maintained: 'Maintain daily streak',
            flashcard_reviewed: 'Review flashcards',
            daily_login: 'Daily login bonus',
        };
        return descriptions[action];
    };

    return {
        POINT_REWARDS,
        calculatePoints,
        getActionDescription,
    };
}
