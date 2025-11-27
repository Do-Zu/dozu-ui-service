import { postRequest } from '@/api/api';
import { GeneratedShortSummarySchema } from '../schemas/note.schema';
import fileHelper from '@/utils/file.helper';
import { AxiosProgressEvent } from 'axios';

export const MAX_FILE_SIZE_MB = 1;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

class NoteUtils {
    public validateGeneratedSummary(data: unknown): { isValid: boolean; summary: string } {
        const parseResult = GeneratedShortSummarySchema.safeParse(data);
        if (!parseResult.success || parseResult.error) {
            return { isValid: false, summary: '' };
        }
        return { isValid: true, summary: parseResult.data[0].summary };
    }

    public async handleImageUpload(file: File, onProgress?: (event: { progress: number }) => void): Promise<string> {
        if (!file) {
            throw new Error('No file provided');
        }
        const formData = new FormData();
        fileHelper.validateFileSize(file, MAX_FILE_SIZE_MB);
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

export default new NoteUtils();
