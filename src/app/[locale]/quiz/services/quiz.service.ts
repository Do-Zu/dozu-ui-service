import { getRequest, postRequest } from '@/api/api';

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
