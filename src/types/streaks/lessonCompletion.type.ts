export interface ILessonCompletionStats {
    isCompleted: boolean;
    completionPercentage: number;
    timeSpent: number; // in milliseconds
    lastAccessed: string | Date;
    score?: number;
    totalLessons: number;
    completedLessons: number;
}

export interface ILessonCompletionStatsResponse {
    isCompleted: boolean;
    completionPercentage: number;
    timeSpent: number; // in milliseconds
    lastAccessed: string; // API returns ISO string
    score?: number;
    totalLessons: number;
    completedLessons: number;
}

export interface ITopicLessonStats {
    isCompleted: boolean;
    completionPercentage: number;
    timeSpent: number;
    lastAccessed: Date;
    score?: number;
}

export interface ITopicLessonStatsResponse {
    isCompleted: boolean;
    completionPercentage: number;
    timeSpent: number;
    lastAccessed: string; // API returns ISO string
    score?: number;
}

export interface IClassLessonStatsResponse {
    [userId: string]: ILessonCompletionStatsResponse;
}
