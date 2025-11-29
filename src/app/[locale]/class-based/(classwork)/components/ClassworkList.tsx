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
import { AssignmentStatusEnum, IAssignment, IDeleteAssignmentPayload } from '../../(assignment)/types/assignment.type';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import { formatDate } from '@/utils';
import assignmentUtils from '../../(assignment)/utils/assignment.utils';
import { useRouter } from 'next/navigation';
import { IClass } from '../../types/class.type';
import { ROUTES } from '@/utils/constants/routes';
import { useTranslations } from 'next-intl';
import { ALL_TOPICS, NO_TOPIC } from '../utils/classwork.constant';
import { ClassworkTypeEnum, IClassworkType } from '../types/classwork.type';
import DeleteAssignmentModal from '../../(assignment)/components/DeleteAssignmentModal';
import usePost from '@/hooks/usePost';
import assignmentService from '../../(assignment)/service/assignment.service';
import toastHelper from '@/utils/toast.helper';
import { USER_ROLES, UserRole } from '@/utils/constants/roles';
import { ILearningMaterial } from '../../(learning-material)/types/learningMaterial.type';
import learningMaterialUtils from '../../(learning-material)/utils/learningMaterial.utils';
import DeleteLearningMaterialModal from '../../(learning-material)/components/DeleteLearningMaterialModal';
import learningMaterialService from '../../(learning-material)/service/learningMaterial.service';
import { IClasswork } from '../services/classwork.service';
import classworkUtils from '../utils/classwork.utils';
import { DATE_DMY_DASH_FORMAT } from '@/utils/date/constant';
import { IClassQuizListItem } from '../../(class-quiz)/types/classQuiz.type';
import ClassQuizItem from '../../(class-quiz)/components/ClassQuizItem';
import classQuizTeacherService from '../../(class-quiz)/services/classQuizTeacher.service';
import { useUserSession } from '@/app/[locale]/auth/hooks/useUserSession';

