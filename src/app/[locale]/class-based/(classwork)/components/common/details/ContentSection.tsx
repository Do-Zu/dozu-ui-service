import { formatDate, isNil } from '@/utils';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { renderMarkdown } from '@/components/comments/utils/markdown';
import { useTranslations } from 'next-intl';

interface BaseProps {
    teacherName: string;
    title: string;
    description: string;
    createdAt: string;
    withGrade: boolean;
    withDeadline: boolean;
    dropdownMenuContent: React.ReactNode;
}

interface WithGradeProps {
    withGrade: true;
    grade?: number | undefined | null;
    totalGrade: number;
}

interface WithoutGradeProps {
    withGrade: false;
}

interface WithDeadlineProps {
    withDeadline: true;
    deadline: string | null;
}

interface WithoutDeadlineProps {
    withDeadline: false;
}

type Props = BaseProps & (WithGradeProps | WithoutGradeProps) & (WithDeadlineProps | WithoutDeadlineProps);

export default function ContentSection(props: Props) {
    const { teacherName, title, description, createdAt, withGrade, withDeadline, dropdownMenuContent } = props;
    const t = useTranslations('assignment');
    const tCommon = useTranslations('common');

    return (
        <div className="flex items-start justify-between">
            <div className="flex flex-1 flex-col gap-4">
                <div className="space-y-3">
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {teacherName && (
                            <div className="flex items-center gap-1.5">
                                <span className="font-medium">{t('labels.teacher')}:</span>
                                <span>{teacherName}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <span className="font-medium">{tCommon('labels.createdAt')}:</span>
                            <span>{formatDate(createdAt)}</span>
                        </div>
                    </div>
                </div>
                {description && (
                    <div 
                        className="text-sm text-muted-foreground break-words max-h-[400px] overflow-y-auto pr-2 prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }}
                    />
                )}
                <div className="mt-2 flex items-center justify-between w-full">
                    {withGrade ? (
                        <div className="flex items-center gap-3">
                            {!isNil(props.grade) ? (
                                <div className="flex items-center gap-2 p-3 rounded-lg border-2 bg-muted/30">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-3xl font-bold ${
                                            (props.grade / props.totalGrade) * 100 >= 80
                                                ? 'text-green-600 dark:text-green-400'
                                                : (props.grade / props.totalGrade) * 100 >= 60
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : (props.grade / props.totalGrade) * 100 >= 40
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`}>
                                            {props.grade}
                                        </span>
                                        <span className="text-xl text-muted-foreground font-semibold">/{props.totalGrade}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 rounded-lg border-2 bg-muted/30">
                                    <p className="text-lg font-semibold text-muted-foreground">
                                        {props.totalGrade} {t('labels.points')}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : null}
                    {withDeadline && props.deadline ? (
                        <p className="text-sm text-muted-foreground">
                            {t('labels.dueDate')} <span className="font-medium text-foreground">{formatDate(props.deadline)}</span>
                        </p>
                    ) : null}
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                {dropdownMenuContent}
            </DropdownMenu>
        </div>
    );
}
