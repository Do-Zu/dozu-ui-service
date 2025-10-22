export enum AssignmentStatusEnum {
    DRAFT = 'draft',
    SCHEDULED = 'scheduled',
    PUBLISHED = 'published',
    CLOSED = 'closed',
}

export type IASsignmentStatus = 'draft' | 'scheduled' | 'published' | 'closed';

export type IAssignment = {
    assignmentId: number;
    createdAt: Date;
    updatedAt: Date | null;
    teacherId: number;
    classId: number;
    topicId: number | null;
    title: string;
    content: string;
    deadline: Date | null;
    totalGrades: number;
    publishedAt: Date | null;
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

export type InsertAssignmentBody = Omit<InsertAssignment, 'teacherId' | 'classId'>;
