import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import {
    IAssignmentSubmissionStatus,
    IAssignmentSubmissionWithStudent,
} from '@/app/[locale]/class-based/(assignment)/types/assignmentSubmission.type';
import assignmentSubmissionUtils from '@/app/[locale]/class-based/(assignment)/utils/assignmentSubmission.utils';
import toastHelper from '@/utils/toast.helper';

interface StudentItemProps {
    studentSubmission: IAssignmentSubmissionWithStudent;
    totalGrade: number;
    onSelect: (studentSubmission: IAssignmentSubmissionWithStudent) => void;
    isSelected: boolean;
}

function StudentItem({ studentSubmission, totalGrade, onSelect, isSelected }: StudentItemProps) {
    const { student, submission } = studentSubmission;
    return (
        <Card
            key={student.userId}
            className={`cursor-pointer hover:bg-muted transition-colors ${isSelected ? 'bg-muted transition-colors' : ''}`}
            onClick={() => onSelect(studentSubmission)}
        >
            <CardContent className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="font-medium">{student.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                            {assignmentSubmissionUtils.getStatusLabel(submission.status)}
                        </span>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                        {submission.grade === null ? '' : submission.grade}/{totalGrade}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

interface SubmissionItemProps {
    studentSubmission: IAssignmentSubmissionWithStudent;
    totalGrade: number;
    onGradeSubmit: ({ submissionId, grade }: { submissionId: number; grade: number }) => Promise<void>;
    gradeLoading: boolean;
}

function SubmissionItem({ studentSubmission, totalGrade, onGradeSubmit, gradeLoading }: SubmissionItemProps) {
    const { student, submission } = studentSubmission;
    const [grade, setGrade] = useState<number | null>(null);

    useEffect(() => {
        setGrade(submission.grade);
    }, [submission.grade]);

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
        if (grade === null) {
            toastHelper.showErrorMessage('Grade is required');
            return;
        }
        onGradeSubmit({ submissionId: submission.submissionId, grade });
    }

    return (
        <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-semibold">{student.fullName}</h2>
                    <p className="text-sm text-muted-foreground">
                        {assignmentSubmissionUtils.getStatusLabel(submission.status)}
                    </p>
                </div>

                <Button variant="default" className="px-6" onClick={handleGradeSubmit} disabled={gradeLoading}>
                    {gradeLoading ? 'Saving...' : 'Trả bài'}
                </Button>
            </div>

            <Card className="mb-6">
                <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <a className="text-blue-500 font-medium hover:underline">100facts_EN.pdf</a>
                        <span className="text-sm text-muted-foreground">PDF</span>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-4 mb-6">
                <Input
                    type="number"
                    placeholder="Nhập điểm"
                    className="w-32"
                    value={grade === null ? '' : grade}
                    onChange={handleGradeChange}
                />
                <span className="text-muted-foreground">/ {totalGrade}</span>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Nhận xét riêng tư</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea placeholder="Thêm nhận xét riêng tư cho học viên..." />
                    <div className="flex justify-end mt-3">
                        <Button variant="secondary">Gửi</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

interface Props {
    totalGrade: number;
    studentSubmissions: IAssignmentSubmissionWithStudent[];
    onGradeSubmit: ({ submissionId, grade }: { submissionId: number; grade: number }) => Promise<void>;
    gradeLoading: boolean;
}

export default function SubmissionsPage({ studentSubmissions, totalGrade, onGradeSubmit, gradeLoading }: Props) {
    const [selectedStudentSubmission, setSelectedStudentSubmission] = useState<IAssignmentSubmissionWithStudent | null>(
        null,
    );

    const [selectedStatus, setSelectedStatus] = useState<IAssignmentSubmissionStatus | null>(null);

    const [studentSubmissionsByGroup, setStudentSubmissionsByGroup] = useState<
        IAssignmentSubmissionWithStudent[] | null
    >(null);

    // needed to be verified
    useEffect(() => {
        setStudentSubmissionsByGroup(
            assignmentSubmissionUtils.getAssignmentSubmissionsByStatus({ status: selectedStatus, studentSubmissions }),
        );
    }, [studentSubmissions, selectedStatus]);

    function handleStudentSubmissionSelect(studentSubmission: IAssignmentSubmissionWithStudent) {
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
                                key={studentSubmission.submission.submissionId}
                                studentSubmission={studentSubmission}
                                totalGrade={totalGrade}
                                onSelect={handleStudentSubmissionSelect}
                                isSelected={
                                    selectedStudentSubmission !== null &&
                                    selectedStudentSubmission.submission.submissionId ===
                                        studentSubmission.submission.submissionId
                                }
                            />
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {selectedStudentSubmission ? (
                <SubmissionItem
                    studentSubmission={selectedStudentSubmission}
                    totalGrade={totalGrade}
                    onGradeSubmit={onGradeSubmit}
                    gradeLoading={gradeLoading}
                />
            ) : null}
        </div>
    );
}
