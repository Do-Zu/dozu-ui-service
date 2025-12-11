'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { UploadCloud, Loader } from 'lucide-react';
import { toast } from 'sonner';

import LoadingOverlay from '@/components/loading/LoadingOverLay';

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

    const toastManager = useMemo(
        () => ({
            ids: [] as (string | number)[],

            renderProgress: (message: string, isProcessing = false) => (
                <div className="flex items-center gap-2">
                    {isProcessing && <Loader className="h-4 w-4 animate-spin" />}
                    <span>{message}</span>
                </div>
            ),

            showProgress: (message: string) => {
                const id = toast(toastManager.renderProgress(message, true), { duration: Infinity });
                toastManager.ids.push(id);
                return id;
            },

            updateProgress: (id: string | number, message: string) => {
                toast(toastManager.renderProgress(message), { id, duration: Infinity });
            },

            dismissAll: () => {
                toastManager.ids.forEach((id) => toast.dismiss(id));
            },

            showSuccess: (message: string) => {
                toast.info(toastManager.renderProgress(message), { duration: 2000 });
            },

            showError: (message: string) => {
                toast.error(toastManager.renderProgress(message), { duration: 4000 });
            },
        }),
        [],
    );

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
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
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
        if (isConverting) {
            toast('Converting...');
        }
    }, [isConverting]);

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            body={
                <div
                    className={`mt-4 rounded-3xl p-8 flex flex-col items-center justify-center transition-colors hover:opacity-70 cursor-pointer ${
                        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                    }`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    {isProcessing() && <LoadingOverlay />}

                    <div className="p-4 rounded-full bg-muted mb-4">
                        <UploadCloud className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-center mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground text-center mb-4">PDF, Doc, Txt</p>

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
