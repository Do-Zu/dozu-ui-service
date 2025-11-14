import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';

export interface IQuizClassStatistics {
    totalStudents: number;
    completedCount: number;
    inProgressCount: number;
    notStartedCount: number;
}

export interface IQuizAnswerDetail {
    questionIndex: number;
    userAnswerIndex: number | null;
    isCorrect: boolean;
    answeredAt: string | null;
}

export interface IStudentQuizResult {
    userId: number;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    status: 'completed' | 'in_progress' | 'not_started';
    completedAt: string | null;
    score: number | null;
    correctCount: number | null;
    questionsCount: number | null;
    correctPercentage: number | null;
    answers?: IQuizAnswerDetail[];
}

export interface IQuizClassResultsResponse {
    quizInfo: {
        classQuizId: number;
        title: string;
        content: string;
        dueDate: string | null;
    };
    statistics: IQuizClassStatistics;
    studentResults: IStudentQuizResult[];
}

export type QuestionCategory = 'thuong_sai' | 'doi_luc_sai' | 'it_khi_sai' | 'chua_bat_dau';

export interface IQuestionAnalysis {
    questionIndex: number;
    questionText?: string;
    choices?: string[];
    correctIndex?: number;
    correctRate: number;
    category: QuestionCategory;
    correctCount: number;
    totalAnswered: number;
    totalStudents: number;
}

export interface IQuestionAnalysisResponse {
    questions: IQuestionAnalysis[];
    totalStudents: number;
    summary: {
        thuongSai: number;
        doiLucSai: number;
        itKhiSai: number;
        chuaBatDau: number;
    };
}

class QuizClassService {
    /**
     * Get complete quiz results for a class
     * GET /api/v1/quiz-class/:classQuizId/results?includeAnswers=true
     */
    public async getQuizResults(classQuizId: number, includeAnswers: boolean = false): Promise<IQuizClassResultsResponse> {
        const url = includeAnswers 
            ? `/quiz-class/${classQuizId}/results?includeAnswers=true`
            : `/quiz-class/${classQuizId}/results`;
        
        const response = await getRequest<void, IQuizClassResultsResponse>(url);
        if (response.status !== 'success') {
            throw new Error(response.message || 'Failed to fetch quiz results');
        }
        return response.data!;
    }

    /**
     * Get quiz statistics only
     * GET /api/v1/quiz-class/:classQuizId/statistics
     */
    public async getQuizStatistics(classQuizId: number): Promise<IQuizClassStatistics> {
        const response = await getRequest<void, IQuizClassStatistics>(
            `/quiz-class/${classQuizId}/statistics`
        );
        if (response.status !== 'success') {
            throw new Error(response.message || 'Failed to fetch quiz statistics');
        }
        return response.data!;
    }

    /**
     * Get student quiz results only
     * GET /api/v1/quiz-class/:classQuizId/students
     */
    public async getStudentResults(classQuizId: number): Promise<IStudentQuizResult[]> {
        const response = await getRequest<void, IStudentQuizResult[]>(
            `/quiz-class/${classQuizId}/students`
        );
        if (response.status !== 'success') {
            throw new Error(response.message || 'Failed to fetch student results');
        }
        return response.data!;
    }

    /**
     * Get question-level analysis
     * GET /api/v1/quiz-class/:classQuizId/question-analysis
     */
    public async getQuestionAnalysis(classQuizId: number): Promise<IQuestionAnalysisResponse> {
        const response = await getRequest<void, IQuestionAnalysisResponse>(
            `/quiz-class/${classQuizId}/question-analysis`
        );
        if (response.status !== 'success') {
            throw new Error(response.message || 'Failed to fetch question analysis');
        }
        return response.data!;
    }
}

export default new QuizClassService();

