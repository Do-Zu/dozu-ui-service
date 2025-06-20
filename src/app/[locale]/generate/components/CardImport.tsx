'use client';

import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useCardImportDispatch, useCardImportSelector } from '../hooks/useReduxStore';
import { toast } from '@/hooks/use-toast';
import usePost from '@/hooks/usePost';
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
import { resetExtractionState } from '@/app/[locale]/generate/stores/features/contentExtractionSlice';
import { setFiles, setStep } from '@/app/[locale]/generate/stores/features/importDialogSlice';
import ContentDetailView from '../detail-extract/components/ContentDetailView';
import ProcessGenerate from './process/ProcessGenerate';
import Final from './steps/Final';
import { compressContent } from '../helper/compress';
import FlashcardEditor, { handleConvertToFlashcardsSubmitted, IFlashcardWithServer } from '../../flashcards/components/FlashcardEditor';
import { Input } from '@/components/ui/input';
import { postRequest } from '@/api/api';
import { useRouter } from 'next/navigation';

export type IFlashcardsFromSSE = { q: string; a: string }[];

export interface ISseData {
  jobId: string;
  timestamp: string;
  status: string;
  data?: {
    data: IFlashcardsFromSSE;
    text: string;
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

const sampleData = [
  { q: 'Hello', a: 'Xin chào' },
  { q: 'Thank you', a: 'Cảm ơn' },
  { q: 'Sorry', a: 'Xin lỗi' },
];

const CardImport: React.FC<CardImportProps> = ({ onComplete = () => {} }) => {
  const router = useRouter();
  const dispatch = useCardImportDispatch();

  const { textContent, extractedContent, activeTab } = useCardImportSelector(
    (state) => state.contentExtraction,
  );
  const { step, importMethod, files, selectedMethod, isProcessing } = useCardImportSelector(
    (state) => state.importDialog,
  );

  const [jobId, setJobId] = useState<string | undefined>();
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();

  function handleOnChangeName(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  function handleOnChangeDescription(event: ChangeEvent<HTMLInputElement>) {
    setDescription(event.target.value);
  }

  const {
    loading,
    data: apiResponse,
    error: apiPostContentError,
    execute,
  } = usePost<unknown, ApiResponsePubGenContent>('/generate/v3/text/llm', 'POST');

  // Setup SSE connection when jobId is available
  const { data: sseData, status: sseStatus } = useEventSource<ISseData>(
    jobId ? `/event/generate/job/${jobId}` : null,
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
      dispatch(setStep(3)); // WARNING: remove this code before commit
      // if (!isStepValid()) return;
      // dispatch(setStep(2));
    } else if (step === 2) {
      dispatch(setStep(3)); // WARNING: remove this code before commit
      // await handleRequestGenContent();
      // if (apiPostContentError && !loading) {
      //   return;
      // }
      if (apiPostContentError === 'completed') {
        dispatch(setStep(3));
      }
    }
  };

  const handleBackPreviousStep = () => {
    if (step == 2) {
      // Reset content(web/url/text) extraction state when go back to step 2
      dispatch(resetExtractionState());
      // Reset files when go back to step 1
      dispatch(setFiles([]));
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

  // // Handle confirmation to leave
  // const handleConfirmLeave = useCallback(() => {
  //   setPreventNavigation(false);
  //   setShowNavigationAlert(false);
  //   setTimeout(() => {
  //     window.history.back();
  //   }, 0);
  // }, [router]);

  // // Handle cancellation of leaving
  // const handleCancelLeave = useCallback(() => {
  //   setShowNavigationAlert(false);
  // }, []);

  // !!! todo: check this function, for using parent and children states at the same time
  const handleOnClickSave = async (flashcards: IFlashcardWithServer[]) => {
    // phase 1: create topic
    if (!name) {
      alert("Name can't be blank");
      return;
    }

    const topicSubmitted = { topicName: name, topicDescription: description };
    let topicId : number;
    try {
      const dataResponsed = await postRequest<any, { data: { topicId: number } }>('/topics', topicSubmitted);
      topicId = dataResponsed.data.topicId;
    } catch (err) {
      console.log(err);
      return;
    }

    // phase 2: insert flashcards generated to topic created
    let flashcardsSubmitted = handleConvertToFlashcardsSubmitted(flashcards);

    try {
      await postRequest(`/flashcards/batch?topicId=${topicId}`, flashcardsSubmitted);
      router.push('/home');
    } catch (err) {
      console.log(err);
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Import />;
      case 2:
        return <ContentDetailView />;
      case 3:
        return (
          <div>

            <div className='flex flex-col gap-4 mb-4'>
              <div className="flex flex-col gap-2">
                <div className="text-primary text-base font-normal">Name</div>
                <Input value={name} onChange={handleOnChangeName} />
              </div>
        
              <div className="flex flex-col gap-2">
                <div className="text-primary text-base font-normal">Description</div>
                <Input value={description ? description : ''} onChange={handleOnChangeDescription} />
              </div>
            </div>

            <FlashcardEditor 
              type="generative" 
              flashcardsProp={sampleData}
              shouldShowBackButton={false}
              handleOnClickSave={handleOnClickSave}
            />
          </div>
        )

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
    console.log({ sseData, sseStatus });

    if (sseStatus === 'timeout' || sseStatus === 'error') {
      toast({
        description:
          sseStatus === 'timeout'
            ? 'The generation process timed out. Please try again with a smaller file.'
            : 'There was an error with the generation process. Please try again.',
        variant: 'destructive',
      });
    } else if (sseData && sseStatus === 'completed') {
      console.log({ sseData });

      dispatch(setStep(3));

      toast({
        description: 'Your content has been successfully generated.',
        variant: 'default',
      });
    }
  }, [sseData, sseStatus]);

  if (jobId && sseStatus === 'open') {
    return <ProcessGenerate isGenerating={true} status={sseStatus} />;
  }

  return (
    <Card className="max-w-[80vw] max-h-[85vh] overflow-auto mx-auto my-auto my-4">
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
