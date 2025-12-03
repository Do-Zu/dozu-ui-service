'use client';

import { useEffect, useState, useCallback } from 'react';
import { quizService } from '../../services/quiz.service';
import QuizCard from '../../components/QuizCard';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface QuizHistoryItem {
    quizResultId: number;
    quizId: number;
    correctAnswersCount: number;
    questionsCount: number;
    timeReviewed: string;
    quizTitle?: string;
}

const QuizHistoryPage = ({ params }: { params: { topicId: string } }) => {
    const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchHistoryWithTitle = useCallback(async () => {
        setError(null);
        setLoading(true);

        try {
            // Original fetch
            const response = await quizService.getQuizHistory(params.topicId);
            const historyList: QuizHistoryItem[] = Array.isArray(response.data) ? response.data : [];

            const historyWithTitles = await Promise.all(
                historyList.map(async (quiz) => {
                    try {
                        const quizDetail = await quizService.getQuizById(quiz.quizId);
                        const quizData = quizDetail?.data as { name?: string } | undefined;

                        return {
                            ...quiz,
                            quizTitle: quizData?.name ?? `Quiz #${quiz.quizId}`,
                        };
                    } catch {
                        // Added fallback for failed quiz title fetch
                        return { ...quiz, quizTitle: `Quiz #${quiz.quizId}` };
                    }
                }),
            );

            setQuizHistory(historyWithTitles);
        } catch (err) {
            console.error('Error fetching quiz history:', err);
            setError('Failed to load quiz history. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [params.topicId]);

    useEffect(() => {
        fetchHistoryWithTitle();
    }, [fetchHistoryWithTitle]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-primary rounded-full mb-3"></div>
                <p className="text-sm font-medium">Loading quiz history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-red-500 font-medium mb-3">{error}</p>
                <Button onClick={fetchHistoryWithTitle}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="px-6 py-8">
            <h2 className="text-2xl font-semibold mb-4">History of Quiz</h2>
            <div className="space-y-4">
                {quizHistory.length === 0 ? (
                    <p className="text-gray-500">No quiz has been taken yet.</p>
                ) : (
                    quizHistory.map((quiz) => (
                        <QuizCard
                            key={quiz.quizResultId}
                            quizId={quiz.quizId}
                            quizTitle={quiz.quizTitle || `Quiz #${quiz.quizId}`}
                            correctAnswersCount={quiz.correctAnswersCount}
                            questionsCount={quiz.questionsCount}
                            timeReviewed={quiz.timeReviewed}
                            onClick={() => router.push(`/quiz/${params.topicId}/history/${quiz.quizResultId}`)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default QuizHistoryPage;
