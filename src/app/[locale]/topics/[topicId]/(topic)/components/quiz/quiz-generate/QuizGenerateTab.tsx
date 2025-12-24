'use client';

import { useEffect, useState } from 'react';
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
import QuizDoingPanel from '../quiz-generate/quiz-doing/QuizDoingPanel';
import Generate from '../../generate/Generate';
import type { IGeneratedQuizItem, IQuestion } from '@/app/[locale]/question/types/question.type';
import RecommendationCard from '../quiz-generate/RecommendationCard';
import { useQuizRecommendation } from '../quiz-generate/hooks/useQuizRecommendation';
import { stat } from 'fs';

const DEFAULT_CHECK_TYPE = 'initial';
type QuizType = 'initial' | 'new' | 'learning' | 'review' | 'wrong' | 'weak';
const QUIZ_TYPES: QuizType[] = ['initial', 'new', 'learning', 'review', 'wrong', 'weak'];
interface ApiResponse<T> {
    code: number;
    status: string;
    message: string;
    data: T;
}

export default function QuizGenerateTab() {
    const { tab, topicId, topic } = useTopicWorkspace();
    const [typeCounts, setTypeCounts] = useState<Partial<Record<QuizType, number>>>({});
    const [disabledMap, setDisabledMap] = useState<Partial<Record<QuizType, boolean>>>({});
    const [checkingTypes, setCheckingTypes] = useState(false);
    const { data: recommendation } = useQuizRecommendation(topicId);

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

        doingMode,
        setDoingMode,
        setDoingQuestions,

        setQuizMode,

        setGeneratedQuestionsForEdit,
    } = useQuizWorkspace();
    console.log({ statistics });
    // null = Haven't finished checking yet, true = have question, false = haven't question
    const { hasAnyQuestions, setHasAnyQuestions } = useQuizWorkspace();

    const checkQuizTypeAvailability = async () => {
        if (!topicId) return;

        setCheckingTypes(true);

        try {
            const results = await Promise.all(
                QUIZ_TYPES.map(async (t) => {
                    try {
                        const res = await quizService.generateQuiz(String(topicId), t);
                        const data = res?.data;
                        const count = Array.isArray(data) ? data.length : 0;
                        return { t, count };
                    } catch {
                        return { t, count: 0 };
                    }
                }),
            );

            const nextCounts: Partial<Record<QuizType, number>> = {};
            const nextDisabled: Partial<Record<QuizType, boolean>> = {};

            for (const r of results) {
                nextCounts[r.t] = r.count;
                nextDisabled[r.t] = r.count === 0;
            }

            setTypeCounts(nextCounts);
            setDisabledMap(nextDisabled);
        } finally {
            setCheckingTypes(false);
        }
    };

    // fetch statistic
    const {
        data: statsData,
        loading: statsLoading,
        error: statsError,
    } = useFetch<ApiResponse<IQuizStatistics>>(() => quizService.getStatistics(String(topicId)), {
        shouldRun: tab === METHOD_LEARNING.QUIZ,
    });

    useEffect(() => {
        if (statsData?.data) setStatistics(statsData.data);
    }, [statsData, setStatistics]);

    useEffect(() => {
        if (tab !== METHOD_LEARNING.QUIZ) return;
        if (!topicId) return;

        const checkQuestions = async () => {
            try {
                const { data } = await quizService.generateQuiz(String(topicId), DEFAULT_CHECK_TYPE);

                if (!Array.isArray(data) || data.length === 0) {
                    setHasAnyQuestions(false);
                } else {
                    setHasAnyQuestions(true);
                }
            } catch (err) {
                console.error(err);
                setHasAnyQuestions(false);
            }
        };

        void checkQuestions();
        void checkQuizTypeAvailability();
    }, [tab, topicId, hasAnyQuestions]);

    // select quiz type
    const handleSelectQuizType = async (type: string) => {
        try {
            const { data } = await quizService.generateQuiz(String(topicId), type as QuizType);

            if (!Array.isArray(data) || data.length === 0) {
                toast({
                    title: 'Cannot create quiz',
                    description: (
                        <span className="text-sm">
                            No questions available.{'  '}
                            <span
                                onClick={() => setShowOnboarding(true)}
                                className="underline cursor-pointer font-medium"
                            >
                                View quiz guide
                            </span>
                            .
                        </span>
                    ),
                });
                return;
            }

            const labelMap: Record<string, string> = {
                initial: 'Initial',
                new: 'New',
                learning: 'Learning',
                review: 'Review',
                wrong: 'Wrong',
                weak: 'Weak',
            };

            const now = new Date();
            const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
                now.getDate(),
            ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
                2,
                '0',
            )}`;

            setDefaultName(`${labelMap[type] || type} Quiz - ${ts}`);
            setDefaultDescription(`Auto-generated (${data.length} questions).`);
            setSelectedType(type as QuizType);
            setIsCreateModalOpen(true);
        } catch (err) {
            console.error(err);
        }
    };

    // create quiz + start doing mode
    const handleCreateQuiz = async ({
        name,
        description,
        initialConfig,
    }: {
        name: string;
        description?: string;
        initialConfig?: { limit?: number; shuffle?: boolean };
    }) => {
        try {
            setLoadingOverlay(true);

            //create quiz record
            const res = await quizService.createQuiz({
                topicId,
                name,
                description,
                questionIds: [],
            });

            const quizId = (res?.data as { quizId?: string })?.quizId;
            if (!quizId) throw new Error('Quiz creation failed');

            //generate questions again for doing mode
            if (!selectedType) throw new Error('Quiz type is not selected');
            const gen = await quizService.generateQuiz(
                String(topicId),
                selectedType as QuizType,
                selectedType === 'initial' ? initialConfig : undefined,
            );

            if (!gen?.data || !Array.isArray(gen.data)) {
                throw new Error('Failed to load quiz questions.');
            }

            // add quizId to each question (needed for submission)
            const formatted = gen.data.map((q: any) => ({
                ...q,
                quizId,
                selectedAnswer: null,
            }));

            setDoingQuestions(formatted);
            setDoingMode(true);
            setIsCreateModalOpen(false);

            toast({
                title: 'Quiz Started',
                description: 'Good luck!',
            });
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

    //show doing mode
    if (doingMode) {
        return <QuizDoingPanel />;
    }

    // loading
    if (statsLoading || hasAnyQuestions === null) return <LoadingPage />;
    if (statsError) return <DataStatus variant="error" title={statsError} />;

    const showOnlyGenerator = hasAnyQuestions === false;

    // helper: map from AI → IQuestion[]
    const mapGeneratedToQuestions = (generated: IGeneratedQuizItem[]): IQuestion[] => {
        return generated.map((item, index) => {
            const options: string[] = Array.isArray(item.o) ? [...item.o] : [];

            const normalizedOptions = options.slice(0, 4);
            while (normalizedOptions.length < 4) {
                normalizedOptions.push('');
            }

            return {
                id: index,
                questionText: item.q ?? '',
                choices: normalizedOptions,
                correctIndex:
                    typeof item.idx === 'number' && item.idx >= 0 && item.idx < normalizedOptions.length ? item.idx : 0,
                questionType: item.type,
                hint: item.hint,
                explain: item.explain,
            } as IQuestion;
        });
    };

    return (
        <div className="relative w-full h-full">
            {loadingOverlay && (
                <div className="absolute inset-0 bg-black/40 z-50 flex flex-col items-center justify-center text-white">
                    <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-white rounded-full mb-3" />
                    <span className="text-lg font-semibold">Creating your quiz...</span>
                </div>
            )}

            <header className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{topic?.name ? `Quiz for "${topic.name}"` : 'Quiz'}</h2>

                <Button variant="outline" onClick={() => setShowOnboarding(true)}>
                    Quiz Guide
                </Button>
            </header>

            <Separator className="mb-4" />

            {showOnlyGenerator ? (
                <div className="mt-4 rounded-xl border bg-muted p-4">
                    <div className="flex flex-col gap-1 mb-3">
                        <h3 className="text-base font-semibold">No questions in this topic yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Use AI to generate a set of quiz questions from this topic&apos;s content, then review them
                            in the editor and save to database.
                        </p>
                    </div>

                    <Generate<IGeneratedQuizItem[]>
                        type="quiz"
                        onSuccess={(generated) => {
                            if (!Array.isArray(generated) || generated.length === 0) {
                                toast({
                                    description: 'No questions generated from AI.',
                                    variant: 'destructive',
                                });
                                return;
                            }

                            const mapped = mapGeneratedToQuestions(generated);

                            setGeneratedQuestionsForEdit(mapped);
                            setQuizMode('edit');
                            setHasAnyQuestions(true);
                        }}
                    />
                </div>
            ) : (
                <>
                    {recommendation && (
                        <RecommendationCard
                            recommendation={recommendation}
                            onStart={(type) => handleSelectQuizType(type)}
                        />
                    )}

                    <QuizTypeSelector
                        onSelectQuizType={handleSelectQuizType}
                        disabledMap={disabledMap}
                        counts={typeCounts}
                        loading={checkingTypes}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8 mt-6">
                        <QuizStatisticsChart statistics={statistics} />
                    </div>
                </>
            )}

            <QuizCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateQuiz}
                quizType={selectedType}
                maxQuestions={selectedType === 'initial' ? typeCounts.initial : undefined}
                defaultName={defaultName}
                defaultDescription={defaultDescription}
                setGlobalLoading={setLoadingOverlay}
            />

            <QuizOnboarding open={showOnboarding} onOpenChange={setShowOnboarding} />
        </div>
    );
}
