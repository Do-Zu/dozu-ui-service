'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import LoadingPage from '@/app/loading';
import classQuizStudentService from '@/app/[locale]/class-based/(class-quiz)/services/classQuizStudent.service';
import {
    IPlayableMeta,
    IStartAttemptResp,
    ISaveAnswerBody,
    ISaveAnswerResp,
    ISubmitAttemptResp,
    IAttemptDetail,
} from '@/app/[locale]/class-based/(class-quiz)/types/classQuiz.type';
import { Button } from '@/components/ui/button';
import QuizQuestion from '@/app/[locale]/quiz/components/QuizQuestion';
import { toast } from '@/hooks/use-toast';
import { useUserSession } from '@/app/[locale]/auth/hooks/useUserSession';
import { useQuizActivityWebSocket } from '@/hooks/useQuizActivityWebSocket';

type UIQuestion = {
    text: string;
    choices: string[];
    selected?: number | null;
    isCorrect?: boolean | null;
    correctIndex?: number;
};

export default function StudentStartClassQuizPage() {
    const { classQuizId, id } = useParams<{ id: string; classQuizId: string }>();
    const quizId = Number(classQuizId);

    const [meta, setMeta] = useState<IPlayableMeta | null>(null);
    const [attempt, setAttempt] = useState<IStartAttemptResp | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const classId = Number(id);
    const { locale } = useParams<{ locale: string }>();

    const [questions, setQuestions] = useState<UIQuestion[]>([]);
    const { user } = useUserSession();
    const authUserId = Number(user?.userId);

    // countdown state
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const hasShownOneMinuteWarning = useRef(false);
    const hasShownTimeUpPopup = useRef(false);

    const { emitAttemptStarted, emitAnswerSaved, emitAttemptSubmitted, emitActivity } = useQuizActivityWebSocket({
        enabled: !!quizId && !!authUserId,
        classQuizId: quizId,
        attemptId: attempt?.attemptId,
    });

    // Focus / Blur tracking
    const focusTimeRef = useRef<number>(Date.now());
    useEffect(() => {
        const handleFocus = () => {
            focusTimeRef.current = Date.now();
            if (attempt?.attemptId) emitActivity('focus', { timestamp: new Date().toISOString() });
        };

        const handleBlur = () => {
            const timeSpent = Date.now() - focusTimeRef.current;
            if (attempt?.attemptId) emitActivity('blur', { timestamp: new Date().toISOString(), timeSpent });
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, [attempt?.attemptId]);

    // load playable meta
    useEffect(() => {
        classQuizStudentService
            .getPlayableMeta(quizId)
            .then(setMeta)
            .finally(() => setLoading(false));
    }, [quizId]);

    // onStart
    async function onStart() {
        try {
            const a = await classQuizStudentService.startAttempt(quizId);
            setAttempt(a);
            emitAttemptStarted(a.attemptId);

            const detail: IAttemptDetail = await classQuizStudentService.attemptDetail(quizId, a.attemptId);
            const items = detail.classQuizVersion.snapshot.items;
            const answersMap = new Map(detail.answers.map((a) => [a.snapshotQuestionIdx, a]));

            const ui: UIQuestion[] = items.map((it: any, index: number) => {
                const saved = answersMap.get(index + 1);
                return {
                    text: it.text || '',
                    choices: it.choices || [],
                    selected: saved?.userAnswerIndex ?? null,
                    isCorrect: saved?.correct ?? null,
                    correctIndex: it.correctIndex,
                };
            });

            setQuestions(ui);

            // setup countdown
            const end = a.attemptEndAt ? new Date(a.attemptEndAt).getTime() : Date.now();
            const now = Date.now();
            const diff = end - now;
            setTimeLeft(diff > 0 ? diff : 0);

            focusTimeRef.current = Date.now();
            emitActivity('focus', { timestamp: new Date().toISOString() });
        } catch (e: any) {
            toast({ title: 'Cannot start quiz', description: e?.message, variant: 'destructive' });
        }
    }

    // save answer
    async function onSelectAnswer(qIdx: number, choiceIdx: number) {
        if (!attempt || !authUserId) return;

        try {
            const body: ISaveAnswerBody = {
                userId: authUserId,
                snapshotQuestionIdx: qIdx + 1,
                userAnswerIndex: choiceIdx,
            };

            setQuestions((prev) => prev.map((q, i) => (i === qIdx ? { ...q, selected: choiceIdx } : q)));

            const resp = await classQuizStudentService.saveAnswer(quizId, attempt.attemptId, body);
            const isCorrect = resp.saved.correct ?? null;

            setQuestions((prev) => prev.map((q, i) => (i === qIdx ? { ...q, selected: choiceIdx, isCorrect } : q)));

            emitActivity('question-change', {
                questionIndex: qIdx + 1,
                timestamp: new Date().toISOString(),
            });
        } catch (e: any) {
            toast({ title: 'Save answer failed', description: e?.message, variant: 'destructive' });
        }
    }

    // submit
    async function onSubmit(auto = false) {
        if (!attempt || !authUserId || submitting) return;

        setSubmitting(true);
        try {
            const res = await classQuizStudentService.submitAttempt(quizId, attempt.attemptId);
            emitAttemptSubmitted(res.score);

            router.push(
                `/${locale}${ROUTES.STUDENT.CLASS_BASED_ID_CLASS_QUIZ_SUBMIT(classId, quizId, attempt.attemptId)}`,
            );
        } catch (e: any) {
            toast({ title: 'Submit failed', description: e?.message, variant: 'destructive' });
        }
    }

    // countdown effect — auto submit + warnings
    useEffect(() => {
        if (timeLeft === null || !attempt) return;

        //  AUTO SUBMIT when < 1.5 s
        if (timeLeft <= 1500) {
            if (!hasShownTimeUpPopup.current) {
                hasShownTimeUpPopup.current = true;

                toast({
                    title: "Time's up!",
                    description: 'Auto-submitting your quiz...',
                    variant: 'destructive',
                });

                // trigger submit chỉ 1 lần
                setTimeout(() => {
                    onSubmit(true);
                }, 300); // slight delay để popup hiển thị
            }

            return; // skip rest
        }

        // < 1 phút → cảnh báo
        if (timeLeft < 60000 && !hasShownOneMinuteWarning.current) {
            hasShownOneMinuteWarning.current = true;
            toast({
                title: 'Under 1 minute left!',
                description: 'Please review your work and prepare to submit.',
                variant: 'destructive',
            });
        }

        const t = setInterval(() => {
            setTimeLeft((prev) => (prev ? prev - 1000 : 0));
        }, 1000);

        return () => clearInterval(t);
    }, [timeLeft]);

    function formatMs(ms: number) {
        const sec = Math.floor(ms / 1000);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    if (loading) return <LoadingPage />;
    if (!meta) return <div>Quiz is not playable</div>;

    return (
        <div className="container mx-auto py-8 max-w-3xl text-foreground">
            <h1 className="text-2xl font-bold mb-4">Quiz</h1>

            {!attempt ? (
                <div className="p-6 rounded-lg border border-border bg-muted text-center space-y-4">
                    <h2 className="text-xl font-semibold">Ready to start?</h2>

                    <p className="text-muted-foreground">
                        You have <span className="text-primary font-semibold">{meta.remainingAttempts}</span> attempt(s)
                        remaining.
                    </p>

                    <Button
                        size="lg"
                        className="px-6 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={onStart}
                    >
                        🚀 Start Attempt
                    </Button>
                </div>
            ) : (
                <>
                    {/* countdown */}
                    <div className="my-4 flex justify-between items-center text-sm text-muted-foreground">
                        <div>
                            Ends at:{' '}
                            <span className="text-destructive font-medium">
                                {new Date(attempt.attemptEndAt ?? Date.now()).toLocaleString()}
                            </span>
                        </div>

                        {timeLeft !== null && (
                            <div className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold">
                                ⏳ {formatMs(timeLeft)}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {questions.map((q, idx) => (
                            <QuizQuestion
                                key={`q-${idx}`}
                                questionNumber={idx + 1}
                                questionText={q.text}
                                choices={q.choices}
                                selectedAnswer={q.selected}
                                showResult={false}
                                onAnswerSelect={(selectedIndex: number) => onSelectAnswer(idx, selectedIndex)}
                            />
                        ))}
                    </div>

                    <div className="mt-6">
                        <Button
                            onClick={() => onSubmit(false)}
                            disabled={submitting || !questions.length}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
