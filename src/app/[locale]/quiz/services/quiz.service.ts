import { getRequest, postRequest } from '@/api/api';
import { activityTrackingService } from '@/services/gamification/activityTracking.service';
import { streakProgressService } from '@/services/progress/streakProgress.service';

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
        
        // Track quiz completion for both activity and progress
        if (response.status === 'success' && response.data) {
            try {
                const responseData = response.data as any;
                const score = responseData.score || 0;
                const quizId = quizData.quizId || responseData.quizId;
                const duration = quizData.duration || 0;
                
                // Get userId from localStorage for progress tracking
                const userString = localStorage.getItem('user');
                if (userString) {
                    const user = JSON.parse(userString);
                    const userId = user?.userId;
                    
                    if (userId) {
                        // Track progress for streak calculation
                        await streakProgressService.trackQuizCompletion(
                            userId.toString(),
                            quizId.toString(),
                            score,
                            duration
                        );
                        console.log('Quiz progress tracked for streak calculation');
                    }
                }
                
                // Also track activity for gamification
                const quizIdNum = Number(quizId);
                await activityTrackingService.trackQuizCompletion(
                    quizIdNum,
                    score,
                    duration
                );
            } catch (error) {
                console.error('Error tracking quiz completion:', error);
                // Don't fail the quiz submission if tracking fails
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
