import { progressService, IProgressCreate, IProgressUpdate } from './progress.service';
import { gamificationService } from '../gamification/gamification.service';
import { ContentType, ProgressStatus } from '@/types/progress';

export interface StreakProgressData {
    userId: string;
    contentId: string;
    topicId?: string;
    contentType: ContentType;
    status: ProgressStatus;
    completionPercentage?: number;
    score?: number;
    timeSpent?: number;
    classId?: number; // Optional classId for class-based learning streaks
    metadata?: {
        attempts?: number;
        lastPosition?: number;
        answers?: Record<string, any>;
        notes?: string;
    };
}

class StreakProgressService {
    /**
     * Track learning activity and update both progress and streak
     */
    async trackLearningActivity(data: StreakProgressData): Promise<{
        progressUpdated: boolean;
        streakUpdated: boolean;
        message: string;
    }> {
        try {
            // 1. Update or create progress record
            const progressResult = await this.updateProgressRecord(data);
            
            // 2. Check if this activity qualifies for streak update
            const shouldUpdateStreak = this.shouldUpdateStreak(data);
            
            let streakResult = false;
            if (shouldUpdateStreak) {
                // 3. Update streak if activity qualifies and classId is provided
                streakResult = await this.updateStreak(data.userId, data.classId);
            }
            
            return {
                progressUpdated: progressResult,
                streakUpdated: streakResult,
                message: streakResult 
                    ? 'Progress and streak updated successfully!' 
                    : 'Progress updated successfully!'
            };
            
        } catch (error) {
            throw new Error('Failed to track learning activity');
        }
    }

