'use client';

import { useEffect, useState } from 'react';
import { quizService } from '../../services/quiz.service';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import QuizQuestion from '../../components/QuizQuestion';

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
    console.log({quizData});
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

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
                })),
            });
            const { quizResultId } = response.data as { quizResultId: string };
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
            <h2 className="text-2xl font-semibold mb-4">Làm bài quiz</h2>
            <div className="space-y-4">
                {quizData.map((question: Question, index: number) => (
                    <QuizQuestion
                        key={index}
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
                Nộp bài
            </Button>
        </div>
    );
};

export default QuizDoingPage;
