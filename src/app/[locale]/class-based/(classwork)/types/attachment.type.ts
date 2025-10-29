import { UploadFileResponse } from '@/components/generative/types';
export interface IAttachment {
    attachmentId: number;
    createdAt: string | null;
    description: string | null;
    title: string;
    contentType: string | null;
    metadata: any;
}

export interface IInputResource {
    title: string;
    contentType: string;
    metadata: UploadFileResponse;
}