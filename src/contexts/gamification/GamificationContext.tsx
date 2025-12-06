'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import gamificationService from '@/services/gamification/gamification.service';
import { 
    StreakData, 
    PointsData, 
    GamificationStats,
    StreakUpdateResult 
} from '@/types/streaks/gamification.type';
import { classStreakService, ClassStreakData } from '@/services/class-based-learning/classStreak.service';
import { getRequest } from '@/api/api';
import { API_GAMIFICATION_ROUTES } from '@/utils/constants/api.routes';

interface GamificationContextType {
    // Streak data
    streakData: StreakData | null;
    isLoadingStreak: boolean;
    streakError: string | null;
    hasUpdatedStreakToday: boolean;
    
    // Points data
    pointsData: PointsData | null;
    isLoadingPoints: boolean;
    pointsError: string | null;
    
    // Actions
    updateStreak: (classId: number) => Promise<StreakUpdateResult | null>;
    refreshStreakData: (classId?: number) => Promise<void>;
    refreshPointsData: (classId?: number) => Promise<void>;
    buyStreakFreeze: (classId: number, cost?: number) => Promise<boolean>;
    getStudentGamificationStats: (userId: number, classId: number) => Promise<GamificationStats | null>;
    
    // Batch operations for teachers
    getStudentStreaks: (userIds: number[]) => Promise<Map<number, GamificationStats>>;
    getClassStudentStreaks: (classId: number, userIds: number[]) => Promise<Map<number, GamificationStats>>;
    buyStreakFreezeForStudent: (studentId: number, classId: number, cost?: number) => Promise<boolean>;
}

