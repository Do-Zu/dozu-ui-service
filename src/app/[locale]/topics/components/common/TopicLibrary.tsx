import ClassFeedList from '@/app/[locale]/class-based/components/ui/classFeed/ClassFeedList';
import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import LoadingPage from '@/app/loading';
import { ShowIf } from '@/components/ui/ShowIf';
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
        <div className="w-full max-w-[85%] mx-auto mb-12 p-6 rounded-lg bg-gray-100 shadow-md dark:bg-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
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
                </div>

                {mainActionButtons}
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
    );
}
