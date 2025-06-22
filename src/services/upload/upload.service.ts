import axios from 'axios';
import { uploadApi } from './upload.api';
import Axios from '@/api/axios';
import { ApiResponse } from '@/api/type';
import { UploadApiResponse, UploadFileResponse } from '@/components/generative/types';
// Types for upload functionality
export interface PresignedUrlRequest {
    fileName: string;
    fileSize: number;
    fileType: string;
    contentType: string;
}

export interface PresignedUrlResponse {
    uploadUrl: string;
    fileId: string;
    expiresIn: number; // seconds
    conditions?: {
        maxFileSize: number;
        allowedContentTypes: string[];
    };
}

export interface UploadProgress {
    fileId: string;
    fileName: string;
    progress: number; // 0-100
    uploadedBytes: number;
    totalBytes: number;
    status: 'pending' | 'uploading' | 'completed' | 'error' | 'paused';
    error?: string;
    startTime?: Date;
    estimatedTimeRemaining?: number; // seconds
}

export interface MultipartUpload {
    uploadId: string;
    fileId: string;
    partSize: number;
    totalParts: number;
    completedParts: number;
    parts: UploadedPart[];
}

export interface UploadedPart {
    partNumber: number;
    etag: string;
    size: number;
}

export interface CompletionNotification {
    fileId: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    uploadUrl?: string;
    metadata?: Record<string, any>;
}

// Configuration
const MULTIPART_THRESHOLD = 100 * 1024 * 1024; // 100MB - use multipart for files larger than this
const PART_SIZE = 10 * 1024 * 1024; // 10MB per part
const MAX_CONCURRENT_PARTS = 3; // Maximum concurrent part uploads

class UploadService {
    private uploadProgressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map();
    private activeUploads: Map<string, AbortController> = new Map();
    private apiUpload;
    private BASE_URL_API = `${process.env.NEXT_PUBLIC_API_URL}/api`;
    constructor() {
        this.apiUpload = uploadApi;
    }

    /**
     * Upload a file using presigned URL
     */
    async uploadFile(file: File, onProgress?: (progress: UploadProgress) => void): Promise<UploadFileResponse> {
        const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Store progress callback
        if (onProgress) {
            this.uploadProgressCallbacks.set(fileId, onProgress);
        }

        try {
            // Step 1: Request presigned URL
            const presignedUrlRequest: PresignedUrlRequest = {
                fileName: file.name,
                fileSize: file.size,
                fileType: this.getFileExtension(file.name),
                contentType: file.type,
            };

            //Presigned URL request
            const { data: presignedResponse } = await this.apiUpload.requestPresignedUrl(presignedUrlRequest);

            // Upload file
            let uploadResult: UploadFileResponse;

            uploadResult = await this.uploadSmallFile(file, presignedResponse, fileId);

            // Step 3: Notify server of completion
            //   await this.notifyUploadCompletion({
            //     fileId: presignedResponse.fileId,
            //     fileName: file.name,
            //     fileSize: file.size,
            //     contentType: file.type,
            //     uploadUrl: presignedResponse.uploadUrl,
            //   });

            return uploadResult;
        } catch (error) {
            this.updateProgress(fileId, {
                fileId,
                fileName: file.name,
                progress: 0,
                uploadedBytes: 0,
                totalBytes: file.size,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed',
            });
            throw error;
        } finally {
            // Cleanup
            this.uploadProgressCallbacks.delete(fileId);
            this.activeUploads.delete(fileId);
        }
    }

    /**
     * Upload file using Axios POST request with FormData
     */
    private async uploadSmallFile(
        file: File,
        presignedResponse: PresignedUrlResponse,
        fileId: string,
    ): Promise<UploadFileResponse> {
        const abortController = new AbortController();
        this.activeUploads.set(fileId, abortController);

        const startTime = new Date();

        try {
            // Create FormData for multer compatibility
            const formData = new FormData();

            // Ensure the file is properly appended with explicit filename
            formData.append('file', file, file.name);

            // Add additional metadata
            formData.append('fileName', file.name);
            formData.append('fileSize', file.size.toString());
            formData.append('fileType', file.type);
            formData.append('originalName', file.name);

            const { data: response }: { data: UploadApiResponse<UploadFileResponse> } = await Axios.post(
                `${this.BASE_URL_API}${presignedResponse.uploadUrl}`,
                formData,
                {
                    signal: abortController.signal,
                    headers: {
                        // Remove the default Content-Type to let Axios set multipart/form-data with boundary
                        'Content-Type': undefined,
                    },
                    transformRequest: [
                        function (data, headers) {
                            // Remove Content-Type header completely to let browser set it
                            delete headers['Content-Type'];
                            return data;
                        },
                    ],
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = (progressEvent.loaded / progressEvent.total) * 100;
                            const elapsedTime = (Date.now() - startTime.getTime()) / 1000;
                            const uploadSpeed = progressEvent.loaded / elapsedTime; // bytes per second
                            const remainingBytes = progressEvent.total - progressEvent.loaded;
                            const estimatedTimeRemaining = remainingBytes / uploadSpeed;

                            this.updateProgress(fileId, {
                                fileId,
                                fileName: file.name,
                                progress: Math.round(progress),
                                uploadedBytes: progressEvent.loaded,
                                totalBytes: progressEvent.total,
                                status: 'uploading',
                                startTime,
                                estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
                            });
                        }
                    },
                },
            );

