'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { METHOD_LEARNING } from '@/utils/constants/method';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import DataStatus from '@/components/errors/DataStatus';
import { quizService } from '@/app/[locale]/quiz/services/quiz.service';
import { toast } from '@/hooks/use-toast';

import QuizTypeSelector from './QuizTypeSelector';
import QuizCreateModal from './QuizCreateModal';
import QuizOnboarding from './QuizOnboarding';
import QuizStatisticsChart from './QuizStatisticsChart';

import { useQuizWorkspace } from '../context/QuizWorkspaceContext';
import { IQuizStatistics } from '../../../hooks/useQuizWorkspace';

export default function QuizGenerateTab() {
    const { tab, topicId, topic } = useTopicWorkspace();
    const {
        statistics,
        setStatistics,
        selectedType,
        setSelectedType,
        loadingOverlay,
        setLoadingOverlay,
        isCreateModalOpen,
        setIsCreateModalOpen,
        defaultName,
        setDefaultName,
        defaultDescription,
        setDefaultDescription,
        showOnboarding,
        setShowOnboarding,
    } = useQuizWorkspace();

    // fetch statistics
    const {
        data: statsData,
        loading: statsLoading,
        error: statsError,
    } = useFetch<IQuizStatistics>(() => quizService.getStatistics(String(topicId)), {
        shouldRun: tab === METHOD_LEARNING.QUIZ,
    });

    useEffect(() => {
        if (statsData) setStatistics(statsData);
    }, [statsData, setStatistics]);

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
            const ts =
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
                    now.getDate(),
                ).padStart(2, '0')} ` +
                `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            setDefaultName(`${labelMap[type] || type} Quiz - ${ts}`);
            setDefaultDescription(
                `Auto-generated (${data.length} questions). You can rename or edit this description before starting.`,
            );
            setSelectedType(type);
            setIsCreateModalOpen(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateQuiz = async ({ name, description }: { name: string; description?: string }) => {
        try {
            setLoadingOverlay(true);
            const res = await quizService.createQuiz({
                topicId,
                name,
                description,
                questionIds: [],
            });

            const quizId = (res?.data as any)?.quizId;
            if (!quizId) throw new Error('Quiz creation failed');

            window.location.href = `/quiz/${topicId}/doing?quizId=${quizId}&type=${selectedType}`;
        } catch (err) {
            toast({
                title: 'Failed to create quiz',
                description: `${err}`,
                variant: 'destructive',
            });
        } finally {
            setLoadingOverlay(false);
        }
    };

    if (statsLoading) return <LoadingPage />;
    if (statsError) return <DataStatus variant="error" title={statsError} />;

    return (
        <div className="relative w-full h-full">
            {loadingOverlay && (
                <div className="absolute inset-0 bg-black/40 z-50 flex flex-col items-center justify-center text-white">
                    <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-white rounded-full mb-3" />
                    <span className="text-lg font-semibold">Creating your quiz...</span>
                </div>
            )}

            <header className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                    {topic?.name ? `Quiz for "${topic.name}"` : 'Quiz'}
                </h2>
                <Button variant="outline" onClick={() => setShowOnboarding(true)}>
                    Quiz Guide
                </Button>
            </header>

            <Separator className="mb-4" />

            <QuizTypeSelector onSelectQuizType={handleSelectQuizType} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8 mt-6">
                <QuizStatisticsChart statistics={statistics} />
            </div>

            <QuizCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateQuiz}
                quizType={selectedType}
                defaultName={defaultName}
                defaultDescription={defaultDescription}
                setGlobalLoading={setLoadingOverlay}
            />

            <QuizOnboarding open={showOnboarding} onOpenChange={setShowOnboarding} />
        </div>
    );
}
