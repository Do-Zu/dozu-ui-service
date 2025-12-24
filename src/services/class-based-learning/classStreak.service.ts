import { getRequest } from '@/api/api';
import { API_GAMIFICATION_ROUTES } from '@/utils/constants/api.routes';
import { IClassStreakData } from '@/types/streaks/classStreaks.type';
import type { ApiResponse } from '@/types/streaks/gamification.type';

// Re-export the interface for backward compatibility
export type ClassStreakData = IClassStreakData;

interface StreakDataResponse {
    userId: number;
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string | null;
    streakFreezeUsed: boolean;
    streakFreezeCount: number;
}

class ClassStreakService {
    /**
     * Get class-specific streak for a single student from API
     * Note: This method is used for getting current user's streak
     * For getting other users' streaks, use getClassStudentStreaks instead
     */
    async getStudentClassStreak(userId: number, classId: number): Promise<IClassStreakData> {
        try {
            // Use new endpoint: /api/gamification/points/user/{userId}?classId={classId}
            const response = await getRequest(
                `${API_GAMIFICATION_ROUTES.GET_USER_GAMIFICATION_STATS({ userId })}?classId=${classId}`
            ) as ApiResponse<{ gamificationStats: any }>;
            
            if (response.status === 'success' && response.data?.gamificationStats) {
                const stats = response.data.gamificationStats;
                return {
                    userId,
                    currentStreak: stats.currentStreak || 0,
                    longestStreak: stats.longestStreak || 0,
                    lastStudyDate: stats.lastStudyDate ? new Date(stats.lastStudyDate) : null,
                    streakActive: (stats.currentStreak || 0) > 0,
                    streakFreezeCount: stats.streakFreezeCount || 0,
                    streakFreezeActive: stats.streakFreezeActive || false,
                };
            }
            
            // Return default if no data
            return {
                userId,
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: null,
                streakActive: false,
                streakFreezeCount: 0,
                streakFreezeActive: false,
            };
        } catch (error) {
            console.error('Error getting class streak for student:', error);
            return {
                userId,
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: null,
                streakActive: false,
                streakFreezeCount: 0,
                streakFreezeActive: false,
            };
        }
    }

    /**
     * Get class-specific streaks for multiple students
     * Uses teacher endpoint to get gamification stats for each student
     */
    async getClassStudentStreaks(classId: number, userIds: number[]): Promise<Map<number, IClassStreakData>> {
        const results = new Map<number, IClassStreakData>();
        
        try {
            // Use Promise.allSettled to handle partial failures
            // Use teacher endpoint to get student stats (includes streak data)
            const promises = userIds.map(async (userId) => {
                try {
                    // Use teacher endpoint to get student gamification stats (includes streak)
                    const response = await getRequest(
                        `${API_GAMIFICATION_ROUTES.GET_USER_GAMIFICATION_STATS({ userId })}?classId=${classId}`
                    ) as any;
                    
                    if (response.status === 'success' && response.data?.gamificationStats) {
                        const stats = response.data.gamificationStats;
                        return {
                            userId,
                            streakData: {
                                userId,
                                currentStreak: stats.currentStreak || 0,
                                longestStreak: stats.longestStreak || 0,
                                lastStudyDate: stats.lastStudyDate ? new Date(stats.lastStudyDate) : null,
                                streakActive: (stats.currentStreak || 0) > 0,
                                streakFreezeCount: stats.streakFreezeCount || 0,
                                streakFreezeActive: stats.streakFreezeActive || false,
                            }
                        };
                    }
                    return { userId, streakData: null };
                } catch (error) {
                    console.error(`Failed to fetch class streak for user ${userId}:`, error);
                    return { userId, streakData: null };
                }
            });

            const responses = await Promise.allSettled(promises);
            
            responses.forEach((response) => {
                if (response.status === 'fulfilled' && response.value.streakData) {
                    results.set(response.value.userId, response.value.streakData);
                }
            });
        } catch (error) {
            console.error('Error fetching class student streaks:', error);
        }

        return results;
    }

}

export const classStreakService = new ClassStreakService();
export default classStreakService;
