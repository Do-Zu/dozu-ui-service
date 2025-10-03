import { postRequest, getRequest } from '@/api/api';
import { API_GAMIFICATION_ROUTES } from '@/utils/constants/api.routes';

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: Date | null;
    streakFreezeActive: boolean;
    streakFreezeCount: number;
}

export interface StreakUpdateResult {
    currentStreak: number;
    isNewStreak: boolean;
    pointsEarned: number;
    streakBroken: boolean;
    message: string;
}

export interface PointsData {
    totalPoints: number;
    availablePoints: number;
    level: number;
    experiencePoints: number;
    nextLevelExperience: number;
}

export interface GamificationStats {
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
    level: number;
    experiencePoints: number;
    nextLevelExperience: number;
    achievements: any[];
    weeklyActivity: number[];
    totalLessonsCompleted: number;
    totalQuizzesCompleted: number;
    totalFlashcardsReviewed: number;
    averageScore: number;
    streakFreezeActive?: boolean;
    streakFreezeCount?: number;
    lastStudyDate?: Date | null;
}

export interface ApiResponse<T = any> {
    status: string;
    data: T;
    message: string;
}

class GamificationService {
    // Streak-related methods
    async getUserStreak(): Promise<StreakData | null> {
        try {
            const response = await getRequest(API_GAMIFICATION_ROUTES.GET_USER_STREAK) as ApiResponse<StreakData>;
            if (response.status === 'success' && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user streak:', error);
            // Return default data instead of throwing for better UX
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: null,
                streakFreezeActive: false,
                streakFreezeCount: 0
            };
        }
    }

    async updateStreak(): Promise<StreakUpdateResult | null> {
        try {
            // Send real activity data instead of random
            const response = await postRequest(API_GAMIFICATION_ROUTES.UPDATE_STREAK, {
                activityType: 'learning_session',
                timestamp: Date.now(),
                route: window.location.pathname,
                // Additional context for better tracking
                metadata: {
                    userAgent: navigator.userAgent,
                    referrer: document.referrer,
                    sessionId: this.getSessionId()
                }
            }) as ApiResponse<StreakUpdateResult>;

            if (response.status === 'success' && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error updating streak:', error);
            throw new Error('Failed to update streak');
        }
    }

    async buyStreakFreeze(cost: number = 100): Promise<boolean> {
        try {
            const response = await postRequest(API_GAMIFICATION_ROUTES.BUY_STREAK_FREEZE, {
                cost,
            }) as ApiResponse;

            return response.status === 'success';
        } catch (error) {
            console.error('Error buying streak freeze:', error);
            if (error instanceof Error && error.message.includes('Insufficient points')) {
                throw new Error('Insufficient points to buy streak freeze');
            }
            throw new Error('Failed to buy streak freeze');
        }
    }

    async getStreakStats(): Promise<any> {
        try {
            const response = await getRequest(API_GAMIFICATION_ROUTES.GET_STREAK_STATS) as ApiResponse;
            if (response.status === 'success' && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching streak stats:', error);
            throw new Error('Failed to fetch streak stats');
        }
    }

    // Points-related methods
    async getUserPoints(): Promise<PointsData | null> {
        try {
            const response = await getRequest(API_GAMIFICATION_ROUTES.GET_USER_POINTS) as ApiResponse<PointsData>;
            if (response.status === 'success' && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user points:', error);
            // Return default data instead of throwing
            return {
                totalPoints: 0,
                availablePoints: 0,
                level: 1,
                experiencePoints: 0,
                nextLevelExperience: 200
            };
        }
    }

    async getUserGamificationStats(userId: number): Promise<GamificationStats | null> {
        try {
            const response = await getRequest(API_GAMIFICATION_ROUTES.GET_USER_GAMIFICATION_STATS({ userId })) as ApiResponse<{ gamificationStats: GamificationStats }>;
            if (response.status === 'success' && response.data?.gamificationStats) {
                return response.data.gamificationStats;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user gamification stats:', error);
            throw new Error('Failed to fetch user gamification stats');
        }
    }

    async getPointHistory(): Promise<any[]> {
        try {
            const response = await getRequest(API_GAMIFICATION_ROUTES.GET_POINTS_HISTORY) as ApiResponse<any[]>;
            if (response.status === 'success' && response.data) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching point history:', error);
            throw new Error('Failed to fetch point history');
        }
    }

    async spendPoints(amount: number, description: string): Promise<boolean> {
        try {
            const response = await postRequest(API_GAMIFICATION_ROUTES.SPEND_POINTS, {
                amount,
                description,
            }) as ApiResponse;

            return response.status === 'success';
        } catch (error) {
            console.error('Error spending points:', error);
            throw new Error('Failed to spend points');
        }
    }

    // Batch methods for efficiency
    async getStudentStreaks(userIds: number[]): Promise<Map<number, GamificationStats>> {
        const results = new Map<number, GamificationStats>();
        
        try {
            // Use Promise.allSettled to handle partial failures
            const promises = userIds.map(async (userId) => {
                try {
                    const stats = await this.getUserGamificationStats(userId);
                    return { userId, stats };
                } catch (error) {
                    console.error(`Failed to fetch stats for user ${userId}:`, error);
                    return { userId, stats: null };
                }
            });

            const responses = await Promise.allSettled(promises);
            
            responses.forEach((response) => {
                if (response.status === 'fulfilled' && response.value.stats) {
                    results.set(response.value.userId, response.value.stats);
                }
            });
        } catch (error) {
            console.error('Error fetching student streaks:', error);
        }

        return results;
    }

    // Helper method to generate session ID
    private getSessionId(): string {
        const sessionId = sessionStorage.getItem('gamification_session_id');
        if (sessionId) {
            return sessionId;
        }
        
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('gamification_session_id', newSessionId);
        return newSessionId;
    }
}

// Export singleton instance
export const gamificationService = new GamificationService();
export default gamificationService;