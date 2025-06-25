'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Upload,
    File,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    FileText,
    FileImage,
    Cloud,
    CloudUpload,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { uploadService, UploadProgress } from '@/services/upload/upload.service';
import { UploadProgressComponent } from './UploadProgressComponent';
import { UploadFileResponse } from './types';

// File validation constants
const MAX_FILE_SIZE_MB = 50;
const ALLOWED_FILE_TYPES = ['.pdf', '.txt', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface FileUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFilesSelected: (files: File[]) => void;
    onComplete?: () => void;
    title?: string;
    description?: string;
    maxFiles?: number;
    allowMultiple?: boolean;
}

interface FileItem {
    file: File;
    id: string;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    uploadProgress?: UploadProgress;
    uploadId?: string;
}

const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            return <File className="h-5 w-5 text-red-500" />;
        case 'doc':
        case 'docx':
            return <FileImage className="h-5 w-5 text-blue-500" />;
        case 'txt':
            return <FileText className="h-5 w-5 text-gray-500" />;
        default:
            return <File className="h-5 w-5 text-gray-500" />;
    }
};

const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
        return {
            isValid: false,
            error: `File size must be less than ${MAX_FILE_SIZE_MB}MB`,
        };
    }

    // Check file type by extension
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
        return {
            isValid: false,
            error: `File type not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
        };
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: `Invalid file format. Please upload a valid ${fileExtension} file`,
        };
    }

    return { isValid: true };
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DialogImportFile: React.FC<FileUploadDialogProps> = ({
    open,
    onOpenChange,
    onFilesSelected,
    onComplete = () => {},
    title = 'Upload Files',
    description = 'Select files to upload. Supports PDF, TXT, DOC, and DOCX files up to 50MB each.',
    maxFiles = 5,
    allowMultiple = true,
}) => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setFiles([]);
            setIsDragging(false);
            setDragCounter(0);
            setIsUploading(false);
            setUploadProgress(new Map());
        }
    }, [open]);

    const handleFiles = useCallback(
        (fileList: FileList | File[]) => {
            const newFiles: FileItem[] = [];
            const filesToProcess = Array.from(fileList);

            // Check if we exceed max files
            if (files.length + filesToProcess.length > maxFiles) {
                toast({
                    title: 'Too many files',
                    description: `You can only upload up to ${maxFiles} files`,
                    variant: 'destructive',
                });
                return;
            }
            filesToProcess.forEach((file) => {
                const validation = validateFile(file);
                const fileItem: FileItem = {
                    file,
                    id: `${file.name}-${Date.now()}-${Math.random()}`,
                    status: validation.isValid ? 'pending' : 'error',
                    error: validation.error,
                };

                newFiles.push(fileItem);

                if (!validation.isValid) {
                    toast({
                        title: 'Invalid file',
                        description: `${file.name}: ${validation.error}`,
                        variant: 'destructive',
                    });
                }
            });

            setFiles((prev) => [...prev, ...newFiles]);
        },
        [files.length, maxFiles],
    );

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => prev + 1);
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => {
            const newCounter = prev - 1;
            if (newCounter === 0) {
                setIsDragging(false);
            }
            return newCounter;
        });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            setDragCounter(0);

            const droppedFiles = e.dataTransfer.files;
            if (droppedFiles.length > 0) {
                handleFiles(droppedFiles);
            }
        },
        [handleFiles],
    );

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = e.target.files;
            if (selectedFiles && selectedFiles.length > 0) {
                handleFiles(selectedFiles);
            }
            // Reset input value to allow selecting the same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [handleFiles],
    );

    const removeFile = useCallback((fileId: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        setUploadProgress((prev) => {
            const newMap = new Map(prev);
            newMap.delete(fileId);
            return newMap;
        });
    }, []);

    const cancelUpload = useCallback(
        (fileId: string) => {
            const fileItem = files.find((f) => f.id === fileId);
            if (fileItem?.uploadId) {
                uploadService.cancelUpload(fileItem.uploadId);
            }

            setFiles((prev) =>
                prev.map((f) => (f.id === fileId ? { ...f, status: 'error' as const, error: 'Upload cancelled' } : f)),
            );
        },
        [files],
    );

    const retryUpload = useCallback(
        async (fileId: string) => {
            const fileItem = files.find((f) => f.id === fileId);
            if (!fileItem) return;

            setFiles((prev) =>
                prev.map((f) => (f.id === fileId ? { ...f, status: 'uploading' as const, error: undefined } : f)),
            );

            try {
                const uploadResult = await uploadService.uploadFile(fileItem.file, (progress) => {
                    setUploadProgress((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(fileId, progress);
                        return newMap;
                    });

                    setFiles((prevFiles) =>
                        prevFiles.map((f) => (f.id === fileId ? { ...f, uploadProgress: progress } : f)),
                    );
                });

                if (!uploadResult) {
                    throw new Error('Upload failed');
                }

                onComplete();

                toast({
                    title: 'Upload successful',
                    description: `${fileItem.file.name} uploaded successfully`,
                });
            } catch (error) {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileId
                            ? {
                                  ...f,
                                  status: 'error' as const,
                                  error: error instanceof Error ? error.message : 'Upload failed',
                              }
                            : f,
                    ),
                );

                toast({
                    title: 'Upload failed',
                    description: error instanceof Error ? error.message : `Failed to upload ${fileItem.file.name}`,
                    variant: 'destructive',
                });
            }
        },
        [files],
    );

    const handleUpload = useCallback(async () => {
        const validFiles = files.filter((f) => f.status === 'pending').map((f) => f.file);
        if (validFiles.length === 0) {
            toast({
                description: 'Please select at least one valid file to upload',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);

        try {
            // Upload files one by one (you can modify this to upload in parallel if needed)
            const uploadResults: UploadFileResponse[] = [];

            for (const file of validFiles) {
                const fileItem = files.find((f) => f.file === file);
                if (!fileItem) continue;

                // Update file status to uploading
                setFiles((prev) =>
                    prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'uploading' as const } : f)),
                );

                try {
                    const uploadResult = await uploadService.uploadFile(file, (progress) => {
                        setUploadProgress((prev) => {
                            const newMap = new Map(prev);
                            newMap.set(fileItem.id, progress);
                            return newMap;
                        });
                        // Update file item with progress
                        setFiles((prevFiles) =>
                            prevFiles.map((f) => (f.id === fileItem.id ? { ...f, uploadProgress: progress } : f)),
                        );
                    });

                    uploadResults.push(uploadResult);

                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileItem.id
                                ? {
                                      ...f,
                                      status: 'completed' as const,
                                  }
                                : f,
                        ),
                    );
                } catch (error) {
                    console.error(`Failed to upload ${file.name}:`, error);

                    // Update file status to error
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileItem.id
                                ? {
                                      ...f,
                                      status: 'error' as const,
                                      error: error instanceof Error ? error.message : 'Upload failed',
                                  }
                                : f,
                        ),
                    );

                    toast({
                        description: `Failed to upload ${file.name}`,
                        variant: 'destructive',
                    });
                }
            }

            if (!allowMultiple) {
                onFilesSelected(files?.map((f) => f.file));
                onComplete();
            }

            // Check if all files were uploaded successfully
            // const completedFiles = files.filter((f) => f.status === 'completed');

            // if (completedFiles.length > 0) {
            //     toast({
            //         description: `Successfully uploaded ${completedFiles.length} file(s)`,
            //     });

            //     onFilesSelected(completedFiles.map((f) => f.file));

            //     setTimeout(() => {
            //         onOpenChange(false);
            //     }, 1500);
            // }

            // onComplete();
        } catch (error) {
            toast({
                title: 'Upload failed',
                description: 'An unexpected error occurred during upload',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    }, [files, onFilesSelected, onOpenChange]);

    const validFileCount = files.filter((f) => f.status === 'pending' || f.status === 'completed').length;
    const completedFileCount = files.filter((f) => f.status === 'completed').length;
    const hasErrors = files.some((f) => f.status === 'error');
    const hasUploading = files.some((f) => f.status === 'uploading');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    {/* Upload Area */}
                    <div
                        className={cn(
                            'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer',
                            isDragging
                                ? 'border-primary bg-primary/5 scale-105'
                                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
                            files.length > 0 && 'mb-6',
                        )}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileInputChange}
                            accept={ALLOWED_FILE_TYPES.join(',')}
                            multiple={allowMultiple}
                        />

                        <div className="flex flex-col items-center justify-center space-y-3">
                            <div
                                className={cn(
                                    'w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                                    isDragging
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-muted-foreground/25 text-muted-foreground',
                                )}
                            >
                                {isUploading ? (
                                    <CloudUpload className="h-8 w-8 animate-pulse" />
                                ) : (
                                    <Upload className="h-8 w-8" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">
                                    {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                                </p>
                                <p className="text-xs text-muted-foreground">or click to browse your files</p>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>Supported formats: PDF, TXT, DOC, DOCX</p>
                                <p>Maximum file size: {MAX_FILE_SIZE_MB}MB</p>
                                {allowMultiple && <p>Maximum files: {maxFiles}</p>}
                            </div>
                        </div>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium">
                                Selected Files ({completedFileCount}/{validFileCount})
                                {isUploading && <span className="text-blue-600 ml-2">Uploading...</span>}
                            </h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {files.map((fileItem) => {
                                    const progress = uploadProgress.get(fileItem.id);

                                    if (fileItem.status === 'uploading' && progress) {
                                        return (
                                            <UploadProgressComponent
                                                key={fileItem.id}
                                                progress={progress}
                                                onCancel={() => cancelUpload(fileItem.id)}
                                                compact={true}
                                            />
                                        );
                                    }

                                    return (
                                        <div
                                            key={fileItem.id}
                                            className={cn(
                                                'flex items-center justify-between p-3 rounded-lg border',
                                                fileItem.status === 'completed' && 'border-green-200 bg-green-50',
                                                fileItem.status === 'pending' && 'border-blue-200 bg-blue-50',
                                                fileItem.status === 'error' && 'border-red-200 bg-red-50',
                                            )}
                                        >
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                {getFileIcon(fileItem.file.name)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(fileItem.file.size)}
                                                    </p>
                                                    {fileItem.error && (
                                                        <p className="text-xs text-red-600 mt-1">{fileItem.error}</p>
                                                    )}
                                                    {fileItem.status === 'completed' && (
                                                        <p className="text-xs text-green-600 mt-1">
                                                            ✓ Upload completed
                                                        </p>
                                                    )}
                                                    {fileItem.status === 'pending' && (
                                                        <p className="text-xs text-blue-600 mt-1">Ready to upload</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {fileItem.status === 'completed' && (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                )}
                                                {fileItem.status === 'pending' && (
                                                    <Cloud className="h-4 w-4 text-blue-600" />
                                                )}
                                                {fileItem.status === 'error' && (
                                                    <>
                                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => retryUpload(fileItem.id)}
                                                            className="h-6 w-6 p-0 text-xs"
                                                        >
                                                            Retry
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(fileItem.id)}
                                                    className="h-8 w-8 p-0"
                                                    disabled={fileItem.status === 'uploading'}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={validFileCount === 0 || isUploading || hasUploading}
                        className="min-w-[120px]"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <CloudUpload className="mr-2 h-4 w-4" />
                                Upload {validFileCount > 0 && `(${validFileCount})`}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DialogImportFile;
