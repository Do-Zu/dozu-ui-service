'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Plus, BookText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssignmentStatusEnum, IAssignment } from '../types/assignment.type';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import { formatDate } from '@/utils';
import assignmentUtils, { ALL_TOPICS, NO_TOPIC } from '../utils/assignment.utils';
import { useRouter } from 'next/navigation';
import { IClass } from '../../types/class.type';
import { ROUTES } from '@/utils/constants/routes';

const AssignmentItem = ({ assignment }: { assignment: IAssignment }) => {
    const isDraft = assignment.status === AssignmentStatusEnum.DRAFT;
    const isPastDeadline = assignment.deadline && new Date() > assignment.deadline;

    return (
        <div className="flex items-center justify-between py-5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <div className="flex items-center gap-4">
                <div
                    className={cn(
                        'flex items-center justify-center h-9 w-9 rounded-full border-2',
                        isDraft ? 'border-muted-foreground/50 bg-muted/30' : 'border-primary/50 bg-primary/10',
                    )}
                >
                    <BookText className={cn(isDraft ? 'text-muted-foreground/80' : 'text-primary')} size={18} />
                </div>
                <div className="flex flex-col">
                    <a href="#" className="font-medium text-base text-foreground">
                        {assignment.title}
                    </a>
                </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
                {isDraft ? (
                    <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
                        Bản nháp
                    </Badge>
                ) : (
                    <p
                        className={cn(
                            'text-sm',
                            isPastDeadline ? 'text-red-400 dark:text-red-600' : 'text-muted-foreground',
                        )}
                    >
                        {assignment.deadline ? `Đến hạn ${formatDate(assignment.deadline)}` : 'Không có hạn nộp'}
                    </p>
                )}
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
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

interface Props {
    myClass: IClass;
    topics: Pick<ITopic, 'topicId' | 'name'>[];
    assignments: IAssignment[];
}

function AssignmentsList({ myClass, topics: topicsData, assignments }: Props) {
    const router = useRouter();
    const topics = useMemo(() => {
        return [...topicsData, NO_TOPIC];
    }, [topicsData]);

    const [assignmentsByTopic, setAssignmentsByTopic] = useState<Map<number, IAssignment[]> | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string>(ALL_TOPICS);
    const selectedAssignments = assignmentUtils.getSelectedAssignments(assignmentsByTopic, selectedTopic);

    useEffect(() => {
        const result = assignmentUtils.getAssignmentsByTopic(assignments, topics);
        setAssignmentsByTopic(result);
    }, [assignments, topics]);

    function handleTopicSelect(value: string) {
        setSelectedTopic(value);
    }

    function handleCreateClick() {
        router.push(ROUTES.TEACHER.CLASS_BASED_ID_ASSIGNMENTS(myClass.classId));
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Bài tập trên lớp</h1>
                <div className="flex items-center gap-3">
                    <Select defaultValue={ALL_TOPICS} value={selectedTopic} onValueChange={handleTopicSelect}>
                        <SelectTrigger className="w-[180px] sm:w-[200px]">
                            <SelectValue placeholder="Lọc theo chủ đề" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_TOPICS}>Tất cả chủ đề</SelectItem>
                            {topics.map((topic) => {
                                if (topic === NO_TOPIC) return null;
                                return (
                                    <SelectItem key={topic.topicId} value={topic.topicId.toString()}>
                                        {topic.name}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleCreateClick}>
                        <Plus className="mr-2 h-4 w-4" /> Tạo
                    </Button>
                </div>
            </div>

            {selectedAssignments ? (
                <div className="mt-10">
                    <h2 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b">
                        {assignmentUtils.getSelectedTopicName(topics, selectedTopic)}
                    </h2>
                    <div className="flex flex-col divide-y divide-border">
                        {selectedAssignments.map((assignment) => (
                            <AssignmentItem key={assignment.assignmentId} assignment={assignment} />
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    {assignmentsByTopic ? (
                        <div className="space-y-10 mt-10">
                            {topics.map((topic) => {
                                const assignments = assignmentsByTopic.get(topic.topicId);
                                return (
                                    <div key={topic.topicId}>
                                        <h2 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b">
                                            {topic.name}
                                        </h2>
                                        <div className="flex flex-col divide-y divide-border">
                                            {assignments?.map((assignment) => (
                                                <AssignmentItem key={assignment.assignmentId} assignment={assignment} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

export default React.memo(AssignmentsList);
