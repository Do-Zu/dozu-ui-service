import { getRequest, postRequest } from '@/api/api';
import { LeaderboardEntry, WeeklyLeaderboard, MonthlyLeaderboard, ClassLeaderboard, LeaderboardFilter } from '@/types/leaderboard.types';

class LeaderboardService {
    async getWeeklyLeaderboard(classId: number): Promise<WeeklyLeaderboard | null> {
        try {
            // TODO: Implement actual API call when backend is ready
            // For now, return mock data
            return this.getMockWeeklyLeaderboard(classId);
        } catch (error) {
            console.error('Error fetching weekly leaderboard:', error);
            return null;
        }
    }

    async getMonthlyLeaderboard(classId: number): Promise<MonthlyLeaderboard | null> {
        try {
            // TODO: Implement actual API call when backend is ready
            // For now, return mock data
            return this.getMockMonthlyLeaderboard(classId);
        } catch (error) {
            console.error('Error fetching monthly leaderboard:', error);
            return null;
        }
    }

    async getClassLeaderboard(classId: number): Promise<ClassLeaderboard | null> {
        try {
            // TODO: Implement actual API call when backend is ready
            // For now, return mock data
            return {
                classId,
                className: `Class ${classId}`,
                weekly: this.getMockWeeklyLeaderboard(classId),
                monthly: this.getMockMonthlyLeaderboard(classId),
                totalStudents: 25
            };
        } catch (error) {
            console.error('Error fetching class leaderboard:', error);
            return null;
        }
    }

    async getGlobalLeaderboard(filter: LeaderboardFilter): Promise<LeaderboardEntry[]> {
        try {
            // TODO: Implement actual API call when backend is ready
            // For now, return mock data
            return this.getMockGlobalLeaderboard(filter);
        } catch (error) {
            console.error('Error fetching global leaderboard:', error);
            return [];
        }
    }

    // Mock data methods
    private getMockWeeklyLeaderboard(classId: number): WeeklyLeaderboard {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

        return {
            week: this.getWeekString(startOfWeek),
            startDate: startOfWeek,
            endDate: endOfWeek,
            entries: this.getMockLeaderboardEntries(10),
            totalParticipants: 25
        };
    }

    private getMockMonthlyLeaderboard(classId: number): MonthlyLeaderboard {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return {
            month: this.getMonthString(startOfMonth),
            startDate: startOfMonth,
            endDate: endOfMonth,
            entries: this.getMockLeaderboardEntries(10),
            totalParticipants: 25,
            monthlyBadges: this.getMockMonthlyBadges()
        };
    }

    private getMockGlobalLeaderboard(filter: LeaderboardFilter): LeaderboardEntry[] {
        return this.getMockLeaderboardEntries(filter.limit || 50);
    }

    private getMockLeaderboardEntries(count: number): LeaderboardEntry[] {
        const mockUsers = [
            { name: 'Alice Johnson', username: 'alice_j', avatar: undefined },
            { name: 'Bob Smith', username: 'bob_s', avatar: undefined },
            { name: 'Charlie Brown', username: 'charlie_b', avatar: undefined },
            { name: 'Diana Prince', username: 'diana_p', avatar: undefined },
            { name: 'Eve Wilson', username: 'eve_w', avatar: undefined },
            { name: 'Frank Miller', username: 'frank_m', avatar: undefined },
            { name: 'Grace Lee', username: 'grace_l', avatar: undefined },
            { name: 'Henry Davis', username: 'henry_d', avatar: undefined },
            { name: 'Ivy Chen', username: 'ivy_c', avatar: undefined },
            { name: 'Jack Wilson', username: 'jack_w', avatar: undefined },
        ];

        return Array.from({ length: count }, (_, index) => ({
            userId: index + 1,
            username: mockUsers[index % mockUsers.length].username,
            fullName: mockUsers[index % mockUsers.length].name,
            avatarUrl: mockUsers[index % mockUsers.length].avatar,
            points: Math.max(1000 - (index * 50), 100),
            rank: index + 1,
            streak: Math.max(30 - (index * 2), 1),
            lessonsCompleted: Math.max(50 - (index * 3), 5),
            quizzesCompleted: Math.max(20 - (index * 2), 2),
            flashcardsReviewed: Math.max(200 - (index * 10), 20),
            averageScore: Math.max(95 - (index * 2), 70),
            lastActivity: new Date(Date.now() - (index * 24 * 60 * 60 * 1000))
        }));
    }

    private getMockMonthlyBadges() {
        return [
            {
                id: 1,
                name: 'Top Performer',
                description: 'Achieved highest points this month',
                icon: '🏆',
                rarity: 'gold' as const,
                criteria: { minPoints: 1000 },
                awardedTo: [1, 2, 3]
            },
            {
                id: 2,
                name: 'Streak Master',
                description: 'Maintained 30+ day streak',
                icon: '🔥',
                rarity: 'silver' as const,
                criteria: { minStreak: 30 },
                awardedTo: [1, 4, 5]
            }
        ];
    }

    private getWeekString(date: Date): string {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }

    private getMonthString(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${year}-${month}`;
    }

    private getWeekNumber(date: Date): number {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    async awardPoints(activity: {
        userId: number;
        action: 'lesson_completed' | 'quiz_high_score' | 'streak_maintained' | 'flashcard_reviewed' | 'daily_login';
        points: number;
        metadata?: any;
    }): Promise<boolean> {
        try {
            // Map actions to correct API endpoints
            let endpoint = '';
            let payload: any = {};

            switch (activity.action) {
                case 'flashcard_reviewed':
                    endpoint = '/gamification/points/award/flashcard';
                    payload = {
                        flashcardId: activity.metadata?.flashcardId,
                        rating: activity.metadata?.rating,
                        topicName: activity.metadata?.topicName
                    };
                    break;
                case 'lesson_completed':
                    endpoint = '/gamification/points/award/lesson';
                    payload = {
                        lessonId: activity.metadata?.lessonId
                    };
                    break;
                case 'quiz_high_score':
                    endpoint = '/gamification/points/award/quiz';
                    payload = {
                        quizId: activity.metadata?.quizId,
                        score: activity.metadata?.score
                    };
                    break;
                case 'streak_maintained':
                    endpoint = '/gamification/points/award/daily-goal';
                    payload = {
                        streakDays: activity.metadata?.streakDays
                    };
                    break;
                case 'daily_login':
                    endpoint = '/gamification/points/award/daily-goal';
                    payload = {
                        type: 'login'
                    };
                    break;
                default:
                    console.error('Unknown action type:', activity.action);
                    return false;
            }

            const response = await postRequest(endpoint, payload) as any;
            return response.status === 'success';
        } catch (error) {
            console.error('Error awarding points:', error);
            return false;
        }
    }

    async getUserRank(userId: number, classId?: number): Promise<{ rank: number; totalUsers: number } | null> {
        try {
            // TODO: Implement actual API call when backend is ready
            // For now, return mock data
            return {
                rank: Math.max(1, userId % 10), // Mock rank based on userId
                totalUsers: 25
            };
        } catch (error) {
            console.error('Error fetching user rank:', error);
            return null;
        }
    }
}

export const leaderboardService = new LeaderboardService();
export default leaderboardService;
