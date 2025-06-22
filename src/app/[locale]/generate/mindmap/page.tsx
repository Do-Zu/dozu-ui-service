'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import DialogImportFileGenerative from '@/components/generative/DialogImportFileGenerative';
import useReaderFile from '@/hooks/useReaderFile';
import usePost from '@/hooks/usePost';
import { postRequest } from '@/api/api';
import { toast } from '@/hooks/use-toast';
import { STATUS_CODE } from '@/utils/constants/http';
import { MindmapData } from '../models/MindmapGeneratedResponseInterface';
import { IGenerateMindmapRequest } from '../models/GenerateMindmapRequestInterface';
import MindmapGeneratingSkeleton from '@/components/generative/MindmapGeneratingSkeleton';

export default function Page() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

    const { text, loading, error, hasFile, fileName, fileSize, fileType } = useReaderFile(selectedFile);

    const handleGenerate = async (request: IGenerateMindmapRequest) => {
        try {
            const { data, code, message } = await postRequest<IGenerateMindmapRequest, MindmapData>(
                '/generate/v1/mindmap/text',
                request,
            );

            if (code !== STATUS_CODE.OK) {
                throw new Error(message);
            }

            console.log(data);
        } catch (error) {
            toast({
                description: error instanceof Error ? error.message : 'An unexpected error occurred.',
                variant: 'destructive',
            });
        }
    };

    const { loading: isGenerating, data, error: errorGenerate, execute } = usePost(handleGenerate);

    const handleFilesSelected = (files: File[]) => {
        const file = files[0];

        if (file) {
            setSelectedFile(file);
        }

        setIsDialogOpen(false);
    };

    const onComplete = () => {
        setIsDialogOpen(false);
    };

    const handleFileChange = () => {
        setSelectedFile(undefined);
        setIsDialogOpen(true);
    };

    const getFileStatusIcon = () => {
        if (loading) return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
        if (error) return <AlertCircle className="h-4 w-4 text-red-500" />;
        if (text) return <CheckCircle className="h-4 w-4 text-green-500" />;
        return null;
    };

    useEffect(() => {
        if (!loading && text && !error) {
            const payload: IGenerateMindmapRequest = {
                content: text || '',
                fileName: selectedFile?.name || '',
                fileType: selectedFile?.type || '',
                type: 'mindmap',
            };

            execute(payload);
        }
    }, [text, loading, error]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-lg font-medium">Processing your file...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Please wait while we extract the content
                    </p>
                </div>
            </div>
        );
    }

    if (isGenerating) {
        return <MindmapGeneratingSkeleton />;
    }

    return (
        <div className="p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-center">File Upload Demo</h2>

                <Button onClick={() => setIsDialogOpen(true)} className="w-full" size="lg" disabled={loading}>
                    <Upload className="mr-2 h-4 w-4" />
                    {selectedFile ? 'Change File' : 'Upload Files'}
                </Button>

                {/* {hasFile && selectedFile && (
                    <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">{fileName}</span>
                                {getFileStatusIcon()}
                            </div>
                            <Button variant="outline" size="sm" onClick={handleFileChange} disabled={loading}>
                                Change
                            </Button>
                        </div>

                        <div className="text-sm text-gray-600">
                            Size: {fileSize ? (fileSize / 1024).toFixed(1) : '0'} KB | Type: {fileType || 'Unknown'}
                        </div>

                        {loading && <div className="text-blue-600 text-sm">Processing file...</div>}

                        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

                        {text && !loading && !error && (
                            <div className="space-y-2">
                                <div className="text-green-600 text-sm">
                                    ✓ Text extracted successfully ({text.length} characters)
                                </div>
                                <div className="bg-gray-50 p-3 rounded text-sm max-h-40 overflow-y-auto">
                                    <strong>Preview:</strong>
                                    <p className="mt-1 whitespace-pre-wrap">{text.length && text}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )} */}

                <DialogImportFileGenerative
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onFilesSelected={handleFilesSelected}
                    onComplete={onComplete}
                    title="Import Documents"
                    description="Upload your documents to process them. We support PDF, TXT, DOC, and DOCX files."
                    maxFiles={1}
                    allowMultiple={false}
                />
            </div>
        </div>
    );
}
