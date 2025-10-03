import { progressService } from '@/services/progress/progress.service';

// Define ContentType locally since it might not exist
enum ContentType {
    FLASHCARD = 'flashcard',
    QUIZ = 'quiz',
    LESSON = 'lesson'
}

export interface ClassStreakData {
    userId: number;
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: Date | null;
    streakActive: boolean;
    streakFreezeCount: number;
    streakFreezeActive: boolean;
}

class ClassStreakService {
    /**
     * Get class-specific streak for a single student
     */
    async getStudentClassStreak(userId: number, classId: number): Promise<ClassStreakData> {
        try {
            // Get progress data for the last 30 days for this specific class
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const progressData = await progressService.getAllProgress({
                userId: userId.toString(),
                fromDate: thirtyDaysAgo,
                contentType: 'flashcard' as any // Focus on flashcard learning
                // Note: classId filtering will be implemented in progress service
            });

            // Calculate streak based on daily learning activity in this class
            const streakData = this.calculateClassStreakFromProgress(progressData);
            
            return {
                userId,
                currentStreak: streakData.currentStreak,
                longestStreak: streakData.longestStreak,
                lastStudyDate: streakData.lastStudyDate,
                streakActive: streakData.streakActive,
                streakFreezeCount: 0, // TODO: Implement class-specific freeze
                streakFreezeActive: false, // TODO: Implement class-specific freeze
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
     */
    async getClassStudentStreaks(classId: number, userIds: number[]): Promise<Map<number, ClassStreakData>> {
        const results = new Map<number, ClassStreakData>();
        
        try {
            // Use Promise.allSettled to handle partial failures
            const promises = userIds.map(async (userId) => {
                try {
                    const streakData = await this.getStudentClassStreak(userId, classId);
                    return { userId, streakData };
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

    /**
     * Calculate streak from progress data for a specific class
     */
    private calculateClassStreakFromProgress(progressData: any[]): {
        currentStreak: number;
        longestStreak: number;
        lastStudyDate: Date | null;
        streakActive: boolean;
    } {
        if (!progressData || progressData.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: null,
                streakActive: false,
            };
        }

        // Group progress by date
        const progressByDate = new Map<string, any[]>();
        progressData.forEach(progress => {
            const date = new Date(progress.createdAt).toDateString();
            if (!progressByDate.has(date)) {
                progressByDate.set(date, []);
            }
            progressByDate.get(date)!.push(progress);
        });

        // Sort dates in descending order
        const sortedDates = Array.from(progressByDate.keys()).sort((a, b) => 
            new Date(b).getTime() - new Date(a).getTime()
        );

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let lastStudyDate: Date | null = null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if user studied today
        const todayStr = today.toDateString();
        const studiedToday = progressByDate.has(todayStr);

        // Calculate current streak
        for (let i = 0; i < sortedDates.length; i++) {
            const dateStr = sortedDates[i];
            const studyDate = new Date(dateStr);
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);

            // Check if this date matches expected consecutive day
            if (studyDate.toDateString() === expectedDate.toDateString()) {
                currentStreak++;
                if (i === 0) {
                    lastStudyDate = studyDate;
                }
            } else {
                break;
            }
        }

        // Calculate longest streak
        for (let i = 0; i < sortedDates.length; i++) {
            const dateStr = sortedDates[i];
            const studyDate = new Date(dateStr);
            
            if (i === 0) {
                tempStreak = 1;
            } else {
                const prevDate = new Date(sortedDates[i - 1]);
                const dayDiff = Math.floor((prevDate.getTime() - studyDate.getTime()) / (1000 * 60 * 60 * 24));
                
                if (dayDiff === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        // Check if streak is active (studied today or yesterday)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        const studiedYesterday = progressByDate.has(yesterdayStr);
        
        const streakActive = studiedToday || (currentStreak > 0 && studiedYesterday);

        return {
            currentStreak,
            longestStreak,
            lastStudyDate,
            streakActive,
        };
    }
}

export const classStreakService = new ClassStreakService();
export default classStreakService;
