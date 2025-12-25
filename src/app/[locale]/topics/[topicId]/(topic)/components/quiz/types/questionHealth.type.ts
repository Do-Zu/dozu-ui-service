export type SRStatus = 'untracked' | 'new' | 'learning' | 'review' | 'relearning';

export type HealthLevel = 'critical' | 'weak' | 'fair' | 'healthy' | 'mastered';

export interface QuestionHealthMetrics {
  easinessFactor: number | null;
  repetitionNumber: number | null;
  reviewInterval: number | null;
  lastReviewed: string | null;
  nextReview: string | null;
}

export interface QuestionHealthDTO {
  questionId: number;
  topicId: number;

  questionText: string;
  questionType: string | null;


  choices?: string[] | null;
  correctIndex?: number | null;

  status: SRStatus;

  healthScore: number; // 0..100
  healthLevel: HealthLevel;

  metrics: QuestionHealthMetrics;
  reasons: string[];
}

export type QuestionHealthData = {
  topicId: number;
  topicName?: string;
  items: QuestionHealthDTO[];
  summary?: Record<HealthLevel, number>;
};

export type QuestionHealthResponse = import('@/api/type').ApiResponse<QuestionHealthData>;
