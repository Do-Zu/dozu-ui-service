'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import LoadingPage from '@/app/loading';
import classQuizStudentService from '@/app/[locale]/class-based/(class-quiz)/services/classQuizStudent.service';
import {
  IPlayableMeta, IStartAttemptResp, ISaveAnswerBody, ISubmitAttemptResp, IAttemptDetail
} from '@/app/[locale]/class-based/(class-quiz)/types/classQuiz.type';
import { Button } from '@/components/ui/button';
import QuizQuestion from '@/app/[locale]/quiz/components/QuizQuestion'; // ⬅️ dùng chung component personal
import { toast } from '@/hooks/use-toast';
import { useUserSession } from '@/app/[locale]/auth/hooks/useUserSession';



type UIQuestion = {
  text: string;
  choices: string[];
  // lưu local state đã chọn (để highlight trong UI). BE lưu thật qua saveAnswer.
  selected?: number | null;
};

export default function StudentStartClassQuizPage() {
  const { classQuizId, id } = useParams<{ id: string; classQuizId: string }>();
  const quizId = Number(classQuizId);

  const [meta, setMeta] = useState<IPlayableMeta | null>(null);
  const [attempt, setAttempt] = useState<IStartAttemptResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ISubmitAttemptResp | null>(null);
  const router = useRouter();
  const classId = Number(id);
    const { locale } = useParams<{
    locale: string;    // vì folder là app/[locale]/...
    id: string;
    classQuizId: string;
  }>();


  // danh sách câu hỏi hiển thị (map từ snapshot)
  const [questions, setQuestions] = useState<UIQuestion[]>([]);
  const { user } = useUserSession();
  const authUserId = Number(user?.userId);


  /** 1) Lấy playable để biết còn lượt / time window */
  useEffect(() => {
    classQuizStudentService
      .getPlayableMeta(quizId)
      .then(setMeta)
      .finally(() => setLoading(false));
  }, [quizId]);

  /** 2) Start -> tạo attempt -> lấy snapshot câu hỏi từ attemptDetail */
  async function onStart() {
    try {
      const a = await classQuizStudentService.startAttempt(quizId);
      setAttempt(a);

      // lấy snapshot để render
      const detail: IAttemptDetail = await classQuizStudentService.attemptDetail(quizId, a.attemptId);
      // snapshot: { orderSeed?: string; items: DraftItem[] }
      const items = detail.classQuizVersion.snapshot.items;

      // map sang UIQuestion. Support adHoc; nếu là originQuestionId thì TODO (xem chú ý bên dưới).
      const ui: UIQuestion[] = items.map((it: any) => {
        if (it && typeof it === 'object' && 'text' in it && Array.isArray(it.choices)) {
          return { text: it.text || '', choices: it.choices || [], selected: null };
        }
        // fallback cho originQuestionId (nếu publish chưa “resolve” text/choices)
        return { text: 'This question comes from the bank (originQuestionId). Please update publish() to embed text/choices.', choices: [], selected: null };
      });

      setQuestions(ui);
    } catch (e: any) {
      toast({ title: 'Cannot start quiz', description: e?.message, variant: 'destructive' });
    }
  }

  /** 3) Chọn đáp án -> gọi saveAnswer cho câu tương ứng (1-based index) */
async function onSelectAnswer(qIdx0: number, choiceIdx: number) {
  if (!attempt) return;
  if (!authUserId) {
    toast({ title: 'Bạn cần đăng nhập', description: 'Không xác định được userId', variant: 'destructive' });
    return;
  }
  try {
    const body: ISaveAnswerBody = {
      userId: authUserId,                 
      snapshotQuestionIdx: qIdx0 + 1,     
      userAnswerIndex: choiceIdx,
    };
    await classQuizStudentService.saveAnswer(quizId, attempt.attemptId, body);
    setQuestions(prev => prev.map((q, i) => (i === qIdx0 ? { ...q, selected: choiceIdx } : q)));
  } catch (e: any) {
    toast({ title: 'Save answer failed', description: e?.message, variant: 'destructive' });
  }
}


  /** 4) Submit attempt */
  async function onSubmit() {
    if (!attempt || !authUserId) return;
    setSubmitting(true);
    try {
      await classQuizStudentService.submitAttempt(quizId, attempt.attemptId);
      const href = `/${locale}${ROUTES.STUDENT.CLASS_BASED_ID_CLASS_QUIZ_SUBMIT(
        classId,
        quizId,
        attempt.attemptId
      )}`;

      router.push(href);
    } catch (e: any) {
      toast({ title: 'Submit failed', description: e?.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingPage/>;
  if (!meta) return <div>Quiz is not playable</div>;

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Quiz</h1>

      {!attempt ? (
        <Button onClick={onStart}>Start Attempt ({meta.remainingAttempts} left)</Button>
      ) : (
        <>
          <div className="my-4 text-sm text-muted-foreground">
            Attempt ends at: {new Date(attempt.attemptEndAt ?? Date.now()).toLocaleString()}
          </div>

          {/* Render câu hỏi bằng QuizQuestion */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <QuizQuestion
                key={`q-${idx}`}
                questionNumber={idx + 1}
                questionText={q.text}
                choices={q.choices}
                onAnswerSelect={(selectedIndex: number) => onSelectAnswer(idx, selectedIndex)}
              />
            ))}
          </div>

          <div className="mt-6">
            <Button onClick={onSubmit} disabled={submitting || !questions.length}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
{/* 
          {result ? (
            <div className="mt-6">
              <p>Score: {result.score}%</p>
              <p>{result.correctCount}/{result.questionsCount} correct</p>
              <p>Submitted at: {new Date(result.submittedAt).toLocaleString()}</p>
            </div>
          ) : null} */}
        </>
      )}
    </div>
  );
}
