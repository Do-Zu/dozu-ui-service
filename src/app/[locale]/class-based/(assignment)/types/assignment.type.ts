export enum AssignmentStatusEnum {
    DRAFT = 'draft',
    SCHEDULED = 'scheduled',
    PUBLISHED = 'published',
    CLOSED = 'closed',
}

export type IAssignmentStatus = 'draft' | 'scheduled' | 'published' | 'closed';

export type IAssignment = {
    assignmentId: number;
    createdAt: string;
    updatedAt: string | null;
    teacherId: number;
    classId: number;
    topicId: number | null;
    title: string;
    content: string;
    deadline: string | null;
    totalGrades: number;
    publishedAt: string | null;
    status: 'draft' | 'scheduled' | 'published' | 'closed';
    acceptingSubmissions: boolean;
};

export type InsertAssignment = {
    teacherId: number;
    classId: number;
    title: string;
    acceptingSubmissions: boolean;
    assignmentId?: number | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | null | undefined;
    topicId?: number | null | undefined;
    content?: string | undefined;
    deadline?: Date | null | undefined;
    totalGrades?: number | undefined;
    publishedAt?: Date | null | undefined;
    status?: 'draft' | 'scheduled' | 'published' | 'closed' | undefined;
};

export type InsertAssignmentBody = Pick<
    InsertAssignment,
    'topicId' | 'title' | 'content' | 'deadline' | 'totalGrades' | 'status' | 'acceptingSubmissions'
>;

// 'closed' is omitted, server will handle it
export type InsertAssignmentStatus = 'draft' | 'scheduled' | 'published';

export type IUpdateAssignment = Pick<
    InsertAssignment,
    'topicId' | 'title' | 'content' | 'deadline' | 'totalGrades' | 'status' | 'acceptingSubmissions' | 'updatedAt'
>;

export type IUpdateAssignmentBody = Omit<IUpdateAssignment, 'updatedAt'>;

export interface ICreateAssignmentPayload {
    classId: number;
    assignment: InsertAssignmentBody;
}

export interface IUpdateAssignmentPayload {
    classId: number;
    assignmentId: number;
    assignment: IUpdateAssignmentBody;
}

export interface IDeleteAssignmentPayload {
    classId: number;
    assignmentId: number;
}
