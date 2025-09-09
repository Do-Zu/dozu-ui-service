'use client';

import { useEffect, useState } from 'react';
import { quizService } from '../../../services/quiz.service';
import QuizResultDetail from '../../../components/QuizResultDetail';

const QuizResultDetailPage = ({ params }: { params: { topicId: string; quizResultId: string } }) => {
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    const fetchQuizResultDetail = async () => {
      try {
        const response = await quizService.getQuizResultDetail(params.quizResultId);
        setQuizResult(response.data);
      } catch (error) {
        console.error('Error fetching quiz result detail:', error);
      }
    };

    fetchQuizResultDetail();
  }, [params.quizResultId]);

  if (!quizResult) return <div className="p-6">Loading...</div>;

  return (
    <div className="px-6 py-8">
      <h2 className="text-2xl font-semibold mb-4">Quiz Result Detail</h2>
      <QuizResultDetail quizResult={quizResult} />
    </div>
  );
};

export default QuizResultDetailPage;