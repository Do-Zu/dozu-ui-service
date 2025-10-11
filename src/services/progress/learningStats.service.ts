import { progressService } from './progress.service';
import { ContentType, ProgressStatus } from '@/types/progress';
import studentTopicService from '@/services/class-based-learning/student/studentTopic.service';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';

export interface LearningStats {
    totalLessonsCompleted: number;
    totalQuizzesCompleted: number;
    totalFlashcardsReviewed: number;
    averageScore: number;
    totalStudyTime: number; // in minutes
    lastActivityDate: Date | null;
}

class LearningStatsService {
    /**
     * Get comprehensive learning statistics for a user
     */
    async getUserLearningStats(userId: string): Promise<LearningStats> {
        try {
            // Get all progress records for the user
            const allProgress = await progressService.getAllProgress({
                userId: userId
            });

            // Calculate statistics
            const stats = this.calculateLearningStats(allProgress);
            
            return stats;
        } catch (error) {
            console.error('Error getting user learning stats:', error);
            throw new Error(`Failed to get learning statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get learning statistics for a specific class
     */
    async getClassLearningStats(userId: string, classId: number): Promise<LearningStats> {
        try {
            // Get all progress records for the user
            const allProgress = await progressService.getAllProgress({
                userId: userId
            });

            // Get topics for this class to determine which content belongs to the class
            const classTopics: ITopic[] = await studentTopicService.getTopicsInClass(classId);
            
            // Handle case where class has no topics
            if (!classTopics || classTopics.length === 0) {
                console.warn(`No topics found for class ${classId}`);
                return this.calculateLearningStats([]);
            }

            const classTopicIds = new Set(classTopics.map((topic: ITopic) => topic.topicId.toString()));

            // Filter progress by content that belongs to this class
            const filteredProgress = allProgress.filter(progress => {
                return classTopicIds.has(progress.topicId);
            });

            const stats = this.calculateLearningStats(filteredProgress);
            
            return stats;
        } catch (error) {
            console.error('Error getting class learning stats:', error);
            throw new Error(`Failed to get class learning statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Calculate learning statistics from progress data
     */
    private calculateLearningStats(progressData: any[]): LearningStats {
        let totalLessonsCompleted = 0;
        let totalQuizzesCompleted = 0;
        let totalFlashcardsReviewed = 0;
        let totalScore = 0;
        let scoreCount = 0;
        let totalStudyTime = 0;
        let lastActivityDate: Date | null = null;

        progressData.forEach(progress => {
            // Count completed items by type
            if (progress.status === ProgressStatus.COMPLETED) {
                switch (progress.contentType) {
                    case ContentType.QUIZ:
                        totalQuizzesCompleted++;
                        break;
                    case ContentType.FLASHCARD:
                        totalFlashcardsReviewed++;
                        break;
                    // Add other content types as needed
                }
            }

            // Count flashcard reviews (both in-progress and completed count as learning activity)
            if (progress.contentType === ContentType.FLASHCARD) {
                if (progress.status === ProgressStatus.IN_PROGRESS || progress.status === ProgressStatus.COMPLETED) {
                    // Count flashcard reviews as lessons (learning activity)
                    totalLessonsCompleted++;
                }
            }

            // Calculate average score - only for completed items with valid scores
            if (progress.status === ProgressStatus.COMPLETED && 
                progress.score !== undefined && 
                progress.score !== null && 
                progress.score >= 0) {
                totalScore += progress.score;
                scoreCount++;
            }
            
            // For flashcard completion, use completion percentage as a score proxy
            if (progress.status === ProgressStatus.COMPLETED && 
                progress.contentType === ContentType.FLASHCARD && 
                progress.score === null &&
                progress.completionPercentage > 0) {
                // Use completion percentage as score (0-100 scale)
                totalScore += progress.completionPercentage;
                scoreCount++;
            }

            // Calculate total study time
            if (progress.metadata?.timeSpent) {
                totalStudyTime += progress.metadata.timeSpent; // Assuming timeSpent is in minutes
            }

            // Track last activity date
            if (progress.lastInteractionAt) {
                const activityDate = new Date(progress.lastInteractionAt);
                if (!lastActivityDate || activityDate > lastActivityDate) {
                    lastActivityDate = activityDate;
                }
            }
        });

        const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;

        // Debug logging
        console.log('Learning Stats Calculation:', {
            totalProgressItems: progressData.length,
            scoreCount,
            totalScore,
            averageScore,
            totalLessonsCompleted,
            totalQuizzesCompleted,
            totalFlashcardsReviewed,
            progressDetails: progressData.map(p => ({
                id: p.progressId,
                contentType: p.contentType,
                status: p.status,
                score: p.score,
                completionPercentage: p.completionPercentage,
                timeSpent: p.metadata?.timeSpent
            }))
        });

        return {
            totalLessonsCompleted,
            totalQuizzesCompleted,
            totalFlashcardsReviewed,
            averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal place
            totalStudyTime,
            lastActivityDate
        };
    }

    /**
     * Get learning statistics for a specific topic
     */
    async getTopicLearningStats(userId: string, topicId: string): Promise<LearningStats> {
        try {
            const topicProgress = await progressService.getAllProgress({
                userId: userId,
                contentId: topicId
            });

            const stats = this.calculateLearningStats(topicProgress);
            
            return stats;
        } catch (error) {
            console.error('Error getting topic learning stats:', error);
            throw new Error(`Failed to get topic learning statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get weekly learning activity
     */
    async getWeeklyLearningActivity(userId: string): Promise<{
        week: Array<{ day: string; count: number; date: string }>;
        totalThisWeek: number;
    }> {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const weeklyProgress = await progressService.getAllProgress({
                userId: userId,
                fromDate: oneWeekAgo
            });

            // Group by day
            const dailyActivity = new Map<string, number>();
            
            weeklyProgress.forEach(progress => {
                const date = new Date(progress.lastInteractionAt).toDateString();
                dailyActivity.set(date, (dailyActivity.get(date) || 0) + 1);
            });

            // Create week array
            const week = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toDateString();
                const count = dailyActivity.get(dateString) || 0;
                
                week.push({
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    count,
                    date: dateString
                });
            }

            const totalThisWeek = week.reduce((sum, day) => sum + day.count, 0);

            return { week, totalThisWeek };
        } catch (error) {
            console.error('Error getting weekly learning activity:', error);
            return { week: [], totalThisWeek: 0 };
        }
    }
}

export const learningStatsService = new LearningStatsService();
