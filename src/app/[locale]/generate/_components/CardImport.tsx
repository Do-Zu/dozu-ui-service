'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import usePost from '@/hooks/usePost';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { useEventSource } from '@/hooks/useEventSource';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Import from './import/Import';
import { resetExtractionState } from '@/stores/features/content-extraction/contentExtractionSlice';
import { setStep } from '@/stores/features/import-dialog/importDialogSlice';
import ContentDetailView from '../detail-extract/components/ContentDetailView';
import ProcessGenerate from './process/ProcessGenerate';
import Final from './steps/Final';
import { compressContent } from '../helper/compress';

export interface ISseData {
  jobId: string;
  timestamp: string;
  status: string;
  data?: {
    content: Array<{ q: string; a: string }>;
    rawText: string;
    timestamp: string;
  };
}

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

const CardImport: React.FC<CardImportProps> = ({ onComplete = () => {} }) => {
  const dispatch = useAppDispatch();
  const { textContent, extractedContent, activeTab } = useAppSelector(
    (state) => state.contentExtraction,
  );

  const [jobId, setJobId] = useState<string | undefined>();
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);

  const { step, importMethod, files, selectedMethod, isProcessing } = useAppSelector(
    (state) => state.importDialog,
  );

  const {
    loading,
    data: apiResponse,
    error: apiPostContentError,
    execute,
  } = usePost<unknown, ApiResponsePubGenContent>('/generate/v3/text/llm', 'POST');

  // Setup SSE connection when jobId is available
  const { data: sseData, status: sseStatus } = useEventSource<ISseData>(
    jobId ? `/event/generate/job/${jobId}` : null,
    {
      onMessage: (event) => {
        try {
          const eventData = JSON.parse(event.data);

          console.log({ sseStatus: eventData.status });

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
    },
  );

  const handleRequestGenContent = async () => {
    let content = '';

    // TEMPORARY: for send text content
    if (importMethod === 'file') {
      content = textContent;
    } else if (importMethod === 'media') {
      //TODO: for send video or radio or video content
    } else if (importMethod === 'text') {
      if (activeTab === 'url') content = extractedContent;
      if (activeTab === 'text') content = textContent;
    }

    const compressedContent = compressContent(content);

    await execute({
      content: compressedContent,
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
      if (apiPostContentError && !loading) {
        return;
      }
      if (apiPostContentError === 'completed') {
        dispatch(setStep(3));
      }
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
        return <Import />;
      case 2:
        return <ContentDetailView />;
      case 3:
        return <Final sseData={sseData} />;

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
        description: apiPostContentError,
        variant: 'destructive',
      });
    }
  }, [apiPostContentError]);

  useEffect(() => {
    console.log({ sseData });
  }, [sseData]);

  useEffect(() => {
    if (sseStatus === 'error' || sseStatus === 'timeout') {
      if (step !== 1) {
        toast({
          title: sseStatus === 'timeout' ? 'Connection Timeout' : 'Connection Error',
          description:
            sseStatus === 'timeout'
              ? 'The generation process timed out. Please try again with a smaller file.'
              : 'There was an error with the generation process. Please try again.',
          variant: 'destructive',
        });
        dispatch(setStep(1));
      }
    }
  }, [sseStatus, dispatch, step]);

  if (
    jobId &&
    generationStatus &&
    !['completed', 'failed', 'timeout', 'error'].includes(generationStatus) &&
    !['error', 'timeout', 'closed'].includes(sseStatus)
  ) {
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
