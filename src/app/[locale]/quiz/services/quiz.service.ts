import { getRequest, postRequest } from '@/api/api';
import qs from 'qs';
import { activityTrackingService } from '@/services/gamification/activityTracking.service';
import { streakProgressService } from '@/services/progress/streakProgress.service';

type QuizType = 'initial' | 'new' | 'learning' | 'review' | 'wrong' | 'weak';

type InitialConfig = {
    limit?: number;
    shuffle?: boolean;
};

export const quizService = {
    getStatistics: async (topicId: string) => {
        const response = await getRequest(`/quiz/statistics?topicId=${topicId}`);
        return response;
    },

    generateQuiz: async (topicId: string, type: QuizType, initialConfig?: InitialConfig) => {
        const query = {
            topicId,
            type,
            ...(type === 'initial' && initialConfig ? { initialConfig } : {}),
        };

        const queryString = qs.stringify(query, {
            allowDots: false, // create initialConfig[limit]
            encode: true,
        });
        const response = await getRequest(`/quiz/generate?${queryString}`);
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
        console.log('Quiz data:', quizData);

        const response = await postRequest('/quiz/submit', quizData);
        console.log('Quiz submit response:', response);

        // Track quiz completion for both activity and progress
        if ((response.status === 'success' || response.status === 'created') && response.data) {
            try {
                const responseData = response.data as any;
                const score = quizData.score || responseData.score || 0;
                const quizId = quizData.quizId || responseData.quizId;
                const duration = quizData.duration || 0;

                console.log('Quiz completion data:', { score, quizId, duration });

                // Get userId from localStorage for progress tracking
                const userString = localStorage.getItem('user');
                if (userString) {
                    const user = JSON.parse(userString);
                    const userId = user?.userId;

                    console.log('User ID for tracking:', userId);

                    if (userId) {
                        // Track progress for streak calculation
                        console.log('Tracking quiz progress...');
                        const progressResult = await streakProgressService.trackQuizCompletion(
                            userId.toString(),
                            quizId.toString(),
                            score,
                            duration,
                            quizData.topicId?.toString(),
                        );
                        console.log('Quiz progress tracking result:', progressResult);
                    }
                }

                // Also track activity for gamification
                console.log('Tracking quiz activity...');
                const quizIdNum = Number(quizId);
                await activityTrackingService.trackQuizCompletion(quizIdNum, score, duration);
                console.log('Quiz activity tracked successfully');
            } catch (error) {
                console.error('Error tracking quiz completion:', error);
                console.error('Error details:', error);
                // Don't fail the quiz submission if tracking fails
            }
        } else {
            console.log('Quiz submission failed or no data:', response);
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

    getRecommendation: async (topicId: string) => {
        const res = await getRequest(`/quiz/recommend?topicId=${topicId}`);
        return res.data;
    },
};
