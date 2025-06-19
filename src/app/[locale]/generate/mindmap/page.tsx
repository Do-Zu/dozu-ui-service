'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import DialogImportFileGenerative from '@/components/generative/DialogImportFileGenerative';

export const FileUploadExample: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    console.log('Selected files:', files);

    // Here you would typically:
    // 1. Upload files to your server
    // 2. Process the files
    // 3. Update your application state

    // Example of processing files
    files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified),
      });
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-center">File Upload Demo</h2>

        <Button onClick={() => setIsDialogOpen(true)} className="w-full" size="lg">
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>

        <DialogImportFileGenerative
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onFilesSelected={handleFilesSelected}
          title="Import Documents"
          description="Upload your documents to process them. We support PDF, TXT, DOC, and DOCX files."
          maxFiles={3}
          allowMultiple={true}
        />
      </div>
    </div>
  );
};

export default FileUploadExample;
