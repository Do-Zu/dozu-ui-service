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
import { METHOD_LEARNING } from '../../generate/constants/resource';
import { truncate } from '@/utils';

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

        let tab = null;

        if (currentLearning.type === 'flashcard') {
            tab = METHOD_LEARNING.FLASHCARD;
        } else if (currentLearning.type === 'question') {
            tab = METHOD_LEARNING.QUIZ;
        }

        router.push(
            ROUTES.TOPIC_WORKSPACE({
                topicId,
                tab,
            }),
        );
    };

    if (loading) {
        return (
            <Card className="mx-auto mb-8 mt-2 min-h-[200px] w-full max-w-full border-0 bg-slate-500 shadow-xl dark:bg-gray-700 sm:max-w-[480px]">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-white/20 p-1 dark:bg-blue-400/20">
                                <Skeleton className="size-6 rounded-full" />{' '}
                            </div>

                            <div>
                                <CardTitle className="mb-4 text-lg font-bold text-slate-200 ">
                                    <Skeleton className="h-6 w-40" />
                                </CardTitle>
                                <Skeleton className="mb-2 h-4 w-3/4 p-1" />
                            </div>
                        </div>

                        <Skeleton className="mb-2 h-4 w-1/3 p-1 sm:w-1/6" />
                    </div>
                </CardHeader>
                <CardContent className="text-center text-slate-200 sm:text-start">
                    <Skeleton className="mb-4 h-6 w-1/2 p-1" />
                    <Skeleton className="mb-2 h-4 w-3/4 p-1" />
                    <Skeleton className="h-4 w-1/4  " />
                </CardContent>
            </Card>
        );
    }

    if (!loading && error) {
        return <></>;
    }

    return (
        <Card className="mx-auto mb-8 mt-2 w-full max-w-[80vw] rounded-3xl border-0 bg-gradient-to-r from-white/80 via-white/60 to-white/80 shadow-[0_12px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md dark:from-slate-800/70 dark:via-slate-900/40 dark:to-slate-800/70 dark:shadow-[0_8px_40px_-10px_rgba(0,0,0,0.6)] sm:max-w-[480px] ">
            <CardHeader className="pb-3">
                {data ? (
                    isMobile ? (
                        <div className="flex justify-end"></div>
                    ) : (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-white/20 p-1 dark:bg-blue-400/20">
                                    <Target className="size-4 text-white dark:text-sky-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200 ">
                                        {t('title')}
                                    </CardTitle>
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-white/20 p-1 dark:bg-blue-400/20">
                                <Target className="size-4 text-white dark:text-sky-500" />
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
                            <h3 className="mb-0.5 text-base font-semibold ">
                                {truncate(currentLearning?.topicName ?? '', 20)}
                            </h3>
                            <p className=" text-sm dark:text-gray-300">
                                {currentLearning?.description && truncate(currentLearning.description, 10)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-white dark:text-gray-200">
                                <span>{t('progress')}</span>
                                <span>{currentLearning?.progress}%</span>
                            </div>
                            <div className="h-1.5  w-full  rounded-full bg-gray-600/30 dark:bg-gray-600/30">
                                <div
                                    className=" h-1.5 rounded-full bg-blue-400 transition-all duration-300"
                                    style={{ width: `${currentLearning?.progress}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs  dark:text-gray-200">
                            <div className="flex items-center gap-1">
                                <AlignEndHorizontal className="size-3" />
                                <span>
                                    {currentLearning?.itemRemaining} {t('remaining')}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                <span>{currentLearning?.nextSession}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end">
                        {data && (
                            <Button
                                onClick={() => onContinueLearning('current')}
                                size="sm"
                                className="w-full rounded-2xl bg-gray-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-500  hover:text-yellow-50 dark:text-zinc-800 dark:hover:bg-gray-300 sm:w-auto sm:px-5"
                            >
                                <Play className="mr-1.5 size-3.5" />
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
