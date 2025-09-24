import { deleteRequest, getRequest, postRequest } from '@/api/api';
import { ICompleteResponseInsertInputSet, PresignedUrlRequest, PresignedUrlResponse } from './upload.service';

export const uploadApi = {
    /**
     * Request a presigned URL for file upload
     */
    requestPresignedUrl: async (params: {
        fileName: string;
        fileSize: number;
        fileType: string;
        contentType: string;
    }) => {
        const response = await postRequest<PresignedUrlRequest, PresignedUrlResponse>('/upload/presigned-url', params);
        return response;
    },

    /**
     * Notify server that upload is complete
     */
    notifyUploadComplete: async (params: {
        fileName: string;
        fileSize: number;
        contentType: string;
        fileKey: string;
    }) => {
        return await postRequest<object, ICompleteResponseInsertInputSet>('/upload/file/single/complete', params);
    },

    /**
     * Get upload status
     */
    getUploadStatus: async (fileId: string) => {
        return await getRequest(`/upload/status/${fileId}`);
    },

    /**
     * Cancel an upload
     */
    cancelUpload: async (fileId: string) => {
        return await deleteRequest(`/upload/${fileId}`);
    },

    /**
     * Request multipart upload initialization
     */
    initializeMultipartUpload: async (params: {
        fileName: string;
        fileSize: number;
        contentType: string;
        partSize?: number;
    }) => {
        return await postRequest('/upload/multipart/initialize', params);
    },

    /**
     * Get presigned URLs for multipart upload parts
     */
    getMultipartUploadUrls: async (params: { uploadId: string; partNumbers: number[] }) => {
        return await postRequest('/upload/multipart/urls', params);
    },

    /**
     * Complete multipart upload
     */
    completeMultipartUpload: async (params: {
        uploadId: string;
        parts: Array<{
            partNumber: number;
            etag: string;
        }>;
    }) => {
        return await postRequest('/upload/multipart/complete', params);
    },

    /**
     * Abort multipart upload
     */
    abortMultipartUpload: async (uploadId: string) => {
        return await deleteRequest(`/upload/multipart/${uploadId}`);
    },
};
