'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import LoadingPage from '@/app/loading';
import classQuizStudentService from '@/app/[locale]/class-based/(class-quiz)/services/classQuizStudent.service';
import {
    IPlayableMeta,
    IStartAttemptResp,
    ISaveAnswerBody,
    IAttemptDetail,
} from '@/app/[locale]/class-based/(class-quiz)/types/classQuiz.type';
import { Button } from '@/components/ui/button';
import QuizQuestion from '@/app/[locale]/quiz/components/QuizQuestion';
import { toast } from '@/hooks/use-toast';
import { useUserSession } from '@/app/[locale]/auth/hooks/useUserSession';
import { useQuizActivityWebSocket } from '@/hooks/useQuizActivityWebSocket';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type UIQuestion = {
    text: string;
    choices: string[];
    selected?: number | null;
    flagged?: boolean;
};

function safeParseJson<T>(raw: string | null, fallback: T): T {
    try {
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export default function StudentStartClassQuizPage() {
    const { classQuizId, id } = useParams<{ id: string; classQuizId: string }>();
    const quizId = Number(classQuizId);
    const classId = Number(id);

    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const { user } = useUserSession();
    const authUserId = Number(user?.userId);
    const hasAuthUserId = Number.isFinite(authUserId);

    const [meta, setMeta] = useState<IPlayableMeta | null>(null);
    const [attempt, setAttempt] = useState<IStartAttemptResp | null>(null);
    const [questions, setQuestions] = useState<UIQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [bootingAttempt, setBootingAttempt] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // confirm submit dialog
    const [confirmOpen, setConfirmOpen] = useState(false);

    // countdown
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const hasShownOneMinuteWarning = useRef(false);
    const hasShownTimeUpPopup = useRef(false);

    const { emitAttemptStarted, emitAttemptSubmitted, emitActivity } = useQuizActivityWebSocket({
        enabled: !!quizId && !!authUserId,
        classQuizId: quizId,
        attemptId: attempt?.attemptId,
    });

    // ===== Persist flags (localStorage) =====
    const flagStorageKey = useMemo(() => {
        // attemptId phải có thì mới key theo attempt; chưa có thì tạm "na"
        const aId = attempt?.attemptId ?? 'na';
        return `dozu:class-quiz:flags:${authUserId}:${quizId}:${aId}`;
    }, [authUserId, quizId, attempt?.attemptId]);

    const readFlags = (key: string) => {
        if (typeof window === 'undefined') return new Set<number>();
        const arr = safeParseJson<number[]>(window.localStorage.getItem(key), []);
        return new Set(arr.filter((n) => Number.isFinite(n)));
    };

    const writeFlags = (key: string, set: Set<number>) => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(key, JSON.stringify(Array.from(set.values())));
    };

    const clearFlags = (key: string) => {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(key);
    };

    // Focus Tracking
    const focusTimeRef = useRef(Date.now());
    useEffect(() => {
        const onFocus = () => {
            focusTimeRef.current = Date.now();
            if (attempt?.attemptId) emitActivity('focus', { timestamp: new Date().toISOString() });
        };

        const onBlur = () => {
            const spent = Date.now() - focusTimeRef.current;
            if (attempt?.attemptId) {
                emitActivity('blur', { timestamp: new Date().toISOString(), timeSpent: spent });
            }
        };

        window.addEventListener('focus', onFocus);
        window.addEventListener('blur', onBlur);

        return () => {
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('blur', onBlur);
        };
    }, [attempt?.attemptId, emitActivity]);

    // Load playable meta
    useEffect(() => {
        classQuizStudentService
            .getPlayableMeta(quizId)
            .then(setMeta)
            .finally(() => setLoading(false));
    }, [quizId]);

    // Clamp currentIndex
    useEffect(() => {
        if (questions.length === 0) return;
        if (currentIndex > questions.length - 1) setCurrentIndex(questions.length - 1);
    }, [questions.length, currentIndex]);

    // Start attempt
    async function onStart() {
        try {
            if (!hasAuthUserId) {
                toast({ title: 'Cannot start quiz', description: 'Missing user session', variant: 'destructive' });
                return;
            }
            setBootingAttempt(true);

            const a = await classQuizStudentService.startAttempt(quizId);
            setAttempt(a);
            emitAttemptStarted(a.attemptId);

            const detail: IAttemptDetail = await classQuizStudentService.attemptDetail(quizId, a.attemptId);

            const items = detail.classQuizVersion.snapshot.items;
            const answersMap = new Map(detail.answers.map((x) => [x.snapshotQuestionIdx, x]));

            // restore flags theo attemptId (quan trọng)
            const key = `dozu:class-quiz:flags:${authUserId}:${quizId}:${a.attemptId}`;
            const flaggedSet = readFlags(key);

            const ui: UIQuestion[] = items.map((it: any, idx: number) => {
                const saved = answersMap.get(idx + 1);
                return {
                    text: it?.text ?? '',
                    choices: Array.isArray(it?.choices) ? it.choices : [],
                    selected: saved?.userAnswerIndex ?? null,
                    flagged: flaggedSet.has(idx),
                };
            });

            setQuestions(ui);
            setCurrentIndex(0);

            const endTs = a.attemptEndAt ? new Date(a.attemptEndAt).getTime() : Date.now();
            const diff = endTs - Date.now();
            setTimeLeft(diff > 0 ? diff : 0);

            focusTimeRef.current = Date.now();
            emitActivity('focus', { timestamp: new Date().toISOString() });
        } catch (e: any) {
            toast({ title: 'Cannot start quiz', description: e?.message, variant: 'destructive' });
        } finally {
            setBootingAttempt(false);
        }
    }

    // Save answer
    async function onSelectAnswer(qIdx: number, choiceIdx: number) {
        if (!attempt) return;

        // optimistic UI
        setQuestions((prev) => prev.map((q, i) => (i === qIdx ? { ...q, selected: choiceIdx } : q)));

        try {
            const body: ISaveAnswerBody = {
                userId: authUserId,
                snapshotQuestionIdx: qIdx + 1,
                userAnswerIndex: choiceIdx,
            };

            await classQuizStudentService.saveAnswer(quizId, attempt.attemptId, body);

            emitActivity('question-change', {
                questionIndex: qIdx + 1,
                timestamp: new Date().toISOString(),
            });
        } catch (e: any) {
            toast({ title: 'Save answer failed', description: e?.message, variant: 'destructive' });
        }
    }

    // Toggle Flag ⭐ (persist)
    function toggleFlag(idx: number) {
        setQuestions((prev) => {
            const next = prev.map((q, i) => (i === idx ? { ...q, flagged: !q.flagged } : q));

            // persist ngay lập tức (không cần chuyển câu mới hiện)
            const set = new Set<number>();
            next.forEach((q, i) => {
                if (q.flagged) set.add(i);
            });

            // chỉ persist khi có attemptId thật
            if (attempt?.attemptId) {
                const key = `dozu:class-quiz:flags:${authUserId}:${quizId}:${attempt.attemptId}`;
                writeFlags(key, set);
            }

            return next;
        });
    }

    // Submit (core)
    async function submitCore() {
        if (!attempt || submitting) return;

        setSubmitting(true);
        try {
            const res = await classQuizStudentService.submitAttempt(quizId, attempt.attemptId);

            // clear flags after submit success
            const key = `dozu:class-quiz:flags:${authUserId}:${quizId}:${attempt.attemptId}`;
            clearFlags(key);

            emitAttemptSubmitted(res.score);

            router.push(
                `/${locale}${ROUTES.STUDENT.CLASS_BASED_ID_CLASS_QUIZ_SUBMIT(classId, quizId, attempt.attemptId)}`,
            );
        } catch (e: any) {
            toast({ title: 'Submit failed', description: e?.message, variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    }

    // Manual submit => confirm dialog
    function onClickSubmit() {
        if (!attempt || submitting) return;
        setConfirmOpen(true);
    }

    // Auto submit => no dialog
    async function onSubmitAuto() {
        await submitCore();
    }

    // Countdown timer
    useEffect(() => {
        if (timeLeft === null || !attempt) return;

        if (timeLeft <= 1500) {
            if (!hasShownTimeUpPopup.current) {
                hasShownTimeUpPopup.current = true;

                toast({
                    title: "Time's up!",
                    description: 'Auto submitting...',
                    variant: 'destructive',
                });

                const t = window.setTimeout(() => onSubmitAuto(), 300);
                return () => window.clearTimeout(t);
            }
            return;
        }

        if (timeLeft < 60000 && !hasShownOneMinuteWarning.current) {
            hasShownOneMinuteWarning.current = true;
            toast({
                title: 'Under 1 minute left!',
                description: 'Please review your answers.',
                variant: 'destructive',
            });
        }

        const t = setInterval(() => setTimeLeft((prev) => (prev ? prev - 1000 : 0)), 1000);
        return () => clearInterval(t);
    }, [timeLeft, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

    function formatMs(ms: number) {
        const sec = Math.floor(ms / 1000);
        return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
    }

    if (loading) return <LoadingPage />;
    if (!meta) return <div>Quiz is not playable</div>;
    if (attempt && bootingAttempt) return <LoadingPage />;

    const current = questions[currentIndex];

    return (
        <div className="container mx-auto py-8 max-w-6xl text-foreground">
            <h1 className="text-2xl font-bold mb-4">Quiz</h1>

            {!attempt ? (
                <div className="p-6 rounded-lg border border-border bg-muted text-center space-y-4">
                    <h2 className="text-xl font-semibold">Ready to start?</h2>
                    <p className="text-muted-foreground">
                        You have <span className="text-primary font-semibold">{meta.remainingAttempts}</span>{' '}
                        attempt(s).
                    </p>

                    <Button size="lg" onClick={onStart} disabled={bootingAttempt || !hasAuthUserId}>
                        {bootingAttempt ? 'Starting...' : '🚀 Start Attempt'}
                    </Button>
                </div>
            ) : (
                <>
                    {/* TOP BAR */}
                    <div className="my-4 flex justify-between items-center text-sm text-muted-foreground">
                        <div>
                            Ends at:{' '}
                            <span className="text-destructive font-medium">
                                {new Date(attempt.attemptEndAt ?? Date.now()).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-6 mt-4">
                        {/* LEFT SIDEBAR */}
                        <div className="w-1/4 border-r pr-4 space-y-4">
                            {/* Timer + Submit (LEFT) */}
                            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-muted-foreground">Time left</div>
                                    <div className="text-xs text-muted-foreground">
                                        {currentIndex + 1}/{questions.length}
                                    </div>
                                </div>

                                <div className="text-3xl font-bold tabular-nums">
                                    {timeLeft !== null ? formatMs(timeLeft) : '--:--'}
                                </div>

                                <Button className="w-full" disabled={submitting} onClick={onClickSubmit}>
                                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                                </Button>
                            </div>

                            {/* Questions grid (scroll + fade ONLY bottom) */}
                            <div>
                                <h2 className="text-lg font-semibold mb-3">Questions</h2>

                                {/* container relative để overlay fade bottom */}
                                <div className="relative">
                                    <div className="max-h-[330px] overflow-y-auto pr-2">
                                        <div className="grid grid-cols-4 gap-3">
                                            {questions.map((q, idx) => {
                                                const active = idx === currentIndex;
                                                const answered = q.selected != null;
                                                const flagged = !!q.flagged;

                                                // base
                                                let bg = 'bg-background text-foreground';
                                                let border = 'border-border';

                                                // answered => blue nhẹ
                                                if (answered) bg = 'bg-blue-100 text-slate-900';

                                                // flagged => vàng
                                                if (flagged) bg = 'bg-yellow-300 text-black border-yellow-500';

                                                // active => border đậm
                                                if (active) border = 'border-black border-2';

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setCurrentIndex(idx)}
                                                        className={`
                              w-12 h-12 rounded-xl border
                              ${border} ${bg}
                              text-[15px] font-medium
                              transition hover:opacity-90
                            `}
                                                        title={
                                                            flagged ? 'Flagged' : answered ? 'Answered' : 'Not answered'
                                                        }
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Fade bottom ONLY (không fade top) */}
                                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-background" />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANEL (QUESTION ONLY) + SCROLL */}
                        <div className="w-3/4">
                            <div className="rounded-xl border border-border bg-background">
                                {/* Header: Flag ở bên question */}
                                <div className="flex items-center justify-end p-3 border-b border-border">
                                    <button
                                        onClick={() => toggleFlag(currentIndex)}
                                        className={`h-10 w-10 rounded-lg border transition flex items-center justify-center text-lg
                      ${
                          current?.flagged
                              ? 'bg-yellow-300 border-yellow-500 text-black'
                              : 'bg-background border-border text-muted-foreground hover:bg-muted'
                      }`}
                                        aria-label="Toggle flag"
                                        title="Toggle flag"
                                    >
                                        ⭐
                                    </button>
                                </div>

                                {/* Question scroll area */}
                                <div className="h-[calc(100vh-220px)] overflow-y-auto p-4">
                                    {current ? (
                                        <QuizQuestion
                                            key={currentIndex}
                                            questionNumber={currentIndex + 1}
                                            questionText={current.text}
                                            choices={current.choices}
                                            selectedAnswer={current.selected}
                                            showResult={false}
                                            onAnswerSelect={(choice) => onSelectAnswer(currentIndex, choice)}
                                        />
                                    ) : (
                                        <div className="text-muted-foreground">Loading question...</div>
                                    )}
                                </div>

                                {/* sticky nav */}
                                <div className="flex justify-between p-4 border-t border-border bg-background sticky bottom-0">
                                    <Button
                                        variant="outline"
                                        disabled={currentIndex === 0}
                                        onClick={() => setCurrentIndex((i) => i - 1)}
                                    >
                                        Previous
                                    </Button>

                                    <Button
                                        variant="outline"
                                        disabled={currentIndex === questions.length - 1}
                                        onClick={() => setCurrentIndex((i) => i + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONFIRM SUBMIT DIALOG (manual only) */}
                    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <AlertDialogContent className="relative">
                            {submitting && (
                                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-md flex items-center justify-center z-50">
                                    <div className="text-sm font-medium">Submitting your answers…</div>
                                </div>
                            )}

                            <AlertDialogHeader>
                                <AlertDialogTitle>Submit quiz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to submit now? You won&apos;t be able to change your answers
                                    after submitting.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    disabled={submitting}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        submitCore();
                                    }}
                                >
                                    Yes, submit
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </div>
    );
}
