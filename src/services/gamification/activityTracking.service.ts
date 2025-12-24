import { gamificationService } from './gamification.service';
import { StudySessionParams, StudySessionResult } from '@/types/streaks/gamification.type';

export enum ActivityType {
    FLASHCARD_REVIEW = 'flashcard_review',
    QUIZ_COMPLETION = 'quiz_completion',
    MINDMAP_INTERACTION = 'mindmap_interaction',
    LESSON_COMPLETION = 'lesson_completion',
    STUDY_SESSION = 'study_session'
}

export interface LearningActivity {
    type: ActivityType;
    timestamp: number;
    metadata?: {
        topicId?: number;
        quizId?: number;
        flashcardId?: number;
        score?: number;
        duration?: number;
        pointsEarned?: number;
    };
}

class ActivityTrackingService {
    private dailyActivities: Set<string> = new Set();
    private lastActivityDate: string | null = null;

    constructor() {
        this.loadDailyActivities();
    }

    /**
     * Track a learning activity and potentially update streak
     * Note: Streak update requires classId (class-based learning only)
     */
    async trackActivity(activity: LearningActivity, classId?: number): Promise<void> {
        try {
            const today = this.getDateString(new Date());
            const activityKey = `${today}-${activity.type}`;

            // Check if this is a new day
            if (this.lastActivityDate !== today) {
                this.dailyActivities.clear();
                this.lastActivityDate = today;
                this.saveDailyActivities();
            }

            // Add activity to today's set
            this.dailyActivities.add(activityKey);
            this.saveDailyActivities();

            // Update streak if this is the first meaningful activity today and classId is provided
            if (this.isFirstMeaningfulActivityToday(today) && classId) {
                await gamificationService.updateStreak(classId);
            } else if (this.isFirstMeaningfulActivityToday(today) && !classId) {
                console.warn('⚠️ Cannot update streak: classId is required but not provided');
            }
        } catch (error) {
            console.error('Error tracking activity:', error);
        }
    }

    /**
     * Check if user has completed any learning activities today
     */
    hasActivityToday(): boolean {
        const today = this.getDateString(new Date());
        return Array.from(this.dailyActivities).some(key => key.startsWith(today));
    }

    /**
     * Get today's activities count
     */
    getTodayActivityCount(): number {
        const today = this.getDateString(new Date());
        return Array.from(this.dailyActivities).filter(key => key.startsWith(today)).length;
    }

    /**
     * Track flashcard review completion
     */
    async trackFlashcardReview(flashcardId: number, score: number, duration: number, classId?: number): Promise<void> {
        await this.trackActivity({
            type: ActivityType.FLASHCARD_REVIEW,
            timestamp: Date.now(),
            metadata: {
                flashcardId,
                score,
                duration,
                pointsEarned: this.calculateFlashcardPoints(score)
            }
        }, classId);
    }

    /**
     * Track quiz completion
     */
    async trackQuizCompletion(quizId: number, score: number, duration: number, classId?: number): Promise<void> {
        await this.trackActivity({
            type: ActivityType.QUIZ_COMPLETION,
            timestamp: Date.now(),
            metadata: {
                quizId,
                score,
                duration,
                pointsEarned: this.calculateQuizPoints(score)
            }
        }, classId);
    }

    /**
     * Track mindmap interaction
     */
    async trackMindmapInteraction(topicId: number, duration: number, classId?: number): Promise<void> {
        await this.trackActivity({
            type: ActivityType.MINDMAP_INTERACTION,
            timestamp: Date.now(),
            metadata: {
                topicId,
                duration,
                pointsEarned: this.calculateMindmapPoints(duration)
            }
        }, classId);
    }

    /**
     * Track lesson completion
     */
    async trackLessonCompletion(topicId: number, score: number, duration: number, classId?: number): Promise<void> {
        await this.trackActivity({
            type: ActivityType.LESSON_COMPLETION,
            timestamp: Date.now(),
            metadata: {
                topicId,
                score,
                duration,
                pointsEarned: this.calculateLessonPoints(score)
            }
        }, classId);
    }

    /**
     * Track study session
     */
    async trackStudySession(params: StudySessionParams, classId?: number): Promise<StudySessionResult> {
            this.validateStudySessionParams(params);

            // Calculate points based on duration and quality
            const pointsEarned = this.calculateStudySessionPoints(params);

            // Track the activity
            await this.trackActivity({
                type: ActivityType.STUDY_SESSION,
                timestamp: Date.now(),
                metadata: {
                    topicId: params.topicId,
                    duration: params.duration,
                    pointsEarned,
                    ...params.metadata
                }
            }, classId);

            return {
                success: true,
                pointsEarned,
                streakUpdated: !!classId, // Only update streak if classId is provided
                message: `Study session tracked! Earned ${pointsEarned} points.`
            };
    }