            this.updateProgress(fileId, {
                fileId,
                fileName: file.name,
                progress: 100,
                uploadedBytes: file.size,
                totalBytes: file.size,
                status: 'completed',
                startTime,
            });

            return response.data;
        } catch (error) {
            // console.error('Upload error:', error);
            if (axios.isCancel(error)) {
                throw new Error('Upload cancelled');
            }
            throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Upload large file (>= 100MB) using multipart upload
     */
    // private async uploadLargeFile(
    //   file: File,
    //   presignedResponse: PresignedUrlResponse,
    //   fileId: string,
    // ): Promise<UploadFileResponse> {
    //   const totalParts = Math.ceil(file.size / PART_SIZE);
    //   const parts: UploadedPart[] = [];
    //   let completedParts = 0;
    //   let uploadedBytes = 0;
    //   const startTime = new Date();
    //   const abortController = new AbortController();
    //   this.activeUploads.set(fileId, abortController);

    //   this.updateProgress(fileId, {
    //     fileId,
    //     fileName: file.name,
    //     progress: 0,
    //     uploadedBytes: 0,
    //     totalBytes: file.size,
    //     status: 'uploading',
    //     startTime,
    //   });

    //   try {
    //     // Create upload promises with concurrency control
    //     const uploadPromises: Promise<UploadedPart>[] = [];
    //     const executingPromises: Promise<any>[] = [];

    //     for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
    //       const uploadPromise = this.uploadPart(
    //         file,
    //         presignedResponse,
    //         partNumber,
    //         fileId,
    //         abortController.signal,
    //       ).then((part) => {
    //         uploadedBytes += part.size;
    //         completedParts++;

    //         const progress = (uploadedBytes / file.size) * 100;
    //         const elapsedTime = (Date.now() - startTime.getTime()) / 1000;
    //         const uploadSpeed = uploadedBytes / elapsedTime;
    //         const remainingBytes = file.size - uploadedBytes;
    //         const estimatedTimeRemaining = remainingBytes / uploadSpeed;

    //         this.updateProgress(fileId, {
    //           fileId,
    //           fileName: file.name,
    //           progress: Math.round(progress),
    //           uploadedBytes,
    //           totalBytes: file.size,
    //           status: 'uploading',
    //           startTime,
    //           estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
    //         });

    //         return part;
    //       });

    //       uploadPromises.push(uploadPromise);

    //       // Control concurrency
    //       if (executingPromises.length >= MAX_CONCURRENT_PARTS) {
    //         await Promise.race(executingPromises);
    //         // Remove completed promises
    //         for (let i = executingPromises.length - 1; i >= 0; i--) {
    //           try {
    //             await Promise.race([executingPromises[i], Promise.resolve()]);
    //             executingPromises.splice(i, 1);
    //           } catch {
    //             // Promise still pending
    //           }
    //         }
    //       }
    //       executingPromises.push(uploadPromise);
    //     }

    //     // Wait for all parts to complete
    //     const uploadedParts = await Promise.all(uploadPromises);
    //     parts.push(...uploadedParts);

    //     // Complete the multipart upload
    //     await this.completeMultipartUpload(presignedResponse.fileId, parts);

    //     this.updateProgress(fileId, {
    //       fileId,
    //       fileName: file.name,
    //       progress: 100,
    //       uploadedBytes: file.size,
    //       totalBytes: file.size,
    //       status: 'completed',
    //       startTime,
    //     });

    //   } catch (error) {
    //     // Abort any remaining uploads
    //     abortController.abort();

    //     this.updateProgress(fileId, {
    //       fileId,
    //       fileName: file.name,
    //       progress: Math.round((uploadedBytes / file.size) * 100),
    //       uploadedBytes,
    //       totalBytes: file.size,
    //       status: 'error',
    //       startTime,
    //       error: error instanceof Error ? error.message : 'Multipart upload failed',
    //     });

    //     throw error;
    //   }
    // }
    /**
     * Upload a single part of a multipart upload
     */
    private async uploadPart(
        file: File,
        presignedResponse: PresignedUrlResponse,
        partNumber: number,
        fileId: string,
        signal: AbortSignal,
    ): Promise<UploadedPart> {
        const start = (partNumber - 1) * PART_SIZE;
        const end = Math.min(start + PART_SIZE, file.size);
        const partBlob = file.slice(start, end);

        try {
            // Create FormData for the part
            const formData = new FormData();
            formData.append('file', partBlob, `${file.name}.part${partNumber}`);
            formData.append('partNumber', partNumber.toString());
            formData.append('fileName', file.name);

            // In a real implementation, you would request a separate presigned URL for each part
            const partUploadUrl = `${this.BASE_URL_API}${presignedResponse.uploadUrl}?partNumber=${partNumber}`;

            const response = await Axios.post(partUploadUrl, formData, {
                headers: {
                    // Let Axios handle Content-Type for FormData
                },
                signal,
                onUploadProgress: (progressEvent) => {
                    // Individual part progress can be tracked here if needed
                    // For now, we rely on the overall progress tracking in uploadLargeFile
                },
            });

            if (!response || response.status < 200 || response.status >= 300) {
                throw new Error(`Part ${partNumber} upload failed with status ${response?.status}`);
            }

            // Extract ETag from response headers (required for multipart completion)
            const etag = response.headers['etag'] || response.headers['ETag'] || `"part-${partNumber}"`;

            return {
                partNumber,
                etag: etag.replace(/"/g, ''), // Remove quotes if present
                size: partBlob.size,
            };
        } catch (error) {
            if (axios.isCancel(error)) {
                throw new Error(`Part ${partNumber} upload cancelled`);
            }
            throw new Error(
                `Part ${partNumber} upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    //   /**
    //    * Notify server that upload is complete
    //    */
    //   private async notifyUploadCompletion(notification: CompletionNotification): Promise<void> {
    //     try {
    //       await axios.post(`${this.baseUrl}/upload/complete`, notification);
    //     } catch (error) {
    //       console.error('Failed to notify server of upload completion:', error);
    //       // Don't throw error here as the file upload itself was successful
    //     }
    //   }

    /**
     * Cancel an active upload
     */
    cancelUpload(fileId: string): void {
        const abortController = this.activeUploads.get(fileId);
        if (abortController) {
            abortController.abort();
            this.activeUploads.delete(fileId);

            // Update progress to show cancelled status
            this.updateProgress(fileId, {
                fileId,
                fileName: 'Unknown', // We don't have access to fileName here
                progress: 0,
                uploadedBytes: 0,
                totalBytes: 0,
                status: 'error',
                error: 'Upload cancelled by user',
            });
        }
    }

    /**
     * Pause an upload (for multipart uploads)
     */
    pauseUpload(fileId: string): void {
        // Implementation would depend on your specific multipart upload strategy
        console.log(`Pausing upload for file ${fileId}`);
    }

    /**
     * Resume a paused upload
     */
    resumeUpload(fileId: string): void {
        // Implementation would depend on your specific multipart upload strategy
        console.log(`Resuming upload for file ${fileId}`);
    }
    /**
     * Complete a multipart upload
     */
    private async completeMultipartUpload(fileId: string, parts: UploadedPart[]): Promise<void> {
        try {
            // Sort parts by part number to ensure correct order
            const sortedParts = parts.sort((a, b) => a.partNumber - b.partNumber);

            // In a real implementation, you would call your backend API to complete the multipart upload
            // const completionData = {
            //   fileId,
            //   parts: sortedParts,
            // };
            // await this.apiUpload.completeMultipartUpload(completionData);

            console.log(`Multipart upload completed for file ${fileId} with ${sortedParts.length} parts`);
        } catch (error) {
            throw new Error(
                `Failed to complete multipart upload: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    /**
     * Utility methods
     */
    private updateProgress(fileId: string, progress: UploadProgress): void {
        const callback = this.uploadProgressCallbacks.get(fileId);
        if (callback) {
            callback(progress);
        }
    }

    private getFileExtension(fileName: string): string {
        return fileName.substring(fileName.lastIndexOf('.'));
    }

    /**
     * Upload multiple files with progress tracking
     */
    async uploadMultipleFiles(
        files: File[],
        onProgress?: (fileId: string, progress: UploadProgress) => void,
        onAllComplete?: (results: { fileId: string; success: boolean; error?: string }[]) => void,
    ): Promise<void> {
        const results: { fileId: string; success: boolean; error?: string }[] = [];

        const uploadPromises = files.map(async (file) => {
            const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            try {
                await this.uploadFile(file, (progress) => {
                    if (onProgress) {
                        onProgress(fileId, progress);
                    }
                });

                results.push({ fileId, success: true });
            } catch (error) {
                results.push({
                    fileId,
                    success: false,
                    error: error instanceof Error ? error.message : 'Upload failed',
                });
            }
        });

        await Promise.allSettled(uploadPromises);

        if (onAllComplete) {
            onAllComplete(results);
        }
    }
}

// Export singleton instance
export const uploadService = new UploadService();
export default UploadService;
