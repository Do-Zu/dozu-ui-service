export interface IProgress {
  id: string;
  userId: string;
  topicId: string;
  contentType: ContentType;
  completionPercentage: number;
  status: ProgressStatus;
  score?: number;
  lastInteractionAt: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: ProgressMetadata;
}

export enum ContentType {
  // COURSE = 'course',
  // LESSON = 'lesson',
  QUIZ = 'quiz',
  FLASHCARD = 'flashcard',
  // VIDEO = 'video',
  // ARTICLE = 'article'
}

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface ProgressMetadata {
  attempts?: number;
  timeSpent?: number;
  lastPosition?: number;
  answers?: Record<string, any>;
  notes?: string;
}

export interface IProgressStatistics {
  totalContents: number;
  completedContents: number;
  inProgressContents: number;
  notStartedContents: number;
  averageCompletionPercentage: number;
  averageScore?: number;
  totalTimeSpent: number;
  lastActiveAt?: Date;
}

export interface IDashboardStatistics {
  totalStudyHours: number;
  averageDailyStudy: number;
  completedTopics: number;
  weeklyComparison: {
    totalStudyHours: number;
    percentageChange: number;
  };
  dailyStudyHours: Array<{
    day: string;
    hours: number;
    date: string;
  }>;
  learningMethodsDistribution: Array<{
    method: ContentType;
    percentage: number;
    count: number;
  }>;
  topPerformanceRank?: number;
}

export interface IDailyStudyRecord {
  id: string;
  userId: string;
  date: string;
  totalMinutes: number;
  sessionsCount: number;
  createdAt: Date;
  updatedAt: Date;
} 