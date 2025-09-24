'use client';

import { useEffect, useState } from 'react';
import { quizService } from '../../services/quiz.service';
import QuizCard from '../../components/QuizCard';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    const fetchHistoryWithTitle = async () => {
      try {
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
            } catch (error) {
              console.warn(`Failed to fetch quiz ${quiz.quizId}`, error);
              return {
                ...quiz,
                quizTitle: `Quiz #${quiz.quizId}`,
              };
            }
          })
        );

        setQuizHistory(historyWithTitles);
      } catch (error) {
        console.error('Error fetching quiz history:', error);
      }
    };

    fetchHistoryWithTitle();
  }, [params.topicId]);

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
              quizResultId={quiz.quizResultId}
              quizId={quiz.quizId}
              quizTitle={quiz.quizTitle || `Quiz #${quiz.quizId}`}
              correctAnswersCount={quiz.correctAnswersCount}
              questionsCount={quiz.questionsCount}
              timeReviewed={quiz.timeReviewed}
              onClick={() =>
                router.push(`/quiz/${params.topicId}/history/${quiz.quizResultId}`)
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default QuizHistoryPage;
