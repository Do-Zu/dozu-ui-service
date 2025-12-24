import useFetch from '@/hooks/useFetch';
import { quizService } from '@/app/[locale]/quiz/services/quiz.service';

export type QuizRecommendType = 'new' | 'learning' | 'review' | 'weak' | 'wrong';

export interface QuizRecommendationDTO {
  recommendedType: QuizRecommendType;
  reason: string;
  counts: Record<QuizRecommendType, number>;
}

export function useQuizRecommendation(topicId?: number) {
    return useFetch<QuizRecommendationDTO | null>(
        () => quizService.getRecommendation(String(topicId)),
        {
            shouldRun: Boolean(topicId),
        }
    );
}
