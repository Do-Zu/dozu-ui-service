import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';

export interface LessonCompletionStats {
    isCompleted: boolean;
    completionPercentage: number;
    timeSpent: number; // in milliseconds
    lastAccessed: Date;
    score?: number;
    totalLessons: number;
    completedLessons: number;
}

class LessonCompletionService {
    /**
     * Get lesson completion statistics for a student in a specific class
     */
    async getStudentLessonStats(userId: number, classId?: number): Promise<LessonCompletionStats> {
        try {
            const endpoint = classId 
                ? `/students/${userId}/classes/${classId}/lesson-stats`
                : `/students/${userId}/lesson-stats`;
            
            const response = await getRequest<void, LessonCompletionStats>(endpoint);
            
            if (response.status !== 'success') {
                throw new Error(response.message);
            }
            
            return response.data;
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
    async getClassLessonStats(classId: number): Promise<Map<number, LessonCompletionStats>> {
        try {
            const response = await getRequest<void, Record<string, LessonCompletionStats>>(
                `/classes/${classId}/lesson-stats`
            );
            
            if (response.status !== 'success') {
                throw new Error(response.message);
            }
            
            // Convert the response to a Map
            const statsMap = new Map<number, LessonCompletionStats>();
            Object.entries(response.data).forEach(([userId, stats]) => {
                statsMap.set(parseInt(userId), stats);
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
    async getTopicLessonStats(userId: number, topicId: number): Promise<{
        isCompleted: boolean;
        completionPercentage: number;
        timeSpent: number;
        lastAccessed: Date;
        score?: number;
    }> {
        try {
            const response = await getRequest<void, {
                isCompleted: boolean;
                completionPercentage: number;
                timeSpent: number;
                lastAccessed: Date;
                score?: number;
            }>(`/students/${userId}/topics/${topicId}/lesson-stats`);
            
            if (response.status !== 'success') {
                throw new Error(response.message);
            }
            
            return response.data;
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
