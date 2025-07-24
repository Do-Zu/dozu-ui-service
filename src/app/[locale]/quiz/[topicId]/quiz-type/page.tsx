'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import QuizTypeSelector from '../../components/QuizTypeSelector';
import CreateQuizModal from '../../components/CreateQuizModal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { quizService } from '../../services/quiz.service';
import { toast } from '@/hooks/use-toast';
import QuizOnboarding from '../../components/QuizOnboarding';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IQuizStatistics {
    totalQuizzes: number;
    averageScore: number;
    perfectScoreCount: number;
    averageQuestionsPerQuiz: number;
}

const QuizTypePage = () => {
    const router = useRouter();
    const params = useParams();
    const topicId = params?.topicId as string;

    const [selectedType, setSelectedType] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [statistics, setStatistics] = useState<IQuizStatistics | null>(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const res = await quizService.getStatistics(topicId);
                setStatistics(res.data as IQuizStatistics);
            } catch (err) {
                console.error('Failed to fetch quiz statistics:', err);
            }
        };

        fetchStatistics();
    }, [topicId]);
    const handleSelectQuizType = async (type: string) => {
        try {
            const { data } = await quizService.generateQuiz(topicId, type);

            if (!Array.isArray(data) || data.length === 0) {
                toast({
                    title: 'Cannot create quiz',
                    description: (
                        <span className="text-sm">
                            There are no suitable questions to create a quiz. Please{' '}
                            <span
                                onClick={() => setShowOnboarding(true)}
                                className="underline cursor-pointer font-medium"
                            >
                                check the guide
                            </span>{' '}
                            to learn how each quiz type works.
                        </span>
                    ),
                    className: 'bg-blue-100 text-blue-800 px-4 py-3',
                });
                return;
            }

            setSelectedType(type);
            setIsModalOpen(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateQuiz = async ({ name, description }: { name: string; description?: string }) => {
        try {
            const res = await quizService.createQuiz({
                topicId: Number(topicId),
                name,
                description,
                questionIds: [],
            });

            const data = res.data as { quizId: string };
            const quizId = data.quizId;
            router.push(`/quiz/${topicId}/doing?quizId=${quizId}&type=${selectedType}`);
        } catch (err) {
            toast({
                title: 'Failed to create quiz',
                description: `${err}`,
                variant: 'destructive',
            });
        }
    };

    const chartData = {
        labels: ['Total Quizzes', 'Average Score (%)', 'Perfect Scores', 'Avg Questions/Quiz'],
        datasets: [
            {
                label: 'Quiz Statistics',
                data: statistics
                    ? [
                          statistics.totalQuizzes,
                          statistics.averageScore,
                          statistics.perfectScoreCount,
                          statistics.averageQuestionsPerQuiz,
                      ]
                    : [0, 0, 0, 0],
                backgroundColor: '#4B89A3',
                borderColor: '#1E3A8A',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Quiz Statistics Chart',
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem: any) => `${tooltipItem.label}: ${tooltipItem.raw}`,
                },
            },
        },
    };

    return (
        <div className="px-8 py-12 bg-background text-foreground">
            <div className="mb-8">
                <header className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-primary">Select Type Quiz</h2>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowOnboarding(true)}
                            className="font-medium hover:bg-muted"
                        >
                            Quiz Guide
                        </Button>
                        <Button
                            onClick={() => router.push(`/quiz/${topicId}/history`)}
                            className="bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-md"
                        >
                            View History Quiz
                        </Button>
                    </div>
                </header>

                <Separator className="mb-6 bg-border" />

                <QuizTypeSelector onSelectQuizType={handleSelectQuizType} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8 mb-8">
                <div className="bg-muted p-6 rounded-lg shadow-md border border-border">
                    <Bar data={chartData} options={options} />
                </div>
            </div>

            <CreateQuizModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateQuiz}
                quizType={selectedType}
            />

            <QuizOnboarding open={showOnboarding} onOpenChange={setShowOnboarding} />
        </div>
    );
};

export default QuizTypePage;
