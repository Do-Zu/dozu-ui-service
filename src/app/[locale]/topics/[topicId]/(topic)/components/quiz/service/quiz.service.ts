import { postRequest } from '@/api/api';
import { ICompareAnswerRequest, ICompareAnswerResponse } from '../types/questionIndividual.type';

class QuizService {
    async compareAnswerSimilarity(data: ICompareAnswerRequest): Promise<ICompareAnswerResponse> {
        const response = await postRequest<ICompareAnswerRequest, ICompareAnswerResponse>(
            '/feynman/compare/similarity',
            data,
        );
        return response?.data;
    }
}

export const quizService = new QuizService();
