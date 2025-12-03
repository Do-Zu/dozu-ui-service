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
import { MoreVertical, Plus, BookText, Edit, Trash2, FileText, HelpCircle, BookOpen, Album } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    AssignmentStatusEnum,
    IAssignment,
    IDeleteAssignmentPayload,
} from '../../../(assignment)/types/assignment.type';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import { formatDate } from '@/utils';
import assignmentUtils from '../../../(assignment)/utils/assignment.utils';
import { useRouter } from 'next/navigation';
import { IClass } from '../../../types/class.type';
import { ROUTES } from '@/utils/constants/routes';
import { useTranslations } from 'next-intl';
import { ALL_TOPICS, NO_TOPIC } from '../../utils/classwork.constant';
import { IClassworkType } from '../../types/classwork.type';
import DeleteAssignmentModal from '../../../(assignment)/components/DeleteAssignmentModal';
import usePost from '@/hooks/usePost';
import assignmentService from '../../../(assignment)/service/assignment.service';
import toastHelper from '@/utils/toast.helper';
import { USER_ROLES, UserRole } from '@/utils/constants/roles';
import { ILearningMaterial } from '../../../(learning-material)/types/learningMaterial.type';
import learningMaterialUtils from '../../../(learning-material)/utils/learningMaterial.utils';
import DeleteLearningMaterialModal from '../../../(learning-material)/components/DeleteLearningMaterialModal';
import learningMaterialService from '../../../(learning-material)/service/learningMaterial.service';

interface ItemProps {
    role: UserRole;
    assignment: IAssignment;
    onOpen: ({ assignmentId }: { assignmentId: number }) => void;
    onClose: () => void;
}

interface LearningMaterialItemProps {
    role: UserRole;
    learningMaterial: ILearningMaterial;
    onOpen: ({ learningMaterialId }: { learningMaterialId: number }) => void;
    onClose: () => void;
}

