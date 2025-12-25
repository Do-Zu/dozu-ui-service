'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useActionStore } from './context/ActionContext';
import { useTranslations } from 'next-intl';
import uploadService from '@/services/upload';
import topicService from '@/services/topic/topic.service';
import { resourceService } from './services/contentCreation.service';
import { Modal } from '@/components/modal/Modal';

import {
    ALLOWED_FILE_TYPES,
    FILE_FORMAT,
    FILE_TYPES_NOT_CONVERT,
    getFileExtension,
    MAX_FILE_SIZE_MB,
    validateFileSize,
    validateFileType,
} from './constants/validate';

import { useUploadConvertFile } from './hooks/useUploadConvertFileFormat';
import { compareIgnoreCapitalization, truncate } from '@/utils';
import { blobToFile, getFileNameWithoutExtension } from './helper/helper';
import { RESOURCE_CONTENT_TYPE, IMPORT_METHOD } from './constants/resource';
import { UploadCloud } from 'lucide-react';
import LoadingOverlay from '@/components/loading/LoadingOverLay';

import { toast } from 'sonner';
import useToastManager from './hooks/useToastManager';
import RenderProgress from './components/upload/RenderProgress';

export const UploadModal: React.FC = () => {
    const t = useTranslations('generate.fileTab');

    const {
        showUpload: isOpen,
        setShowUpload: setIsOpen,
        isProcessing,
        setProcessingType,
        redirectTopicWorkspace,
    } = useActionStore((state) => state);

    const [isDragging, setIsDragging] = useState(false);

    const { upload, loading: isConverting } = useUploadConvertFile({
        url: '/convert/file',
    });

    const toastManager = useToastManager();

    const handleProcessingContent = async (file: File) => {
        try {
            setProcessingType(IMPORT_METHOD.FILE);

            const fileName = getFileNameWithoutExtension(file.name);

            toastManager.showProgress('Creating topic workspace...');

            const topic = await topicService.createTopic({
                name: fileName,
                description: '',
            });

            const { topicId } = topic;

            const uploadToastId = toastManager.showProgress(`Starting Upload ${truncate(fileName, 50)}...`);

            setIsOpen(false);

            const fileUploadResult = await uploadService.uploadFile(file, ({ progress }) => {
                toastManager.updateProgress(uploadToastId, `Uploading ${truncate(fileName, 50)}... ${progress}%`);
            });

            toastManager.showProgress('Adding content to workspace...');

            await resourceService.insertContentTopic({
                contentType: RESOURCE_CONTENT_TYPE.FILE,
                payload: fileUploadResult,
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

    const processFiles = useCallback(async (fileList: File[]) => {
        // Only process the first file if multiple files are somehow provided
        let file = fileList[0];

        if (!validateFileType(file) || !validateFileSize(file)) {
            toast(
                t('validations.fileRejected', {
                    types: ALLOWED_FILE_TYPES.join(', '),
                    size: MAX_FILE_SIZE_MB,
                }),
            );

            return;
        }

        //Convert all file type into PDF format
        if (!compareIgnoreCapitalization(getFileExtension(file), FILE_TYPES_NOT_CONVERT)) {
            const arrayBuffer = await upload(file);

            if (!arrayBuffer) {
                toast(t('toasts.convertFailed'));
                return;
            }

            const blob = new Blob([arrayBuffer], { type: FILE_FORMAT });

            file = blobToFile(blob, file.name);
        }

        await handleProcessingContent(file);
    }, []);

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

    useEffect(() => {
        const id = 'FILE_CONVERTING_FILE_TOAST';
        if (isConverting) toast(<RenderProgress message="Converting..." />, { id, duration: Infinity });
        else toast.dismiss(id);
    }, [isConverting]);

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            body={
                <div
                    className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl p-8 transition-colors hover:opacity-70 ${
                        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                    }`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    {isProcessing() && <LoadingOverlay />}

                    <div className="mb-4 rounded-full bg-muted p-4">
                        <UploadCloud className="size-8 text-muted-foreground" />
                    </div>
                    <p className="mb-1 text-center text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="mb-4 text-center text-xs text-muted-foreground">PDF, Doc, Txt</p>

                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept={ALLOWED_FILE_TYPES.join(',')}
                    />
                </div>
            }
        />
    );
};
