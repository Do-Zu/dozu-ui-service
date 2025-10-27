import { UploadFileResponse } from '@/components/generative/types';
export interface IAttachment {
    createdAt: string | null;
    description: string | null;
    title: string;
    attachmentId: number;
    contentType: string | null;
    metadata: any;
}

export interface IInputResource {
    title: string;
    contentType: string;
    metadata: UploadFileResponse;
}