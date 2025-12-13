import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, X } from 'lucide-react';
import {
    IAssignmentSubmissionStatus,
    IAssignmentSubmissionStatusCounts,
    IAssignmentSubmissionWithStudentDetails,
} from '@/app/[locale]/class-based/(assignment)/types/assignmentSubmission.type';
import assignmentSubmissionUtils from '@/app/[locale]/class-based/(assignment)/utils/assignmentSubmission.utils';
import toastHelper from '@/utils/toast.helper';
import AttachmentItem from '@/app/[locale]/class-based/(classwork)/components/common/AttachmentItem';
import { isNil } from '@/utils';
import classworkUtils from '@/app/[locale]/class-based/(classwork)/utils/classwork.utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import UrlAttachmentItem from '@/app/[locale]/class-based/(classwork)/components/common/UrlAttachmentItem';
import PrivateCommentSection from './PrivateCommentSection';

interface StudentItemProps {
    studentSubmission: IAssignmentSubmissionWithStudentDetails;
    totalGrade: number;
    onSelect: (studentSubmission: IAssignmentSubmissionWithStudentDetails) => void;
    isSelected: boolean;
}

function StudentItem({ studentSubmission, totalGrade, onSelect, isSelected }: StudentItemProps) {
    const { student, submission } = studentSubmission;
    const { fullName, email, username } = student;
    return (
        <Card
            key={student.userId}
            className={`cursor-pointer hover:bg-muted transition-colors ${isSelected ? 'bg-muted transition-colors' : ''}`}
            onClick={() => onSelect(studentSubmission)}
        >
            <CardContent className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {classworkUtils.getStudentDisplayName({ fullName, email, username })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {assignmentSubmissionUtils.getStatusLabel(submission?.status)}
                        </span>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                        {isNil(submission?.grade) ? '' : submission.grade}/{totalGrade}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

function SubmissionsOverview({ statusCounts }: { statusCounts: IAssignmentSubmissionStatusCounts }) {
    const { assignedCount, submittedCount, returnedCount } = statusCounts;
    return (
        <div className="p-6 max-w-5xl mx-auto mt-10">
            <h2 className="text-2xl font-semibold mb-6">Bài tập</h2>

            <div className="flex justify-center items-center gap-12 mb-6">
                <div className="text-center">
                    <p className="text-3xl font-bold">{submittedCount}</p>
                    <p className="text-sm text-gray-500">Đã nộp</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold">{assignedCount}</p>
                    <p className="text-sm text-gray-500">Đã giao</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold">{returnedCount}</p>
                    <p className="text-sm text-gray-500">Đã chấm điểm</p>
                </div>
            </div>

            <div className="flex justify-center items-center gap-3 mb-10">
                <Switch id="disable-submissions" />
                <Label htmlFor="disable-submissions" className=" text-sm">
                    Không nhận bài tập
                </Label>
            </div>
        </div>
    );
}

interface SubmissionItemProps {
    studentSubmission: IAssignmentSubmissionWithStudentDetails;
    totalGrade: number;
    assignmentId: number;
    onGradeSubmit: ({ submissionId, grade }: { submissionId: number; grade: number }) => Promise<void>;
    gradeLoading: boolean;
}

function SubmissionItem({ studentSubmission, totalGrade, assignmentId, onGradeSubmit, gradeLoading }: SubmissionItemProps) {
    const { student, submission, attachments } = studentSubmission;
    const { fullName, email, username } = student;

    const [grade, setGrade] = useState<number | null>();

    const canEdit = submission !== null;

    useEffect(() => {
        setGrade(submission?.grade);
    }, [submission?.grade]);

    function handleGradeChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.value === '') {
            setGrade(null);
            return;
        }
        const raw = Number(e.target.value);
        const val = Number.isNaN(raw) ? null : raw;
        if (val === null) {
            setGrade(null);
            return;
        }
        const clamped = Math.min(Math.max(val, 0), totalGrade);
        setGrade(clamped);
    }

    function handleGradeSubmit() {
        if (!canEdit) {
            toastHelper.showErrorMessage("This student hasn't submitted any work yet.");
            return;
        }
        if (isNil(grade)) {
            toastHelper.showErrorMessage('Grade is required');
            return;
        }
        onGradeSubmit({ submissionId: submission.submissionId, grade });
    }

    return (
        <div className="flex-1 px-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-semibold">
                        {classworkUtils.getStudentDisplayName({ fullName, email, username })}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {assignmentSubmissionUtils.getStatusLabel(submission?.status)}
                    </p>
                </div>

                <Button variant="default" className="px-6" onClick={handleGradeSubmit} disabled={gradeLoading}>
                    {gradeLoading ? 'Saving...' : 'Trả bài'}
                </Button>
            </div>

            {attachments?.map((attachment) => <AttachmentItem key={attachment.attachmentId} attachment={attachment} />)}
            {submission?.urls?.map((u, i) => <UrlAttachmentItem key={i} url={u} />)}

            <div className="flex items-center gap-4">
                <Input
                    type="number"
                    placeholder="Nhập điểm"
                    className="w-32"
                    value={grade === null ? '' : grade}
                    onChange={handleGradeChange}
                />
                <span className="text-muted-foreground">/ {totalGrade}</span>
            </div>

            <PrivateCommentSection
                assignmentId={assignmentId}
                submissionId={submission?.submissionId || null}
            />
        </div>
    );
}

interface Props {
    totalGrade: number;
    assignmentId: number;
    studentSubmissions: IAssignmentSubmissionWithStudentDetails[];
    onGradeSubmit: ({ submissionId, grade }: { submissionId: number; grade: number }) => Promise<void>;
    gradeLoading: boolean;
}
const defaultSubmissionStatusCounts: IAssignmentSubmissionStatusCounts = {
    assignedCount: 0,
    submittedCount: 0,
    returnedCount: 0,
};

export default function SubmissionsPage({ studentSubmissions, totalGrade, assignmentId, onGradeSubmit, gradeLoading }: Props) {
    const [selectedStudentSubmission, setSelectedStudentSubmission] =
        useState<IAssignmentSubmissionWithStudentDetails | null>(null);

    const [selectedStatus, setSelectedStatus] = useState<IAssignmentSubmissionStatus | null>(null);

    const [studentSubmissionsByGroup, setStudentSubmissionsByGroup] = useState<
        IAssignmentSubmissionWithStudentDetails[] | null
    >(null);

    const [studentSubmissionStatusCounts, setStudentSubmissionStatusCounts] =
        useState<IAssignmentSubmissionStatusCounts>(defaultSubmissionStatusCounts);

    // needed to be verified
    useEffect(() => {
        setStudentSubmissionsByGroup(
            assignmentSubmissionUtils.getAssignmentSubmissionsByStatus({ status: selectedStatus, studentSubmissions }),
        );
        setStudentSubmissionStatusCounts(
            assignmentSubmissionUtils.getAssignmentSubmissionStatusCounts(studentSubmissions),
        );
    }, [studentSubmissions, selectedStatus]);

    function handleStudentSubmissionSelect(studentSubmission: IAssignmentSubmissionWithStudentDetails) {
        setSelectedStudentSubmission(studentSubmission);
    }

    function handleStatusSelect(status: string) {
        setSelectedStatus(status === 'all' ? null : (status as IAssignmentSubmissionStatus));
    }

    return (
        <div className="flex h-screen bg-background text-foreground">
            <div className="w-72 border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                    <h2 className="font-semibold text-lg">Bài nộp của học viên</h2>
                </div>

                <div className="p-4 border-b border-border">
                    <Select value={selectedStatus ?? 'all'} onValueChange={handleStatusSelect}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Trạng thái bài nộp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="draft">Đã giao</SelectItem>
                            <SelectItem value="submitted">Đã nộp</SelectItem>
                            <SelectItem value="returned">Đã chấm điểm</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {studentSubmissionsByGroup?.map((studentSubmission) => (
                            <StudentItem
                                key={studentSubmission.student.userId}
                                studentSubmission={studentSubmission}
                                totalGrade={totalGrade}
                                onSelect={handleStudentSubmissionSelect}
                                isSelected={
                                    selectedStudentSubmission !== null &&
                                    selectedStudentSubmission.student.userId === studentSubmission.student.userId
                                }
                            />
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {selectedStudentSubmission ? (
                <div className="w-full flex flex-col">
                    <div className="flex justify-end m-2 px-6">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedStudentSubmission(null)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex-1">
                        <SubmissionItem
                            studentSubmission={selectedStudentSubmission}
                            totalGrade={totalGrade}
                            assignmentId={assignmentId}
                            onGradeSubmit={onGradeSubmit}
                            gradeLoading={gradeLoading}
                        />
                    </div>
                </div>
            ) : (
                <SubmissionsOverview statusCounts={studentSubmissionStatusCounts} />
            )}
        </div>
    );
}
