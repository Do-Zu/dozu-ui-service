'use client';

import React, { useCallback, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Upload, File, Mic, Video, ArrowRight, Sparkles, Link } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import TabContent from './TabsTextContent';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import {
  setActiveTab,
  setExtractionContent,
} from '@/stores/features/content-extraction/contentExtractionSlice';
import {
  setStep,
  setImportMethod,
  setFiles,
  setIsProcessing,
  resetImportDialog,
} from '@/stores/features/import-dialog/importDialogSlice';
import Axios from '@/api/axios';
import SelectMethod from './steps/SelectMethod';
import Process from './Process';
import { reduceTokenInput } from '../helper/reduceTokenInput';
import ContentDetailView from '../detail-extract/components/ContentDetailView';
import usePost from '@/hooks/usePost';
import ProcessGenerate from './ProcessGenerate';

interface CardImportProps {
  onOpenChange?: (open: boolean) => void;
  onComplete?: (data: any) => void;
}

const CardImport: React.FC<CardImportProps> = ({
  onOpenChange = () => {},
  onComplete = () => {},
}) => {
  const dispatch = useAppDispatch();
  const {
    textContent,
    extractedContent,
    isLoading,
    error: extractionError,
  } = useAppSelector((state) => state.contentExtraction);

  const { step, importMethod, files, selectedMethod, isProcessing } = useAppSelector(
    (state) => state.importDialog,
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      dispatch(setFiles(droppedFiles));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      dispatch(setFiles(selectedFiles));
    }
  };

  const {
    loading,
    data,
    error: apiError,
    execute,
  } = usePost('/generate/v1/text/llm/flashcards', 'POST');

  const handleContinue = async () => {
    if (step === 1) {
      dispatch(setStep(2));
    } else if (step === 2) {
      await execute({
        content: textContent,
      });
      dispatch(setStep(3));
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      if (importMethod === 'file') return files.length > 0;
      if (importMethod === 'text') return textContent.trim().length > 0;
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
                dispatch(setActiveTab(value));
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

                  {files.length > 0 && (
                    <div className="mt-4 text-left">
                      <h4 className="text-sm font-medium  mb-2">Selected files:</h4>
                      <ul className="space-y-1">
                        {files.map((file, index) => (
                          <li key={index} className="text-sm  flex items-center">
                            <File className="h-4 w-4 mr-2" />
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <TabContent />
              </TabsContent>

              <TabsContent value="media" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center  transition-colors cursor-pointer"
                    onClick={() => document.getElementById('audio-upload')?.click()}
                  >
                    <input id="audio-upload" type="file" className="hidden" accept="audio/*" />
                    <Mic className="h-8 w-8  mx-auto mb-3" />
                    <h3 className=" font-medium text-sm mb-1">Upload Audio</h3>
                    <p className="text-xs ">MP3, WAV, M4A files</p>
                  </div>

                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center  transition-colors cursor-pointer"
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    <input id="video-upload" type="file" className="hidden" accept="video/*" />
                    <Video className="h-8 w-8  mx-auto mb-3" />
                    <h3 className=" font-medium text-sm mb-1">Upload Video</h3>
                    <p className="text-xs ">MP4, MOV, AVI files</p>
                  </div>
                </div>
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
        <></>;
      // return (
      //   <div className="space-y-6">
      //     <div className=" p-4 rounded-lg border border-gray-200">
      //       <h3 className="font-medium  mb-3">Content Preview</h3>
      //       <div className=" border  rounded-md p-3 max-h-[200px] overflow-y-auto">
      //         {importMethod === 'text' ? (
      //           <p className="text-sm ">{textContent}</p>
      //         ) : (
      //           <ul className="space-y-1">
      //             {files.map((file, index) => (
      //               <li key={index} className="text-sm flex items-center">
      //                 <File className="h-4 w-4 mr-2" />
      //                 {file.name}
      //               </li>
      //             ))}
      //           </ul>
      //         )}
      //       </div>
      //     </div>

      //     <div className="space-y-3">
      //       <h3 className="font-medium ">
      //         Learning Method: <span className="capitalize">{selectedMethod}</span>
      //       </h3>

      //       <div className="grid grid-cols-2 gap-4">
      //         <div className="space-y-2">
      //           <label className="text-sm font-medium ">Title</label>
      //           <Input
      //             placeholder="Enter a title for your content"
      //             defaultValue={
      //               files.length > 0 ? files[0].name.split('.')[0] : 'New Learning Content'
      //             }
      //           />
      //         </div>
      //         <div className="space-y-2">
      //           <label className="text-sm font-medium ">Category</label>
      //           <Input placeholder="Optional category" />
      //         </div>
      //       </div>

      //       <div className="space-y-2">
      //         <label className="text-sm font-medium ">Description</label>
      //         <Textarea placeholder="Add a description (optional)" className="min-h-[80px]" />
      //       </div>
      //     </div>
      //   </div>
      // );

      default:
        return null;
    }
  };
  if (loading) return <ProcessGenerate isGenerating={loading} />;

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
          <Button
            variant="outline"
            onClick={() => dispatch(setStep(step - 1))}
            disabled={isProcessing}
          >
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
