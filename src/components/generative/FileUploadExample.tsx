'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogImportFileGenerative } from './DialogImportFileGenerative';
import { CloudUpload, FileText, CheckCircle } from 'lucide-react';

export const FileUploadExample: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    console.log('Selected files:', files);
    setUploadedFiles(prev => [...prev, ...files]);

    // Here you would typically:
    // 1. Files have already been uploaded to cloud storage via presigned URLs
    // 2. Server has been notified of successful uploads
    // 3. You can now process the files or update your application state

    // Example of processing files
    files.forEach((file, index) => {
      console.log(`Uploaded file ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified),
      });
    });
  };

  const clearUploadedFiles = () => {
    setUploadedFiles([]);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Cloud File Upload Demo
          </h2>
          <p className="text-gray-600">
            Upload files directly to Google Cloud Storage using presigned URLs
          </p>
        </div>

        {/* Upload Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="w-full max-w-md"
            size="lg"
          >
            <CloudUpload className="mr-2 h-5 w-5" />
            Upload Files to Cloud
          </Button>
        </div>

        {/* Features List */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Presigned URL Upload</p>
                <p className="text-xs text-gray-600">Secure, server-controlled uploads</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Multipart Upload</p>
                <p className="text-xs text-gray-600">For large files with resume capability</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Progress Tracking</p>
                <p className="text-xs text-gray-600">Real-time upload progress</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">File Validation</p>
                <p className="text-xs text-gray-600">Type and size validation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Files Display */}
        {uploadedFiles.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-green-800">
                Successfully Uploaded Files ({uploadedFiles.length})
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearUploadedFiles}
              >
                Clear List
              </Button>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`}
                  className="flex items-center space-x-3 p-2 bg-white rounded border"
                >
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Dialog */}
        <DialogImportFileGenerative
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onFilesSelected={handleFilesSelected}
          title="Upload Documents to Cloud"
          description="Upload your documents directly to Google Cloud Storage. We support PDF, TXT, DOC, and DOCX files up to 50MB each."
          maxFiles={10}
          allowMultiple={true}
        />
      </div>
    </div>
  );
};

export default FileUploadExample;
