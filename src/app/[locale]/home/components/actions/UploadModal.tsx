'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { useActionStore } from './context/ActionContext';
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
import { useTranslations } from 'next-intl';
import { compareIgnoreCapitalization } from '@/utils';
import { blobToFile } from './helper/helper';
import LoadingOverlay from '@/components/loading/LoadingOverLay';
import uploadService from '@/services/upload';
import topicService from '@/services/topic/topic.service';
import { resourceService } from './services/contentCreation.service';
import { RESOURCE_CONTENT_TYPE } from './constants/resource';
import { toast } from '@/hooks/use-toast';
import FileUploadArea from './components/FileUploadArea';

export const UploadModal: React.FC = () => {
    const t = useTranslations('generate.fileTab');

    const {
        showUpload: isOpen,
        setShowUpload: setIsOpen,
        isProcessing,
        setIsProcessing,
        redirectTopicWorkspace,
    } = useActionStore((state) => state);

    const [isDragging, setIsDragging] = useState(false);

    const { upload, loading: isConverting } = useUploadConvertFile({
        url: '/convert/file',
    });

    const handleProcessingContent = async (file: File) => {
        try {
            setIsProcessing(true);

            const fileName = file.name;

            const fileUploadResult = await uploadService.uploadFile(file);

            const topic = await topicService.createTopic({
                name: fileName,
                description: '',
            });

            const { topicId } = topic;

            await resourceService.insertContentTopic({
                contentType: RESOURCE_CONTENT_TYPE.FILE,
                payload: fileUploadResult,
                topicId,
            });

            redirectTopicWorkspace(topicId);
        } catch (error) {
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const processFiles = useCallback(async (fileList: File[]) => {
        // Only process the first file if multiple files are somehow provided
        let file = fileList[0];

        if (!validateFileType(file) || !validateFileSize(file)) {
            toast({
                description: t('validations.fileRejected', {
                    types: ALLOWED_FILE_TYPES.join(', '),
                    size: MAX_FILE_SIZE_MB,
                }),
                variant: 'destructive',
            });

            return;
        }

        //Convert all file type into PDF format
        if (!compareIgnoreCapitalization(getFileExtension(file), FILE_TYPES_NOT_CONVERT)) {
            const arrayBuffer = await upload(file);

            if (!arrayBuffer) {
                toast({
                    description: t('toasts.convertFailed'),
                });
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
            toast({
                description: 'Converting...',
            });
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
                    {isProcessing && <LoadingOverlay />}

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
