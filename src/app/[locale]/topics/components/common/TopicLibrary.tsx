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
        <div className='relative w-full max-w-6xl mx-auto mb-16 px-6 md:px-8"'>
            <div className="pointer-events-none absolute -inset-x-10 -top-6 h-40 bg-gradient-to-r from-indigo-300/20 via-sky-300/20 to-cyan-300/20 dark:from-indigo-500/10 dark:via-sky-500/10 dark:to-cyan-500/10 blur-2xl" />
            <div className="relative rounded-2xl border border-slate-200/60 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/80 dark:from-slate-800/70 dark:via-slate-900/40 dark:to-slate-800/70 backdrop-blur-md shadow-[0_12px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.04] mix-blend-normal dark:mix-blend-soft-light bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_60%)]" />
                <div className="relative z-10 px-6 pt-6 md:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            {mode === 'class-based' ? (
                                <div className="flex flex-row gap-4 items-center">
                                    <School />
                                    <h2 className="text-2xl font-semibold">
                                        {tClass('classWithName', { name: props.myClass.name })}
                                    </h2>
                                </div>
                            ) : null}
                            {mode === 'personal' ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-row gap-4 items-center">
                                        <CircleUserRound />
                                        <h2 className="text-2xl font-semibold">{t('title')}</h2>
                                    </div>
                                    <div>Your topics and personal contents live here</div>
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
