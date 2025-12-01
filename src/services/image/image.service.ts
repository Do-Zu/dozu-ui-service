import { postRequest } from '@/api/api';
import fileHelper from '@/utils/file.helper';
import { AxiosProgressEvent } from 'axios';

export interface ImageUploadPayload {
    file: File;
    maxSize?: number;
    onProgress?: (event: { progress: number }) => void;
}

export const MAX_IMAGE_SIZE_MB = 1;
export const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;

class ImageService {
    public async uploadImage(payload: ImageUploadPayload): Promise<string> {
        const { file, maxSize, onProgress } = payload;
        if (!file) {
            throw new Error('No file provided');
        }
        const maxSizeMb = maxSize ? maxSize / (1024 * 1024) : MAX_IMAGE_SIZE_MB;
        const formData = new FormData();
        fileHelper.validateFileSize(file, maxSizeMb);
        formData.append('file', file);

        const response = await postRequest<FormData, { imageUrl: string }>('/images', formData, {
            onUploadProgress: (event: AxiosProgressEvent) => {
                const { loaded, total } = event;
                if (total) {
                    const progress = Math.round((loaded / total) * 100);
                    onProgress?.({ progress });
                }
            },
        });
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data.imageUrl;
    }
}

export default new ImageService();
