'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import QuizTypeSelector from '../../components/QuizTypeSelector';
import CreateQuizModal from '../../components/CreateQuizModal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { quizService } from '../../services/quiz.service';
import { toast } from '@/hooks/use-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const QuizTypePage = () => {
    const router = useRouter();
    const params = useParams();
    const topicId = params?.topicId as string;

    const [selectedType, setSelectedType] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

const handleSelectQuizType = async (type: string) => {
    try {
        const { data } = await quizService.generateQuiz(topicId, type);

        if (!Array.isArray(data) || data.length === 0) {
            toast({
                title: 'Cannot create quiz',
                description: 'There are no suitable questions to create a quiz.',
                variant: 'destructive',
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
        labels: ['Quiz Done', 'Average Score', 'Average Time', 'Quiz Success'],
        datasets: [
            {
                label: 'Statistics Quiz',
                data: [20, 85, 3.33, 9],
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
        <div className="px-8 py-12">
            <div className="mb-8">
                <header className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Select Type Quiz</h2>
                    <Button
                        onClick={() => router.push(`/quiz/${topicId}/history`)}
                        className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md"
                    >
                        View History Quiz
                    </Button>
                </header>

                <Separator className="mb-6" />

                <QuizTypeSelector onSelectQuizType={handleSelectQuizType} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                    <Bar data={chartData} options={options} />
                </div>
            </div>

            <CreateQuizModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateQuiz}
                quizType={selectedType}
            />
        </div>
    );
};

export default QuizTypePage;
