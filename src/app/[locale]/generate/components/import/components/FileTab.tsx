'use client';

import React, { memo, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Upload } from 'lucide-react';
import { resetImportDialog, setFiles } from '@/app/[locale]/generate/stores/features/importDialogSlice';
import { toast } from '@/hooks/use-toast';
import {
    ALLOWED_FILE_TYPES,
    FILE_FORMAT,
    FILE_TYPES_NOT_CONVERT,
    getFileExtension,
    MAX_FILE_SIZE_MB,
    validateFileSize,
    validateFileType,
} from '../../../helper/validate';
import useReaderFile from '../../../hooks/useReaderFile';
import { useCardImportSelector, useCardImportDispatch } from '../../../hooks/useReduxStore';
import FileUploadArea from './FileUploadArea';
import LoadingOverlay from './LoadingOverlay';
import { useUploadConvertFile } from '../../../hooks/useUploadConvertFileFormat';
import { compareIgnoreCapitalization } from '@/utils';
import { blobToFile } from '../../../utils/helper';

const FileTab: React.FC = () => {
    const dispatch = useCardImportDispatch();
    const t = useTranslations('generate.fileTab');
    const { files } = useCardImportSelector((state) => state.importDialog);
    const { loading: isLoadingExtractFile, error: errorExtractFile } = useReaderFile();

    const { upload, loading: isConverting } = useUploadConvertFile({
        url: '/convert/file',
    });

    const handleFileUpload = async (file: File) => {
        try {
            dispatch(setFiles([file]));
        } catch {
            toast({
                description: t('toasts.uploadFailed'),
                variant: 'destructive',
            });
            dispatch(setFiles([]));
        }
    };

    const processFiles = useCallback(
        async (fileList: File[]) => {
            // Only process the first file if multiple files are somehow provided
            let file = fileList[0];

            // Validate file type and size
            if (!validateFileType(file) || !validateFileSize(file)) {
                toast({
                    description: t('validations.fileRejected', {
                        types: ALLOWED_FILE_TYPES.join(', '),
                        size: MAX_FILE_SIZE_MB,
                    }),
                    variant: 'destructive',
                });
                dispatch(setFiles([]));
                return;
            }

            //Convert all file type into PDF format
            if (!compareIgnoreCapitalization(getFileExtension(file), FILE_TYPES_NOT_CONVERT)) {
                const arrayBuffer = await upload(file);

                if (!arrayBuffer) {
                    dispatch(resetImportDialog());
                    toast({
                        description: t('toasts.convertFailed'),
                    });
                    return;
                }

                const blob = new Blob([arrayBuffer], { type: FILE_FORMAT });

                file = blobToFile(blob, file.name);
            }

            await handleFileUpload(file);
        },
        [dispatch],
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

    const handleRemoveFile = useCallback(
        (index: number, e: React.MouseEvent) => {
            e.stopPropagation();
            const newFiles = [...files];
            newFiles.splice(index, 1);
            dispatch(setFiles(newFiles));
        },
        [files, dispatch],
    );

    useEffect(() => {
        if (errorExtractFile) {
            toast({
                description: errorExtractFile,
                variant: 'destructive',
            });
        }
    }, [errorExtractFile]);

    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <div
                className="border-2 border-dashed rounded-lg p-8 text-center hover:opacity-70 transition-colors cursor-pointer w-full"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
            >
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                />
                <Upload className="h-10 w-10 mx-auto mb-4" />
                <h3 className="font-medium mb-1">{t('ui.dragDrop.title')}</h3>
                <p className="text-sm mb-2">{t('ui.dragDrop.subtitle')}</p>
                <p className="text-xs">{t('ui.dragDrop.supported')}</p>
            </div>

            {(isLoadingExtractFile || isConverting) && (
                <LoadingOverlay
                    title={isLoadingExtractFile ? t('loading.processing.title') : t('loading.converting.title')}
                    description={t('loading.processing.description')}
                />
            )}

            {!isLoadingExtractFile && !isConverting && (
                <FileUploadArea
                    files={files}
                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                    handleDragEnter={handleDragEnter}
                    handleDragLeave={handleDragLeave}
                    handleFileChange={handleFileChange}
                    handleRemoveFile={handleRemoveFile}
                />
            )}
        </div>
    );
};

export default memo(FileTab);
