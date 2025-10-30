import { formatDate } from '@/utils';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import React from 'react';

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

    return (
        <div className="flex items-start justify-between">
            <div className="flex flex-1 flex-col">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="text-muted-foreground">
                    {teacherName} • {formatDate(createdAt)}
                </p>
                {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
                <div className="mt-2 flex items-center justify-between w-full">
                    {withGrade ? (
                        <p>
                            {props.grade !== null ? <span className="font-semibold">{props.grade}/</span> : null}
                            <span className={props.grade !== null ? '' : 'font-medium'}>{props.totalGrade}</span>
                            {props.grade !== null ? '' : ' điểm'}
                        </p>
                    ) : null}
                    {withDeadline && props.deadline ? (
                        <p className="text-sm text-muted-foreground">
                            Đến hạn <span className="font-medium text-foreground">{formatDate(props.deadline)}</span>
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
