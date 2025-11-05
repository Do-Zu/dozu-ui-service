import { IAttachment, IInputResource } from '../../(classwork)/types/attachment.type';

export type ILearningMaterial = {
    learningMaterialId: number;
    title: string;
    content: string;
    topicId: number | null;
    classId: number;
    createdAt: string;
};

export type ILearningMaterialWithAttachments = {
    learningMaterial: ILearningMaterial;
    attachments: IAttachment[];
};

export type InsertLearningMaterial = {
    teacherId: number;
    classId: number;
    title: string;
    learningMaterialId?: number | undefined;
    createdAt?: Date | undefined;
    topicId?: number | null | undefined;
    content?: string | undefined;
};

export type IUpdateLearningMaterial = Pick<InsertLearningMaterial, 'topicId' | 'title' | 'content'>;

export type IUpdateLearningMaterialBody = IUpdateLearningMaterial & {
    inputResources?: IInputResource[] | undefined;
};

export interface IUpdateLearningMaterialPayload {
    classId: number;
    learningMaterialId: number;
    learningMaterial: IUpdateLearningMaterialBody;
}
