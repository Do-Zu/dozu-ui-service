import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import uploadService from '@/services/upload';
import { isEmpty, isNilOrEmpty } from '@/utils';
import { UploadFileResponse } from '@/components/generative/types';

export interface UseUploadAttachmentFilesReturn {
    //  result:any;
    isLoading: boolean;
    execute: (files: File[]) => Promise<UploadFileResponse[]>;
}

const useUploadAttachmentFiles = (): UseUploadAttachmentFilesReturn => {
    const tCommon = useTranslations('common');
    const [isLoading, setIsLoading] = useState(false);

    const execute = async (files: File[]): Promise<UploadFileResponse[]> => {
        try {
            if (isEmpty(files)) {
                return [];
            }

            setIsLoading(true);
            const uploadPromises = files.map(async (file) => {
                const fileInfo = await uploadService.uploadFile(file);
                if (!fileInfo || Object.keys(fileInfo).length === 0) {
                    throw new Error(`File upload failed for ${file.name}`);
                }
                return fileInfo;
            });
            const fileInfos = await Promise.all(uploadPromises);

            return fileInfos;
        } catch (error) {
            const message = error instanceof Error ? error.message : tCommon('messages.createError');
            toast({ description: message });
            throw new Error('Files upload failed');
        } finally {
            // Always runs
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        execute,
    };
};

export default useUploadAttachmentFiles;
