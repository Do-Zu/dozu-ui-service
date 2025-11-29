export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: Date | null;
    streakFreezeActive: boolean;
    streakFreezeCount: number;
}

export interface StreakUpdateResult {
    currentStreak: number;
    isNewStreak: boolean;
    pointsEarned: number;
    streakBroken: boolean;
    message: string;
}

export interface PointsData {
    totalPoints: number;
    availablePoints: number;
    level: number;
    experiencePoints: number;
    nextLevelExperience: number;
}

export interface GamificationStats {
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
    level: number;
    experiencePoints: number;
    nextLevelExperience: number;
    achievements: any[];
    weeklyActivity: number[];
    totalLessonsCompleted: number;
    totalQuizzesCompleted: number;
    totalFlashcardsCompleted: number;
    averageScore: number;
    streakFreezeActive?: boolean;
    streakFreezeCount?: number;
    lastStudyDate?: Date | null;
}

export interface ApiResponse<T = any> {
    status: string;
    data: T;
    message: string;
}

export interface StudySessionParams {
    userId: string;
    duration: number; // in minutes
    topicId?: number;
    subject?: string;
    metadata?: {
        notes?: string;
        difficulty?: 'easy' | 'medium' | 'hard';
        focusAreas?: string[];
        resources?: string[];
    };
}

export interface StudySessionResult {
    success: boolean;
    pointsEarned: number;
    streakUpdated: boolean;
    message: string;
}

export interface AwardPointsRequest {
    userId: number;
    action: 'lesson_completed' | 'quiz_high_score' | 'streak_maintained' | 'flashcard_reviewed' | 'daily_login';
    points: number;
    metadata?: Record<string, unknown>;
}

export interface AwardPointsResponse {
    success: boolean;
    pointsAwarded: number;
    newTotalPoints: number;
    message: string;
}

export interface FlashcardAwardPayload {
    flashcardId?: number;
    rating?: number;
    topicName?: string;
}

export interface LessonAwardPayload {
    lessonId?: number;
}

export interface QuizAwardPayload {
    quizId?: number;
    score?: number;
}

export interface StreakAwardPayload {
    streakDays?: number;
}

export interface LoginAwardPayload {
    type: 'login';
}