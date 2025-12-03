'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import classQuizStudentService from '@/app/[locale]/class-based/(class-quiz)/services/classQuizStudent.service';
import LoadingPage from '@/app/loading';
import { IAttemptDetail, IMyAttemptRow } from '@/app/[locale]/class-based/(class-quiz)/types/classQuiz.type';
import QuizQuestion from '@/app/[locale]/quiz/components/QuizQuestion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
  const { id: classId, classQuizId } = useParams<{ id: string; classQuizId: string }>();
  const router = useRouter();
  const search = useSearchParams();

  const quizId = Number(classQuizId);
  const attemptId = Number(search.get('attemptId'));

  const [attemptList, setAttemptList] = useState<IMyAttemptRow[]>([]);
  const [detail, setDetail] = useState<IAttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  /** 1) Load all attempts */
  useEffect(() => {
    classQuizStudentService.myAttempts(Number(classId)).then(rows => {
      const filtered = rows.filter(r => r.classQuizId === quizId);
      setAttemptList(filtered);
    });
  }, [classId, quizId]);

  /** 2) Load detail if has attemptId */
  useEffect(() => {
    if (!attemptId) {
      setLoading(false);
      return;
    }

    classQuizStudentService
      .attemptDetail(quizId, attemptId)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [quizId, attemptId]);

  /** ============================
   *  CASE 1 — LIST OF ATTEMPTS
   * ============================ */
  if (!attemptId) {
    return (
      <div className="container mx-auto py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 tracking-tight">Quiz Attempts</h1>

        {attemptList.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            <p>No attempts have been submitted.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {attemptList.map(at => (
              <Card
                key={at.attemptId}
                className="p-4 hover:bg-muted/40 transition rounded-xl"
              >
                <div className="flex items-center justify-between">
                  {/* LEFT */}
                  <div>
                    <p className="font-semibold text-lg">
                      Attempt #{at.attemptId}
                    </p>

                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      {at.submittedAt ? new Date(at.submittedAt).toLocaleString() : '—'}
                    </p>

                    <p className="mt-2 text-sm">
                      Score:{' '}
                      <span className="font-semibold">
                        {at.score}% ({at.correctCount}/{at.questionsCount})
                      </span>
                    </p>
                  </div>

                  {/* RIGHT */}
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={() =>
                      router.push(
                        `/class-based/${classId}/class-quiz/${quizId}/history?attemptId=${at.attemptId}`
                      )
                    }
                  >
                    Review answers <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  /** ============================
   *  CASE 2 — REVIEW A SPECIFIC ATTEMPT
   * ============================ */
  if (loading) return <LoadingPage />;

  if (!detail) return <div>Attempt not found</div>;

  const items = detail.classQuizVersion.snapshot.items;
  const answers = detail.answers;

  const correctCount = answers.filter(a => a.correct).length;
  const total = items.length;
  const score = Math.round((correctCount / total) * 100);

  const questions = items.map((item: any, idx: number) => {
    const answer = answers.find(a => a.snapshotQuestionIdx === idx + 1);
    return {
      text: item.text,
      choices: item.choices,
      selected: answer?.userAnswerIndex,
      isCorrect: answer?.correct,
      correctIndex: item.correctIndex,
    };
  });

  return (
    <div className="container mx-auto py-10 max-w-4xl space-y-6">
      {/* HEADER CARD */}
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Attempt #{attemptId}</CardTitle>
          <p className="text-muted-foreground mt-1">
            Submitted at:{' '}
            {((detail as any).submittedAt
              ? new Date((detail as any).submittedAt).toLocaleString()
              : ((detail as any).createdAt
                  ? new Date((detail as any).createdAt).toLocaleString()
                  : '—'))}
          </p>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-10">
            {/* SCORE CIRCLE */}
            <div className="relative h-24 w-24 flex items-center justify-center">
              <svg className="absolute h-24 w-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-muted stroke-[8]"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-emerald-500 stroke-[8]"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={
                    2 * Math.PI * 40 - (2 * Math.PI * 40 * score) / 100
                  }
                  strokeLinecap="round"
                />
              </svg>

              <div className="text-2xl font-bold">{score}%</div>
            </div>

            {/* META */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Correct Answers</p>
              <p className="text-xl font-semibold">
                {correctCount}/{total}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-6"
            onClick={() =>
              router.push(`/class-based/${classId}/class-quiz/${quizId}/history`)
            }
          >
            Back to attempts
          </Button>
        </CardContent>
      </Card>

      {/* QUESTIONS */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Answer Review</h2>

        {questions.map((q, idx) => (
          <QuizQuestion
            key={idx}
            questionNumber={idx + 1}
            questionText={q.text}
            choices={q.choices}
            selectedAnswer={q.selected}
            isCorrect={q.isCorrect}
            correctIndex={q.correctIndex}
            showResult={true}
            onAnswerSelect={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
