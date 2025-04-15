'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  FileText,
  Upload,
  File,
  Mic,
  Video,
  Check,
  ArrowRight,
  Sparkles,
  Lightbulb,
  BookOpen,
  Link,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import TabContent from './TabsTextContent';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setActiveTab } from '@/stores/features/content-extraction/contentExtractionSlice';
import Axios from '@/api/axios';

interface ImportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onComplete?: (data: any) => void;
}

// Define types for the dialog state management
interface DialogState {
  step: number;
  importMethod: string;
  files: File[];
  processingProgress: number;
  isProcessing: boolean;
  suggestedMethods: string[];
  selectedMethod: string;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  open = true,
  onOpenChange = () => {},
  onComplete = () => {},
}) => {
  const dispatch = useAppDispatch();
  const { textContent } = useAppSelector((state) => state.contentExtraction);

  const [dialogState, setDialogState] = useState<DialogState>({
    step: 1,
    importMethod: 'file',
    files: [],
    processingProgress: 0,
    isProcessing: false,
    suggestedMethods: ['flashcards', 'notes', 'quiz'],
    selectedMethod: 'flashcards',
  });

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setDialogState((prev) => ({ ...prev, files: droppedFiles }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setDialogState((prev) => ({ ...prev, files: selectedFiles }));
    }
  };

  const handleGenerateContent = async () => {
    const { data, status } = await Axios.post('/generate/text/flashcards', {
      content: textContent,
    });

    console.log(data);
    if (status === 200) {
      toast({
        title: 'Success',
        description: 'Content generated successfully',
      });
    } else if (status === 400) {
      toast({
        title: 'Error',
        description: 'Invalid content provided',
        variant: 'destructive',
      });
    } else if (status === 500) {
      toast({
        title: 'Error',
        description: 'Internal server error',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Generated content successfully',
      });
    }
  };

  const handleContinue = async () => {
    if (dialogState.step === 1) {
      setDialogState((prev) => ({ ...prev, isProcessing: true }));

      const interval = setInterval(() => {
        setDialogState((prev) => {
          if (prev.processingProgress >= 100) {
            clearInterval(interval);
            return {
              ...prev,
              isProcessing: false,
              step: 2,
              processingProgress: 100,
            };
          }
          return {
            ...prev,
            processingProgress: prev.processingProgress + 10,
          };
        });
      }, 300);
    } else if (dialogState.step === 2) {
      setDialogState((prev) => ({ ...prev, step: 3 }));
    } else if (dialogState.step === 3) {
      await handleGenerateContent();

      onComplete({
        method: dialogState.selectedMethod,
        content: dialogState.importMethod === 'text' ? textContent : dialogState.files,
      });
      onOpenChange(false);
      setDialogState({
        step: 1,
        importMethod: 'file',
        files: [],
        processingProgress: 0,
        isProcessing: false,
        suggestedMethods: ['flashcards', 'notes', 'quiz'],
        selectedMethod: 'flashcards',
      });
    }
  };

  const isStepValid = () => {
    if (dialogState.step === 1) {
      if (dialogState.importMethod === 'file') return dialogState.files.length > 0;
      if (dialogState.importMethod === 'text') return textContent.trim().length > 0;
      return false;
    }
    return true;
  };

  const renderStepContent = () => {
    switch (dialogState.step) {
      case 1:
        return (
          <div className="space-y-4">
            <Tabs
              defaultValue="file"
              value={dialogState.importMethod}
              onValueChange={(value) => {
                setDialogState((prev) => ({ ...prev, importMethod: value }));
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

                  {dialogState.files.length > 0 && (
                    <div className="mt-4 text-left">
                      <h4 className="text-sm font-medium  mb-2">Selected files:</h4>
                      <ul className="space-y-1">
                        {dialogState.files.map((file, index) => (
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
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-lg border ">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium  mb-1">AI Content Analysis</h3>
                  <p className="text-sm text-gray-600">
                    We've analyzed your content and identified the following learning methods that
                    would work best:
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {dialogState.suggestedMethods.map((method) => (
                <div
                  key={method}
                  className={`p-4 rounded-lg border ${dialogState.selectedMethod === method ? 'border-gray-800 bg-gray-50' : 'border-gray-200'} cursor-pointer transition-all`}
                  onClick={() => setDialogState((prev) => ({ ...prev, selectedMethod: method }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {method === 'flashcards' && <BookOpen className="h-5 w-5 " />}
                      {method === 'notes' && <FileText className="h-5 w-5 " />}
                      {method === 'quiz' && <Lightbulb className="h-5 w-5 " />}
                      <div>
                        <h4 className="font-medium  capitalize">{method}</h4>
                        <p className="text-sm ">
                          {method === 'flashcards' && 'Perfect for memorization and quick review'}
                          {method === 'notes' && 'Ideal for detailed study and reference'}
                          {method === 'quiz' && 'Great for testing your knowledge'}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border ${dialogState.selectedMethod === method ? 'bg-gray-800 border-gray-800' : 'border-gray-300'} flex items-center justify-center`}
                    >
                      {dialogState.selectedMethod === method && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className=" p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium  mb-3">Content Preview</h3>
              <div className=" border  rounded-md p-3 max-h-[200px] overflow-y-auto">
                {dialogState.importMethod === 'text' ? (
                  <p className="text-sm ">{textContent}</p>
                ) : (
                  <ul className="space-y-1">
                    {dialogState.files.map((file, index) => (
                      <li key={index} className="text-sm flex items-center">
                        <File className="h-4 w-4 mr-2" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium ">
                Learning Method: <span className="capitalize">{dialogState.selectedMethod}</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium ">Title</label>
                  <Input
                    placeholder="Enter a title for your content"
                    defaultValue={
                      dialogState.files.length > 0
                        ? dialogState.files[0].name.split('.')[0]
                        : 'New Learning Content'
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium ">Category</label>
                  <Input placeholder="Optional category" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium ">Description</label>
                <Textarea placeholder="Add a description (optional)" className="min-h-[80px]" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold ">
            {dialogState.step === 1 && 'Import Learning Content'}
            {dialogState.step === 2 && 'Suggested Learning Methods'}
            {dialogState.step === 3 && 'Customize Learning Content'}
          </DialogTitle>
          <DialogDescription>
            {dialogState.step === 1 && 'Upload or paste content to create learning materials.'}
            {dialogState.step === 2 && 'Choose the best learning method for your content.'}
            {dialogState.step === 3 && 'Customize your learning content before finalizing.'}
          </DialogDescription>
        </DialogHeader>

        {dialogState.isProcessing ? (
          <div className="py-10 space-y-4">
            <div className="text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-medium mb-1">Processing your content</h3>
              <p className="text-sm ">
                Our AI is analyzing your content to suggest the best learning methods.
              </p>
            </div>
            <Progress value={dialogState.processingProgress} className="w-full h-2" />
            <p className="text-xs text-center ">
              This may take a moment depending on the size of your content.
            </p>
          </div>
        ) : (
          <div className="overflow-y-scroll max-h-[90vh]">{renderStepContent()}</div>
        )}

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          {dialogState.step > 1 && !dialogState.isProcessing && (
            <Button
              variant="outline"
              onClick={() => setDialogState((prev) => ({ ...prev, step: prev.step - 1 }))}
              disabled={dialogState.isProcessing}
            >
              Back
            </Button>
          )}
          <div className="flex-1 sm:flex-none"></div>
          <Button onClick={handleContinue} disabled={!isStepValid() || dialogState.isProcessing}>
            {dialogState.step === 3 ? 'Create Learning Content' : 'Continue'}
            {dialogState.step !== 3 && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
