'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import classQuizStudentService from '@/app/[locale]/class-based/(class-quiz)/services/classQuizStudent.service';
import LoadingPage from '@/app/loading';
import { IAttemptDetail } from '@/app/[locale]/class-based/(class-quiz)/types/classQuiz.type';

export default function SubmitPage() {
  const { classQuizId } = useParams<{ id: string; classQuizId: string }>();
  const search = useSearchParams();
  const attemptId = Number(search.get('attemptId'));
  const quizId = Number(classQuizId);

  const [detail, setDetail] = useState<IAttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    classQuizStudentService
      .attemptDetail(quizId, attemptId)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [quizId, attemptId]);

  if (!attemptId) return <div>Missing attemptId</div>;
  if (loading) return <LoadingPage/>;

  const score = detail?.answers
    ? Math.round(100 * (detail.answers.filter(a => a.correct).length) / (detail.classQuizVersion.snapshot.items.length))
    : 0;

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Assignment results</h1>
      <p className="mb-2">Attempt ID: {attemptId}</p>
      <p className="mb-2">Score: {score}%</p>
      <p className="mb-6">
        Correct {detail?.answers.filter(a => a.correct).length}/{detail?.classQuizVersion.snapshot.items.length}
      </p>

      {/* Nếu muốn liệt kê từng câu */}
      {/* ... */}
    </div>
  );
}
