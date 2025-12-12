import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
import { useTranslations } from 'next-intl';

interface StudentItemProps {
    studentSubmission: IAssignmentSubmissionWithStudentDetails;
    totalGrade: number;
    onSelect: (studentSubmission: IAssignmentSubmissionWithStudentDetails) => void;
    isSelected: boolean;
}

function StudentItem({ studentSubmission, totalGrade, onSelect, isSelected }: StudentItemProps) {
    const { student, submission } = studentSubmission;
    const { fullName, email, username } = student;
    const t = useTranslations('assignment');
    
    // Get status label with translation
    const getStatusLabel = (status?: IAssignmentSubmissionStatus) => {
        switch (status) {
            case 'draft':
                return t('status.draft');
            case 'submitted':
                return t('status.submitted');
            case 'returned':
                return t('status.returned');
            default:
                return t('status.invalid');
        }
    };
    
    // Get status badge styling
    // If status is undefined/null, treat it as 'draft' (assigned but not submitted)
    const getStatusBadge = (status?: IAssignmentSubmissionStatus) => {
        const actualStatus = status ?? 'draft';
        switch (actualStatus) {
            case 'submitted':
                return {
                    label: getStatusLabel(actualStatus),
                    className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
                };
            case 'returned':
                return {
                    label: getStatusLabel(actualStatus),
                    className: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30',
                };
            case 'draft':
            default:
                return {
                    label: getStatusLabel(actualStatus),
                    className: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30',
                };
        }
    };
    
    const statusBadge = getStatusBadge(submission?.status);
    const hasGrade = !isNil(submission?.grade) && submission.grade !== null;
    const gradeValue = submission?.grade ?? 0;
    const gradePercent = hasGrade ? (gradeValue / totalGrade) * 100 : 0;
    
    // Get grade color based on percentage
    const getGradeColor = () => {
        if (!hasGrade) return 'text-muted-foreground';
        if (gradePercent >= 80) return 'text-green-600 dark:text-green-400 font-bold';
        if (gradePercent >= 60) return 'text-blue-600 dark:text-blue-400 font-bold';
        if (gradePercent >= 40) return 'text-amber-600 dark:text-amber-400 font-bold';
        return 'text-red-600 dark:text-red-400 font-bold';
    };
    
    return (
        <Card
            key={student.userId}
            className={`cursor-pointer hover:bg-muted transition-colors ${isSelected ? 'bg-muted border-primary border-2' : ''}`}
            onClick={() => onSelect(studentSubmission)}
        >
            <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <span className="font-medium truncate">
                            {classworkUtils.getStudentDisplayName({ fullName, email, username })}
                        </span>
                        <Badge 
                            variant="outline" 
                            className={`text-xs font-semibold px-2 py-0.5 w-fit ${statusBadge.className}`}
                        >
                            {statusBadge.label}
                        </Badge>
                    </div>
                    {hasGrade && (
                        <span className={`text-lg font-bold ${getGradeColor()}`}>
                            {gradeValue}/{totalGrade}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function SubmissionsOverview({ statusCounts }: { statusCounts: IAssignmentSubmissionStatusCounts }) {
    const { assignedCount, submittedCount, returnedCount } = statusCounts;
    const t = useTranslations('assignment');
    
    return (
        <div className="p-6 max-w-5xl mx-auto mt-10">
            <h2 className="text-2xl font-semibold mb-8">{t('assignment')}</h2>

            <div className="flex justify-center items-center gap-8 mb-8">
                <Card className="flex-1 max-w-[200px] border-2 border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/10">
                    <CardContent className="p-6 text-center">
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            {submittedCount}
                        </p>
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 font-semibold">
                            {t('status.submitted')}
                        </Badge>
                    </CardContent>
                </Card>
                
                <Card className="flex-1 max-w-[200px] border-2 border-gray-200 dark:border-gray-500/30 bg-gray-50/50 dark:bg-gray-500/10">
                    <CardContent className="p-6 text-center">
                        <p className="text-4xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                            {assignedCount}
                        </p>
                        <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30 font-semibold">
                            {t('status.draft')}
                        </Badge>
                    </CardContent>
                </Card>
                
                <Card className="flex-1 max-w-[200px] border-2 border-green-200 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/10">
                    <CardContent className="p-6 text-center">
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                            {returnedCount}
                        </p>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30 font-semibold">
                            {t('status.returned')}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-center items-center gap-3 mb-10">
                <Switch id="disable-submissions" />
                <Label htmlFor="disable-submissions" className="text-sm">
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
    const t = useTranslations('assignment');

    const [grade, setGrade] = useState<number | null>();

    const canEdit = submission !== null;

    // Get status label with translation
    // If status is undefined/null, treat it as 'draft' (assigned but not submitted)
    const getStatusLabel = (status?: IAssignmentSubmissionStatus) => {
        const actualStatus = status ?? 'draft';
        switch (actualStatus) {
            case 'draft':
                return t('status.draft');
            case 'submitted':
                return t('status.submitted');
            case 'returned':
                return t('status.returned');
            default:
                return t('status.draft'); // Fallback to draft instead of invalid
        }
    };

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
        <div className="flex-1 space-y-6">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold">
                        {classworkUtils.getStudentDisplayName({ fullName, email, username })}
                    </h2>
                    <Badge 
                        variant="outline" 
                        className={`text-sm font-semibold px-3 py-1 w-fit ${
                            submission?.status === 'submitted' 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                                : submission?.status === 'returned'
                                ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30'
                        }`}
                    >
                        {getStatusLabel(submission?.status)}
                    </Badge>
                </div>

                <Button variant="default" className="px-6" onClick={handleGradeSubmit} disabled={gradeLoading}>
                    {gradeLoading ? 'Saving...' : 'Trả bài'}
                </Button>
            </div>

            {attachments?.map((attachment) => <AttachmentItem key={attachment.attachmentId} attachment={attachment} />)}
            {submission?.urls?.map((u, i) => <UrlAttachmentItem key={i} url={u} />)}

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Nhập điểm"
                        className="w-32 font-semibold"
                        value={grade === null ? '' : grade}
                        onChange={handleGradeChange}
                    />
                    <span className="text-muted-foreground text-lg">/ {totalGrade}</span>
                </div>
                {!isNil(grade) && (
                    <div className="flex items-center gap-2">
                        <Badge 
                            variant="outline"
                            className={`text-sm font-bold px-3 py-1 ${
                                (grade / totalGrade) * 100 >= 80
                                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30'
                                    : (grade / totalGrade) * 100 >= 60
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                                    : (grade / totalGrade) * 100 >= 40
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                                    : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30'
                            }`}
                        >
                            {Math.round((grade / totalGrade) * 100)}%
                        </Badge>
                    </div>
                )}
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
    const t = useTranslations('assignment');
    const tCommon = useTranslations('common');
    
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
            <div className="w-80 border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                    <h2 className="font-semibold text-lg">{t('submission.studentSubmissions')}</h2>
                </div>

                <div className="p-4 border-b border-border">
                    <Select value={selectedStatus ?? 'all'} onValueChange={handleStatusSelect}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('submission.status')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{tCommon('all')}</SelectItem>
                            <SelectItem value="draft">{t('status.draft')}</SelectItem>
                            <SelectItem value="submitted">{t('status.submitted')}</SelectItem>
                            <SelectItem value="returned">{t('status.returned')}</SelectItem>
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
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-end m-2 px-6">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedStudentSubmission(null)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <div className="max-w-4xl mx-auto px-4">
                            <SubmissionItem
                                studentSubmission={selectedStudentSubmission}
                                totalGrade={totalGrade}
                                assignmentId={assignmentId}
                                onGradeSubmit={onGradeSubmit}
                                gradeLoading={gradeLoading}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <SubmissionsOverview statusCounts={studentSubmissionStatusCounts} />
            )}
        </div>
    );
}
