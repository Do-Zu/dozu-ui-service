'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  File,
  X,
  Check,
  Info,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Axios from '@/api/axios';
import { toast } from '@/hooks/use-toast';

interface ImportPanelProps {
  onFileSelect?: (files: File[]) => void;
  onTextImport?: (text: string) => void;
  onGenerate?: (files: File[] | string) => Promise<void>;
  isProcessing?: boolean;
  processingProgress?: number;
  supportedFileTypes?: string[];
  maxFileSize?: number; // in MB
}

const CHUNK_SIZE = 5 * 1024 * 1024;

const ImportPanel: React.FC<ImportPanelProps> = ({
  onFileSelect = () => {},
  onTextImport = () => {},
  onGenerate,
  isProcessing = false,
  processingProgress = 0,
  supportedFileTypes = ['.txt', '.pdf', '.docx', '.mp3', '.mp4', '.doc'],
  maxFileSize = 50,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [importText, setImportText] = useState('');
  const [activeTab, setActiveTab] = useState<'files' | 'text'>('files');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFiles = useCallback(
    (files: File[]) => {
      setError(null);
      const validFiles = [];

      for (const file of files) {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!supportedFileTypes.includes(fileExtension)) {
          setError(
            `Unsupported file type: ${fileExtension}. Please use: ${supportedFileTypes.join(', ')}`,
          );
          continue;
        }

        if (file.size > maxFileSize * 1024 * 1024) {
          setError(`File too large: ${file.name}. Maximum size is ${maxFileSize}MB`);
          continue;
        }

        validFiles.push(file);
      }

      return validFiles;
    },
    [supportedFileTypes, maxFileSize],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = validateFiles(droppedFiles);

        if (validFiles.length > 0) {
          setSelectedFiles(validFiles);
          onFileSelect(validFiles);
        }
      }
    },
    [onFileSelect, validateFiles],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = validateFiles(selectedFiles);

        if (validFiles.length > 0) {
          setSelectedFiles(validFiles);
          onFileSelect(validFiles);
        }
      }
    },
    [onFileSelect, validateFiles],
  );

  const handleTextImport = useCallback(() => {
    if (importText.trim()) {
      onTextImport(importText);
      setImportText('');
    } else {
      setError('Please enter some text to import');
    }
  }, [importText, onTextImport]);

  const handleRemoveFile = useCallback(
    (index: number) => {
      const newFiles = [...selectedFiles];
      newFiles.splice(index, 1);
      setSelectedFiles(newFiles);
      onFileSelect(newFiles);
    },
    [selectedFiles, onFileSelect],
  );

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
      case 'txt':
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-5 w-5 text-gray-500" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <FileAudio className="h-5 w-5 text-gray-500" />;
      case 'mp4':
      case 'mov':
      case 'avi':
        return <FileVideo className="h-5 w-5 text-gray-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleGenerateContent = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);

      if (activeTab === 'files' && selectedFiles.length === 0) {
        setError('Please select at least one file to generate content');
        setIsGenerating(false);
        return;
      }

      if (activeTab === 'text' && !importText.trim()) {
        setError('Please enter some text to generate content');
        setIsGenerating(false);
        return;
      }

      // If onGenerate prop is provided, use it
      if (onGenerate) {
        await onGenerate(activeTab === 'files' ? selectedFiles : importText);
      } else {
        // Otherwise, implement default behavior
        await uploadAndGenerateContent();
      }

      toast({
        title: 'Content generation started',
        description: 'Your content is being processed',
      });
    } catch (err) {
      console.error('Error generating content:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const uploadAndGenerateContent = async () => {
    if (activeTab === 'files') {
      // For files, use chunked upload
      await Promise.all(selectedFiles.map(uploadLargeFile));
    } else {
      // For text, do a simple POST
      await uploadTextContent(importText);
    }
  };

  const uploadLargeFile = async (file: File) => {
    // Initialize progress tracking for this file
    setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

    // For very large files, use chunked upload
    if (file.size > CHUNK_SIZE) {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const fileId = `${file.name}-${Date.now()}`;
      try {
        // 1. Initialize upload session with metadata
        await fetch('/api/content/upload/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            fileType: file.type,
            fileSize: file.size,
            totalChunks,
            fileId,
          }),
        });

        // 2. Upload chunks
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append('chunk', chunk);
          formData.append('fileId', fileId);
          formData.append('chunkIndex', chunkIndex.toString());

          await fetch('/api/content/upload/chunk', {
            method: 'POST',
            body: formData,
          });

          // Update progress
          const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
          setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
        }

        // 3. Complete upload
        await fetch('/api/content/upload/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId }),
        });
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}`);
      }
    } else {
      // For smaller files, use direct upload
      const formData = new FormData();
      formData.append('file', file);

      try {
        await fetch('/api/content/upload', {
          method: 'POST',
          body: formData,
        });

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}`);
      }
    }
  };

  const uploadTextContent = async (text: string) => {
    try {
      await Axios.post('/generate/upload/text', { text });
    } catch (error) {
      console.error('Error uploading text:', error);
      throw new Error('Failed to upload text content');
    }
  };

  const renderGenerateButton = () => (
    <div className="mt-6">
      <Button
        onClick={handleGenerateContent}
        disabled={
          isGenerating ||
          isProcessing ||
          (activeTab === 'files' && selectedFiles.length === 0) ||
          (activeTab === 'text' && !importText.trim())
        }
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Content
          </>
        )}
      </Button>
      <p className="text-xs text-gray-500 text-center mt-2">
        Start processing your content to generate AI results
      </p>
    </div>
  );

  return (
    <Card className="w-full max-w-[1200px] mx-auto bg-gray-50">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">Import Learning Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Button
            variant={activeTab === 'files' ? 'default' : 'outline'}
            onClick={() => setActiveTab('files')}
            className={cn(
              'flex-1 bg-gray-700 hover:bg-gray-800',
              activeTab !== 'files' && 'bg-transparent text-gray-700 hover:bg-gray-200',
            )}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
          <Button
            variant={activeTab === 'text' ? 'default' : 'outline'}
            onClick={() => setActiveTab('text')}
            className={cn(
              'flex-1 bg-gray-700 hover:bg-gray-800',
              activeTab !== 'text' && 'bg-transparent text-gray-700 hover:bg-gray-200',
            )}
          >
            <FileText className="mr-2 h-4 w-4" />
            Paste Text
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-start">
            <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto p-0 h-5 w-5 text-red-500 hover:bg-red-100"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {activeTab === 'files' ? (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 transition-colors',
              dragActive ? 'border-gray-500 bg-gray-100' : 'border-gray-300',
              isProcessing && 'opacity-50 pointer-events-none',
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                Drag and drop your files here
              </h3>
              <p className="text-sm text-gray-500 mb-4">or click to browse from your computer</p>
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-100"
                disabled={isProcessing}
              >
                <label className="cursor-pointer">
                  Browse Files
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept={supportedFileTypes.join(',')}
                    disabled={isProcessing}
                  />
                </label>
              </Button>
              <p className="mt-4 text-xs text-gray-500">
                Supported formats: {supportedFileTypes.join(', ')} (Max: {maxFileSize}MB)
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                <ul className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                    >
                      <div className="flex items-center">
                        {getFileIcon(file.name)}
                        <span className="ml-2 text-sm text-gray-700 truncate max-w-[300px]">
                          {file.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleRemoveFile(index)}
                        disabled={isProcessing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isProcessing && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Processing files...</span>
                  <span>{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <textarea
              className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none bg-white"
              placeholder="Paste your text content here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              disabled={isProcessing}
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleTextImport}
                disabled={isProcessing || !importText.trim()}
                className="bg-gray-700 hover:bg-gray-800"
              >
                <Check className="mr-2 h-4 w-4" />
                Import Text
              </Button>
            </div>

            {isProcessing && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Processing text...</span>
                  <span>{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}
          </div>
        )}
      </CardContent>
      {renderGenerateButton()}
    </Card>
  );
};

export default ImportPanel;
