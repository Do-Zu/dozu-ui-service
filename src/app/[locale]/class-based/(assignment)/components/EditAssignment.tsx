'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CalendarIcon, Link2, Upload, X, ChevronDown } from 'lucide-react';
import ContentSection from '../../(classwork)/components/common/ContentSection';
import AttachmentsSection from '../../(classwork)/components/common/AttachmentsSection';
import DetailsPanel from '../../(classwork)/components/common/DetailsPanel';
import { useRouter } from 'next/navigation';
import { IClass } from '../../types/class.type';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import {
    AssignmentStatusEnum,
    IAssignment,
    InsertAssignmentStatus,
    IUpdateAssignmentBody,
} from '../types/assignment.type';
import assignmentUtils from '../utils/assignment.utils';
import { DEFAULT_ASSIGNMENT_STATUS, DEFAULT_TOTAL_GRADE } from '../utils/assignment.constant';
import { NO_TOPIC_ID } from '../../(classwork)/utils/classwork.constant';

interface Props {
    myClass: IClass;
    topics: Pick<ITopic, 'topicId' | 'name'>[];
    assignment: IAssignment;
    onSubmit: ({ assignment }: { assignment: IUpdateAssignmentBody }) => Promise<void>;
    loading: boolean;
}

// create another component for implementing your feature
export function EditAssignment({ myClass, topics, assignment, onSubmit, loading }: Props) {
    const router = useRouter();

    // Assignment Status selection states
    const [selectedStatus, setSelectedStatus] = useState<InsertAssignmentStatus>(DEFAULT_ASSIGNMENT_STATUS);

    // Content Section states
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');

    // Attachments Section states
    // ... states

    // Details
    const [selectedTopic, setSelectedTopic] = useState<string>(NO_TOPIC_ID);
    const [grade, setGrade] = useState<number>(DEFAULT_TOTAL_GRADE);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        setSelectedStatus(AssignmentStatusEnum.PUBLISHED); // handle later
        setTitle(assignment.title);
        setContent(assignment.content);
        setSelectedTopic(assignment.topicId ? assignment.topicId.toString() : NO_TOPIC_ID);
        setGrade(assignment.totalGrades);
        setDueDate(assignment.deadline ? assignment.deadline : undefined);
    }, [
        assignment.status,
        assignment.title,
        assignment.content,
        assignment.topicId,
        assignment.totalGrades,
        assignment.deadline,
    ]);

    function handleCloseClick() {
        router.back();
    }

    async function handleSubmit() {
        const assignment: IUpdateAssignmentBody = {
            topicId: assignmentUtils.parseTopicId(selectedTopic),
            title,
            content,
            acceptingSubmissions: true,
            deadline: dueDate,
            totalGrades: grade,
            status: AssignmentStatusEnum.PUBLISHED,
        };
        await onSubmit({ assignment });
    }

    return (
        <div className="container w-[100%] max-w-7xl p-2">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={handleCloseClick}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Đóng</span>
                    </Button>
                    <h1 className="text-3xl font-semibold text-foreground">Bài tập</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : assignmentUtils.getStatusLabel(selectedStatus)}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" defaultValue={DEFAULT_ASSIGNMENT_STATUS}>
                            <DropdownMenuItem onSelect={() => setSelectedStatus('published')}>
                                Giao bài ngay
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedStatus('scheduled')}>
                                Lên lịch
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedStatus('draft')}>
                                Lưu bản nháp
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <ContentSection title={title} setTitle={setTitle} content={content} setContent={setContent} />
                    <AttachmentsSection />
                </div>

                <div className="space-y-8">
                    <DetailsPanel
                        myClass={myClass}
                        topics={topics}
                        withGrade={true}
                        withDeadline={true}
                        selectedTopic={selectedTopic}
                        setSelectedTopic={setSelectedTopic}
                        grade={grade}
                        setGrade={setGrade}
                        dueDate={dueDate}
                        setDueDate={setDueDate}
                    />
                </div>
            </div>
        </div>
    );
}
