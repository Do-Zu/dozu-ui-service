'use client';

import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, Play, AlignEndHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useFetch from '@/hooks/useFetch';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { ROUTES } from '@/utils/constants/routes';

interface CurrentLearning {
    topicName?: string;
    description: string | null;
    progress?: number;
    itemRemaining?: number;
    nextSession?: string;
    type?: string;
}

interface CurrentProcessLearningProps {}

interface ITopic {
    topicId: number;
    userId: number;
    name: string;
    description: string | null;
    createdAt: Date;
}
type ITopicBasic = Pick<ITopic, 'topicId' | 'name' | 'description'>;

interface ICurrentLearningProgressResponse {
    topic: ITopicBasic;
    progress: {
        totalItems: number;
        completedItems: number;
        remain: number;
        percentComplete: number;
        type: 'flashcard' | 'question';
    };
}

const CurrentProcessLearning: React.FC<CurrentProcessLearningProps> = ({}) => {
    const t = useTranslations('home.currentProcessLearning');
    const router = useRouter();
    const isMobile = useIsMobile();
    const { data, loading, error } = useFetch<ICurrentLearningProgressResponse>('/tracking/current-learning');

    const adapterDataCurrentLearning = (data: ICurrentLearningProgressResponse | null): CurrentLearning => {
        if (!data) {
            return {
                topicName: 'N/A',
                description: null,
                progress: 0,
                itemRemaining: 0,
                nextSession: 'N/A',
            };
        }

        const { topic, progress } = data as ICurrentLearningProgressResponse;

        return {
            topicName: topic?.name ?? 'N/A',
            description: topic?.description,
            progress: progress?.percentComplete,
            itemRemaining: progress?.remain,
            nextSession: 'N/A',
            type: progress?.type,
        };
    };

    const currentLearning = adapterDataCurrentLearning(data);

    const onContinueLearning = (type: 'current' | 'next') => {
        const topicId = data?.topic?.topicId;

        if (!topicId) {
            toast({
                description: t('error.noTopicFound'),
            });

            return;
        }

        if (currentLearning.type === 'flashcard') {
            router.push(ROUTES.FLASHCARDS_LEARNING(topicId));
        } else if (currentLearning.type === 'question') {
            router.push(ROUTES.QUIZ_START(topicId));
        }
    };

    if (loading) {
        return (
            <Card className="w-full max-w-full sm:max-w-[480px] min-h-[200px] mx-auto mt-2 mb-8 bg-slate-500 dark:bg-gray-700 border-0 shadow-xl">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-white/20 dark:bg-blue-400/20 rounded-lg">
                                <Skeleton className="h-6 w-6 rounded-full" />{' '}
                            </div>

                            <div>
                                <CardTitle className="text-slate-200 text-lg font-bold mb-4 ">
                                    <Skeleton className="h-6 w-40" />
                                </CardTitle>
                                <Skeleton className="h-4 w-3/4 mb-2 p-1" />
                            </div>
                        </div>

                        <Skeleton className="h-4 w-1/3 sm:w-1/6 mb-2 p-1" />
                    </div>
                </CardHeader>
                <CardContent className="text-center text-slate-200 sm:text-start">
                    <Skeleton className="h-6 w-1/2 mb-4 p-1" />
                    <Skeleton className="h-4 w-3/4 mb-2 p-1" />
                    <Skeleton className="h-4 w-1/4  " />
                </CardContent>
            </Card>
        );
    }

    if (!loading && error) {
        return <></>;
    }

    return (
        <Card className="w-full max-w-[80vw] sm:max-w-[480px] mx-auto mt-2 mb-8 rounded-3xl bg-gradient-to-r from-white/80 via-white/60 to-white/80 dark:from-slate-800/70 dark:via-slate-900/40 dark:to-slate-800/70 backdrop-blur-md shadow-[0_12px_50px_-12px_rgba(0,0,0,0.5)] dark:shadow-[0_8px_40px_-10px_rgba(0,0,0,0.6)] border-0 ">
            <CardHeader className="pb-3">
                {data ? (
                    isMobile ? (
                        <div className="flex justify-end"></div>
                    ) : (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-white/20 dark:bg-blue-400/20 rounded-lg">
                                    <Target className="h-4 w-4 text-white dark:text-sky-500" />
                                </div>
                                <div>
                                    <CardTitle className="dark:text-slate-200 text-slate-800 text-lg font-bold ">
                                        {t('title')}
                                    </CardTitle>
                                </div>
                            </div>
                            <Badge className="text-sm max-w-28">{currentLearning?.type || 'N/A'}</Badge>
                        </div>
                    )
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-white/20 dark:bg-blue-400/20 rounded-lg">
                                <Target className="h-4 w-4 text-white dark:text-sky-500" />
                            </div>
                            <CardTitle className="text-lg font-bold ">{t('error.message')}</CardTitle>
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:items-center">
                    <div className="space-y-2">
                        <div>
                            <h3 className="text-base font-semibold mb-0.5 ">{currentLearning?.topicName}</h3>
                            <p className=" dark:text-gray-300 text-sm">{currentLearning?.description}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-white dark:text-gray-200">
                                <span>{t('progress')}</span>
                                <span>{currentLearning?.progress}%</span>
                            </div>
                            <div className="w-full  dark:bg-gray-600/30  bg-gray-600/30 rounded-full h-1.5">
                                <div
                                    className=" bg-blue-400 rounded-full h-1.5 transition-all duration-300"
                                    style={{ width: `${currentLearning?.progress}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs  dark:text-gray-200">
                            <div className="flex items-center gap-1">
                                <AlignEndHorizontal className="h-3 w-3" />
                                <span>
                                    {currentLearning?.itemRemaining} {t('remaining')}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{currentLearning?.nextSession}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end">
                        {data && (
                            <Button
                                onClick={() => onContinueLearning('current')}
                                size="sm"
                                className="w-full sm:w-auto text-slate-700 dark:text-zinc-800 hover:bg-slate-500 hover:text-yellow-50 bg-gray-200  dark:hover:bg-gray-300 font-semibold px-4 py-2 sm:px-5"
                            >
                                <Play className="mr-1.5 h-3.5 w-3.5" />
                                {t('continueButton')}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CurrentProcessLearning;
