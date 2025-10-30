import { User } from '@/types/auth';
import { IAttachment, IInputResource } from '../../(classwork)/types/attachment.type';

export enum AssignmentSubmissionStatusEnum {
    DRAFT = 'draft',
    SUBMITTED = 'submitted',
    RETURNED = 'returned',
}
export type IAssignmentSubmissionStatus = 'draft' | 'submitted' | 'returned';

export type IAssignmentSubmission = {
    assignmentId: number;
    status: IAssignmentSubmissionStatus;
    submissionId: number;
    updatedAt: string | null;
    studentId: number;
    grade: number | null;
    submittedAt: string | null;
    returnedAt: string | null;
};

export type InsertAssignmentSubmission = {
    assignmentId: number;
    studentId: number;
    status?: 'draft' | 'submitted' | 'returned' | undefined;
    submissionId?: number | undefined;
    updatedAt?: Date | null | undefined;
    grade?: number | null | undefined;
    submittedAt?: Date | null | undefined;
    returnedAt?: Date | null | undefined;
};

export type InsertAssignmentSubmissionBody = Pick<InsertAssignmentSubmission, 'studentId' | 'status'>;

export type IUpdateAssignmentSubmission = Pick<
    InsertAssignmentSubmission,
    'updatedAt' | 'status' | 'grade' | 'submittedAt' | 'returnedAt'
>;

export type IUpdateAssignmentSubmissionBody = Pick<IUpdateAssignmentSubmission, 'status'> & {
    inputResources?: IInputResource[] | undefined;
};

export interface IAssignmentSubmissionWithStudent {
    submission: IAssignmentSubmission;
    student: Pick<User, 'userId' | 'fullName' | 'avatarUrl'>;
}

export type IAssignmentSubmissionWithStudentDetails = IAssignmentSubmissionWithStudent & {
    attachments: IAttachment[];
};

export interface IGradeAssignmentSubmissionPayload {
    assignmentId: number;
    submissionId: number;
    grade: number;
}

export type IAssignmentSubmissionWithAttachments = {
    assignmentSubmission: IAssignmentSubmission;
    attachments: IAttachment[];
};

export type IUpdatedAssignmentSubmission = {
    updatedAssignmentSubmission: IAssignmentSubmission;
    addedAttachments: IAttachment[];
};
