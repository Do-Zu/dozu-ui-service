'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Link, Loader2, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { MarkdownContent } from '@/components/customs/markdown-content';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import {
  setInputUrl,
  setActiveTab,
  setContentView,
  setTextContent,
  resetExtractionState,
  extractYouTubeVideoId,
  extractYouTubeTranscript,
  extractWebsiteContent,
} from '@/stores/features/content-extraction/contentExtractionSlice';

const TabContent: React.FC = () => {
  // Use Redux state and dispatch
  const dispatch = useAppDispatch();
  const {
    activeTab,
    inputUrl,
    extractedContent,
    isLoading,
    error: extractionError,
    contentView,
    videoInfo,
    contentType,
    textContent,
  } = useAppSelector((state) => state.contentExtraction);

  // Determine if URL is a YouTube URL
  const isYouTubeUrl = (url: string): boolean => {
    return extractYouTubeVideoId(url) !== null;
  };

  // Handle content extraction based on URL type
  const handleExtractContent = useCallback(async () => {
    if (!inputUrl.trim()) {
      // Handle empty URL case
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

  // Handle copying content to clipboard
  const copyToClipboard = (content: string) => {
    if (!content) return;

    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast({
          title: 'Copied to clipboard',
          description: 'The content has been copied to your clipboard',
        });
      })
      .catch(() => {
        toast({
          title: 'Failed to copy',
          description: 'Could not copy to clipboard',
          variant: 'destructive',
        });
      });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setTextContent(e.target.value));
  };

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
                placeholder="Enter YouTube URL or website URL (e.g., https://youtube.com/... or https://example.com)"
                value={inputUrl}
                onChange={(e) => dispatch(setInputUrl(e.target.value))}
                className="flex-1"
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

            {extractionError && (
              <Alert variant="destructive">
                <AlertDescription>{extractionError}</AlertDescription>
              </Alert>
            )}

            {videoInfo && contentType === 'youtube' && (
              <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                {videoInfo.thumbnailUrl && (
                  <img
                    src={videoInfo.thumbnailUrl}
                    alt={videoInfo.title}
                    className="w-32 h-auto rounded object-cover"
                  />
                )}
                <div>
                  <h3 className="font-medium text-lg">{videoInfo.title}</h3>
                  <p className="text-sm text-gray-500">YouTube transcript extracted successfully</p>
                </div>
              </div>
            )}

            {extractedContent && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">
                  {contentType === 'youtube' ? 'YouTube Transcript:' : 'Extracted Content:'}
                </h3>
                <Tabs
                  value={contentView}
                  onValueChange={(value) =>
                    dispatch(setContentView(value as 'preview' | 'markdown'))
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="markdown">Markdown</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="mt-2">
                    <MarkdownContent content={extractedContent} className="min-h-[300px]" />
                  </TabsContent>

                  <TabsContent value="markdown" className="mt-2">
                    <div className="border rounded-md relative">
                      <Textarea
                        value={extractedContent}
                        readOnly
                        className="min-h-[300px] font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-800"
                        onClick={() => copyToClipboard(extractedContent)}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
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
            onChange={(e) => {
              dispatch(setTextContent(e.target.value));
              handleTextChange(e);
            }}
          />
          <p className="text-xs">
            Tip: You can paste text from any source, including websites, documents, or notes.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TabContent;
