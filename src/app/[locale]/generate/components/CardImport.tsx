'use client';

import { resetExtractionState } from '@/app/[locale]/generate/stores/features/contentExtractionSlice';
import { setFiles, setStep } from '@/app/[locale]/generate/stores/features/importDialogSlice';
import GeneratingSkeleton from '@/components/generative/GeneratingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useEventSource } from '@/hooks/useEventSource';
import usePost from '@/hooks/usePost';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import ContentDetailView from '../detail-extract/components/ContentDetailView';
import { compressContent } from '../helper/compress';
import { useContentGeneration } from '../hooks/useContentGeneration';
import { useCardImportDispatch, useCardImportSelector } from '../hooks/useReduxStore';
import { ISseData } from '../types';
import ContentGenerationPreview from './ContentGenerationPreview';
import Import from './import/Import';
import LoadingPage from '@/app/loading';

interface CardImportProps {
    onOpenChange?: (open: boolean) => void;
    onComplete?: (data: any) => void;
}

interface ApiResponsePubGenContent {
    status: string;
    message: string;
    data?: {
        jobId: string;
        status?: string;
        data?: object[];
    };
    sse: {
        event: string;
    };
}

const URL_API_GENERATE = '/generate/v3/text/llm';

const CardImport: React.FC<CardImportProps> = ({ onComplete = () => {} }) => {
    const router = useRouter();
    const dispatch = useCardImportDispatch();

    const { textContent, extractedContent, activeTab } = useCardImportSelector((state) => state.contentExtraction);
    const { step, importMethod, files, selectedMethod, isProcessing } = useCardImportSelector(
        (state) => state.importDialog,
    );

    const [jobId, setJobId] = useState<string | undefined>();

    const {
        loading,
        data: apiResponse,
        error: apiPostContentError,
        execute,
    } = usePost<unknown, ApiResponsePubGenContent>(URL_API_GENERATE, 'POST');

    // Setup SSE connection when jobId is available
    const { data: sseData, status: sseStatus } = useEventSource<ISseData>(
        jobId ? `/event/generate/job/${jobId}` : null,
    );

    const {
        dataGenerated,
        setDataGenerated,
        topicName,
        setTopicName,
        topicDescription,
        setTopicDescription,
        isTopicModalOpen,
        setIsTopicModalOpen,
        handleOnClickSave,
    } = useContentGeneration({ sseData, sseStatus });

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
        } else if (step === 3) {
            setIsTopicModalOpen(true);
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
    // }, [router]);    // // Handle cancellation of leaving
    // const handleCancelLeave = useCallback(() => {
    //   setShowNavigationAlert(false);
    // }, []);

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return <Import />;
            case 2:
                return <ContentDetailView />;
            case 3:
                return (
                    <ContentGenerationPreview
                        sseData={sseData}
                        dataGenerated={dataGenerated}
                        setDataGenerated={setDataGenerated}
                        topicName={topicName}
                        setTopicName={setTopicName}
                        topicDescription={topicDescription}
                        setTopicDescription={setTopicDescription}
                        isTopicModalOpen={isTopicModalOpen}
                        setIsTopicModalOpen={setIsTopicModalOpen}
                        onSave={handleOnClickSave}
                    />
                );

            default:
                return null;
        }
    };

    useEffect(() => {
        if (apiResponse) {
            const { data, sse } = apiResponse;
            const jobId = data?.jobId;
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
        // console.log({ sseData, sseStatus });

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
    }, [sseData, sseStatus, dispatch]);

    if (jobId && sseStatus === 'open') {
        return <GeneratingSkeleton />;
    }

    if (step === 3)
        return (
            <div className=" items-center justify-between p-4">
                {renderStepContent()}
                <div className="flex-1 sm:flex-none"></div>
                <Button className="fixed bottom-4 right-[50%] z-50" onClick={handleContinue} disabled={!isStepValid()}>
                    Create Learning Content
                </Button>
            </div>
        );

    return (
        <Card className="max-w-[80vw] max-h-[90vh] overflow-auto mx-auto my-4">
            <CardHeader>
                <CardTitle className="text-xl font-semibold ">
                    {step === 1 && 'Import Learning Content'}
                    {step === 2 && 'Suggested Learning Methods'}
                </CardTitle>
            </CardHeader>

            <CardContent className="">{renderStepContent()}</CardContent>
            {loading && <LoadingPage isOverlay={true} size={120} />}
            <CardFooter className="flex justify-between items-center sm:justify-between">
                {step > 1 && (
                    <Button variant="outline" onClick={handleBackPreviousStep} disabled={isProcessing}>
                        Back
                    </Button>
                )}
                <div className="flex-1 sm:flex-none"></div>

                <Button onClick={handleContinue} disabled={!isStepValid()}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default CardImport;
