'use client';

import ContentSection from '@/app/[locale]/class-based/(classwork)/components/common/details/ContentSection';
import AttachmentsSection from '@/app/[locale]/class-based/(classwork)/components/common/details/AttachmentsSection';
import { Separator } from '@/components/ui/separator';
import useFetch from '@/hooks/useFetch';
import {
    IAssignment,
    IAssignmentWithAttachments,
    IDeleteAssignmentPayload,
} from '@/app/[locale]/class-based/(assignment)/types/assignment.type';
import assignmentService from '@/app/[locale]/class-based/(assignment)/service/assignment.service';
import { useParams, useRouter } from 'next/navigation';
import LoadingPage from '@/app/loading';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/utils/constants/routes';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { useState } from 'react';
import DeleteAssignmentModal from '@/app/[locale]/class-based/(assignment)/components/DeleteAssignmentModal';
import { ClassDashboardTab } from '@/app/[locale]/class-based/[id]/utils/class.constant';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubmissionsPage from './components/SubmissionsPage';
import CommentSection from './components/CommentSection';
import {
    IAssignmentSubmission,
    IAssignmentSubmissionWithStudent,
    IAssignmentSubmissionWithStudentDetails,
    IGradeAssignmentSubmissionPayload,
} from '@/app/[locale]/class-based/(assignment)/types/assignmentSubmission.type';
import assignmentSubmissionService from '@/app/[locale]/class-based/(assignment)/service/assignmentSubmission.service';

// Mock data (for now)
const mockAssignment = {
    assignmentId: 8,
    classId: 1,
    topicId: 35,
    title: 'History assignment',
    description: 'Writing about history.',
    createdAt: '2025-10-24T08:02:43.826Z',
    attachments: [
        {
            attachmentId: 1,
            title: 'How Your Brain Alters Your Reality.mp4',
            description: '',
            contentType: 'video/mp4',
            metadata: { size: '34MB' },
            createdAt: '2025-10-24T09:00:00.000Z',
        },
        {
            attachmentId: 2,
            title: 'Wikipedia, bách khoa toàn thư mở.png',
            description: '',
            contentType: 'image/png',
            metadata: { size: '2.1MB' },
            createdAt: '2025-10-24T09:05:00.000Z',
        },
        {
            attachmentId: 3,
            title: 'Basic English - Wikipedia.pdf',
            description: '',
            contentType: 'application/pdf',
            metadata: { size: '1.8MB' },
            createdAt: '2025-10-24T09:10:00.000Z',
        },
    ],
    grade: 100,
    deadline: '2025-11-27T09:10:00.000Z',
};

export default function Page() {
    const params = useParams();
    const isValidClassId = typeof params.id === 'string' && !isNaN(Number(params.id)) && Number(params.id) > 0;
    const isValidAssignmentId =
        typeof params.assignmentId === 'string' &&
        !isNaN(Number(params.assignmentId)) &&
        Number(params.assignmentId) > 0;

    const isValidId = isValidClassId && isValidAssignmentId;
    if (!isValidId) {
        return <div className="p-8">Invalid classId, please try again.</div>;
    }

    const classId = Number(params.id);
    const assignmentId = Number(params.assignmentId);

    return <ValidPage classId={classId} assignmentId={assignmentId} />;
}

