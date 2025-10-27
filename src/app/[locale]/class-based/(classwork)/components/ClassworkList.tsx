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
import { MoreVertical, Plus, BookText, Edit, Trash2, FileText, HelpCircle, BookOpen } from 'lucide-react';
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
import { IClassworkType } from '../types/classwork.type';
import DeleteAssignmentModal from '../../(assignment)/components/DeleteAssignmentModal';
import usePost from '@/hooks/usePost';
import assignmentService from '../../(assignment)/service/assignment.service';
import toastHelper from '@/utils/toast.helper';
import { USER_ROLES, UserRole } from '@/utils/constants/roles';

interface ItemProps {
    role: UserRole;
    assignment: IAssignment;
    onOpen: ({ assignmentId }: { assignmentId: number }) => void;
    onClose: () => void;
}

const ClassworkItem = ({ role, assignment, onOpen, onClose }: ItemProps) => {
    const router = useRouter();
    const tCommon = useTranslations('common');
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
            // handle route to assignment details page
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
                        {assignment.deadline ? `Đến hạn ${formatDate(assignment.deadline)}` : 'Không có hạn nộp'}
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

interface Props {
    role: UserRole;
    myClass: IClass;
    topics: Pick<ITopic, 'topicId' | 'name'>[];
    assignments: IAssignment[];
    setAssignments: React.Dispatch<React.SetStateAction<IAssignment[] | null>>;
}

function ClassworkList({ role, myClass, topics: topicsData, assignments, setAssignments }: Props) {
    const router = useRouter();
    const topics = useMemo(() => {
        return [...topicsData, NO_TOPIC];
    }, [topicsData]);

    const [assignmentsByTopic, setAssignmentsByTopic] = useState<Map<number, IAssignment[]> | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string>(ALL_TOPICS);
    const selectedAssignments = assignmentUtils.getSelectedAssignments(assignmentsByTopic, selectedTopic);

    // delete assignment
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [deletingAssignment, setDeletingAssignment] = useState<number | null>(null);

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

    function applyDeleteAssignment(id: number) {
        setAssignments((prev) => (prev ? prev.filter((e) => e.assignmentId !== id) : null));
    }

    useEffect(() => {
        const result = assignmentUtils.getAssignmentsByTopic(assignments, topics);
        setAssignmentsByTopic(result);
    }, [assignments, topics]);

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
                break;
            default:
                break;
        }
    }

    function onOpen({ assignmentId }: { assignmentId: number }) {
        setDeletingAssignment(assignmentId);
        setIsOpen(true);
    }

    function onClose() {
        setDeletingAssignment(null);
        setIsOpen(false);
    }

    async function handleDeleteSubmit({ assignmentId }: { assignmentId: number }) {
        await deleteAssignmentAsync({ classId: myClass.classId, assignmentId });
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
                    {role === USER_ROLES.TEACHER ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Tạo
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => handleSelect('assignment')}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Bài tập</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem onSelect={() => handleSelect('quiz')}>
                                    <HelpCircle className="mr-2 h-4 w-4" />
                                    <span>Câu hỏi / Quiz</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem onSelect={() => handleSelect('learningMaterial')}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    <span>Tài liệu học tập</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
                </div>
            </div>

            {selectedAssignments ? (
                <div className="mt-10">
                    <h2 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b">
                        {assignmentUtils.getSelectedTopicName(topics, selectedTopic)}
                    </h2>
                    <div className="flex flex-col divide-y divide-border">
                        {selectedAssignments.map((assignment) => (
                            <ClassworkItem
                                key={assignment.assignmentId}
                                role={role}
                                assignment={assignment}
                                onOpen={onOpen}
                                onClose={onClose}
                            />
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
                                                <ClassworkItem
                                                    key={assignment.assignmentId}
                                                    role={role}
                                                    assignment={assignment}
                                                    onOpen={onOpen}
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
        </div>
    );
}

export default React.memo(ClassworkList);
