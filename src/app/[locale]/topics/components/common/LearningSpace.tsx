import { ClassDashboardTab, classDashboardTabs } from '@/app/[locale]/class-based/[id]/utils/class.constant';
import classUtils from '@/app/[locale]/class-based/[id]/utils/class.utils';
import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleUserRound, Library, School } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

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
    feedContent: React.ReactNode; 
    classworkContent?: React.ReactNode;
}

type Props = BaseProps & (PersonalModeProps | ClassBasedModeProps);

export default function LearningSpace(props: Props) {
    const { mode, topicContent, mainActionButtons } = props;
    const t = useTranslations('home.contentLibrary');
    const tCommon = useTranslations('common');
    const tClass = useTranslations('class');
    const [activeTab, setActiveTab] = useState<ClassDashboardTab>(
        mode === 'class-based' ? (props.defaultTab || ClassDashboardTab.FEEDS) : ClassDashboardTab.FEEDS
    );

    return (
        <div className="relative w-full max-w-7xl mx-auto mb-16 px-4 md:px-8">
            <div className="pointer-events-none absolute -inset-x-10 -top-6 h-40 bg-gradient-to-r from-indigo-300/20 via-sky-300/20 to-cyan-300/20 dark:from-indigo-500/10 dark:via-sky-500/10 dark:to-cyan-500/10 blur-2xl" />
            <div className="relative rounded-2xl p-5 border border-slate-200/60 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/80 dark:from-slate-800/70 dark:via-slate-900/40 dark:to-slate-800/70 backdrop-blur-md shadow-[0_12px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="relative z-10 px-6 pt-6 md:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex flex-col gap-3 md:flex-grow">
                            {mode === 'class-based' && props.myClass ? (
                                <>
                                    <div className="flex flex-row gap-3 items-center">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <School
                                                className="text-foreground flex-shrink-0"
                                                size={24}
                                            />
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                                            {props.myClass.name}
                                        </h2>
                                    </div>
                                    {props.myClass.description && (
                                        <p className="text-base text-muted-foreground">
                                            {props.myClass.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-muted-foreground">{tClass('invitationCode')}:</span>
                                        <div className="px-2.5 py-1 rounded-full bg-muted border border-border font-mono text-xs font-semibold text-foreground">
                                            {props.myClass.invitationCode}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-row gap-3 items-center text-xl md:text-2xl font-semibold tracking-tight">
                                        <Library
                                            className="text-slate-700 dark:text-sky-200 flex-shrink-0"
                                            size={28}
                                        />
                                        <h2 className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-indigo-200 dark:via-sky-200 dark:to-cyan-200 bg-clip-text text-transparent">
                                            {t('title')}
                                        </h2>
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
                            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ClassDashboardTab)} className="w-full">
                                <div className="flex justify-center">
                                    <TabsList className="inline-flex h-10 items-center justify-center rounded-md text-muted-foreground bg-transparent p-0 border-b border-slate-200 dark:border-white/10 relative">
                                        {classDashboardTabs.map((tab) => (
                                            <TabsTrigger
                                                key={tab}
                                                value={tab}
                                                className="relative overflow-hidden rounded-b-none text-base font-medium px-8 py-2 transition-all 
                                                    -mb-px min-w-[300px] data-[state=active]:bg-background/80 data-[state=active]:shadow-sm
                                                    data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
                                            >
                                                {classUtils.getTabLabel(tab)}
                                                <span 
                                                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-blue-500 dark:bg-blue-400 
                                                        transition-all duration-300 ease-out origin-center ${
                                                            activeTab === tab ? 'w-full' : 'w-0'
                                                        }`}
                                                />
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

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
