import { IProgress } from '../progress';

export interface IClassStreakData {
    userId: number;
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: Date | null;
    streakActive: boolean;
    streakFreezeCount: number;
    streakFreezeActive: boolean;
}

export interface IStreakCalculationResult {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: Date | null;
    streakActive: boolean;
}

export interface IProgressByDate {
    [dateString: string]: IProgress[];
}
