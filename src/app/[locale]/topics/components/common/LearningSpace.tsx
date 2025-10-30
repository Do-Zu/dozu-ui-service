import { ClassDashboardTab, classDashboardTabs } from '@/app/[locale]/class-based/[id]/utils/class.constant';
import classUtils from '@/app/[locale]/class-based/[id]/utils/class.utils';
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
    defaultTab?: ClassDashboardTab;
    feedContent: React.ReactNode; // Made optional
    classworkContent?: React.ReactNode;
}

type Props = BaseProps & (PersonalModeProps | ClassBasedModeProps);

export default function LearningSpace(props: Props) {
    const { mode, topicContent, mainActionButtons } = props;
    const t = useTranslations('home.contentLibrary');
    const tCommon = useTranslations('common');
    const tClass = useTranslations('class');

    return (
        <div className="relative w-full max-w-6xl mx-auto mb-16 px-4 md:px-8">
            <div className="pointer-events-none absolute -inset-x-10 -top-6 h-40 bg-gradient-to-r from-indigo-300/20 via-sky-300/20 to-cyan-300/20 dark:from-indigo-500/10 dark:via-sky-500/10 dark:to-cyan-500/10 blur-2xl" />
            <div className="relative rounded-2xl p-5 border border-slate-200/60 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/80 dark:from-slate-800/70 dark:via-slate-900/40 dark:to-slate-800/70 backdrop-blur-md shadow-[0_12px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="relative z-10 px-6 pt-6 md:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col gap-1 md:flex-grow">
                            {mode === 'class-based' && props.myClass ? (
                                <>
                                    <div className="flex flex-row gap-3 items-center text-xl md:text-2xl font-semibold tracking-tight">
                                        <School
                                            className="text-slate-700 dark:text-indigo-300 flex-shrink-0"
                                            size={28}
                                        />
                                        <h2 className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-indigo-200 dark:via-sky-200 dark:to-cyan-200 bg-clip-text text-transparent">
                                            {tClass('classWithName', { name: props.myClass.name })}
                                        </h2>
                                    </div>
                                    <div className="pl-10 mt-1 text-sm text-muted-foreground">
                                        <p>
                                            {props.myClass.description
                                                ? props.myClass.description
                                                : tCommon('labels.noDescription')}
                                        </p>
                                        <p className="mt-1">
                                            <span className="font-medium">{tClass('invitationCode')}:</span>{' '}
                                            {props.myClass.invitationCode}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-row gap-3 items-center text-xl md:text-2xl font-semibold tracking-tight">
                                        <CircleUserRound
                                            className="text-slate-700 dark:text-sky-200 flex-shrink-0"
                                            size={28}
                                        />
                                        <h2 className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-indigo-200 dark:via-sky-200 dark:to-cyan-200 bg-clip-text text-transparent">
                                            {t('title')}
                                        </h2>
                                    </div>
                                    <div className="pl-10 mt-1 text-sm text-slate-600 dark:text-slate-400">
                                        Your topics and personal contents live here
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex-shrink-0">{mainActionButtons}</div>
                    </div>
                </div>

                <div className="relative z-10">
                    {mode === 'class-based' ? (
                        <div className="pt-6">
                            <Tabs defaultValue={props.defaultTab || ClassDashboardTab.FEEDS} className="w-full">
                                <TabsList className="w-full mx-6 md:mx-8 bg-transparent p-0 border-b border-slate-200 dark:border-white/10">
                                    {classDashboardTabs.map((tab) => (
                                        <TabsTrigger
                                            key={tab}
                                            value={tab}
                                            style={{ width: `${75 / classDashboardTabs.length}%` }}
                                            className="data-[state=active]:bg-background/80 data-[state=active]:shadow-sm 
                                                data-[state=active]:border-b-2 data-[state=active]:border-primary 
                                                rounded-b-none text-base font-medium px-4 py-2 transition-all 
                                                -mb-px"
                                        >
                                            {classUtils.getTabLabel(tab)}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                <TabsContent value="feeds" className="px-6 md:px-8 py-4">
                                    {props.feedContent}
                                </TabsContent>
                                <TabsContent value="topics" className="px-6 md:px-8 py-4">
                                    {topicContent}
                                </TabsContent>
                                <TabsContent value="classwork" className="px-6 md:px-8 py-4">
                                    {props.classworkContent ?? ''}
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : (
                        <div>{topicContent}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
