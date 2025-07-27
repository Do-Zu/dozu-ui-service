'use client';

import React from 'react';
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
            <Card className="max-w-[60%] min-w-[40%] h-[200px] mx-auto mt-2 mb-8 bg-slate-500 dark:bg-gray-700 border-0 shadow-xl">
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

                        <Skeleton className="h-4 w-1/6 mb-2 p-1" />
                    </div>
                </CardHeader>
                <CardContent className="text-center text-slate-200">
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
        <Card className="max-w-[80%] min-w-[40%] mx-auto mt-2 mb-8  bg-slate-500  dark:bg-gray-700 border-0 shadow-xl">
            <CardHeader className="pb-3">
                {data ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-white/20 dark:bg-blue-400/20 rounded-lg">
                                <Target className="h-4 w-4 text-white dark:text-sky-500" />
                            </div>
                            <div>
                                <CardTitle className="text-slate-200 text-lg font-bold ">{t('title')}</CardTitle>
                                <p className="text-slate-400 dark:text-gray-300 text-sm">{t('subtitle')}</p>
                            </div>
                        </div>
                        <Badge className=" text-sm">{currentLearning?.type || 'N/A'}</Badge>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-white/20 dark:bg-blue-400/20 rounded-lg">
                                <Target className="h-4 w-4 text-white dark:text-sky-500" />
                            </div>
                            <CardTitle className="text-slate-200 text-lg font-bold ">{t('error.message')}</CardTitle>
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <div>
                            <h3 className="text-base text-slate-200 font-semibold mb-0.5 ">
                                {currentLearning?.topicName}
                            </h3>
                            <p className="text-slate-200 dark:text-gray-300 text-sm">{currentLearning?.description}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-white dark:text-gray-200">
                                <span>{t('progress')}</span>
                                <span>{currentLearning?.progress}%</span>
                            </div>
                            <div className="w-full bg-white/20 dark:bg-gray-600/30 rounded-full h-1.5">
                                <div
                                    className="bg-white dark:bg-blue-400 rounded-full h-1.5 transition-all duration-300"
                                    style={{ width: `${currentLearning?.progress}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white dark:text-gray-200">
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
                    <div className="flex items-center justify-center lg:justify-end">
                        {data && (
                            <Button
                                onClick={() => onContinueLearning('current')}
                                size="default"
                                className=" text-slate-700 dark:text-zinc-800 hover:bg-slate-100 bg-gray-200  dark:hover:bg-gray-300 font-semibold px-6 py-2"
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