function ValidPage({ classId, assignmentId }: { classId: number; assignmentId: number }) {
    const { user } = useAuth();
    const router = useRouter();
    const tCommon = useTranslations('common');

    // assignment
    const {
        data: assignmentWithAttachments,
        loading: assignmentWithAttachmentsLoading,
        error: assignmentWithAttachmentsError,
    } = useFetch<IAssignmentWithAttachments>(() =>
        assignmentService.getAssignmentWithAttachmentsById({ classId, assignmentId }),
    );

    // submissions of the above assignment
    const {
        data: studentSubmissions,
        setData: setStudentSubmissions,
        loading: studentSubmissionsLoading,
        error: studentSubmissionsError,
    } = useFetch<IAssignmentSubmissionWithStudentDetails[]>(() =>
        assignmentSubmissionService.getAssignmentSubmissionsOfStudents({ assignmentId }),
    );

    // grade assignment submission
    const { execute: gradeSubmissionAsync, loading: gradeSubmissionLoading } = usePost<
        IGradeAssignmentSubmissionPayload,
        IAssignmentSubmission
    >(assignmentSubmissionService.gradeAssignmentSubmission, 'PUT', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess(data) {
            toastHelper.showSuccessMessage('Grade and return submission successfully');
            // handle update UI
            setStudentSubmissions((prev) => {
                if (!prev) return null;
                return prev.map((studentSubmission) => {
                    const { submission } = studentSubmission;
                    if (submission?.submissionId === data.submissionId)
                        return { ...studentSubmission, submission: data };
                    return studentSubmission;
                });
            });
        },
    });

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { execute: deleteAssignmentAsync, loading: deleteAssignmentLoading } = usePost<
        IDeleteAssignmentPayload,
        number
    >(assignmentService.deleteAssignmentById, 'DELETE', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess(data) {
            toastHelper.showSuccessMessage('Delete assignment successfully');
            setIsOpen(false);
            router.push(ROUTES.TEACHER.CLASS_BASED_ID(classId, ClassDashboardTab.CLASSWORK));
        },
    });

    function handleEditClick() {
        router.push(ROUTES.TEACHER.CLASS_BASED_ID_ASSIGNMENT_ID_EDIT({ classId, assignmentId }));
    }

    function handleDeleteClick() {
        setIsOpen(true);
    }

    async function handleDeleteSubmit() {
        await deleteAssignmentAsync({ classId, assignmentId });
    }

    async function onGradeSubmit({ submissionId, grade }: { submissionId: number; grade: number }) {
        await gradeSubmissionAsync({ assignmentId, submissionId, grade });
    }

    const error = assignmentWithAttachmentsError || studentSubmissionsError;
    const loading = assignmentWithAttachmentsLoading || studentSubmissionsLoading;
    const notfound = !assignmentWithAttachments || !studentSubmissions;

    if (error) {
        return <div>Error: {error}</div>;
    }
    if (loading) {
        return <LoadingPage />;
    }
    if (notfound) {
        return <div>Data Not Found</div>;
    }

    const { assignment, attachments } = assignmentWithAttachments;

    return (
        <div className="p-6">
            <Tabs className="w-[100%]" defaultValue="details">
                <TabsList className="w-[20%]">
                    <TabsTrigger value="details" className="justify-center">
                        Details
                    </TabsTrigger>
                    <TabsTrigger value="submissions" className="justify-center">
                        Submissions
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="px-6 md:px-8 py-4">
                    <Separator />
                    <div className="max-w-3xl mx-auto p-6 space-y-6">
                        <ContentSection
                            teacherName={user?.fullName || ''}
                            title={assignment.title}
                            description={assignment.content}
                            createdAt={assignment.createdAt}
                            withGrade={true}
                            withDeadline={true}
                            totalGrade={assignment.totalGrades}
                            deadline={assignment.deadline}
                            dropdownMenuContent={
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleEditClick}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>{tCommon('actions.edit')}</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={handleDeleteClick}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>{tCommon('actions.delete')}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            }
                        />

                        <Separator />

                        <AttachmentsSection attachments={attachments} />

                        <CommentSection classId={classId} assignmentId={assignmentId} />

                        <DeleteAssignmentModal
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            assignmentId={assignmentId}
                            onSubmit={handleDeleteSubmit}
                            loading={deleteAssignmentLoading}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="submissions" className="px-6 md:px-8 py-4">
                    <Separator />
                    <SubmissionsPage
                        studentSubmissions={studentSubmissions}
                        totalGrade={assignment.totalGrades}
                        assignmentId={assignmentId}
                        onGradeSubmit={onGradeSubmit}
                        gradeLoading={gradeSubmissionLoading}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
