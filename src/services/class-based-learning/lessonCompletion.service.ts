import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { 
    ILessonCompletionStats, 
    ILessonCompletionStatsResponse, 
    ITopicLessonStats, 
    ITopicLessonStatsResponse,
    IClassLessonStatsResponse 
} from '@/types/streaks/lessonCompletion.type';

/**
 * Transforms a date string or Date object to a Date object
 */
const transformDate = (date: string | Date): Date => {
    return typeof date === 'string' ? new Date(date) : date;
};

/**
 * Transforms lesson completion stats to ensure lastAccessed is a Date object
 */
const transformLessonStats = (stats: ILessonCompletionStatsResponse): ILessonCompletionStats => {
    return {
        ...stats,
        lastAccessed: transformDate(stats.lastAccessed)
    };
};

// Re-export the interface for backward compatibility
export type LessonCompletionStats = ILessonCompletionStats;

class LessonCompletionService {
    /**
     * Get lesson completion statistics for a student in a specific class
     */
    async getStudentLessonStats(userId: number, classId?: number): Promise<ILessonCompletionStats> {
        try {
            const endpoint = classId 
                ? `/students/${userId}/classes/${classId}/lesson-stats`
                : `/students/${userId}/lesson-stats`;
            
            const response = await getRequest<void, ILessonCompletionStatsResponse>(endpoint);
            
            if (response.status !== 'success') {
                throw new Error(response.message);
            }
            
            return transformLessonStats(response.data);
        } catch (error) {
            console.error('Error fetching student lesson stats:', error);
            
            // Return mock data for development/testing
            return {
                isCompleted: false,
                completionPercentage: 0,
                timeSpent: 0,
                lastAccessed: new Date(),
                score: undefined,
                totalLessons: 0,
                completedLessons: 0
            };
        }
    }

    /**
     * Get lesson completion statistics for all students in a class
     */
    async getClassLessonStats(classId: number): Promise<Map<number, ILessonCompletionStats>> {
        try {
            const response = await getRequest<void, IClassLessonStatsResponse>(
                `/classes/${classId}/lesson-stats`
            );
            
            if (response.status !== 'success') {
                throw new Error(response.message);
            }
            
            // Convert the response to a Map and transform dates
            const statsMap = new Map<number, ILessonCompletionStats>();
            Object.entries(response.data).forEach(([userId, stats]) => {
                statsMap.set(parseInt(userId), transformLessonStats(stats));
            });
            
            return statsMap;
        } catch (error) {
            console.error('Error fetching class lesson stats:', error);
            
            // Return empty map for development/testing
            return new Map();
        }
    }

    /**
     * Get lesson completion statistics for a specific topic
     */
    async getTopicLessonStats(userId: number, topicId: number): Promise<ITopicLessonStats> {
        try {
            const response = await getRequest<void, ITopicLessonStatsResponse>(`/students/${userId}/topics/${topicId}/lesson-stats`);
            
            if (response.status !== 'success') {
                throw new Error(response.message);
            }
            
            const transformedData: ITopicLessonStats = {
                ...response.data,
                lastAccessed: transformDate(response.data.lastAccessed)
            };
            
            return transformedData;
        } catch (error) {
            console.error('Error fetching topic lesson stats:', error);
            
            // Return mock data for development/testing
            return {
                isCompleted: false,
                completionPercentage: 0,
                timeSpent: 0,
                lastAccessed: new Date(),
                score: undefined
            };
        }
    }
}

export default new LessonCompletionService();
