'use client';

import React, { memo, useCallback, useState, useEffect } from 'react';
import { Upload, X, File, Loader2 } from 'lucide-react';
import { setFiles } from '@/app/[locale]/generate/stores/features/importDialogSlice';
import { toast } from '@/hooks/use-toast';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB, validateFileSize, validateFileType } from '../../../helper/validate';
import useReaderFile from '../../../hooks/useReaderFile';
import { useCardImportSelector, useCardImportDispatch } from '../../../hooks/useReduxStore';

interface FileUploadAreaProps {
    files: File[];
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveFile: (index: number, e: React.MouseEvent) => void;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    files,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleFileChange,
    handleRemoveFile,
}) => {
    const [isDragging, setIsDragging] = useState(false);

    // Global drag and drop listeners for full-screen effect
    useEffect(() => {
        const handleGlobalDragEnter = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer?.types.includes('Files')) {
                setIsDragging(true);
            }
        };

        const handleGlobalDragLeave = (e: DragEvent) => {
            e.preventDefault();
            // Check if we're leaving the document (not just an element)
            if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
                setIsDragging(false);
            }
        };

        const handleGlobalDrop = () => {
            setIsDragging(false);
        };

        document.addEventListener('dragenter', handleGlobalDragEnter);
        document.addEventListener('dragleave', handleGlobalDragLeave);
        document.addEventListener('drop', handleGlobalDrop);

        return () => {
            document.removeEventListener('dragenter', handleGlobalDragEnter);
            document.removeEventListener('dragleave', handleGlobalDragLeave);
            document.removeEventListener('drop', handleGlobalDrop);
        };
    }, []);

    return (
        <>
            {/* Full-screen overlay when dragging */}
            {isDragging && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={(e) => {
                        handleDragLeave(e);
                        // Only hide overlay if actually leaving the document
                        if (
                            e.clientX <= 0 ||
                            e.clientY <= 0 ||
                            e.clientX >= window.innerWidth ||
                            e.clientY >= window.innerHeight
                        ) {
                            setIsDragging(false);
                        }
                    }}
                    onDrop={(e) => {
                        handleDrop(e);
                        setIsDragging(false);
                    }}
                >
                    <div className="bg-slate-200 dark:bg-slate-600 p-12 rounded-lg border-1 border-dashed text-center">
                        <Upload className="h-20 w-20 mx-auto mb-6" />
                        <h2 className="text-gray-500 dark:text-gray-100 text-2xl font-bold mb-2">
                            Drop your file here
                        </h2>
                        <p className="text-gray-600">Release to upload</p>
                    </div>
                </div>
            )}

            {/* File list */}
            {files.length > 0 && (
                <div className="mt-4 text-left w-full">
                    <h4 className="text-sm font-medium mb-2">Selected file:</h4>
                    <ul className="space-y-1">
                        {files.map((file, index) => (
                            <li key={index} className="text-sm flex items-center justify-between">
                                <div className="flex items-center">
                                    <File className="h-4 w-4 mr-2" />
                                    {file.name}
                                    <span className="ml-2 text-xs text-gray-500">
                                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleRemoveFile(index, e)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
};

const FileTab: React.FC = () => {
    const dispatch = useCardImportDispatch();
    const { files } = useCardImportSelector((state) => state.importDialog);

    const { text, loading: isLoadingExtractFile, error: errorExtractFile } = useReaderFile();

    const processFiles = useCallback(
        (fileList: File[]) => {
            // Only process the first file if multiple files are somehow provided
            const file = fileList[0];

            // Validate file type and size
            if (!validateFileType(file) || !validateFileSize(file)) {
                toast({
                    title: 'Invalid file',
                    description: `File rejected. Only ${ALLOWED_FILE_TYPES.join(', ')} files up to ${MAX_FILE_SIZE_MB}MB are allowed.`,
                    variant: 'destructive',
                });
                dispatch(setFiles([]));
            } else {
                dispatch(setFiles([file]));
            }
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
            {/* Loading overlay */}
            {isLoadingExtractFile && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium">Processing your file...</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Please wait while we extract the content
                        </p>
                    </div>
                </div>
            )}

            {/* Regular upload area */}
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
