'use client';

import { useEffect, useState } from 'react';
import { quizService } from '../../services/quiz.service';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import QuizQuestion from '../../components/QuizQuestion';
import { useQuizStreakTracking } from '@/hooks/useStreakProgress';

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
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { trackQuizCompletion } = useQuizStreakTracking();

    const quizId = searchParams.get('quizId');
    const type = searchParams.get('type');
    const { topicId } = params;

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!quizId || !type) {
                console.error('quizId or type is missing');
                return;
            }
            try {
                const response = await quizService.generateQuiz(topicId, type);
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

    const handleSubmitQuiz = async () => {
        try {
            const response = await quizService.submitQuiz({
                quizId: Number(quizId),
                results: quizData.map((q: Question) => ({
                    questionId: q.questionId,
                    correct: q.selectedAnswer === q.correctIndex,
                    userAnswerIndex: typeof q.selectedAnswer === 'number' ? q.selectedAnswer : null
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
                        const correctAnswers = quizData.filter(q => q.selectedAnswer === q.correctIndex).length;
                        const accuracy = quizData.length > 0 ? (correctAnswers / quizData.length) * 100 : 0;
                        
                        // Calculate actual quiz duration in seconds
                        const currentTime = Date.now();
                        const duration = quizStartTime ? Math.round((currentTime - quizStartTime) / 1000) : 300; // fallback to 5 minutes if start time is undefined
                        
                        await trackQuizCompletion(
                            userId.toString(),
                            topicId,
                            accuracy, // score (accuracy percentage)
                            duration // actual time taken in seconds
                        );
                        console.log('Quiz completion tracked for streak progress');
                    }
                }
            } catch (error) {
                console.error('Error tracking quiz completion:', error);
                // Don't show error to user, just log it
            }
            
            router.push(`/quiz/${topicId}/result/${quizResultId}`);
        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    if (!quizData || quizData.length === 0) {
        return <div>No questions available for this quiz.</div>;
    }

    return (
        <div className="px-6 py-8">
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
            <Button onClick={handleSubmitQuiz} className="mt-4">
                Submit
            </Button>
        </div>
    );
};

export default QuizDoingPage;
