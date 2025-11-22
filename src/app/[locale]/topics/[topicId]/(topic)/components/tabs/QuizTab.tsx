'use client';

import { useEffect, useState } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import useFetch from '@/hooks/useFetch';

import LoadingPage from '@/app/loading';
import DataStatus from '@/components/errors/DataStatus';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

import { METHOD_LEARNING } from '@/utils/constants/method';

import QuizTypeSelector from '@/app/[locale]/quiz/components/QuizTypeSelector';
import CreateQuizModal from '@/app/[locale]/quiz/components/CreateQuizModal';
import QuizOnboarding from '@/app/[locale]/quiz/components/QuizOnboarding';

import { quizService } from '@/app/[locale]/quiz/services/quiz.service';
import { toast } from '@/hooks/use-toast';

// ------------------- CHART IMPORTS --------------------
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// IMPORTANT: register chart elements or it will not show
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface IQuizStatistics {
    totalQuizzes: number;
    averageScore: number;
    perfectScoreCount: number;
    averageQuestionsPerQuiz: number;
}

export default function QuizTab() {
    const { tab, topicId } = useTopicWorkspace();

    const [statistics, setStatistics] = useState<IQuizStatistics | null>(null);
    const [selectedType, setSelectedType] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [defaultName, setDefaultName] = useState('');
    const [defaultDescription, setDefaultDescription] = useState('');
    const [loadingOverlay, setLoadingOverlay] = useState(false);

    // ===================================================
    // Fetch STATISTICS (same as old QuizTypePage)
    // ===================================================
    const {
        data: statsData,
        loading: statsLoading,
        error: statsError,
    } = useFetch<IQuizStatistics>(() => quizService.getStatistics(String(topicId)), {
        shouldRun: tab === METHOD_LEARNING.QUIZ,
    });

    useEffect(() => {
        if (statsData) setStatistics(statsData);
    }, [statsData]);

    // ===================================================
    // Select Quiz Type → Generate Quiz
    // ===================================================
    const handleSelectQuizType = async (type: string) => {
        try {
            const { data } = await quizService.generateQuiz(String(topicId), type);

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
                            to understand quiz types.
                        </span>
                    ),
                });
                return;
            }

            const labelMap: Record<string, string> = {
                initial: 'Initial',
                review: 'Review',
                ef_low: 'EF Low',
                new: 'New',
                random: 'Random',
                wrong: 'Wrong',
            };

            const now = new Date();
            const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
                2,
            )}-${String(now.getDate()).padStart(2)} ${String(now.getHours()).padStart(
                2,
            )}:${String(now.getMinutes()).padStart(2)}`;

            setDefaultName(`${labelMap[type] || type} Quiz - ${ts}`);
            setDefaultDescription(`Auto-generated (${data.length} questions).`);
            setSelectedType(type);

            setIsCreateModalOpen(true);
        } catch (err) {
            console.error(err);
        }
    };

    // ===================================================
    // CREATE QUIZ
    // ===================================================
    const handleCreateQuiz = async ({
        name,
        description,
    }: {
        name: string;
        description?: string;
    }) => {
        try {
            setLoadingOverlay(true);
            const res = (await quizService.createQuiz({
                topicId,
                name,
                description,
                questionIds: [],
            })) as { data?: { quizId?: string } };

            const quizId = res.data?.quizId;

            if (!quizId) {
                toast({
                    title: 'Failed to create quiz',
                    description: 'No quiz id returned from server.',
                    variant: 'destructive',
                });
                return;
            }

            window.location.href = `/quiz/${topicId}/doing?quizId=${quizId}&type=${selectedType}`;
        } catch (err) {
            toast({
                title: 'Failed to create quiz',
                description: String(err),
                variant: 'destructive',
            });
        } finally {
            setLoadingOverlay(false);
        }
    };

    // ===================================================
    // CHART DATA
    // ===================================================
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
    };

    // ===================================================
    // RENDER
    // ===================================================

    if (statsLoading) return <LoadingPage />;
    if (statsError) return <DataStatus variant="error" title={statsError} />;

    return (
        <div className="relative px-8 py-6 w-full h-full">

            {/* overlay */}
            {loadingOverlay && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-50 text-white">
                    <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-white rounded-full mb-3"></div>
                    <span className="text-lg font-semibold">Creating your quiz...</span>
                </div>
            )}

            {/* HEADER */}
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Select Quiz Type</h2>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowOnboarding(true)}
                    >
                        Quiz Guide
                    </Button>
                    <Button
                        className="bg-primary text-white"
                        onClick={() =>
                            (window.location.href = `/quiz/${topicId}/history`)
                        }
                    >
                        View History
                    </Button>
                </div>
            </header>

            <Separator className="mb-6" />

            {/* SELECT TYPE */}
            <QuizTypeSelector onSelectQuizType={handleSelectQuizType} />

            {/* CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mt-8">
                <div className="bg-muted p-6 rounded-lg shadow-md border border-border">
                    <Bar data={chartData} options={options} />
                </div>
            </div>

            {/* MODAL */}
            <CreateQuizModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateQuiz}
                quizType={selectedType}
                defaultName={defaultName}
                defaultDescription={defaultDescription}
                setGlobalLoading={setLoadingOverlay}
            />

            <QuizOnboarding
                open={showOnboarding}
                onOpenChange={setShowOnboarding}
            />
        </div>
    );
}
