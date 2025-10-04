import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleUserRound, School } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

interface BaseProps {
    topicContent: React.ReactNode;
    mainActionButtons: React.ReactNode;
}

interface PersonalModeProps {
    mode: 'personal';
}

interface ClassBasedModeProps {
    mode: 'class-based';
    myClass: IClass;
    feedContent: React.ReactNode;
}

type Props = BaseProps & (PersonalModeProps | ClassBasedModeProps);

export default function TopicLibrary(props: Props) {
    const { mode, topicContent, mainActionButtons } = props;
    const t = useTranslations('home.contentLibrary');
    const tCommon = useTranslations('common');
    const tClass = useTranslations('class');

    return (
        <div className="relative w-full max-w-6xl mx-auto mb-16 px-6 md:px-8">
            <div className="pointer-events-none absolute -inset-x-10 -top-6 h-40 bg-gradient-to-r from-indigo-300/20 via-sky-300/20 to-cyan-300/20 dark:from-indigo-500/10 dark:via-sky-500/10 dark:to-cyan-500/10 blur-2xl" />
            <div className="relative rounded-2xl p-5 border border-slate-200/60 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/80 dark:from-slate-800/70 dark:via-slate-900/40 dark:to-slate-800/70 backdrop-blur-md shadow-[0_12px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="relative z-10 px-6 pt-6 md:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            {mode === 'class-based' ? (
                                <div className="flex flex-row gap-4 items-center text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-indigo-200 dark:via-sky-200 dark:to-cyan-200 bg-clip-text text-transparent">
                                    <School className="" />
                                    <h2 className="text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-indigo-200 dark:via-sky-200 dark:to-cyan-200 bg-clip-text text-transparent">
                                        {tClass('classWithName', { name: props.myClass.name })}
                                    </h2>
                                </div>
                            ) : null}
                            {mode === 'personal' ? (
                                <div className="flex flex-col gap-2 ">
                                    <div className="flex flex-row gap-4 items-center">
                                        <CircleUserRound />
                                        <h2 className="text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-indigo-200 dark:via-sky-200 dark:to-cyan-200 bg-clip-text text-transparent">
                                            {t('title')}
                                        </h2>
                                    </div>
                                    <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        Your topics and personal contents live here
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {mode == 'class-based' ? (
                            <>
                                <div className="text-muted-foreground">
                                    {props.myClass.description
                                        ? props.myClass.description
                                        : tCommon('labels.noDescription')}
                                </div>
                                <div className="text-sm">
                                    {tClass('invitationCode')}: {props.myClass.invitationCode}
                                </div>
                            </>
                        ) : null}

                        {mainActionButtons}
                    </div>
                </div>

                {mode === 'class-based' ? (
                    <Tabs defaultValue="feeds">
                        <TabsList>
                            <TabsTrigger value="feeds" className="flex items-center gap-2">
                                <span>Feeds</span>
                            </TabsTrigger>
                            <TabsTrigger value="topics" className="flex items-center gap-2">
                                <span>Topics</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="feeds">{props.feedContent}</TabsContent>

                        <TabsContent value="topics">{topicContent}</TabsContent>
                    </Tabs>
                ) : null}

                {mode === 'personal' ? topicContent : null}
            </div>
        </div>
    );
}