    /**
     * Update or create progress record
     */
    private async updateProgressRecord(data: StreakProgressData): Promise<boolean> {
        try {
            
            // Check if progress record exists
            const existingProgress = await progressService.getAllProgress({
                userId: data.userId,
                topicId: data.topicId || data.contentId,
                contentType: data.contentType
            });


            if (existingProgress.length > 0) {
                // Update existing progress
                const progressId = existingProgress[0].id;
                const updateData: IProgressUpdate = {
                    status: data.status,
                    completionPercentage: data.completionPercentage,
                    score: data.score,
                    lastInteractionAt: new Date(),
                    metadata: {
                        ...data.metadata,
                        timeSpent: data.timeSpent,
                    }
                };
                
                await progressService.updateProgress(progressId, updateData);
            } else {
                // Create new progress record
                const createData = {
                    userId: data.userId,
                    topicId: data.topicId || data.contentId, // Server expects topicId, not contentId
                    contentType: data.contentType,
                    status: data.status,
                    completionPercentage: data.completionPercentage || 0,
                    score: data.score,
                    metadata: {
                        ...data.metadata,
                        timeSpent: data.timeSpent,
                    }
                } as IProgressCreate;
                
                await progressService.createProgress(createData);
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if this activity qualifies for streak update
     */
    private shouldUpdateStreak(data: StreakProgressData): boolean {
        // Only update streak for meaningful learning activities
        const qualifyingStatuses = [ProgressStatus.IN_PROGRESS, ProgressStatus.COMPLETED];
        const qualifyingContentTypes = [ContentType.FLASHCARD, ContentType.QUIZ];
        
        return (
            qualifyingStatuses.includes(data.status) &&
            qualifyingContentTypes.includes(data.contentType) &&
            (data.completionPercentage || 0) > 0 // Must have some progress
        );
    }

    /**
     * Update user's streak
     * Note: Requires classId for class-based learning streaks
     * If classId is not provided, streak update will be skipped
     */
    private async updateStreak(userId: string, classId?: number): Promise<boolean> {
        try {
            // Only update streak if classId is provided (streaks are class-specific)
            if (!classId) {
                console.warn('updateStreak: classId is required but not provided. Skipping streak update.');
                return false;
            }
            // Call gamification service to update streak
            await gamificationService.updateStreak(classId);
            return true;
        } catch (error) {
            console.error('Error updating streak:', error);
            return false;
        }
    }

    /**
     * Get user's learning streak based on progress data
     */
    async getUserLearningStreak(userId: string): Promise<{
        currentStreak: number;
        longestStreak: number;
        lastStudyDate: Date | null;
        streakActive: boolean;
    }> {
        try {
            // Get progress data for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const progressData = await progressService.getAllProgress({
                userId: userId,
                fromDate: thirtyDaysAgo,
                contentType: ContentType.FLASHCARD // Focus on flashcard learning
            });

            // Calculate streak based on daily learning activity
            const streakData = this.calculateStreakFromProgress(progressData);
            
            return streakData;
        } catch (error) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: null,
                streakActive: false
            };
        }
    }

    /**
     * Calculate streak from progress data
     */
    private calculateStreakFromProgress(progressData: any[]): {
        currentStreak: number;
        longestStreak: number;
        lastStudyDate: Date | null;
        streakActive: boolean;
    } {
        // Group progress by date
        const dailyActivity = new Map<string, boolean>();
        
        progressData.forEach(progress => {
            const date = new Date(progress.lastInteractionAt).toDateString();
            dailyActivity.set(date, true);
        });

        // Calculate current streak
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let lastStudyDate: Date | null = null;

        const today = new Date();
        const dates = Array.from(dailyActivity.keys()).sort((a, b) => 
            new Date(b).getTime() - new Date(a).getTime()
        );

        // Calculate current streak (consecutive days from today backwards)
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateString = checkDate.toDateString();
            
            if (dailyActivity.has(dateString)) {
                currentStreak++;
                if (!lastStudyDate) {
                    lastStudyDate = checkDate;
                }
            } else {
                // Allow grace period: streak continues if studied yesterday
                if (i > 1) {
                    break;  // Break if gap is more than 1 day
                }
            }
        }

        // Calculate longest streak by checking consecutive days
        const sortedDates = Array.from(dailyActivity.keys()).sort((a, b) => 
            new Date(a).getTime() - new Date(b).getTime() // Sort from oldest to newest
        );
        
        tempStreak = 1; // Start with 1 for the first date
        longestStreak = 1; // Minimum streak is 1
        
        for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const previousDate = new Date(sortedDates[i - 1]);
            const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === 1) {
                // Consecutive day
                tempStreak++;
            } else {
                // Gap found, update longest streak and reset
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1; // Reset to 1 for the current date
            }
        }
        
        // Update longest streak with the final temp streak
        longestStreak = Math.max(longestStreak, tempStreak);

        return {
            currentStreak,
            longestStreak,
            lastStudyDate,
            streakActive: currentStreak > 0
        };
    }

    /**
     * Track flashcard learning session
     */
    async trackFlashcardSession(
        userId: string,
        topicId: string,
        flashcardsStudied: number,
        accuracy: number,
        timeSpent: number
    ): Promise<{ progressUpdated: boolean; streakUpdated: boolean; message: string }> {
        
        const status = flashcardsStudied > 0 ? ProgressStatus.IN_PROGRESS : ProgressStatus.NOT_STARTED;
        
        const result = await this.trackLearningActivity({
            userId,
            contentId: topicId,
            contentType: ContentType.FLASHCARD,
            status,
            completionPercentage: Math.min(100, flashcardsStudied * 10), // Rough estimate
            score: accuracy,
            timeSpent,
            metadata: {
                attempts: 1,
                answers: { flashcardsStudied, accuracy }
            }
        });
        
        return result;
    }

    /**
     * Track quiz completion
     */
    async trackQuizCompletion(
        userId: string,
        quizId: string,
        score: number,
        timeSpent: number,
        topicId?: string
    ): Promise<{ progressUpdated: boolean; streakUpdated: boolean; message: string }> {
        return this.trackLearningActivity({
            userId,
            contentId: quizId,
            topicId: topicId || quizId, // Use topicId if provided, otherwise fallback to quizId
            contentType: ContentType.QUIZ,
            status: ProgressStatus.COMPLETED,
            completionPercentage: 100,
            score,
            timeSpent,
            metadata: {
                attempts: 1,
                answers: { score, timeSpent }
            }
        });
    }
}

export const streakProgressService = new StreakProgressService();
