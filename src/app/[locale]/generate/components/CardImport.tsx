'use client';

import React, { Fragment, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from '@/hooks/use-toast';
import usePost from '@/hooks/usePost';
import { useEventSource } from '@/hooks/useEventSource';
import { resetExtractionState } from '@/app/[locale]/generate/stores/features/contentExtractionSlice';
import { resetImportDialog, setFiles, setStep } from '@/app/[locale]/generate/stores/features/importDialogSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ContentDetailView from '../detail-extract/components/ContentDetailView';
import Import from './import/Import';
import ContentGenerationPreview from './ContentGenerationPreview';
import GeneratingSkeleton from '@/components/generative/GeneratingSkeleton';
import LoadingPage from '@/app/loading';
import LoadingOverlay from './import/components/LoadingOverlay';
import { compressContent } from '../helper/compress';
import { useContentGeneration } from '../hooks/useContentGeneration';
import { useCardImportDispatch, useCardImportSelector } from '../hooks/useReduxStore';
import { ApiResponsePubGenContent, ISseData } from '../types';
import { URL_API_GENERATE } from '../utils/constant';
import { ClassPropsInGenerate } from './GeneratePage';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';

interface CardImportProps {
    onOpenChange?: (open: boolean) => void;
    onComplete?: (data: any) => void;
    classProps: ClassPropsInGenerate;
}

const CardImport: React.FC<CardImportProps> = ({ onComplete = () => {}, classProps }) => {
    const dispatch = useCardImportDispatch();
    const t = useTranslations('generate.cardImport');
    const tFileTab = useTranslations('generate.fileTab');

    const { textContent, extractedContent, activeTab } = useCardImportSelector((state) => state.contentExtraction);
    const { step, importMethod, files, selectedMethod, isProcessing, isUploading } = useCardImportSelector(
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
        isTopicModalOpen,
        setIsTopicModalOpen,
        handleOnClickSave,

        isCreateFeedModalOpen,
        setIsCreateFeedModalOpen,
        handleCreateFeedModalOpen,
        handleCreateFeedClick,
        defaultFeed,
        handleCancelFeedClick,
    } = useContentGeneration({ sseData, sseStatus, classProps });

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
                        shouldCreateTopic
                        isTopicModalOpen={isTopicModalOpen}
                        setIsTopicModalOpen={setIsTopicModalOpen}
                        onSave={handleOnClickSave}
                        shouldCreateFeed={classProps.mode === MODE_ACCESS_PAGE_ROLE.classBased}
                        isFeedModalOpen={isCreateFeedModalOpen}
                        setIsFeedModalOpen={setIsCreateFeedModalOpen}
                        openFeedModal={handleCreateFeedModalOpen}
                        onSaveFeed={handleCreateFeedClick}
                        defaultFeed={defaultFeed}
                        onCancelFeed={handleCancelFeedClick}
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
        if (sseStatus === 'timeout' || sseStatus === 'error') {
            toast({
                description: sseStatus === 'timeout' ? t('toasts.timeout') : t('toasts.error'),
                variant: 'destructive',
            });
        } else if (sseData && sseStatus === 'completed') {
            dispatch(setStep(3));
            toast({
                description: t('toasts.success'),
                variant: 'default',
            });
        }
    }, [sseData, sseStatus, dispatch]);

    useEffect(() => {
        return () => {
            dispatch(resetExtractionState());
            dispatch(resetImportDialog());
        };
    }, []);

    if (jobId && sseStatus === 'open') {
        return <GeneratingSkeleton />;
    }

    if (step === 3)
        return (
            <div className=" items-center justify-between p-4">
                {renderStepContent()}
                <div className="flex-1 sm:flex-none"></div>
                <Button className="fixed bottom-4 right-[50%] z-50" onClick={handleContinue} disabled={!isStepValid()}>
                    {t('buttons.createContent')}
                </Button>
            </div>
        );

    return (
        <Fragment>
            <Card className="max-w-[80vw] max-h-[90vh] overflow-auto mx-auto my-4">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold ">
                        {step === 1 && t('titles.step1')}
                        {step === 2 && t('titles.step2')}
                    </CardTitle>
                </CardHeader>

                <CardContent className="">{renderStepContent()}</CardContent>
                {loading && <LoadingPage isOverlay={true} size={120} />}
                <CardFooter className="flex justify-between items-center sm:justify-between">
                    {step > 1 && (
                        <Button variant="outline" onClick={handleBackPreviousStep} disabled={isProcessing}>
                            {t('buttons.back')}
                        </Button>
                    )}
                    <div className="flex-1 sm:flex-none"></div>

                    <Button onClick={handleContinue} disabled={!isStepValid()}>
                        {t('buttons.continue')}
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </CardFooter>
            </Card>
            {isUploading && (
                <LoadingOverlay
                    title={tFileTab('loading.uploading.title')}
                    description={tFileTab('loading.uploading.description')}
                />
            )}
        </Fragment>
    );
};

export default CardImport;
