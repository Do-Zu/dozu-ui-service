'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Upload, File, Mic, Video, ArrowRight, Sparkles, Link, X } from 'lucide-react';
import TabContent from './TabsTextContent';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import {
  resetExtractionState,
  setActiveTab,
} from '@/stores/features/content-extraction/contentExtractionSlice';
import {
  setStep,
  setImportMethod,
  setFiles,
} from '@/stores/features/import-dialog/importDialogSlice';
import ContentDetailView from '../detail-extract/components/ContentDetailView';
import usePost from '@/hooks/usePost';
import ProcessGenerate from './ProcessGenerate';
import Final from './steps/Final';
import { useEventSource } from '@/hooks/useEventSource';
import {
  validateFileType,
  validateFileSize,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE_MB,
  validateMediaType,
  ALLOWED_AUDIO_TYPES,
  MAX_MEDIA_SIZE_MB,
  ALLOWED_VIDEO_TYPES,
} from '../helper/validate';

interface CardImportProps {
  onOpenChange?: (open: boolean) => void;
  onComplete?: (data: any) => void;
}

interface ApiResponsePubGenContent {
  status: string;
  message: string;
  data?: {
    jobId: string;
  };
}

const CardImport: React.FC<CardImportProps> = ({
  onOpenChange = () => {},
  onComplete = () => {},
}) => {
  const dispatch = useAppDispatch();
  const { textContent, error: extractionError } = useAppSelector(
    (state) => state.contentExtraction,
  );

  const { inputUrl, extractedContent, contentType, activeTab } = useAppSelector(
    (state) => state.contentExtraction,
  );

  const [jobId, setJobId] = useState<string | undefined>();
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);

  const { step, importMethod, files, selectedMethod, isProcessing } = useAppSelector(
    (state) => state.importDialog,
  );

  // Update file handlers with validation
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

    // if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    //   const droppedFiles = Array.from(e.dataTransfer.files);

    //   // Validate file types and sizes
    //   const invalidFiles = droppedFiles.filter(
    //     (file) => !validateFileType(file) || !validateFileSize(file),
    //   );

    //   if (invalidFiles.length > 0) {
    //     toast({
    //       title: 'Invalid files',
    //       description: `Some files were rejected. Only ${ALLOWED_FILE_TYPES.join(', ')} files up to ${MAX_FILE_SIZE_MB}MB are allowed.`,
    //       variant: 'destructive',
    //     });
    //     // Only keep valid files
    //     const validFiles = droppedFiles.filter(
    //       (file) => validateFileType(file) && validateFileSize(file),
    //     );
    //     dispatch(setFiles(validFiles));
    //   } else {
    //     dispatch(setFiles(droppedFiles));
    //   }
    // }
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

  // Add handlers for media uploads
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

  const {
    loading,
    data: apiResponse,
    error: apiPostContentError,
    execute,
  } = usePost<unknown, ApiResponsePubGenContent>('/generate/v3/text/llm/flashcards', 'POST');

  // Setup SSE connection when jobId is available
  const { data: sseData, status: sseStatus } = useEventSource(
    jobId ? `/event/generate/job/${jobId}` : null,
    {
      onMessage: (event) => {
        try {
          const eventData = JSON.parse(event.data);
          setGenerationStatus(eventData.status);
          setGenerationProgress(eventData.progress || 0);

          // When generation is complete, move to the final step
          if (eventData.status === 'completed') {
            dispatch(setStep(3));
            onComplete(eventData.result);
          } else if (eventData.status === 'failed') {
            toast({
              title: 'Generation Failed',
              description: eventData.error || 'Something went wrong generating your content.',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Error processing SSE event:', error);
        }
      },
      onError: () => {
        toast({
          title: 'Connection Error',
          description: 'Lost connection to the server. Please try again.',
          variant: 'destructive',
        });
      },
    },
  );

  const handleRequestGenContent = async () => {
    let content = '';

    if (importMethod === 'file') {
      //TODO for send file
    }

    //TODO: for send video or mp3

    if (importMethod === 'text') {
      if (activeTab === 'url') content = extractedContent;
      if (activeTab === 'text') content = textContent;
    }

    await execute({
      content,
      method: importMethod,
      type: selectedMethod,
    });
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!isStepValid()) return;
      dispatch(setStep(2));
    } else if (step === 2) {
      await handleRequestGenContent();
      dispatch(setStep(3));
    }
  };
  const handleBackPreviousStep = () => {
    if (step == 2) {
      dispatch(resetExtractionState());
    }
    dispatch(setStep(step - 1));
  };

  const isStepValid = () => {
    if (step === 1) {
      if (importMethod === 'file') return files.length > 0;
      if (importMethod === 'text') {
        if (activeTab === 'url') return extractedContent.trim().length > 0;
        if (activeTab === 'text') return textContent.trim().length > 0;
      }
      return false;
    }
    return true;
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Tabs
              defaultValue="file"
              value={importMethod}
              onValueChange={(value) => {
                dispatch(setImportMethod(value));
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Files</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  <span>URL</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Media</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="mt-4">
                <div
                  className="border-2 border-dashed  rounded-lg p-8 text-center hover:opacity-70 transition-colors cursor-pointer"
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
                  <Upload className="h-10 w-10  mx-auto mb-4" />
                  <h3 className="font-medium mb-1">Drag & drop files here</h3>
                  <p className=" text-sm mb-2">or click to browse your files</p>
                  <p className="text-xs ">Supports PDF, Word, and text files</p>
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
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <TabContent />
              </TabsContent>

              <TabsContent value="media" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div

                    className="border-2 border-dashed border-border rounded-lg p-6 text-center  transition-colors cursor-pointer"

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

                    className="border-2 border-dashed border-border rounded-lg p-6 text-center  transition-colors cursor-pointer"

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

                <p className="text-xs text-muted-foreground mt-4">

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
              </TabsContent>
            </Tabs>
          </div>
        );
      case 2:
        return <ContentDetailView />;
      case 3:
        return <Final />;

      default:
        return null;
    }
  };

  useEffect(() => {
    if (apiResponse) {
      console.log('api res for pub', { apiResponse });
      const jobId = apiResponse.data?.jobId;
      setJobId(jobId);
    }
  }, [apiResponse]);

  useEffect(() => {
    if (apiPostContentError) {
      toast({
        title: 'Post Fail',
        description: 'Upload Content Fail. Please try again.',
        variant: 'destructive',
      });
    }
  }, [apiPostContentError]);

  useEffect(() => {
    console.log({ sseData });
  }, [sseData]);

  if (loading || (jobId && generationStatus && generationStatus !== 'completed')) {
    return <ProcessGenerate isGenerating={true} status={sseStatus} />;
  }

  return (
    <Card className="max-w-[80vw] max-h-[85vh] overflow-auto mx-auto my-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold ">
          {step === 1 && 'Import Learning Content'}
          {step === 2 && 'Suggested Learning Methods'}
          {step === 3 && 'Customize Learning Content'}
        </CardTitle>
        <CardDescription>
          {step === 1 && 'Upload or paste content to create learning materials.'}
          {step === 2 && 'Choose the best learning method for your content.'}
          {step === 3 && 'Customize your learning content before finalizing.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="">{renderStepContent()}</CardContent>

      <CardFooter className="flex justify-between items-center sm:justify-between">
        {step > 1 && (
          <Button variant="outline" onClick={handleBackPreviousStep} disabled={isProcessing}>
            Back
          </Button>
        )}
        <div className="flex-1 sm:flex-none"></div>

        <Button onClick={handleContinue} disabled={!isStepValid()}>
          {step === 3 ? 'Create Learning Content' : 'Continue'}
          {step !== 3 && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CardImport;
