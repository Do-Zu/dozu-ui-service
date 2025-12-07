'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Link, Loader2, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useCardImportSelector, useCardImportDispatch } from '../../../hooks/useReduxStore';
import {
    setInputUrl,
    setActiveTab,
    setTextContent,
    resetExtractionState,
    extractYouTubeVideoId,
    extractYouTubeTranscript,
    setContentType,
} from '@/app/[locale]/generate/stores/features/contentExtractionSlice';
import { setFiles, setStep } from '@/app/[locale]/generate/stores/features/importDialogSlice';
import { ExtractionTab, RESOURCE_CONTENT_TYPE } from '../../../constants/resource';
import { isNilOrEmpty } from '@/utils';
import useReaderFile from '../../../hooks/useReaderFile';
import useUrlToPdfConverter from '../../../hooks/useUrlToPdfConverter';

const TabContent: React.FC = () => {
    const dispatch = useCardImportDispatch();
    const t = useTranslations('generate.textUrlTab');
    const {
        activeTab,
        inputUrl,
        extractedContent,
        isLoading,
        error: extractionError,
        videoInfo,
        contentType,
        textContent,
    } = useCardImportSelector((state) => state.contentExtraction);

    const { step } = useCardImportSelector((state) => state.importDialog);
    const { loading: isExtractContent } = useReaderFile();
    const { convertUrlToPdf, isConverting } = useUrlToPdfConverter();

    // State to control view switching
    const [showDetailView, setShowDetailView] = useState(false);
    const isYouTubeUrl = (url: string): boolean => {
        return extractYouTubeVideoId(url) !== null;
    };

    const handleExtractContent = useCallback(async () => {
        if (!inputUrl.trim()) {
            return;
        }

        dispatch(resetExtractionState());

        try {
            if (isYouTubeUrl(inputUrl)) {
                const videoId = extractYouTubeVideoId(inputUrl);
                if (videoId) {
                    dispatch(extractYouTubeTranscript(videoId));
                }
            } else {
                handleExtractUrlContent(inputUrl);
            }
        } catch (err) {
            //console.error('Error during extraction:', err);
        }
    }, [dispatch, inputUrl]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch(setTextContent(e.target.value));
    };

    const handleFileUpload = useCallback((file: File) => {
        dispatch(setFiles([file]));
    }, []);

    const handleExtractUrlContent = useCallback(
        async (pastedUrl: string) => {
            if (isNilOrEmpty(pastedUrl)) {
                return;
            }

            await convertUrlToPdf(pastedUrl, {
                onSuccess: (pdfFile) => {
                    dispatch(setContentType(RESOURCE_CONTENT_TYPE.WEBSITE));
                    handleFileUpload(pdfFile);
                },
                onError: () => {
                    toast({
                        title: 'Failed to extract content from URL',
                    });
                },
            });
        },
        [convertUrlToPdf, dispatch, handleFileUpload],
    );

    const handleUrlOnPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        dispatch(resetExtractionState());
        e.preventDefault();
        const pastedUrl = e.clipboardData.getData('text').trim();
        const urlPattern =
            /^(https?:\/\/)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6})\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

        // Regex pattern to validate URLs
        // This pattern checks for a valid URL format, including http/https and domain name
        if (!pastedUrl || !urlPattern.test(pastedUrl)) {
            return;
        }

        dispatch(setInputUrl(pastedUrl));

        if (isYouTubeUrl(pastedUrl)) {
            const videoId = extractYouTubeVideoId(pastedUrl);
            if (videoId) {
                dispatch(extractYouTubeTranscript(videoId));
            }
        } else {
            handleExtractUrlContent(pastedUrl);
        }
    };

    const handleChangeInputUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setInputUrl(e.target.value));
    };

    const handleViewDetails = () => {
        setShowDetailView(true);
    };

    useEffect(() => {
        if (extractionError) {
            toast({
                title: t('toasts.extractionError'),
                description: extractionError,
                variant: 'destructive',
            });
        }
    }, [extractionError, dispatch]);

    const onCompleteProcess = () => {
        if (step === 1) dispatch(setStep(2));
    };

    const isProcessingExtract = useMemo(
        () => isLoading || isExtractContent || isConverting,
        [isLoading, isExtractContent, isConverting],
    );

    useEffect(() => {
        if (extractedContent && !isProcessingExtract) {
            onCompleteProcess();
        }
    }, [isProcessingExtract, extractedContent]);

    return (
        <Tabs value={activeTab} onValueChange={(value) => dispatch(setActiveTab(value as ExtractionTab))}>
            <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <span>{t('tabs.url')}</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{t('tabs.text')}</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="mt-4">
                <Card className="w-full">
                    <CardContent className="space-y-4 mt-4">
                        <div className="flex gap-3">
                            <Input
                                type="text"
                                placeholder={t('input.urlPlaceholder')}
                                value={inputUrl}
                                onChange={handleChangeInputUrl}
                                className="flex-1"
                                onPaste={handleUrlOnPaste}
                                disabled={isProcessingExtract}
                            />
                            <Button
                                onClick={handleExtractContent}
                                disabled={isProcessingExtract || !inputUrl.trim()}
                                className="flex items-center gap-2"
                            >
                                {isProcessingExtract ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('buttons.extracting')}
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-4 w-4" />
                                        {t('buttons.extract')}
                                    </>
                                )}
                            </Button>
                        </div>

                        {videoInfo && contentType === RESOURCE_CONTENT_TYPE.YOUTUBE && (
                            <div className="flex gap-4 p-4 bg-muted rounded-lg">
                                {videoInfo?.thumbnailUrl && (
                                    <img
                                        src={videoInfo.thumbnailUrl}
                                        alt={videoInfo?.title}
                                        className="w-32 h-auto rounded object-cover"
                                    />
                                )}
                                <div>
                                    <h3 className="font-medium text-lg">{videoInfo?.title}</h3>
                                    <p className="text-sm text-muted-foreground">{t('messages.ytExtracted')}</p>
                                </div>
                            </div>
                        )}

                        {extractedContent && (
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-medium">
                                        {contentType === RESOURCE_CONTENT_TYPE.YOUTUBE
                                            ? t('headings.youtubeTranscript')
                                            : t('headings.extractedContent')}
                                    </h3>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="text" className="mt-4">
                <div className="space-y-4">
                    <Textarea
                        placeholder={t('input.textPlaceholder')}
                        className="min-h-[200px]"
                        value={textContent}
                        onChange={handleTextChange}
                    />
                    <div className="flex justify-between items-center">
                        <p className="text-xs">{t('messages.tip')}</p>

                        {/* Show View Details button for text content too */}
                        {textContent.trim() && !showDetailView && (
                            <Button
                                onClick={handleViewDetails}
                                variant="outline"
                                className="flex items-center gap-1 text-primary hover:bg-blue-50"
                            >
                                <ExternalLink className="h-4 w-4" />
                                {t('buttons.viewDetails')}
                            </Button>
                        )}
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
};

export default TabContent;
