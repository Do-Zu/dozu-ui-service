import { postRequest, getRequest } from '@/api/api';
import { API_GAMIFICATION_ROUTES } from '@/utils/constants/api.routes';
import { 
    StreakData, 
    StreakUpdateResult, 
    PointsData, 
    GamificationStats, 
    ApiResponse 
} from '@/types/streaks/gamification.type';

class GamificationService {
    // Streak-related methods
    /**
     * @deprecated This method is deprecated. Use getUserGamificationStats(userId, classId) instead.
     * Streak is now class-specific and requires both userId and classId.
     */
    async getUserStreak(): Promise<StreakData | null> {
        console.warn('getUserStreak() is deprecated. Use getUserGamificationStats(userId, classId) instead.');
        // Return default data since endpoint no longer exists
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: null,
            streakFreezeActive: false,
            streakFreezeCount: 0
        };
    }

    async updateStreak(classId: number): Promise<StreakUpdateResult | null> {
        try {
            if (!classId || typeof classId !== 'number') {
                throw new Error('classId is required and must be a number');
            }

            // Send classId in request body as required by backend
            const response = await postRequest(API_GAMIFICATION_ROUTES.UPDATE_STREAK, {
                classId,
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

    async buyStreakFreeze(classId: number, cost: number = 100): Promise<boolean> {
        try {
            if (!classId || typeof classId !== 'number') {
                throw new Error('classId is required and must be a number');
            }

            const response = await postRequest(API_GAMIFICATION_ROUTES.BUY_STREAK_FREEZE, {
                classId,
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
    async getUserPoints(classId: number): Promise<PointsData | null> {
        try {
            if (!classId || typeof classId !== 'number') {
                throw new Error('classId is required and must be a number');
            }

            const response = await getRequest(`${API_GAMIFICATION_ROUTES.GET_USER_POINTS}?classId=${classId}`) as ApiResponse<PointsData>;
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

    async getUserGamificationStats(userId: number, classId: number): Promise<GamificationStats | null> {
        try {
            if (!classId || typeof classId !== 'number') {
                throw new Error('classId is required and must be a number');
            }

            const response = await getRequest(`${API_GAMIFICATION_ROUTES.GET_USER_GAMIFICATION_STATS({ userId })}?classId=${classId}`) as ApiResponse<{ gamificationStats: GamificationStats }>;
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
    // Note: This method is deprecated because streak/points are now class-specific
    // Use getClassStudentStreaks from GamificationContext instead
    async getStudentStreaks(userIds: number[]): Promise<Map<number, GamificationStats>> {
        console.warn('getStudentStreaks is deprecated. Use getClassStudentStreaks with classId instead.');
        return new Map();
    }

    // Helper method to generate session ID
    private getSessionId(): string {
        const sessionId = sessionStorage.getItem('gamification_session_id');
        if (sessionId) {
            return sessionId;
        }
        
        // Use crypto.getRandomValues() for cryptographically secure random ID
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        const randomPart = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        
        const newSessionId = `session_${Date.now()}_${randomPart}`;
        sessionStorage.setItem('gamification_session_id', newSessionId);
        return newSessionId;
    }
}

// Export singleton instance
export const gamificationService = new GamificationService();
export default gamificationService;