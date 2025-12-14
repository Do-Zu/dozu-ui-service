import topicService from '@/services/topic/topic.service';
import { IMPORT_METHOD, RESOURCE_CONTENT_TYPE } from '../constants/resource';
import { useActionStore } from '../context/ActionContext';
import { getFileNameWithoutExtension } from '../helper/helper';
import useToastManager from './useToastManager';
import { truncate } from '@/utils';
import uploadService from '@/services/upload';
import audioTranscriptionService from '@/app/[locale]/topics/[topicId]/(topic)/service/audioTranscription.service';
import { MediaResourceMetadata } from '../types/resource.type';
import { resourceService } from '../services/contentCreation.service';
import { useCallback, useState } from 'react';
import { ALLOWED_AUDIO_TYPES, MAX_MEDIA_SIZE_MB, validateFileSize, validateMediaType } from '../constants/validate';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function useUploadAudioFile() {
    const t = useTranslations('generate.fileTab');
    const toastManager = useToastManager();

    const [isDragging, setIsDragging] = useState(false);

    const { setShowMedia: setIsOpen, setProcessingType, redirectTopicWorkspace } = useActionStore((state) => state);

    const handleProcessingContent = async (audioFile: File) => {
        try {
            setProcessingType(IMPORT_METHOD.MEDIA);
            const fileName = getFileNameWithoutExtension(audioFile.name);

            // step 1: create new topic using name from selected file
            toastManager.showProgress('Creating topic workspace...');
            const topic = await topicService.createTopic({ name: fileName, description: '' });

            const { topicId } = topic;

            const uploadToastId = toastManager.showProgress(`Starting Upload ${truncate(fileName, 50)}...`);

            setIsOpen(false);

            // step 2: upload file
            const fileUploadResult = await uploadService.uploadFile(audioFile, ({ progress }) => {
                toastManager.updateProgress(uploadToastId, `Uploading ${truncate(fileName, 50)}... ${progress}%`);
            });

            toastManager.showProgress('Adding content to workspace...');

            // step 3: get audio transcript segments
            const transcriptSegments = await audioTranscriptionService.getTranscripSegmentsFromAudio({
                audioFile,
            });

            // step 4: insert input set
            const payload: MediaResourceMetadata = { ...fileUploadResult, content: transcriptSegments };

            await resourceService.insertContentTopic({
                contentType: RESOURCE_CONTENT_TYPE.MEDIA,
                payload,
                topicId,
            });

            toastManager.dismissAll();
            toastManager.showSuccess('Ready! Redirecting to workspace...');

            redirectTopicWorkspace(topicId);
        } catch {
            toastManager.dismissAll();
            toastManager.showError('Processing failed. Please try again.');
        } finally {
            setProcessingType(null);
        }
    };

    const processFiles = useCallback(
        async (fileList: File[]) => {
            const file = fileList[0];

            if (!validateMediaType(file, 'audio') || !validateFileSize(file, { isMedia: true })) {
                toast(
                    t('validations.fileRejected', {
                        types: ALLOWED_AUDIO_TYPES.join(', '),
                        size: MAX_MEDIA_SIZE_MB,
                    }),
                );

                return;
            }

            await handleProcessingContent(file);
        },
        [t, handleProcessingContent],
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                const selectedFiles = Array.from(e.target.files);
                processFiles(selectedFiles);
            }
        },
        [processFiles],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const droppedFiles = Array.from(e.dataTransfer.files);
                processFiles(droppedFiles);
            }
        },
        [processFiles],
    );

    return {
        isDragging,
        handleProcessingContent,
        processFiles,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        handleFileChange,
        handleDrop,
    };
}
