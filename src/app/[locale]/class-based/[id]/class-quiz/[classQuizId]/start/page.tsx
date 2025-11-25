'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import LoadingPage from '@/app/loading';
import classQuizStudentService from '@/app/[locale]/class-based/(class-quiz)/services/classQuizStudent.service';
import {
  IPlayableMeta, IStartAttemptResp, ISaveAnswerBody, ISaveAnswerResp, ISubmitAttemptResp, IAttemptDetail
} from '@/app/[locale]/class-based/(class-quiz)/types/classQuiz.type';
import { Button } from '@/components/ui/button';
import QuizQuestion from '@/app/[locale]/quiz/components/QuizQuestion'; // ⬅️ dùng chung component personal
import { toast } from '@/hooks/use-toast';
import { useUserSession } from '@/app/[locale]/auth/hooks/useUserSession';
import { useQuizActivityWebSocket } from '@/hooks/useQuizActivityWebSocket';



type UIQuestion = {
  text: string;
  choices: string[];
  // lưu local state đã chọn (để highlight trong UI). BE lưu thật qua saveAnswer.
  selected?: number | null;
  isCorrect?: boolean | null; // null = chưa biết, true/false = đã biết kết quả
  correctIndex?: number; // Index của đáp án đúng (nếu có)
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

  // WebSocket for quiz activity tracking
  const { isConnected, emitAttemptStarted, emitAnswerSaved, emitAttemptSubmitted, emitActivity } = useQuizActivityWebSocket({
    enabled: !!quizId && !!authUserId,
    classQuizId: quizId,
    attemptId: attempt?.attemptId,
  });

  // Track focus/blur for activity monitoring
  const focusTimeRef = useRef<number>(Date.now());
  
  useEffect(() => {
    const handleFocus = () => {
      focusTimeRef.current = Date.now();
      if (attempt?.attemptId) {
        emitActivity('focus', { timestamp: new Date().toISOString() });
      }
    };
    
    const handleBlur = () => {
      const timeSpent = Date.now() - focusTimeRef.current;
      if (attempt?.attemptId) {
        emitActivity('blur', { 
          timestamp: new Date().toISOString(),
          timeSpent,
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [attempt?.attemptId, emitActivity]);


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

      // Emit WebSocket event for real-time tracking
      // Note: Backend also emits this event, but we emit from client for immediate feedback
      if (a.attemptId) {
        emitAttemptStarted(a.attemptId);
      }

      // lấy snapshot để render
      const detail: IAttemptDetail = await classQuizStudentService.attemptDetail(quizId, a.attemptId);
      // snapshot: { orderSeed?: string; items: DraftItem[] }
      const items = detail.classQuizVersion.snapshot.items;

      // Create a map of saved answers by question index for quick lookup
      const answersMap = new Map(
        detail.answers.map(answer => [answer.snapshotQuestionIdx, answer])
      );

      // map sang UIQuestion. Support adHoc; nếu là originQuestionId thì TODO (xem chú ý bên dưới).
      const ui: UIQuestion[] = items.map((it: any, index: number) => {
        const questionIdx = index + 1; // 1-based index
        const savedAnswer = answersMap.get(questionIdx);
        
        const baseQuestion = {
          text: it && typeof it === 'object' && 'text' in it ? (it.text || '') : 'This question comes from the bank (originQuestionId). Please update publish() to embed text/choices.',
          choices: it && typeof it === 'object' && Array.isArray(it.choices) ? (it.choices || []) : [],
          selected: savedAnswer?.userAnswerIndex ?? null,
          isCorrect: savedAnswer?.correct ?? null,
          correctIndex: typeof it?.correctIndex === 'number' ? it.correctIndex : undefined,
        };
        
        return baseQuestion;
      });

      setQuestions(ui);
      
      // Track focus when quiz starts
      focusTimeRef.current = Date.now();
      emitActivity('focus', { timestamp: new Date().toISOString() });
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
    
    // Optimistically update selected answer
    setQuestions(prev => prev.map((q, i) => 
      i === qIdx0 
        ? { ...q, selected: choiceIdx } 
        : q
    ));
    
    const response: ISaveAnswerResp = await classQuizStudentService.saveAnswer(quizId, attempt.attemptId, body);
    
    // Update UI with the response - store isCorrect internally but don't show to student
    // Backend emits WebSocket event with isCorrect for teacher monitoring
    const isCorrect = response?.saved?.correct ?? null;
    
    setQuestions(prev => prev.map((q, i) => 
      i === qIdx0 
        ? { ...q, selected: choiceIdx, isCorrect } // Store internally for potential use, but not displayed
        : q
    ));
    
    // Don't emit quiz-answer-saved from client - backend already emits it with isCorrect
    // Backend emits the event with correct status from saveAnswer response
    // Only emit generic activity events from client
    
    // Emit question change activity
    emitActivity('question-change', { 
      questionIndex: qIdx0 + 1,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    toast({ title: 'Save answer failed', description: e?.message, variant: 'destructive' });
  }
}


  /** 4) Submit attempt */
  async function onSubmit() {
    if (!attempt || !authUserId) return;
    setSubmitting(true);
    try {
      const result = await classQuizStudentService.submitAttempt(quizId, attempt.attemptId);
      
      // Emit WebSocket event for real-time tracking
      // Note: Backend also emits this event, but we emit from client for immediate feedback
      emitAttemptSubmitted(result?.score);
      
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
          {/* Don't show results while taking quiz - only track silently for teacher monitoring via WebSocket */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <QuizQuestion
                key={`q-${idx}`}
                questionNumber={idx + 1}
                questionText={q.text}
                choices={q.choices}
                selectedAnswer={q.selected}
                // Don't pass isCorrect or correctIndex - hide results from student during quiz
                // Backend still tracks and emits to teacher via WebSocket
                showResult={false}
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
