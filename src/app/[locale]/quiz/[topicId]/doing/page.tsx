'use client';

import { useEffect, useState } from 'react';
import { quizService } from '../../services/quiz.service';
import { Button } from '@/components/ui/button';
import ConfirmSubmitDialog from '@/app/[locale]/quiz/components/ConfirmSubmitDialog';
import { useRouter, useSearchParams } from 'next/navigation';
import QuizQuestion from '../../components/QuizQuestion';
import { useQuizStreakTracking } from '@/hooks/useStreakProgress';
import { toast } from '@/hooks/use-toast';
import type { QuizType } from '@/app/[locale]/topics/[topicId]/(topic)/hooks/useQuizWorkspace';

// Define types based on the response structure
interface Question {
    questionId: number;
    topicId: number;
    questionText: string;
    choices: string[];
    correctIndex: number;
    createdAt: string;
    selectedAnswer?: number | null;
}

interface QuestionResult {
    quizId: number;
    questionId: number;
    userId: number;
    correct: boolean;
    answeredAt: string;
}

interface QuizData {
    question_result: QuestionResult;
    questions: Question;
}

const QuizDoingPage = ({ params }: { params: { topicId: string } }) => {
    const [quizData, setQuizData] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { trackQuizCompletion } = useQuizStreakTracking();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingSubmit, setPendingSubmit] = useState(false);

    const quizId = searchParams.get('quizId');
    const type = searchParams.get('type');
    const { topicId } = params;
    const rawType = searchParams.get('type');

    const quizType = (
  ['initial', 'new', 'learning', 'review', 'wrong', 'weak'] as QuizType[]
).includes(rawType as QuizType)
  ? (rawType as QuizType)
  : null;

    // Derived values
    const answeredCount = quizData.filter((q) => q.selectedAnswer !== null && q.selectedAnswer !== undefined).length;
    const totalQuestions = quizData.length;

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!quizId || !quizType) {
                console.error('quizId or type is missing');
                return;
            }
            try {
                const response = await quizService.generateQuiz(topicId, quizType);
                const data = response.data;

                let formattedData: Question[] = [];

                // Ensure data is an array before mapping
                const quizArray = Array.isArray(data) ? data : [];

                // Handle different types of quizzes
                switch (type) {
                    case 'review':
                    case 'ef-low': {
                        formattedData = quizArray.map((item: any) => ({
                            questionId: item.questions.questionId,
                            topicId: item.questions.topicId,
                            questionText: item.questions.questionText,
                            choices: item.questions.choices,
                            correctIndex: item.questions.correctIndex,
                            createdAt: item.questions.createdAt,
                            selectedAnswer: null,
                        }));
                        break;
                    }
                    case 'wrong':
                    case 'initial':
                    case 'new':
                    case 'random': {
                        formattedData = quizArray.map((item: any) => ({
                            questionId: item.questionId,
                            topicId: item.topicId,
                            questionText: item.questionText,
                            choices: item.choices,
                            correctIndex: item.correctIndex,
                            createdAt: item.createdAt,
                            selectedAnswer: null,
                        }));
                        break;
                    }
                    default: {
                        console.error('Unknown quiz type');
                        break;
                    }
                }

                setQuizData(formattedData);
                // Initialize quiz start time when quiz data is loaded
                setQuizStartTime(Date.now());
            } catch (error) {
                console.error('Error fetching quiz:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [topicId, quizId, type]);

    // Submit the quiz
    const submitQuiz = async () => {
        try {
            setSubmitting(true);
            const response = await quizService.submitQuiz({
                quizId: Number(quizId),
                results: quizData.map((q: Question) => ({
                    questionId: q.questionId,
                    correct: q.selectedAnswer === q.correctIndex,
                    userAnswerIndex: typeof q.selectedAnswer === 'number' ? q.selectedAnswer : null,
                })),

            });

            const { quizResultId } = response.data as { quizResultId: string };

            // Track quiz completion for streak progress
            try {
                // Get userId from localStorage
                const userString = localStorage.getItem('user');
                if (userString) {
                    const user = JSON.parse(userString);
                    const userId = user?.userId;

                    if (userId) {
                        // Calculate accuracy based on correct answers
                        const correctAnswers = quizData.filter((q) => q.selectedAnswer === q.correctIndex).length;
                        const accuracy = quizData.length > 0 ? (correctAnswers / quizData.length) * 100 : 0;

                        // Calculate actual quiz duration in seconds
                        const currentTime = Date.now();
                        const duration = quizStartTime ? Math.round((currentTime - quizStartTime) / 1000) : 300; // fallback to 5 minutes if start time is undefined

                        await trackQuizCompletion(
                            userId.toString(),
                            topicId,
                            accuracy, // score (accuracy percentage)
                            duration, // actual time taken in seconds
                        );
                        console.log('Quiz completion tracked for streak progress');
                    }
                }
            } catch (error) {
                console.error('Error tracking quiz completion:', error);
            }

            router.push(`/quiz/${topicId}/result/${quizResultId}`);
        } catch (err) {
            toast({
                title: 'Submission failed',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Validate before submit
    const handleSubmitQuiz = () => {
        if (answeredCount === 0) {
            toast({
                title: 'No answers selected',
                description: 'Please answer at least one question before submitting.',
                variant: 'destructive',
            });
            return;
        }
        if (answeredCount < totalQuestions) {
            setShowConfirmDialog(true);
            return;
        }
        submitQuiz();
    };

    if (loading) return <div>Loading...</div>;

    if (!quizData || quizData.length === 0) {
        return <div>No questions available for this quiz.</div>;
    }

    return (
        <div className="px-6 py-8">
            {submitting && (
                <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center text-white">
                    <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-white rounded-full mb-3"></div>
                    <span className="text-lg font-medium">Submitting your quiz...</span>
                </div>
            )}

            <h2 className="text-2xl font-semibold mb-4">Take the quiz</h2>
            <div className="space-y-4">
                {quizData.map((question: Question, index: number) => (
                    <QuizQuestion
                        key={index}
                        questionNumber={index + 1}
                        questionText={question.questionText}
                        choices={question.choices}
                        onAnswerSelect={(selectedIndex: number) => {
                            const updatedQuestions = [...quizData];
                            updatedQuestions[index].selectedAnswer = selectedIndex;
                            setQuizData(updatedQuestions);
                        }}
                    />
                ))}
            </div>

            <Button variant="destructive" onClick={handleSubmitQuiz} className="mt-4" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
            </Button>

            <ConfirmSubmitDialog
                open={showConfirmDialog}
                answeredCount={answeredCount}
                totalQuestions={totalQuestions}
                loading={submitting}
                onCancel={() => setShowConfirmDialog(false)}
                onConfirm={async () => {
                    setShowConfirmDialog(false);
                    await submitQuiz();
                }}
            />
        </div>
    );
};

export default QuizDoingPage;
