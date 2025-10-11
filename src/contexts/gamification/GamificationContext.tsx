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
    updateStreak: () => Promise<StreakUpdateResult | null>;
    refreshStreakData: () => Promise<void>;
    refreshPointsData: () => Promise<void>;
    buyStreakFreeze: (cost?: number) => Promise<boolean>;
    getStudentGamificationStats: (userId: number) => Promise<GamificationStats | null>;
    
    // Batch operations for teachers
    getStudentStreaks: (userIds: number[]) => Promise<Map<number, GamificationStats>>;
    getClassStudentStreaks: (classId: number, userIds: number[]) => Promise<Map<number, GamificationStats>>;
    buyStreakFreezeForStudent: (studentId: number, cost?: number) => Promise<boolean>;
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

    // Refresh streak data
    const refreshStreakData = async () => {
        try {
            setIsLoadingStreak(true);
            setStreakError(null);
            
            const data = await gamificationService.getUserStreak();
            setStreakData(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load streak data';
            setStreakError(errorMessage);
            console.error('Error loading streak data:', error);
        } finally {
            setIsLoadingStreak(false);
        }
    };

    // Refresh points data
    const refreshPointsData = async () => {
        try {
            setIsLoadingPoints(true);
            setPointsError(null);
            
            const data = await gamificationService.getUserPoints();
            setPointsData(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load points data';
            setPointsError(errorMessage);
            console.error('Error loading points data:', error);
        } finally {
            setIsLoadingPoints(false);
        }
    };

    // Update streak
    const updateStreak = async (): Promise<StreakUpdateResult | null> => {
        try {
            setIsLoadingStreak(true);
            setStreakError(null);

            // Check if already updated today
            if (hasUpdatedStreakToday) {
                return null;
            }

            const result = await gamificationService.updateStreak();
            if (result) {
                // Update local streak data
                setStreakData(prev => prev ? {
                    ...prev,
                    currentStreak: result.currentStreak,
                    lastStudyDate: new Date()
                } : null);

                // Mark as updated today
                setHasUpdatedStreakToday(true);
                localStorage.setItem('lastStreakUpdate', new Date().toDateString());

                // Refresh points as they might have changed
                refreshPointsData();

                // Dispatch event for other components
                window.dispatchEvent(new CustomEvent('streakUpdated', {
                    detail: {
                        currentStreak: result.currentStreak,
                        pointsEarned: result.pointsEarned,
                        message: result.message,
                        isNewStreak: result.isNewStreak
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

    // Buy streak freeze
    const buyStreakFreeze = async (cost: number = 100): Promise<boolean> => {
        try {
            setIsLoadingPoints(true);
            setPointsError(null);

            const success = await gamificationService.buyStreakFreeze(cost);
            if (success) {
                // Refresh both streak and points data
                await refreshStreakData();
                await refreshPointsData();
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
    const getStudentGamificationStats = async (userId: number): Promise<GamificationStats | null> => {
        try {
            return await gamificationService.getUserGamificationStats(userId);
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

    // Get streaks for all students in a class (batch API - more efficient)
    const getClassStudentStreaks = async (classId: number, userIds: number[]): Promise<Map<number, GamificationStats>> => {
        try {
            // Get class-specific streaks for all students
            const classStreaks = await classStreakService.getClassStudentStreaks(classId, userIds);
            
            // Convert ClassStreakData to GamificationStats format
            const results = new Map<number, GamificationStats>();
            
            classStreaks.forEach((classStreakData, userId) => {
                results.set(userId, {
                    totalPoints: 0, // Will be filled by points data
                    currentStreak: classStreakData.currentStreak,
                    longestStreak: classStreakData.longestStreak,
                    level: 1, // Default level
                    experiencePoints: 0,
                    nextLevelExperience: 200,
                    achievements: [],
                    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
                    totalLessonsCompleted: 0,
                    totalQuizzesCompleted: 0,
                    totalFlashcardsReviewed: 0,
                    averageScore: 0,
                    streakFreezeActive: classStreakData.streakFreezeActive,
                    streakFreezeCount: classStreakData.streakFreezeCount,
                    lastStudyDate: classStreakData.lastStudyDate,
                });
            });
            
            return results;
        } catch (error) {
            console.error('Error fetching class student streaks:', error);
            return new Map();
        }
    };

    // Buy streak freeze for a specific student (for teachers)
    const buyStreakFreezeForStudent = async (studentId: number, cost: number = 100): Promise<boolean> => {
        try {
            // For now, use the regular buyStreakFreeze method
            console.warn('buyStreakFreezeForStudent not implemented, using regular buyStreakFreeze');
            return await gamificationService.buyStreakFreeze(cost);
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
        forceUpdateStreak: async () => {
            localStorage.removeItem('lastStreakUpdate');
            return updateStreak();
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