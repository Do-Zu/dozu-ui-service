import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Pause, Play, AlertCircle } from 'lucide-react';
import { UploadProgress } from '@/services/upload/upload.service';
import { cn } from '@/lib/utils';

interface UploadProgressProps {
  progress: UploadProgress;
  onCancel?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onRetry?: () => void;
  showControls?: boolean;
  compact?: boolean;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTime = (seconds: number): string => {
  if (!seconds || seconds === Infinity) return '--';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

export const UploadProgressComponent: React.FC<UploadProgressProps> = ({
  progress,
  onCancel,
  onPause,
  onResume,
  onRetry,
  showControls = true,
  compact = false,
}) => {
  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'paused':
        return 'text-yellow-600';
      case 'uploading':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'uploading':
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  const getProgressColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{progress.fileName}</div>
          <div className="flex items-center space-x-2">
            <Progress value={progress.progress} className="flex-1 h-1" />
            <span className="text-xs text-gray-500">{progress.progress}%</span>
          </div>
        </div>
        {showControls && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div>
            <h4 className="text-sm font-medium truncate">{progress.fileName}</h4>
            <p className={cn('text-xs capitalize', getStatusColor())}>
              {progress.status}
              {progress.error && ` - ${progress.error}`}
            </p>
          </div>
        </div>
        {showControls && (
          <div className="flex items-center space-x-1">
            {progress.status === 'uploading' && onPause && (
              <Button variant="ghost" size="sm" onClick={onPause}>
                <Pause className="h-4 w-4" />
              </Button>
            )}
            {progress.status === 'paused' && onResume && (
              <Button variant="ghost" size="sm" onClick={onResume}>
                <Play className="h-4 w-4" />
              </Button>
            )}
            {progress.status === 'error' && onRetry && (
              <Button variant="ghost" size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
            {onCancel && progress.status !== 'completed' && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {formatBytes(progress.uploadedBytes)} / {formatBytes(progress.totalBytes)}
          </span>
          <span>{progress.progress}%</span>
        </div>
        <Progress 
          value={progress.progress} 
          className="h-2"
        />
      </div>

      {/* Additional Info */}
      {(progress.status === 'uploading' || progress.status === 'paused') && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0
              ? `${formatTime(progress.estimatedTimeRemaining)} remaining`
              : 'Calculating...'}
          </span>
          {progress.startTime && (
            <span>
              Started: {progress.startTime.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {progress.status === 'completed' && (
        <div className="text-xs text-green-600 font-medium">
          ✓ Upload completed successfully
        </div>
      )}
    </div>
  );
};

export default UploadProgressComponent;
