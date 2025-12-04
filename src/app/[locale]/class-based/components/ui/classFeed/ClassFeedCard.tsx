import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { IClassFeed } from '../../../types/classFeed.type';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, TimeUnit } from '@/utils';
import Link from 'next/link';
import { DATETIME_DMY_12H_FORMAT } from '@/utils/date/constant';
import { Button } from '@/components/ui/button';
import { Edit, MessageCircle, MoreVertical, SquarePen, Trash2, ArrowUpRight } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { IUpdatingFeed } from '@/app/[locale]/teacher/feeds/components/modals/UpdateFeedModal';
import { ISubtractedDate } from '@/utils/feeds/feed.helper';
import CommentThread from '../../comment/CommentThread';
import { useMemo } from 'react';
import { EnumNodeComment } from '../../../types/class.type';

interface TeacherProps {
    role: 'teacher';
    onUpdateOpen: (feed: IUpdatingFeed) => void;
    onDeleteOpen: (classFeedId: number) => void;
}

interface StudentProps {
    role: 'student';
}

type Props = {
    feed: IClassFeed;
    group: ISubtractedDate;
} & (TeacherProps | StudentProps);

export default function ClassFeedCard(props: Props) {
    const tCommon = useTranslations('common');
    const tClassFeed = useTranslations('class.classFeed');
    const { feed, role } = props;
    const { classFeedId, title, content, createdAt, updatedAt, sender, link, classId } = feed;
    const { group } = props;

    function getDisplayDate(createdAt: string): string {
        if (group.unit === TimeUnit.MINUTE && group.unitAgo) {
            return group.unitAgo + ' ' + tClassFeed('minutesAgo');
        }
        if (group.unit === TimeUnit.DAY && group.unitAgo) {
            return group.unitAgo + ' ' + tClassFeed('hoursAgo');
        }
        return formatDate(createdAt, DATETIME_DMY_12H_FORMAT);
    }

    const triggerComponent = useMemo(
        () => (
            <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                    e.stopPropagation();
                }}
                className="h-7 px-2 text-xs rounded-full transition-all duration-300 transform hover:scale-105 text-gray-600 dark:text-gray-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/20"
            >
                <MessageCircle className="w-3 h-3 mr-1" />
                comments
            </Button>
        ),
        [],
    );

    return (
        <Card>
            <CardHeader>
                {sender ? (
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={sender.avatarUrl} alt={sender?.fullName} />
                            <AvatarFallback>{sender.fullName}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{sender.fullName}</span>
                            <span className="text-xs text-muted-foreground">{getDisplayDate(createdAt)}</span>
                        </div>
                    </div>
                ) : null}
            </CardHeader>
            <CardContent className={!sender ? '-mt-6' : ''}>
                <div className="space-y-3">
                    <div className="flex justify-between items-center gap-4">
                        <h3 className="text-lg font-bold text-foreground">{title}</h3>

                        {role === 'teacher' ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:pointer-events-auto">
                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" side="top">
                                    <DropdownMenuItem
                                        onSelect={() => {
                                            props.onUpdateOpen({
                                                classFeedId: classFeedId,
                                                title,
                                                content,
                                                link,
                                            });
                                        }}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>{tCommon('actions.edit')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => props.onDeleteOpen(classFeedId)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>{tCommon('actions.delete')}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-2">
                        {content ? (
                            <p className="text-sm text-secondary-foreground">{content}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground">No content yet</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                            {link ? (
                                <Button asChild size="sm" variant="outline" className="h-7 px-3 rounded-full gap-1">
                                    <Link
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="View content"
                                    >
                                        View Content
                                        <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                                    </Link>
                                </Button>
                            ) : null}
                            {classId && (
                                <CommentThread
                                    triggerComponent={triggerComponent}
                                    nodeId={classFeedId.toString()}
                                    nodeTitle={title}
                                    classId={classId}
                                    topicId={null}
                                    typeNode={EnumNodeComment.FEED}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
            {!sender ? (
                <CardFooter>
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-muted-foreground">{getDisplayDate(createdAt)}</span>
                        {updatedAt ? (
                            <span className="text-xs text-muted-foreground">
                                {tClassFeed('lastEditedAt')} '{formatDate(updatedAt, DATETIME_DMY_12H_FORMAT)}'
                            </span>
                        ) : null}
                    </div>
                </CardFooter>
            ) : null}

            {sender && updatedAt ? (
                <CardFooter className="-mt-2">
                    <span className="text-xs text-muted-foreground">
                        {tClassFeed('lastEditedAt')} '{formatDate(updatedAt, DATETIME_DMY_12H_FORMAT)}'
                    </span>
                </CardFooter>
            ) : null}
        </Card>
    );
}
