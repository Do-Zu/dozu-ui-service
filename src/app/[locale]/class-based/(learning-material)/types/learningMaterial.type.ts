import { IAttachment, IInputResource } from '../../(classwork)/types/attachment.type';

export enum AssignmentStatusEnum {
    DRAFT = 'draft',
    SCHEDULED = 'scheduled',
    PUBLISHED = 'published',
    CLOSED = 'closed',
}

export type IAssignmentStatus = 'draft' | 'scheduled' | 'published' | 'closed';

export type ILearningMaterial = {
    learningMaterialId: number;
    title: string;
    description: string;
    topicId: number | null;
    classId: number;
    createdAt: string;
};

export type ILearningMaterialWithAttachments = {
    assignment: ILearningMaterial;
    attachments: IAttachment[];
};
