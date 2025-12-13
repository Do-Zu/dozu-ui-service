'use client';

import ContentSection from '@/app/[locale]/class-based/(classwork)/components/common/details/ContentSection';
import AttachmentsViewSection from '@/app/[locale]/class-based/(classwork)/components/common/details/AttachmentsViewSection';
import { Separator } from '@/components/ui/separator';
import useFetch from '@/hooks/useFetch';
import { useParams, useRouter } from 'next/navigation';
import LoadingPage from '@/app/loading';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ILearningMaterialWithAttachments } from '@/app/[locale]/class-based/(learning-material)/types/learningMaterial.type';
import learningMaterialService from '@/app/[locale]/class-based/(learning-material)/service/learningMaterial.service';
import LearningMaterialCommentSection from './components/LearningMaterialCommentSection';

export default function Page() {
    const params = useParams();
    const isValidClassId = typeof params.id === 'string' && !isNaN(Number(params.id)) && Number(params.id) > 0;
    const isValidLearningMaterialId =
        typeof params.learningMaterialId === 'string' &&
        !isNaN(Number(params.learningMaterialId)) &&
        Number(params.learningMaterialId) > 0;

    const isValidId = isValidClassId && isValidLearningMaterialId;
    if (!isValidId) {
        return <div className="p-8">Invalid classId or learningMaterialId, please try again.</div>;
    }

    const classId = Number(params.id);
    const learningMaterialId = Number(params.learningMaterialId);

    return <ValidPage classId={classId} learningMaterialId={learningMaterialId} />;
}

function ValidPage({ classId, learningMaterialId }: { classId: number; learningMaterialId: number }) {
    const router = useRouter();
    const tCommon = useTranslations('common');

    // learningMaterial
    const {
        data: learningMaterialWithAttachments,
        loading: learningMaterialWithAttachmentsLoading,
        error: learningMaterialWithAttachmentsError,
    } = useFetch<ILearningMaterialWithAttachments>(() =>
        learningMaterialService.getLearningMaterialWithAttachmentsById({ classId, learningMaterialId }),
    );

    const error = learningMaterialWithAttachmentsError;
    const loading = learningMaterialWithAttachmentsLoading;
    const notfound = !learningMaterialWithAttachments;

    if (error) {
        return <div>Error: {error}</div>;
    }
    if (loading) {
        return <LoadingPage />;
    }
    if (notfound) {
        return <div>Data Not Found</div>;
    }

    const { learningMaterial, attachments: assignmentAttachments } = learningMaterialWithAttachments;
    // const { assignmentSubmission: submission, attachments: submissionAttachments } = submissionWithAttachments;
    // const updateLoading = isUploading || updateSubmissionLoading;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-7 gap-6">
            <div className="lg:col-span-5 space-y-6">
                <ContentSection
                    teacherName=""
                    title={learningMaterial.title}
                    description={learningMaterial.content}
                    createdAt={learningMaterial.createdAt}
                    withGrade={false}
                    withDeadline={false}
                    dropdownMenuContent={
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Sao chép đường liên kết</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    }
                />

                <Separator />

                <AttachmentsViewSection attachments={assignmentAttachments} urls={learningMaterial.urls} />

                <LearningMaterialCommentSection classId={classId} learningMaterialId={learningMaterialId} />
            </div>

            <div className="lg:col-span-2 space-y-6">
                {/* <SubmissionCard
                    submission={submission}
                    attachments={submissionAttachments}
                    onSubmit={onSubmit}
                    loading={updateLoading}
                />

                <PrivateCommentsCard /> */}
            </div>
        </div>
    );
}
