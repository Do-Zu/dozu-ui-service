import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { IClassFeed } from '../../../types/classFeed.type';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/utils';
import Link from 'next/link';
import { DATETIME_DMY_12H_FORMAT } from '@/utils/date/constant';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, SquarePen, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';

interface Props {
    feed: IClassFeed;
    editable: boolean;
}

export default function ClassFeedCard({ feed, editable }: Props) {
    const tCommon = useTranslations('common');
    const { title, content, createdAt, updatedAt, sender, link } = feed;

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
                            <span className="text-xs text-muted-foreground">{formatDate(createdAt)}</span>
                        </div>
                    </div>
                ) : null}
            </CardHeader>
            <CardContent className={!sender ? '-mt-6' : ''}>
                <div className="space-y-3">
                    <div className="flex justify-between items-center gap-4">
                        <h3 className="text-lg font-bold text-foreground">{title}</h3>

                        {editable ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:pointer-events-auto">
                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" side="top">
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>{tCommon('actions.edit')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
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
                        {link ? (
                            <Link href={link} className="text-sm underline text-blue-600 hover:text-blue-800">
                                View Content
                            </Link>
                        ) : null}
                    </div>
                </div>
            </CardContent>
            {!sender ? (
                <CardFooter>
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-muted-foreground">
                            {formatDate(createdAt, DATETIME_DMY_12H_FORMAT)}
                        </span>
                        {updatedAt ? (
                            <span className="text-xs text-muted-foreground">
                                This post was last edited at '{formatDate(updatedAt, DATETIME_DMY_12H_FORMAT)}'
                            </span>
                        ) : null}
                    </div>
                </CardFooter>
            ) : null}
        </Card>
    );
}
