'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Link, Loader2, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import {
  setInputUrl,
  setActiveTab,
  setTextContent,
  resetExtractionState,
  extractYouTubeVideoId,
  extractYouTubeTranscript,
  extractWebsiteContent,
} from '@/stores/features/content-extraction/contentExtractionSlice';
import { setStep } from '@/stores/features/import-dialog/importDialogSlice';

const TabContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    activeTab,
    inputUrl,
    extractedContent,
    isLoading,
    error: extractionError,
    videoInfo,
    contentType,
    textContent,
  } = useAppSelector((state) => state.contentExtraction);

  const { step } = useAppSelector((state) => state.importDialog);

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
        dispatch(extractWebsiteContent(inputUrl));
      }
    } catch (err) {
      console.error('Error during extraction:', err);
    }
  }, [dispatch, inputUrl]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setTextContent(e.target.value));
  };

  const handleUrlOnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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
      dispatch(extractWebsiteContent(pastedUrl));
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
        title: 'Extraction Error',
        description: extractionError,
        variant: 'destructive',
      });
    }
  }, [extractionError, dispatch]);

  const onCompleteProcess = () => {
    if (step === 1) dispatch(setStep(2));
  };

  useEffect(() => {
    if (extractedContent && !isLoading && !extractionError) {
      onCompleteProcess();
    }
  }, [isLoading, extractionError]);

  return (
    <Tabs value={activeTab} onValueChange={(value) => dispatch(setActiveTab(value))}>
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="url" className="flex items-center gap-2">
          <Link className="h-4 w-4" />
          <span>URL Content</span>
        </TabsTrigger>
        <TabsTrigger value="text" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Text</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="url" className="mt-4">
        <Card className="w-full">
          <CardContent className="space-y-4 mt-4">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter YouTube URL or website URL (e.g., https://youtube.com/... or https://example.com)"
                value={inputUrl}
                onChange={handleChangeInputUrl}
                className="flex-1"
                onPaste={handleUrlOnPaste}
                disabled={isLoading}
              />
              <Button
                onClick={handleExtractContent}
                disabled={isLoading || !inputUrl.trim()}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Extract Content
                  </>
                )}
              </Button>
            </div>

            {videoInfo && contentType === 'youtube' && (
              <div className="flex gap-4 p-4 bg-muted rounded-lg">
                {videoInfo.thumbnailUrl && (
                  <img
                    src={videoInfo.thumbnailUrl}
                    alt={videoInfo.title}
                    className="w-32 h-auto rounded object-cover"
                  />
                )}
                <div>
                  <h3 className="font-medium text-lg">{videoInfo.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    YouTube transcript extracted successfully
                  </p>
                </div>
              </div>
            )}

            {extractedContent && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">
                    {contentType === 'youtube' ? 'YouTube Transcript:' : 'Extracted Content:'}
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
            placeholder="Paste or type your content here..."
            className="min-h-[200px]"
            value={textContent}
            onChange={handleTextChange}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs">
              Tip: You can paste text from any source, including websites, documents, or notes.
            </p>

            {/* Show View Details button for text content too */}
            {textContent.trim() && !showDetailView && (
              <Button
                onClick={handleViewDetails}
                variant="outline"
                className="flex items-center gap-1 text-primary hover:bg-blue-50"
              >
                <ExternalLink className="h-4 w-4" />
                View Full Details
              </Button>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TabContent;