const ClassworkItem = ({ role, assignment, onOpen, onClose }: ItemProps) => {
    const router = useRouter();
    const tCommon = useTranslations('common');
    const tClasswork = useTranslations('classwork');
    const isDraft = assignment.status === AssignmentStatusEnum.DRAFT;
    const isPastDeadline = assignment.deadline && new Date() > new Date(assignment.deadline);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    function handleEditClick() {
        if (role === USER_ROLES.USER) return;
        router.push(
            ROUTES.TEACHER.CLASS_BASED_ID_ASSIGNMENT_ID_EDIT({
                classId: assignment.classId,
                assignmentId: assignment.assignmentId,
            }),
        );
    }

    function handleDeleteClick() {
        if (role === USER_ROLES.USER) return;
        onOpen({ assignmentId: assignment.assignmentId });
    }

    function handleDetailsClick() {
        if (dropdownOpen) return;
        if (role === USER_ROLES.USER) {
            router.push(
                ROUTES.ASSIGNMENT_DETAILS({ classId: assignment.classId, assignmentId: assignment.assignmentId }),
            );
        } else if (role === USER_ROLES.TEACHER) {
            router.push(
                ROUTES.TEACHER.CLASS_BASED_ID_ASSIGNMENT_ID_DETAILS({
                    classId: assignment.classId,
                    assignmentId: assignment.assignmentId,
                }),
            );
        }
    }

    return (
        <div
            className="flex items-center justify-between py-5 px-3 hover:bg-muted/50 rounded-md transition-colors hover:cursor-pointer"
            onClick={handleDetailsClick}
        >
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
                        {assignment.deadline
                            ? tClasswork('dueDateAt', { date: formatDate(assignment.deadline) })
                            : tClasswork('noDueDate')}
                    </p>
                )}
                {role === USER_ROLES.TEACHER ? (
                    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
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
                            <DropdownMenuItem onSelect={handleEditClick}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>{tCommon('actions.edit')}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem onSelect={handleDeleteClick}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>{tCommon('actions.delete')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
            </div>
        </div>
    );
};

const LearningMaterialItem = ({ role, learningMaterial, onOpen, onClose }: LearningMaterialItemProps) => {
    const router = useRouter();
    const tCommon = useTranslations('common');
    const tClasswork = useTranslations('classwork');

    const [dropdownOpen, setDropdownOpen] = useState(false);

    // function handleEditClick() {
    //     if (role === USER_ROLES.USER) return;
    //     router.push(
    //         ROUTES.TEACHER.CLASS_BASED_ID_ASSIGNMENT_ID_EDIT({
    //             classId: learningMaterial.classId,
    //             learningMaterialId: learningMaterial.learningMaterialId,
    //         }),
    //     );
    // }

    function handleDeleteClick() {
        if (role === USER_ROLES.USER) return;
        onOpen({ learningMaterialId: learningMaterial.learningMaterialId });
    }

    // function handleDetailsClick() {
    //     if (dropdownOpen) return;
    //     if (role === USER_ROLES.USER) {
    //         router.push(
    //             ROUTES.ASSIGNMENT_DETAILS({
    //                 classId: learningMaterial.classId,
    //                 assignmentId: learningMaterial.assignmentId,
    //             }),
    //         );
    //     } else if (role === USER_ROLES.TEACHER) {
    //         router.push(
    //             ROUTES.TEACHER.CLASS_BASED_ID_ASSIGNMENT_ID_DETAILS({
    //                 classId: learningMaterial.classId,
    //                 assignmentId: learningMaterial.assignmentId,
    //             }),
    //         );
    //     }
    // }

    return (
        <div
            className="flex items-center justify-between py-5 px-3 hover:bg-muted/50 rounded-md transition-colors hover:cursor-pointer"
            // onClick={handleDetailsClick}
        >
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-blue-400 bg-blue-50 dark:bg-blue-950/30">
                    <Album className="text-blue-500 dark:text-blue-400" size={18} />
                </div>
                <div className="flex flex-col">
                    <a href="#" className="font-medium text-base text-foreground">
                        {learningMaterial.title}
                    </a>
                </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
                <p className={cn('text-sm', 'text-muted-foreground')}></p>

                {role === USER_ROLES.TEACHER ? (
                    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
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
                            <DropdownMenuItem
                            //  onSelect={handleEditClick}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>{tCommon('actions.edit')}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem onSelect={handleDeleteClick}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>{tCommon('actions.delete')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
            </div>
        </div>
    );
};

interface Props {
    role: UserRole;
    myClass: IClass;
    topics: Pick<ITopic, 'topicId' | 'name'>[];
    assignments: IAssignment[];
    setAssignments: React.Dispatch<React.SetStateAction<IAssignment[] | null>>;
    learningMaterials: ILearningMaterial[];
    setLearningMaterials: React.Dispatch<React.SetStateAction<ILearningMaterial[] | null>>;
}

function ClassworkList({
    role,
    myClass,
    topics: topicsData,
    assignments,
    setAssignments,
    learningMaterials,
    setLearningMaterials,
}: Props) {
    const tCommon = useTranslations('common');
    const tClasswork = useTranslations('classwork');
    const router = useRouter();
    const topics = useMemo(() => {
        return [...topicsData, NO_TOPIC];
    }, [topicsData]);

    const [assignmentsByTopic, setAssignmentsByTopic] = useState<Map<number, IAssignment[]> | null>(null);
    const [learningMaterialsByTopic, setLearningMaterialsByTopic] = useState<Map<number, ILearningMaterial[]> | null>(
        null,
    );

    const [selectedTopic, setSelectedTopic] = useState<string>(ALL_TOPICS);
    const selectedAssignments = assignmentUtils.getSelectedAssignments(assignmentsByTopic, selectedTopic);
    const selectedLearningMaterials = learningMaterialUtils.getSelectedLearningMaterials(
        learningMaterialsByTopic,
        selectedTopic,
    );

    // delete assignment
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isOpenDeleteLM, setIsOpenDeleteLM] = useState<boolean>(false);
    const [deletingAssignment, setDeletingAssignment] = useState<number | null>(null);
    const [deletingLearningMaterial, setDeletingLearningMaterial] = useState<number | null>(null);

    const { execute: deleteAssignmentAsync, loading: deleteAssignmentLoading } = usePost<
        IDeleteAssignmentPayload,
        number
    >(assignmentService.deleteAssignmentById, 'DELETE', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess(data) {
            toastHelper.showSuccessMessage('Delete assignment successfully');
            applyDeleteAssignment(data);
            setIsOpen(false);
        },
    });

    const { execute: deleteLMAsync, loading: deleteLMLoading } = usePost<any, number>(
        learningMaterialService.deleteLearningMaterialById,
        'DELETE',
        {
            onError(error) {
                toastHelper.showErrorMessage(error);
            },
            onSuccess(data: any) {
                toastHelper.showSuccessMessage('Delete learning material successfully');

                applyDeleteLearningMaterial(data.deletedLearningMaterialId);
                setIsOpenDeleteLM(false);
            },
        },
    );

    function applyDeleteAssignment(id: number) {
        setAssignments((prev) => (prev ? prev.filter((e) => e.assignmentId !== id) : null));
    }

    function applyDeleteLearningMaterial(id: number) {
        setLearningMaterials((prev) => (prev ? prev.filter((e) => e.learningMaterialId !== id) : null));
    }

    useEffect(() => {
        const result = assignmentUtils.getAssignmentsByTopic(assignments, topics);
        setAssignmentsByTopic(result);
    }, [assignments, topics]);

    useEffect(() => {
        const result = learningMaterialUtils.getLearningMaterialsByTopic(learningMaterials, topics);
        setLearningMaterialsByTopic(result);
    }, [learningMaterials, topics]);

    function handleTopicSelect(value: string) {
        setSelectedTopic(value);
    }

    function handleSelect(type: IClassworkType) {
        switch (type) {
            case 'assignment':
                router.push(ROUTES.TEACHER.CLASS_BASED_ID_ASSIGNMENTS(myClass.classId));
                break;
            case 'quiz':
                // ...routing to your page
                break;
            case 'learningMaterial':
                // ...routing to your page
                router.push(ROUTES.TEACHER.CLASS_BASED_ID_LEARNING_MATERIAL(myClass.classId));
                break;
            default:
                break;
        }
    }

    function onOpen({ assignmentId }: { assignmentId: number }) {
        setDeletingAssignment(assignmentId);
        setIsOpen(true);
    }

    function onOpenLearningMaterial({ learningMaterialId }: { learningMaterialId: number }) {
        setDeletingLearningMaterial(learningMaterialId);
        setIsOpenDeleteLM(true);
    }

    function onClose() {
        setDeletingAssignment(null);
        setIsOpen(false);
    }

    function onCloseLM() {
        setDeletingLearningMaterial(null);
        setIsOpenDeleteLM(false);
    }

    async function handleDeleteSubmit({ assignmentId }: { assignmentId: number }) {
        await deleteAssignmentAsync({ classId: myClass.classId, assignmentId });
    }

    async function handleDeleteSubmitLM({ learningMaterialId }: { learningMaterialId: number }) {
        await deleteLMAsync({ classId: myClass.classId, learningMaterialId });
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{tClasswork('classwork')}</h1>
                <div className="flex items-center gap-3">
                    <Select defaultValue={ALL_TOPICS} value={selectedTopic} onValueChange={handleTopicSelect}>
                        <SelectTrigger className="w-[180px] sm:w-[200px]">
                            <SelectValue placeholder="Lọc theo chủ đề" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_TOPICS}>{tClasswork('allTopic')}</SelectItem>
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
                    {role === USER_ROLES.TEACHER ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> {tCommon('actions.create')}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => handleSelect('assignment')}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>{tClasswork('assignment')}</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem onSelect={() => handleSelect('quiz')}>
                                    <HelpCircle className="mr-2 h-4 w-4" />
                                    <span>{tClasswork('quiz')}</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem onSelect={() => handleSelect('learningMaterial')}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    <span>{tClasswork('learningMaterial')}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
                </div>
            </div>

            {selectedAssignments || selectedLearningMaterials ? (
                <div className="mt-10">
                    <h2 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b">
                        {assignmentUtils.getSelectedTopicName(topics, selectedTopic)}
                    </h2>

                    <div className="flex flex-col divide-y divide-border">
                        {/* Assignments */}
                        {selectedAssignments?.map((assignment) => (
                            <ClassworkItem
                                key={`assignment-${assignment.assignmentId}`}
                                role={role}
                                assignment={assignment}
                                onOpen={onOpen}
                                onClose={onClose}
                            />
                        ))}

                        {/* Learning Materials */}
                        {selectedLearningMaterials?.map((material) => (
                            <LearningMaterialItem
                                key={`material-${material.learningMaterialId}`}
                                role={role}
                                learningMaterial={material}
                                onOpen={onOpenLearningMaterial}
                                onClose={onCloseLM}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    {assignmentsByTopic && learningMaterialsByTopic ? (
                        <div className="space-y-10 mt-10">
                            {topics.map((topic) => {
                                const assignments = assignmentsByTopic.get(topic.topicId);
                                const materials = learningMaterialsByTopic.get(topic.topicId);

                                if (!assignments?.length && !materials?.length) return null;

                                return (
                                    <div key={topic.topicId}>
                                        <h2 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b">
                                            {topic.name}
                                        </h2>

                                        <div className="flex flex-col divide-y divide-border">
                                            {assignments?.map((assignment) => (
                                                <ClassworkItem
                                                    key={`assignment-${assignment.assignmentId}`}
                                                    role={role}
                                                    assignment={assignment}
                                                    onOpen={onOpen}
                                                    onClose={onClose}
                                                />
                                            ))}

                                            {materials?.map((material) => (
                                                <LearningMaterialItem
                                                    key={`material-${material.learningMaterialId}`}
                                                    role={role}
                                                    learningMaterial={material}
                                                    onOpen={onOpenLearningMaterial}
                                                    onClose={onClose}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            )}
            <DeleteAssignmentModal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                assignmentId={deletingAssignment}
                onSubmit={handleDeleteSubmit}
                loading={deleteAssignmentLoading}
            />
            <DeleteLearningMaterialModal
                isOpen={isOpenDeleteLM}
                setIsOpen={setIsOpenDeleteLM}
                learningMaterialId={deletingLearningMaterial}
                onSubmit={handleDeleteSubmitLM}
                loading={deleteLMLoading}
            />
        </div>
    );
}

export default React.memo(ClassworkList);
