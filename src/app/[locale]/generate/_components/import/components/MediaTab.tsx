'use client';

import React, { memo } from 'react';
import { Mic, Video, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setFiles, setImportMethod } from '@/stores/features/import-dialog/importDialogSlice';
import { toast } from '@/hooks/use-toast';
import {
  ALLOWED_AUDIO_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_MEDIA_SIZE_MB,
  validateFileSize,
  validateMediaType,
} from '../../../helper/validate';

const MediaTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { importMethod, files } = useAppSelector((state) => state.importDialog);

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

  const handleMediaDrop = (e: React.DragEvent<HTMLDivElement>, mediaType: 'audio' | 'video') => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]; // Only take the first file for media

      if (!validateMediaType(file, mediaType) || !validateFileSize(file, true)) {
        toast({
          title: `Invalid ${mediaType} file`,
          description: `Only ${mediaType === 'audio' ? ALLOWED_AUDIO_TYPES.join(', ') : ALLOWED_VIDEO_TYPES.join(', ')} files up to ${MAX_MEDIA_SIZE_MB}MB are allowed.`,
          variant: 'destructive',
        });
        return;
      }

      // Handle valid media file
      dispatch(setFiles([file]));
      dispatch(setImportMethod('media'));
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!validateMediaType(file, 'audio') || !validateFileSize(file, true)) {
        toast({
          title: 'Invalid audio file',
          description: `Only ${ALLOWED_AUDIO_TYPES.join(', ')} files up to ${MAX_MEDIA_SIZE_MB}MB are allowed.`,
          variant: 'destructive',
        });
        e.target.value = '';
        return;
      }

      // Handle valid audio file
      dispatch(setFiles([file]));
      dispatch(setImportMethod('media'));
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!validateMediaType(file, 'video') || !validateFileSize(file, true)) {
        toast({
          title: 'Invalid video file',
          description: `Only ${ALLOWED_VIDEO_TYPES.join(', ')} files up to ${MAX_MEDIA_SIZE_MB}MB are allowed.`,
          variant: 'destructive',
        });
        e.target.value = '';
        return;
      }

      // Handle valid video file
      dispatch(setFiles([file]));
      dispatch(setImportMethod('media'));
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors cursor-pointer"
          onClick={() => document.getElementById('audio-upload')?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleMediaDrop(e, 'audio')}
        >
          <input
            id="audio-upload"
            type="file"
            className="hidden"
            accept="audio/*"
            onChange={handleAudioUpload}
          />
          <Mic className="h-8 w-8 mx-auto mb-3" />
          <h3 className="font-medium text-sm mb-1">Upload Audio</h3>
          <p className="text-xs">MP3, WAV, M4A files (max {MAX_MEDIA_SIZE_MB}MB)</p>
        </div>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors cursor-pointer"
          onClick={() => document.getElementById('video-upload')?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleMediaDrop(e, 'video')}
        >
          <input
            id="video-upload"
            type="file"
            className="hidden"
            accept="video/*"
            onChange={handleVideoUpload}
          />
          <Video className="h-8 w-8 mx-auto mb-3" />
          <h3 className="font-medium text-sm mb-1">Upload Video</h3>
          <p className="text-xs">MP4, MOV, AVI files (max {MAX_MEDIA_SIZE_MB}MB)</p>
        </div>
      </div>
      {files.length > 0 && importMethod === 'media' && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Selected file:</h4>
          <div className="text-sm flex items-center justify-between">
            <div className="flex items-center">
              {files[0].type.includes('audio') ? (
                <Mic className="h-4 w-4 mr-2" />
              ) : (
                <Video className="h-4 w-4 mr-2" />
              )}
              {files[0].name}
              <span className="ml-2 text-xs text-gray-500">
                ({(files[0].size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(setFiles([]));
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4">
        Note: Audio and video content will be processed to extract learning material.
      </p>
    </>
  );
};

export default memo(MediaTab);
