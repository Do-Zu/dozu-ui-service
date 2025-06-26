'use client';

import React, { memo, useCallback, useState, useEffect } from 'react';
import { Upload, CloudUpload } from 'lucide-react';
import { setFiles } from '@/app/[locale]/generate/stores/features/importDialogSlice';
import { toast } from '@/hooks/use-toast';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB, validateFileSize, validateFileType } from '../../../helper/validate';
import useReaderFile from '../../../hooks/useReaderFile';
import { useCardImportSelector, useCardImportDispatch } from '../../../hooks/useReduxStore';
import FileUploadArea from './FileUploadArea';
import LoadingOverlay from './LoadingOverlay';
import uploadService from '@/services/upload';

const FileTab: React.FC = () => {
    const dispatch = useCardImportDispatch();
    const { files } = useCardImportSelector((state) => state.importDialog);
    const [isUploading, setIsUploading] = useState(false);
    const { text, loading: isLoadingExtractFile, error: errorExtractFile } = useReaderFile();

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const result = await uploadService.uploadFile(file);

            if (!result || !result.fileName) {
                throw new Error('File upload failed');
            }

            dispatch(setFiles([file]));
        } catch (error) {
            toast({
                description: 'Failed to upload file. Please try again.',
                variant: 'destructive',
            });
            dispatch(setFiles([]));
        } finally {
            setIsUploading(false);
        }
    };

    const processFiles = useCallback(
        async (fileList: File[]) => {
            // Only process the first file if multiple files are somehow provided
            const file = fileList[0];

            // Validate file type and size
            if (!validateFileType(file) || !validateFileSize(file)) {
                toast({
                    description: `File rejected. Only ${ALLOWED_FILE_TYPES.join(', ')} files up to ${MAX_FILE_SIZE_MB}MB are allowed.`,
                    variant: 'destructive',
                });
                dispatch(setFiles([]));
                return;
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
                <h3 className="font-medium mb-1">Drag & drop a file here</h3>
                <p className="text-sm mb-2">or click to browse your files</p>
                <p className="text-xs">Supports PDF, Word, and text files</p>
            </div>

            {isUploading && (
                <LoadingOverlay title="Uploading your file..." description="Please wait while we upload the content" />
            )}

            {isLoadingExtractFile && (
                <LoadingOverlay
                    title="Processing your file..."
                    description="Please wait while we extract the content"
                />
            )}

            {!isLoadingExtractFile && (
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