    /**
     * Manual streak update (for testing)
     * Note: Requires classId for class-based learning streaks
     */
    async manualStreakUpdate(classId: number): Promise<void> {
        if (!classId) {
            throw new Error('classId is required to update streak');
        }
        await gamificationService.updateStreak(classId);
    }

    // Private helper methods
    private isFirstMeaningfulActivityToday(today: string): boolean {
        const meaningfulActivities = [
            ActivityType.FLASHCARD_REVIEW,
            ActivityType.QUIZ_COMPLETION,
            ActivityType.LESSON_COMPLETION,
            ActivityType.MINDMAP_INTERACTION,
            ActivityType.STUDY_SESSION
        ];

        const todayMeaningfulActivities = Array.from(this.dailyActivities)
            .filter(key => key.startsWith(today))
            .filter(key => meaningfulActivities.some(type => key.includes(type)));

        return todayMeaningfulActivities.length === 1; // First meaningful activity
    }

    private getDateString(date: Date): string {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    private loadDailyActivities(): void {
        try {
            const stored = localStorage.getItem('daily_learning_activities');
            const data = stored ? JSON.parse(stored) : {};
            
            this.lastActivityDate = data.date || null;
            this.dailyActivities = new Set(data.activities || []);

            // Clear if it's a new day
            const today = this.getDateString(new Date());
            if (this.lastActivityDate !== today) {
                this.dailyActivities.clear();
                this.lastActivityDate = today;
                this.saveDailyActivities();
            }
        } catch (error) {
            console.error('Error loading daily activities:', error);
            this.dailyActivities = new Set();
            this.lastActivityDate = null;
        }
    }

    private saveDailyActivities(): void {
        try {
            const data = {
                date: this.lastActivityDate,
                activities: Array.from(this.dailyActivities)
            };
            localStorage.setItem('daily_learning_activities', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving daily activities:', error);
        }
    }

    // Points calculation methods
    private calculateFlashcardPoints(score: number): number {
        return Math.round(score * 10); // 0-100 score -> 0-1000 points
    }

    private calculateQuizPoints(score: number): number {
        return Math.round(score * 20); // 0-100 score -> 0-2000 points
    }

    private calculateLessonPoints(score: number): number {
        return Math.round(score * 15); // 0-100 score -> 0-1500 points
    }

    private calculateMindmapPoints(duration: number): number {
        // Award points based on interaction duration (minutes)
        return Math.min(Math.round(duration * 5), 100); // Max 100 points for 20+ minutes
    }

    private calculateStudySessionPoints(params: StudySessionParams): number {
        const basePoints = Math.min(params.duration * 2, 200); // 2 points per minute, max 200 for 100+ minutes
        
        // Bonus points for longer sessions
        let bonusPoints = 0;
        if (params.duration >= 60) bonusPoints += 50; // 1+ hour bonus
        if (params.duration >= 120) bonusPoints += 50; // 2+ hour bonus
        
        // Difficulty bonus
        if (params.metadata?.difficulty === 'hard') bonusPoints += 25;
        else if (params.metadata?.difficulty === 'medium') bonusPoints += 10;
        
        return Math.round(basePoints + bonusPoints);
    }

    private validateStudySessionParams(params: StudySessionParams): void {
        if (!params.userId || typeof params.userId !== 'string') {
            throw new Error('Valid userId is required');
        }
        
        if (!params.duration || params.duration <= 0) {
            throw new Error('Duration must be greater than 0');
        }
        
        if (params.duration > 480) { // 8 hours max
            throw new Error('Duration cannot exceed 480 minutes (8 hours)');
        }
        
        if (params.topicId && (typeof params.topicId !== 'number' || params.topicId <= 0)) {
            throw new Error('topicId must be a positive number if provided');
        }
        
        if (params.metadata?.difficulty && !['easy', 'medium', 'hard'].includes(params.metadata.difficulty)) {
            throw new Error('Difficulty must be easy, medium, or hard');
        }
    }
}

// Export singleton instance
export const activityTrackingService = new ActivityTrackingService();
export default activityTrackingService;