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
// import ContentSection from './ContentSection';

// import AttachmentsSection from './AttachmentsSection';
// import DetailsPanel from './DetailsPanel';
DetailsPanel;

import { useRouter } from 'next/navigation';
import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';

import { useTranslations } from 'next-intl';

import useUploadAttachmentFiles from '@/hooks/upload/useUploadAttachmentFiles';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { UploadFileResponse } from '@/components/generative/types';
import { RESOURCE_CONTENT_TYPE } from '@/app/[locale]/generate/constants/resource';

import ContentSection from '@/app/[locale]/class-based/(classwork)/components/common/ContentSection';
import AttachmentsSection from '@/app/[locale]/class-based/(classwork)/components/common/AttachmentsSection';
import DetailsPanel from '@/app/[locale]/class-based/(classwork)/components/common/DetailsPanel';
import { NO_TOPIC_ID } from '@/app/[locale]/class-based/(classwork)/utils/classwork.constant';
import AttachmentItem from '@/app/[locale]/class-based/(assignment)/components/AttachmentItem';
import { AssignmentStatusEnum } from '@/app/[locale]/class-based/(assignment)/types/assignment.type';

interface Props {
    myClass: IClass;
    topics: Pick<ITopic, 'topicId' | 'name'>[];
}

interface IInputResource {
    title: string;
    contentType: string;
    metadata: UploadFileResponse;
}

interface ICreateLearningMaterialBody {
    title: string;
    description: string;
    topicId?: string;
    inputResources?: IInputResource[];
}

const DEFAULT_TOTAL_GRADE = 100;
const DEFAULT_ASSIGNMENT_STATUS = AssignmentStatusEnum.PUBLISHED;

// create another component for implementing your feature
export function EditLearningMaterial({ myClass, topics }: Props) {
    const t = useTranslations('EditLearningMaterial');
    const router = useRouter();

    // Assignment Status selection states
    // const [selectedStatus, setSelectedStatus] = useState<InsertAssignmentStatus>(DEFAULT_ASSIGNMENT_STATUS);

    // Content Section states
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');

    // Attachments Section states
    // files
    const [files, setFiles] = useState<File[]>([]);
    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            const selectedFiles = Array.from(event.target.files);
            setFiles(selectedFiles);
        }
    }

    // Details
    const [selectedTopic, setSelectedTopic] = useState<string>(NO_TOPIC_ID);
    const [grade, setGrade] = useState<number>(DEFAULT_TOTAL_GRADE);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

    function handleCloseClick() {
        router.back();
    }

    //File upload
    const { isLoading: isUploading, execute: uploadFiles } = useUploadAttachmentFiles();

    // Handle create learning material

    const {
        loading: isPosting,
        data: apiResponse,
        error: apiPostContentError,
        execute: sendCreateLearningMaterialRequest,
    } = usePost<ICreateLearningMaterialBody, any>(`/classes/${myClass.classId}/learning-material`, 'POST', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess() {
            //toast success
            // router.push(`/auth/changePasswordEmailSent`);
        },
    });

    const handleClickSubmitCreateLearningMaterial = async () => {
        let uploadedFileResult;
        if (files.length > 0) {
            const result = await uploadFiles(files);
            uploadedFileResult = result.map((metadata) => ({
                title: metadata.fileName,
                contentType: RESOURCE_CONTENT_TYPE.FILE,
                metadata: {
                    ...metadata,
                },
            }));
        }

        const requestBody: ICreateLearningMaterialBody = { title, description: content ?? '' };
        if (selectedTopic !== NO_TOPIC_ID) {
            requestBody.topicId = selectedTopic;
        }
        if (uploadedFileResult) {
            requestBody.inputResources = uploadedFileResult;
        }
        const result = await sendCreateLearningMaterialRequest(requestBody);
        console.log(result);
    };

    const isLoading = isPosting || isUploading;
    const isSumbmitDisabled = isLoading || !title;

    // function formatSelectedStatus(status: InsertAssignmentStatus) {
    //     switch (status) {
    //         case 'draft': {
    //             return 'Lưu bản nháp';
    //         }
    //         case 'scheduled': {
    //             return 'Lên lịch';
    //         }
    //         case 'published': {
    //             return 'Giao bài ngay';
    //         }
    //         default: {
    //             return 'Giá trị không hợp lệ';
    //         }
    //     }
    // }

    function handleSubmit() {}

    return (
        <div className="container w-[100%] max-w-7xl p-2">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={handleCloseClick}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">{t('closeButtonAria')}</span>
                    </Button>
                    <h1 className="text-3xl font-semibold text-foreground">{t('header')}</h1>
                </div>
                <div className="flex items-center space-x-2">
                    {/* <Button>{formatSelectedStatus(selectedStatus)}</Button> */}
                    <Button disabled={isSumbmitDisabled} onClick={handleClickSubmitCreateLearningMaterial}>
                        {' '}
                        {t('submitButtonLabel')}
                    </Button>

                    {/* <DropdownMenu>
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
                        // grade={grade}
                        // setGrade={setGrade}
                        // dueDate={dueDate}
                        // setDueDate={setDueDate}
                    />
                </div>
            </div>
        </div>
    );
}
