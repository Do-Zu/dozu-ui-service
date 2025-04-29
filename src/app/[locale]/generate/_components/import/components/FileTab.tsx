'use client';

import React, { memo } from 'react';
import { Upload, X, File } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setFiles } from '@/stores/features/import-dialog/importDialogSlice';
import { toast } from '@/hooks/use-toast';
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE_MB,
  validateFileSize,
  validateFileType,
} from '../../../helper/validate';

const FileTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { importMethod, files } = useAppSelector((state) => state.importDialog);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);

      // Validate file types and sizes
      const invalidFiles = droppedFiles.filter(
        (file) => !validateFileType(file) || !validateFileSize(file),
      );

      if (invalidFiles.length > 0) {
        toast({
          title: 'Invalid files',
          description: `Some files were rejected. Only ${ALLOWED_FILE_TYPES.join(', ')} files up to ${MAX_FILE_SIZE_MB}MB are allowed.`,
          variant: 'destructive',
        });
        // Only keep valid files
        const validFiles = droppedFiles.filter(
          (file) => validateFileType(file) && validateFileSize(file),
        );
        dispatch(setFiles(validFiles));
      } else {
        dispatch(setFiles(droppedFiles));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);

      // Validate file types and sizes
      const invalidFiles = selectedFiles.filter(
        (file) => !validateFileType(file) || !validateFileSize(file),
      );

      if (invalidFiles.length > 0) {
        toast({
          title: 'Invalid files',
          description: `Some files were rejected. Only ${ALLOWED_FILE_TYPES.join(', ')} files up to ${MAX_FILE_SIZE_MB}MB are allowed.`,
          variant: 'destructive',
        });
        // Only keep valid files
        const validFiles = selectedFiles.filter(
          (file) => validateFileType(file) && validateFileSize(file),
        );
        dispatch(setFiles(validFiles));
      } else {
        dispatch(setFiles(selectedFiles));
      }
    }
  };

  return (
    <>
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center hover:opacity-70 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt"
        />
        <Upload className="h-10 w-10 mx-auto mb-4" />
        <h3 className="font-medium mb-1">Drag & drop files here</h3>
        <p className="text-sm mb-2">or click to browse your files</p>
        <p className="text-xs">Supports PDF, Word, and text files</p>
      </div>
      {files.length > 0 && importMethod === 'file' && (
        <div className="mt-4 text-left">
          <h4 className="text-sm font-medium mb-2">Selected files:</h4>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    const newFiles = [...files];
                    newFiles.splice(index, 1);
                    dispatch(setFiles(newFiles));
                  }}
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

export default memo(FileTab);
