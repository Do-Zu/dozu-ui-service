'use client';

import { useEffect, useState } from 'react';
import { quizService } from '../../../services/quiz.service';
import QuizResult from '../../../components/QuizResult';

const QuizResultPage = ({ params }: { params: { topicId: string; quizResultId: string } }) => {
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        const response = await quizService.getQuizResultDetail(params.quizResultId);
        setQuizResult(response.data);
      } catch (error) {
        console.error('Error fetching quiz result:', error);
      }
    };

    fetchQuizResult();
  }, [params.quizResultId]);

  if (!quizResult) return <div>Loading...</div>;

  return (
    <div className="px-6 py-8">
      <h2 className="text-2xl font-semibold mb-4">Kết quả bài quiz</h2>
      <QuizResult
        totalScore={quizResult.correctAnswersCount}
        correctAnswers={quizResult.correctAnswersCount}
        incorrectAnswers={quizResult.questionsCount - quizResult.correctAnswersCount}
      />
    </div>
  );
};

export default QuizResultPage;