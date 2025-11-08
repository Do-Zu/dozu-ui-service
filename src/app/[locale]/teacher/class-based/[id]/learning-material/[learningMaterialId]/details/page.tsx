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
import {
    IAssignmentSubmission,
    IAssignmentSubmissionWithStudent,
    IAssignmentSubmissionWithStudentDetails,
    IGradeAssignmentSubmissionPayload,
} from '@/app/[locale]/class-based/(assignment)/types/assignmentSubmission.type';
import assignmentSubmissionService from '@/app/[locale]/class-based/(assignment)/service/assignmentSubmission.service';
import { ILearningMaterialWithAttachments } from '@/app/[locale]/class-based/(learning-material)/types/learningMaterial.type';
import learningMaterialService from '@/app/[locale]/class-based/(learning-material)/service/learningMaterial.service';
import DeleteLearningMaterialModal from '@/app/[locale]/class-based/(learning-material)/components/DeleteLearningMaterialModal';

export default function Page() {
    const params = useParams();
    const isValidClassId = typeof params.id === 'string' && !isNaN(Number(params.id)) && Number(params.id) > 0;
    const isValidLearningMaterialId =
        typeof params.learningMaterialId === 'string' &&
        !isNaN(Number(params.learningMaterialId)) &&
        Number(params.learningMaterialId) > 0;

    const isValidId = isValidClassId && isValidLearningMaterialId;
    if (!isValidId) {
        return <div className="p-8">Invalid classId, please try again.</div>;
    }

    const classId = Number(params.id);
    const learningMaterialId = Number(params.learningMaterialId);

    return <ValidPage classId={classId} learningMaterialId={learningMaterialId} />;
}

function ValidPage({ classId, learningMaterialId }: { classId: number; learningMaterialId: number }) {
    const { user } = useAuth();
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

    // // submissions of the above assignment
    // const {
    //     data: studentSubmissions,
    //     setData: setStudentSubmissions,
    //     loading: studentSubmissionsLoading,
    //     error: studentSubmissionsError,
    // } = useFetch<IAssignmentSubmissionWithStudentDetails[]>(() =>
    //     assignmentSubmissionService.getAssignmentSubmissionsOfStudents({ assignmentId: learningMaterialId }),
    // );

    // // grade assignment submission
    // const { execute: gradeSubmissionAsync, loading: gradeSubmissionLoading } = usePost<
    //     IGradeAssignmentSubmissionPayload,
    //     IAssignmentSubmission
    // >(assignmentSubmissionService.gradeAssignmentSubmission, 'PUT', {
    //     onError(error) {
    //         toastHelper.showErrorMessage(error);
    //     },
    //     onSuccess(data) {
    //         toastHelper.showSuccessMessage('Grade and return submission successfully');
    //         // handle update UI
    //         setStudentSubmissions((prev) => {
    //             if (!prev) return null;
    //             return prev.map((studentSubmission) => {
    //                 const { submission } = studentSubmission;
    //                 if (submission?.submissionId === data.submissionId)
    //                     return { ...studentSubmission, submission: data };
    //                 return studentSubmission;
    //             });
    //         });
    //     },
    // });

    const [isOpen, setIsOpen] = useState<boolean>(false);

    // const { execute: deleteAssignmentAsync, loading: deleteAssignmentLoading } = usePost<
    //     IDeleteAssignmentPayload,
    //     number
    // >(assignmentService.deleteAssignmentById, 'DELETE', {
    //     onError(error) {
    //         toastHelper.showErrorMessage(error);
    //     },
    //     onSuccess(data) {
    //         toastHelper.showSuccessMessage('Delete assignment successfully');
    //         setIsOpen(false);
    //         router.push(ROUTES.TEACHER.CLASS_BASED_ID(classId, ClassDashboardTab.CLASSWORK));
    //     },
    // });

    const { execute: deleteLMAsync, loading: deleteLMLoading } = usePost<any, number>(
        learningMaterialService.deleteLearningMaterialById,
        'DELETE',
        {
            onError(error) {
                toastHelper.showErrorMessage(error);
            },
            onSuccess(data: any) {
                toastHelper.showSuccessMessage('Delete learning material successfully');

                setIsOpen(false);
                router.push(ROUTES.TEACHER.CLASS_BASED_ID(classId, ClassDashboardTab.CLASSWORK));
            },
        },
    );

    function handleEditClick() {
        router.push(`/teacher/class-based/${classId}/learning-material/${learningMaterialId}/edit`);
    }

    function handleDeleteClick() {
        setIsOpen(true);
    }

    async function handleDeleteSubmit() {
        await deleteLMAsync({ classId, assignmentId: learningMaterialId });
    }

    // async function onGradeSubmit({ submissionId, grade }: { submissionId: number; grade: number }) {
    //     await gradeSubmissionAsync({ assignmentId: learningMaterialId, submissionId, grade });
    // }

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

    const { learningMaterial, attachments } = learningMaterialWithAttachments;

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
                            title={learningMaterial.title}
                            description={learningMaterial.content}
                            createdAt={learningMaterial.createdAt}
                            withGrade={false}
                            withDeadline={false}
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

                        <DeleteLearningMaterialModal
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            learningMaterialId={learningMaterialId}
                            onSubmit={handleDeleteSubmit}
                            loading={deleteLMLoading}
                        />
                    </div>
                </TabsContent>
                {/* <TabsContent value="submissions" className="px-6 md:px-8 py-4">
                    <Separator />
                    <SubmissionsPage
                        studentSubmissions={studentSubmissions}
                        totalGrade={learningMaterial.totalGrades}
                        onGradeSubmit={onGradeSubmit}
                        gradeLoading={gradeSubmissionLoading}
                    />
                </TabsContent> */}
            </Tabs>
        </div>
    );
}