interface GamificationProviderProps {
    children: React.ReactNode;
    autoLoad?: boolean;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children, autoLoad = true }: GamificationProviderProps) {
    // Streak state
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [isLoadingStreak, setIsLoadingStreak] = useState(false);
    const [streakError, setStreakError] = useState<string | null>(null);
    const [hasUpdatedStreakToday, setHasUpdatedStreakToday] = useState(false);
    
    // Points state
    const [pointsData, setPointsData] = useState<PointsData | null>(null);
    const [isLoadingPoints, setIsLoadingPoints] = useState(false);
    const [pointsError, setPointsError] = useState<string | null>(null);

    // Check if streak was already updated today
    useEffect(() => {
        const lastUpdate = localStorage.getItem('lastStreakUpdate');
        const today = new Date().toDateString();
        setHasUpdatedStreakToday(lastUpdate === today);
    }, []);

    // Auto-load data on mount
    useEffect(() => {
        if (autoLoad) {
            refreshStreakData();
            refreshPointsData();
        }
    }, [autoLoad]);

    // Refresh streak data (requires classId for class-based learning)
    const refreshStreakData = async (classId?: number) => {
        try {
            setIsLoadingStreak(true);
            setStreakError(null);
            
            if (!classId) {
                // Streak is only available for class-based learning
                setStreakData(null);
                return;
            }
            
            // Get userId from localStorage
            const userString = localStorage.getItem('user');
            if (userString) {
                const userObject = JSON.parse(userString);
                const userId = userObject?.userId || userObject?.id;
                
                if (userId) {
                    const data = await classStreakService.getStudentClassStreak(userId, classId);
                    setStreakData({
                        currentStreak: data.currentStreak,
                        longestStreak: data.longestStreak,
                        lastStudyDate: data.lastStudyDate,
                        streakFreezeActive: data.streakFreezeActive,
                        streakFreezeCount: data.streakFreezeCount,
                    });
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load streak data';
            setStreakError(errorMessage);
            console.error('Error loading streak data:', error);
        } finally {
            setIsLoadingStreak(false);
        }
    };

    // Refresh points data (requires classId for class-based learning)
    const refreshPointsData = async (classId?: number) => {
        try {
            setIsLoadingPoints(true);
            setPointsError(null);
            
            if (!classId) {
                // Points are only available for class-based learning
                setPointsData(null);
                return;
            }
            
            const data = await gamificationService.getUserPoints(classId);
            setPointsData(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load points data';
            setPointsError(errorMessage);
            console.error('Error loading points data:', error);
        } finally {
            setIsLoadingPoints(false);
        }
    };

    // Update streak (requires classId for class-based learning)
    const updateStreak = async (classId: number): Promise<StreakUpdateResult | null> => {
        try {
            setIsLoadingStreak(true);
            setStreakError(null);

            if (!classId || typeof classId !== 'number') {
                throw new Error('classId is required and must be a number');
            }

            // Check if already updated today (use classId in localStorage key to track per class)
            const lastUpdateKey = `lastStreakUpdate_${classId}`;
            const lastUpdate = localStorage.getItem(lastUpdateKey);
            const today = new Date().toDateString();
            if (lastUpdate === today) {
                return null;
            }

            const result = await gamificationService.updateStreak(classId);
            if (result) {
                // Update local streak data
                setStreakData(prev => prev ? {
                    ...prev,
                    currentStreak: result.currentStreak,
                    lastStudyDate: new Date()
                } : null);

                // Mark as updated today for this class
                setHasUpdatedStreakToday(true);
                localStorage.setItem(lastUpdateKey, today);

                // Refresh points as they might have changed
                refreshPointsData(classId);

                // Dispatch event for other components
                window.dispatchEvent(new CustomEvent('streakUpdated', {
                    detail: {
                        userId: undefined, // Will be set by component if needed
                        currentStreak: result.currentStreak,
                        pointsEarned: result.pointsEarned,
                        message: result.message,
                        isNewStreak: result.isNewStreak,
                        classId,
                    }
                }));
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update streak';
            setStreakError(errorMessage);
            throw error;
        } finally {
            setIsLoadingStreak(false);
        }
    };

    // Buy streak freeze (requires classId for class-based learning)
    const buyStreakFreeze = async (classId: number, cost: number = 100): Promise<boolean> => {
        try {
            setIsLoadingPoints(true);
            setPointsError(null);

            if (!classId || typeof classId !== 'number') {
                throw new Error('classId is required and must be a number');
            }

            const success = await gamificationService.buyStreakFreeze(classId, cost);
            if (success) {
                // Refresh both streak and points data
                await refreshStreakData(classId);
                await refreshPointsData(classId);
            }
            return success;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to buy streak freeze';
            setPointsError(errorMessage);
            throw error;
        } finally {
            setIsLoadingPoints(false);
        }
    };

    // Get student gamification stats (for teachers)
    const getStudentGamificationStats = async (userId: number, classId: number): Promise<GamificationStats | null> => {
        try {
            return await gamificationService.getUserGamificationStats(userId, classId);
        } catch (error) {
            console.error(`Error fetching stats for user ${userId}:`, error);
            return null;
        }
    };

    // Get multiple student streaks (for teachers)
    const getStudentStreaks = async (userIds: number[]): Promise<Map<number, GamificationStats>> => {
        try {
            return await gamificationService.getStudentStreaks(userIds);
        } catch (error) {
            console.error('Error fetching student streaks:', error);
            return new Map();
        }
    };

    // Get streaks and points for all students in a class (batch API - more efficient)
    const getClassStudentStreaks = async (classId: number, userIds: number[]): Promise<Map<number, GamificationStats>> => {
        try {
            // classStreakService.getClassStudentStreaks now uses teacher endpoint which returns both streak and points
            // So we only need to call it once and extract the data
            // Fetch gamification stats (includes both streak and points) for all students in parallel
            const statsPromises = userIds.map(async (userId) => {
                try {
                    const response = await getRequest(
                        `${API_GAMIFICATION_ROUTES.GET_USER_GAMIFICATION_STATS({ userId })}?classId=${classId}`
                    ) as any;
                    
                    if (response.status === 'success' && response.data?.gamificationStats) {
                        return { userId, stats: response.data.gamificationStats };
                    }
                    return { userId, stats: null };
                } catch (error) {
                    console.error(`Failed to fetch stats for user ${userId}:`, error);
                    return { userId, stats: null };
                }
            });
            
            const statsResults = await Promise.allSettled(statsPromises);
            const results = new Map<number, GamificationStats>();
            
            statsResults.forEach((result) => {
                if (result.status === 'fulfilled' && result.value.stats) {
                    const stats = result.value.stats;
                    results.set(result.value.userId, {
                        totalPoints: stats.totalPoints || 0,
                        currentStreak: stats.currentStreak || 0,
                        longestStreak: stats.longestStreak || 0,
                        level: stats.level || Math.floor((stats.totalPoints || 0) / 200) + 1 || 1,
                        experiencePoints: stats.experiencePoints || 0,
                        nextLevelExperience: stats.nextLevelExperience || 200,
                        achievements: stats.achievements || [],
                        weeklyActivity: stats.weeklyActivity || [0, 0, 0, 0, 0, 0, 0],
                        totalLessonsCompleted: stats.totalLessonsCompleted || 0,
                        totalQuizzesCompleted: stats.totalQuizzesCompleted || 0,
                        totalFlashcardsCompleted: stats.totalFlashcardsCompleted || 0,
                        averageScore: stats.averageScore || 0,
                        streakFreezeActive: stats.streakFreezeActive || false,
                        streakFreezeCount: stats.streakFreezeCount || 0,
                        lastStudyDate: stats.lastStudyDate ? new Date(stats.lastStudyDate) : null,
                    });
                }
            });
            
            return results;
        } catch (error) {
            console.error('Error fetching class student streaks:', error);
            return new Map();
        }
    };

    // Buy streak freeze for a specific student (for teachers)
    const buyStreakFreezeForStudent = async (studentId: number, classId: number, cost: number = 100): Promise<boolean> => {
        try {
            if (!classId || typeof classId !== 'number') {
                throw new Error('classId is required and must be a number');
            }
            // For now, use the regular buyStreakFreeze method
            // TODO: Implement teacher-specific endpoint for buying streak freeze for students
            console.warn('buyStreakFreezeForStudent not fully implemented, using regular buyStreakFreeze');
            return await gamificationService.buyStreakFreeze(classId, cost);
        } catch (error) {
            console.error('Error buying streak freeze for student:', error);
            throw error;
        }
    };

    const contextValue: GamificationContextType = {
        // Streak data
        streakData,
        isLoadingStreak,
        streakError,
        hasUpdatedStreakToday,
        
        // Points data
        pointsData,
        isLoadingPoints,
        pointsError,
        
        // Actions
        updateStreak,
        refreshStreakData,
        refreshPointsData,
        buyStreakFreeze,
        getStudentGamificationStats,
        getStudentStreaks,
        getClassStudentStreaks,
        buyStreakFreezeForStudent,
    };

    return (
        <GamificationContext.Provider value={contextValue}>
            {children}
        </GamificationContext.Provider>
    );
}

export function useGamification(): GamificationContextType {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
}

// Hook specifically for streak tracking
export function useStreakTracking() {
    const {
        streakData,
        isLoadingStreak,
        streakError,
        hasUpdatedStreakToday,
        updateStreak,
        refreshStreakData
    } = useGamification();

    return {
        currentStreakData: streakData,
        isLoading: isLoadingStreak,
        error: streakError,
        hasUpdatedStreakToday,
        updateStreak,
        getCurrentStreak: refreshStreakData,
        forceUpdateStreak: async (classId: number) => {
            if (!classId) {
                throw new Error('classId is required');
            }
            // Clear last update for this class
            const lastUpdateKey = `lastStreakUpdate_${classId}`;
            localStorage.removeItem(lastUpdateKey);
            return updateStreak(classId);
        },
        resetStreakState: () => {
            localStorage.removeItem('lastStreakUpdate');
            refreshStreakData();
        }
    };
}

// Hook for points management
export function usePointsManagement() {
    const {
        pointsData,
        isLoadingPoints,
        pointsError,
        refreshPointsData,
        buyStreakFreeze
    } = useGamification();

    return {
        pointsData,
        isLoading: isLoadingPoints,
        error: pointsError,
        refreshPoints: refreshPointsData,
        buyStreakFreeze
    };
}

// Hook for listening to streak updates
export function useStreakListener() {
    const [streakUpdate, setStreakUpdate] = useState<any>(null);

    useEffect(() => {
        const handleStreakUpdate = (event: CustomEvent) => {
            setStreakUpdate(event.detail);
        };

        window.addEventListener('streakUpdated', handleStreakUpdate as EventListener);
        
        return () => {
            window.removeEventListener('streakUpdated', handleStreakUpdate as EventListener);
        };
    }, []);

    return streakUpdate;
}

export default GamificationContext;