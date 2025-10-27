export interface IAttachment {
    createdAt: string | null;
    description: string | null;
    title: string;
    attachmentId: number;
    contentType: string | null;
    metadata: any;
}