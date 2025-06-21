import { ApiResponse } from '@/api/type';

export interface FileUploadDialogProps {
  /** Controls the open state of the dialog */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when files are selected and validated */
  onFilesSelected: (files: File[]) => void;
  /** Dialog title */
  title?: string;
  /** Dialog description */
  description?: string;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Whether multiple files can be selected */
  allowMultiple?: boolean;
}

export interface FileItem {
  /** The actual File object */
  file: File;
  /** Unique identifier for the file */
  id: string;
  /** Current status of the file */
  status: 'uploading' | 'success' | 'error';
  /** Error message if status is 'error' */
  error?: string;
}

export interface FileValidationResult {
  /** Whether the file passed validation */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
}

export interface FileUploadConfig {
  /** Maximum file size in MB */
  maxFileSizeMB: number;
  /** Allowed file extensions */
  allowedExtensions: string[];
  /** Allowed MIME types */
  allowedMimeTypes: string[];
  /** Maximum number of files */
  maxFiles: number;
}

export type FileUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface FileUploadProgress {
  /** File being uploaded */
  file: File;
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Current status */
  status: FileUploadStatus;
  /** Error message if upload failed */
  error?: string;
}

/**
 * Response from successful file upload
 */
export interface UploadFileResponse {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  size: number;
  mimeType: string;
  status: 'completed' | 'processing' | 'failed';
  uploadedAt: string;
}

/**
 * API Response wrapper for upload operations
 */
export interface UploadApiResponse<T = UploadFileResponse> extends ApiResponse<T> {
  data: T;
}
