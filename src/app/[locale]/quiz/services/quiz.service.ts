import { getRequest, postRequest } from '@/api/api';
import { activityTrackingService } from '@/services/gamification/activityTrackingService';

export const quizService = {

    getStatistics: async (topicId: string) => {
        const response = await getRequest(`/quiz/statistics?topicId=${topicId}`);
        return response;
    },

    generateQuiz: async (topicId: string, type: string) => {
        const response = await getRequest(`/quiz/generate?type=${type}&topicId=${topicId}`);
        return response;
    },

    createQuiz: async (quizData: any) => {
        const response = await postRequest('/quiz/create', quizData);
        return response;
    },

    getQuizById: async (quizId: string | number) => {
        const response = await getRequest(`/quiz/${quizId}`);
        return response;
    },

    submitQuiz: async (quizData: any) => {
        const response = await postRequest('/quiz/submit', quizData);
        
        // Track quiz completion activity for streak
        if (response.status === 'success' && response.data) {
            try {
                const responseData = response.data as any;
                const score = responseData.score || 0; // Assuming score is in response
                const quizId = quizData.quizId || responseData.quizId;
                const duration = quizData.duration || 0; // Assuming duration is tracked
                
                await activityTrackingService.trackQuizCompletion(
                    Number(quizId),
                    score,
                    duration
                );
            } catch (error) {
                console.error('Error tracking quiz completion activity:', error);
            }
        }
        
        return response;
    },

    getQuizHistory: async (topicId: string) => {
        const response = await getRequest(`/quiz/history?topicId=${topicId}`);
        return response;
    },

    getQuizResultDetail: async (quizResultId: string) => {
        const response = await getRequest(`/quiz/history/${quizResultId}`);
        return response;
    },
};
