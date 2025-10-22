'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CalendarIcon, Link2, Upload, X, ChevronDown } from 'lucide-react';
import ContentSection from './ContentSection';
import AttachmentsSection from './AttachmentsSection';
import DetailsPanel, { NO_TOPIC } from './DetailsPanel';
import { useRouter } from 'next/navigation';
import { IClass } from '../../../types/class.type';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import { AssignmentStatusEnum, InsertAssignmentStatus } from '../../types/assignment.type';

interface Props {
    myClass: IClass;
    topics: Pick<ITopic, 'topicId' | 'name'>[];
}

const DEFAULT_TOTAL_GRADE = 100;
const DEFAULT_ASSIGNMENT_STATUS = AssignmentStatusEnum.PUBLISHED;

// create another component for implementing your feature
export function EditAssignment({ myClass, topics }: Props) {
    const router = useRouter();

    // Assignment Status selection states
    const [selectedStatus, setSelectedStatus] = useState<InsertAssignmentStatus>(DEFAULT_ASSIGNMENT_STATUS);

    // Content Section states
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');

    // Attachments Section states
    // ... states

    // Details
    const [selectedTopic, setSelectedTopic] = useState<string>(NO_TOPIC);
    const [grade, setGrade] = useState<number>(DEFAULT_TOTAL_GRADE);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

    function handleCloseClick() {
        router.back();
    }

    function formatSelectedStatus(status: InsertAssignmentStatus) {
        switch (status) {
            case 'draft': {
                return 'Lưu bản nháp';
            }
            case 'scheduled': {
                return 'Lên lịch';
            }
            case 'published': {
                return 'Giao bài ngay';
            }
            default: {
                return 'Giá trị không hợp lệ';
            }
        }
    }

    function handleSubmit() {}

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
                    <Button>{formatSelectedStatus(selectedStatus)}</Button>

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
