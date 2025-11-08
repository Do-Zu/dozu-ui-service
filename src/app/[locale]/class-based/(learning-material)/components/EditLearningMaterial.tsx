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
// import {
//     AssignmentStatusEnum,
//     IAssignment,
//     InsertAssignmentStatus,
//     IUpdateAssignmentBody,
// } from '../types/assignment.type';
// import assignmentUtils from '../utils/assignment.utils';
// import { DEFAULT_ASSIGNMENT_STATUS, DEFAULT_TOTAL_GRADE } from '../utils/assignment.constant';
import { NO_TOPIC_ID } from '../../(classwork)/utils/classwork.constant';
import toastHelper from '@/utils/toast.helper';
import { useTranslations } from 'next-intl';
import { IAttachment } from '../../(classwork)/types/attachment.type';
import { ILearningMaterial, IUpdateLearningMaterialBody } from '../types/learningMaterial.type';
import assignmentUtils from '../../(assignment)/utils/assignment.utils';

interface Props {
    myClass: IClass;
    topics: Pick<ITopic, 'topicId' | 'name'>[];
    learningMaterial: ILearningMaterial;
    attachments: IAttachment[];
    onSubmit: ({
        learningMaterial,
        files,
    }: {
        learningMaterial: IUpdateLearningMaterialBody;
        files: File[];
    }) => Promise<void>;
    loading: boolean;
}

// create another component for implementing your feature
export function EditLearningMaterial({ myClass, topics, learningMaterial, attachments, onSubmit, loading }: Props) {
    const router = useRouter();
    const tCommon = useTranslations('common');
    // const tAssignment = useTranslations('assignment');
    const tClasswork = useTranslations('classwork');

    // Content Section states
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');

    // Attachments Section states
    // ... states
    const [files, setFiles] = useState<File[]>([]);

    // Details
    const [selectedTopic, setSelectedTopic] = useState<string>(NO_TOPIC_ID);

    useEffect(() => {
        setTitle(learningMaterial.title);
        setContent(learningMaterial.content);
        setSelectedTopic(learningMaterial.topicId ? learningMaterial.topicId.toString() : NO_TOPIC_ID);
    }, [learningMaterial.title, learningMaterial.content, learningMaterial.topicId]);

    function handleCloseClick() {
        router.back();
    }

    async function handleSubmit() {
        if (!title) {
            toastHelper.showErrorMessage(tCommon('validation.required', { name: tCommon('labels.title') }));
            return;
        }
        const learningMaterial: IUpdateLearningMaterialBody = {
            topicId: assignmentUtils.parseTopicId(selectedTopic),
            title,
            content,
        };
        await onSubmit({ learningMaterial, files });
        setFiles([]);
    }

    return (
        <div className="container w-[100%] max-w-7xl p-2">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={handleCloseClick}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Đóng</span>
                    </Button>
                    <h1 className="text-3xl font-semibold text-foreground">Learning material</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleSubmit} disabled={loading}>
                        {/* {loading ? tCommon('status.saving') : assignmentUtils.getStatusLabel(selectedStatus)} */}
                        Submit
                    </Button>

                    {/* <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" defaultValue={DEFAULT_ASSIGNMENT_STATUS}>
                            <DropdownMenuItem onSelect={() => setSelectedStatus('published')}>
                                {tClasswork('assignNow')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedStatus('scheduled')}>
                                {tClasswork('schedule')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedStatus('draft')}>
                                {tClasswork('saveDraft')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu> */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <ContentSection
                        title={title}
                        setTitle={setTitle}
                        content={content}
                        setContent={setContent}
                        files={files}
                        setFiles={setFiles}
                        attachments={attachments}
                    />
                    <AttachmentsSection files={files} setFiles={setFiles} />
                </div>

                <div className="space-y-8">
                    <DetailsPanel
                        myClass={myClass}
                        topics={topics}
                        withGrade={false}
                        withDeadline={false}
                        selectedTopic={selectedTopic}
                        setSelectedTopic={setSelectedTopic}
                    />
                </div>
            </div>
        </div>
    );
}
