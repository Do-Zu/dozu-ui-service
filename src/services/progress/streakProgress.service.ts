import { progressService, IProgressCreate, IProgressUpdate } from './progress.service';
import { gamificationService } from '../gamification/gamificationService';
import { ContentType, ProgressStatus } from '@/types/progress';

export interface StreakProgressData {
    userId: string;
    contentId: string;
    contentType: ContentType;
    status: ProgressStatus;
    completionPercentage?: number;
    score?: number;
    timeSpent?: number;
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
                // 3. Update streak if activity qualifies
                streakResult = await this.updateStreak(data.userId);
            }
            
            return {
                progressUpdated: progressResult,
                streakUpdated: streakResult,
                message: streakResult 
                    ? 'Progress and streak updated successfully!' 
                    : 'Progress updated successfully!'
            };
            
        } catch (error) {
            console.error('Error tracking learning activity:', error);
            throw new Error('Failed to track learning activity');
        }
    }

    /**
     * Update or create progress record
     */
    private async updateProgressRecord(data: StreakProgressData): Promise<boolean> {
        try {
            console.log('StreakProgress: Updating progress record for:', data);
            
            // Check if progress record exists
            const existingProgress = await progressService.getAllProgress({
                userId: data.userId,
                contentId: data.contentId,
                contentType: data.contentType
            });

            console.log(`StreakProgress: Found ${existingProgress.length} existing progress records`);

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
                
                console.log('StreakProgress: Updating existing progress:', progressId, updateData);
                await progressService.updateProgress(progressId, updateData);
            } else {
                // Create new progress record
                const createData: IProgressCreate = {
                    userId: data.userId,
                    contentId: data.contentId,
                    contentType: data.contentType,
                    status: data.status,
                    completionPercentage: data.completionPercentage || 0,
                    score: data.score,
                    metadata: {
                        ...data.metadata,
                        timeSpent: data.timeSpent,
                    }
                };
                
                console.log('StreakProgress: Creating new progress record:', createData);
                await progressService.createProgress(createData);
            }
            
            console.log('StreakProgress: Progress record updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating progress record:', error);
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
     */
    private async updateStreak(userId: string): Promise<boolean> {
        try {
            // Call gamification service to update streak
            await gamificationService.updateStreak();
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
            console.error('Error getting learning streak:', error);
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
                if (i === 0) {
                    currentStreak++;
                    lastStudyDate = checkDate;
                } else if (currentStreak > 0) {
                    currentStreak++;
                }
            } else {
                if (i === 0) {
                    // No activity today, check if yesterday had activity
                    continue;
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak
        for (let i = 0; i < dates.length; i++) {
            const currentDate = new Date(dates[i]);
            const nextDate = i < dates.length - 1 ? new Date(dates[i + 1]) : null;
            
            if (nextDate) {
                const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
                if (dayDiff === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak + 1);
                    tempStreak = 0;
                }
            } else {
                longestStreak = Math.max(longestStreak, tempStreak + 1);
            }
        }

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
        console.log(`StreakProgress: Tracking flashcard session for user ${userId}, topic ${topicId}, studied ${flashcardsStudied}, accuracy ${accuracy}`);
        
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
        
        console.log('StreakProgress: Tracking result:', result);
        return result;
    }

    /**
     * Track quiz completion
     */
    async trackQuizCompletion(
        userId: string,
        quizId: string,
        score: number,
        timeSpent: number
    ): Promise<{ progressUpdated: boolean; streakUpdated: boolean; message: string }> {
        return this.trackLearningActivity({
            userId,
            contentId: quizId,
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
