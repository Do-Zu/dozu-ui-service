'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import classQuizStudentService from '@/app/[locale]/class-based/(class-quiz)/services/classQuizStudent.service';
import LoadingPage from '@/app/loading';
import { IAttemptDetail } from '@/app/[locale]/class-based/(class-quiz)/types/classQuiz.type';
import QuizQuestion from '@/app/[locale]/quiz/components/QuizQuestion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/utils/constants/routes';

export default function SubmitPage() {
    const { id: classId, classQuizId } = useParams<{ id: string; classQuizId: string }>();
    const search = useSearchParams();
    const router = useRouter();
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
    if (loading) return <LoadingPage />;

    const items = detail?.classQuizVersion.snapshot.items || [];
    const answers = detail?.answers || [];
    const correctCount = answers.filter((a) => a.correct).length;
    const totalQuestions = items.length;
    const score = totalQuestions > 0 ? Math.round((100 * correctCount) / totalQuestions) : 0;

    // Map questions with answers for display
    const questionsWithAnswers = items.map((item: any, idx: number) => {
        const answer = answers.find((a) => a.snapshotQuestionIdx === idx + 1);
        return {
            text: item?.text || '',
            choices: item?.choices || [],
            selected: answer?.userAnswerIndex ?? null,
            isCorrect: answer?.correct ?? null,
            correctIndex: typeof item?.correctIndex === 'number' ? item.correctIndex : undefined,
        };
    });

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Quiz Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6 mb-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Score</p>
                            <p className="text-3xl font-bold">{score}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Correct Answers</p>
                            <p className="text-2xl font-semibold flex items-center gap-2">
                                <span
                                    className={
                                        correctCount === totalQuestions
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-foreground'
                                    }
                                >
                                    {correctCount}/{totalQuestions}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Attempt ID</p>
                            <p className="text-sm font-mono">{attemptId}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(ROUTES.CLASS_BASED_ID(Number(classId)))}>
                            Back to Topic Workspace
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Show questions with results */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Question Review</h2>
                {questionsWithAnswers.map((q, idx) => (
                    <QuizQuestion
                        key={`q-${idx}`}
                        questionNumber={idx + 1}
                        questionText={q.text}
                        choices={q.choices}
                        selectedAnswer={q.selected}
                        isCorrect={q.isCorrect}
                        correctIndex={q.correctIndex}
                        showResult={true}
                        onAnswerSelect={() => {}} // Disabled on results page
                    />
                ))}
            </div>
        </div>
    );
}