interface AssignmentItemProps {
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

const AssignmentItem = ({ role, assignment, onOpen, onClose }: AssignmentItemProps) => {
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
                        isDraft
                            ? 'border-muted-foreground/50 bg-muted/30'
                            : 'border-blue-400 bg-blue-50 dark:bg-blue-950/30',
                    )}
                >
                    <BookText
                        className={cn(isDraft ? 'text-muted-foreground/80' : 'text-blue-500 dark:text-blue-400')}
                        size={18}
                    />
                </div>
                <div className="flex flex-col">
                    <a href="#" className="font-medium text-base text-foreground">
                        {assignment.title}
                    </a>

                    <div className="text-sm text-muted-foreground mt-1">
                        <p>{formatDate(assignment.createdAt, DATE_DMY_DASH_FORMAT)}</p>
                        {/* <p>Last edited at: 2025-10-30 09:45</p> */}
                    </div>
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
                        {role === USER_ROLES.USER ? (
                            <>
                                {assignment.deadline
                                    ? tClasswork('dueDateAt', {
                                          date: formatDate(assignment.deadline, DATE_DMY_DASH_FORMAT),
                                      })
                                    : tClasswork('noDueDate')}{' '}
                            </>
                        ) : null}
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

    function handleEditClick() {
        if (role === USER_ROLES.USER) return;
        router.push(
            `/teacher/class-based/${learningMaterial.classId}/learning-material/${learningMaterial.learningMaterialId}/edit`,
        );
    }

    function handleDeleteClick() {
        if (role === USER_ROLES.USER) return;
        onOpen({ learningMaterialId: learningMaterial.learningMaterialId });
    }

    function handleDetailsClick() {
        if (dropdownOpen) return;
        if (role === USER_ROLES.USER) {
            // router.push(
            //     ROUTES.ASSIGNMENT_DETAILS({
            //         classId: learningMaterial.classId,
            //         assignmentId: learningMaterial.assignmentId,
            //     }),
            // );
            router.push(
                `/class-based/${learningMaterial.classId}/learning-material/${learningMaterial.learningMaterialId}/details`,
            );
        } else if (role === USER_ROLES.TEACHER) {
            router.push(
                `/teacher/class-based/${learningMaterial.classId}/learning-material/${learningMaterial.learningMaterialId}/details`,
            );
        }
    }

    return (
        <div
            className="flex items-center justify-between py-5 px-3 hover:bg-muted/50 rounded-md transition-colors hover:cursor-pointer"
            onClick={handleDetailsClick}
        >
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-blue-400 bg-blue-50 dark:bg-blue-950/30">
                    <Album className="text-blue-500 dark:text-blue-400" size={18} />
                </div>
                <div className="flex flex-col">
                    <a href="#" className="font-medium text-base text-foreground">
                        {learningMaterial.title}
                    </a>
                    <div className="text-sm text-muted-foreground mt-1">
                        <p>{formatDate(learningMaterial.createdAt, DATE_DMY_DASH_FORMAT)}</p>
                        {/* <p>Last edited at: 2025-10-30 09:45</p> */}
                    </div>
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

interface Props {
    role: UserRole;
    myClass: IClass;
    topics: Pick<ITopic, 'topicId' | 'name'>[];
    classwork: IClasswork[];
    setClasswork: React.Dispatch<React.SetStateAction<IClasswork[] | null>>;
}

function ClassworkList({ role, myClass, topics: topicsData, classwork, setClasswork }: Props) {
    const tCommon = useTranslations('common');
    const tClasswork = useTranslations('classwork');
    const router = useRouter();
    const topics = useMemo(() => {
        return [...topicsData, NO_TOPIC];
    }, [topicsData]);
    const { user, isLoggedIn } = useUserSession();
    const [creatingQuiz, setCreatingQuiz] = useState(false);
    const [classworkByTopic, setClassworkByTopic] = useState<Map<number, IClasswork[]> | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string>(ALL_TOPICS);
    const selectedClasswork = classworkUtils.getSelectedClasswork({ classworkByTopic, topicId: selectedTopic });

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
        setClasswork((prev) => {
            if (!prev) return null;
            return prev.filter((e) => {
                if (e.type !== ClassworkTypeEnum.ASSIGNMENT) return true;
                return (e.item as IAssignment).assignmentId !== id;
            });
        });
    }

    function applyDeleteLearningMaterial(id: number) {
        setClasswork((prev) => {
            if (!prev) return null;
            return prev.filter((e) => {
                if (e.type !== ClassworkTypeEnum.LEARNING_MATERIAL) return true;
                return (e.item as ILearningMaterial).learningMaterialId !== id;
            });
        });
    }

    useEffect(() => {
        const result = classworkUtils.getClassworkByTopic({ classwork, topics });
        setClassworkByTopic(result);
    }, [classwork, topics]);

    function handleTopicSelect(value: string) {
        setSelectedTopic(value);
    }

function resolveTopicId(): number | null {
  if (selectedTopic === ALL_TOPICS) return null;
  if (selectedTopic === NO_TOPIC.topicId?.toString?.()) return null;
  const n = Number(selectedTopic);
  return Number.isFinite(n) ? n : null;
}


    async function handleSelect(type: IClassworkType) {
        switch (type) {
            case ClassworkTypeEnum.ASSIGNMENT:
                router.push(ROUTES.TEACHER.CLASS_BASED_ID_ASSIGNMENTS(myClass.classId));
                break;
            case ClassworkTypeEnum.QUIZ:
                // ...routing to your page
                if (creatingQuiz) return;
                if (!isLoggedIn || !user?.userId) {
                    toastHelper.showErrorMessage('Bạn cần đăng nhập để tạo quiz');
                    return;
                }
                try {
                    setCreatingQuiz(true);
                    const created = await classQuizTeacherService.createClassQuiz(myClass.classId, {
                        teacherId: Number(user.userId),
                        topicId: resolveTopicId(),
                        title: 'New Quiz',
                        content: '',
                        startAt: null,
                        endAt: null,
                        durationSeconds: null,
                        maxAttempts: 1,
                        shuffleQuestions: true,
                        shuffleChoices: true,
                        showScoreToStudent: true,
                    });

                    router.push(ROUTES.TEACHER.CLASS_BASED_ID_CLASS_QUIZ_EDIT(myClass.classId, created.classQuizId));
                    toastHelper.showSuccessMessage('Created new quiz draft');
                } catch (e: any) {
                    toastHelper.showErrorMessage(e?.message || 'Failed to create quiz');
                } finally {
                    setCreatingQuiz(false);
                }
                break;
            case ClassworkTypeEnum.LEARNING_MATERIAL:
                // route to learningMaterial
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

            {selectedClasswork ? (
                <div className="mt-10">
                    <h2 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b">
                        {assignmentUtils.getSelectedTopicName(topics, selectedTopic)}
                    </h2>

                    <div className="flex flex-col divide-y divide-border">
                        {selectedClasswork.map((classwork) => {
                            switch (classwork.type) {
                                case ClassworkTypeEnum.ASSIGNMENT: {
                                    const assignment = classwork.item as IAssignment;
                                    return (
                                        <AssignmentItem
                                            key={`assignment-${assignment.assignmentId}`}
                                            role={role}
                                            assignment={assignment}
                                            onOpen={onOpen}
                                            onClose={onClose}
                                        />
                                    );
                                }
                                case ClassworkTypeEnum.LEARNING_MATERIAL: {
                                    const material = classwork.item as ILearningMaterial;
                                    return (
                                        <LearningMaterialItem
                                            key={`material-${material.learningMaterialId}`}
                                            role={role}
                                            learningMaterial={material}
                                            onOpen={onOpenLearningMaterial}
                                            onClose={onCloseLM}
                                        />
                                    );
                                }
                                case ClassworkTypeEnum.QUIZ: {
                                    const quiz = classwork.item as IClassQuizListItem;
                                    return (
                                        <ClassQuizItem
                                            key={`quiz-${quiz.classQuizId}`}
                                            role={role}
                                            quiz={quiz}
                                            classIdForRoute={myClass.classId}
                                        />
                                    );
                                }
                            }
                        })}
                    </div>
                </div>
            ) : (
                <div>
                    {classworkByTopic ? (
                        <div className="space-y-10 mt-10">
                            {topics.map((topic) => {
                                const classwork = classworkByTopic.get(topic.topicId);
                                if (!classwork || classwork.length === 0) return null;

                                return (
                                    <div key={topic.topicId}>
                                        <h2 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b">
                                            {topic.name}
                                        </h2>

                                        <div className="flex flex-col divide-y divide-border">
                                            {classwork.map((classworkItem) => {
                                                switch (classworkItem.type) {
                                                    case ClassworkTypeEnum.ASSIGNMENT: {
                                                        const assignment = classworkItem.item as IAssignment;
                                                        return (
                                                            <AssignmentItem
                                                                key={`assignment-${assignment.assignmentId}`}
                                                                role={role}
                                                                assignment={assignment}
                                                                onOpen={onOpen}
                                                                onClose={onClose}
                                                            />
                                                        );
                                                    }
                                                    case ClassworkTypeEnum.LEARNING_MATERIAL: {
                                                        const material = classworkItem.item as ILearningMaterial;
                                                        return (
                                                            <LearningMaterialItem
                                                                key={`material-${material.learningMaterialId}`}
                                                                role={role}
                                                                learningMaterial={material}
                                                                onOpen={onOpenLearningMaterial}
                                                                onClose={onCloseLM}
                                                            />
                                                        );
                                                    }
                                                    case ClassworkTypeEnum.QUIZ: {
                                                        const quiz = classworkItem.item as IClassQuizListItem;
                                                        return (
                                                            <ClassQuizItem
                                                                key={`quiz-${quiz.classQuizId}`}
                                                                role={role}
                                                                quiz={quiz}
                                                                classIdForRoute={myClass.classId}
                                                            />
                                                        );
                                                    }
                                                }
                                            })}
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
