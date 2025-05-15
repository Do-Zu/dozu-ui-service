'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MarkdownContent } from '@/components/customs/markdown-content';
import { useAppSelector } from '@/stores/hooks';
import { ArrowLeft, Copy, ExternalLink, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import WebsiteView from './WebsiteView';
import SelectMethod from '../../components/steps/SelectMethod';
import { useCardImportSelector } from '../../hooks/useReduxStore';

interface ContentDetailViewProps {
  onBack?: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const ContentDetailView: React.FC<ContentDetailViewProps> = ({ onBack }) => {
  const {
    extractedContent,
    contentType,
    videoInfo,
    inputUrl,
    error: extractionError,
    transcriptSegments,
    activeTab,
    textContent,
  } = useCardImportSelector((state) => state.contentExtraction);

  const { importMethod } = useCardImportSelector((state) => state.importDialog);

  const router = useRouter();
  const [activeTranscriptView, setActiveTranscriptView] = useState<'full' | 'segments'>('segments');

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

  const navigateToTime = (timeInSeconds: number) => {
    if (contentType === 'youtube' && inputUrl) {
      const videoId = extractYoutubeVideoId(inputUrl);
      if (videoId) {
        window.open(`https://youtube.com/watch?v=${videoId}&t=${timeInSeconds}`, '_blank');
      }
    }
  };

  const extractYoutubeVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const getYoutubeEmbedUrl = (url: string): string => {
    const videoId = extractYoutubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const isDisplayPreviewLeftSide = (): boolean => {
    if (activeTab !== 'text') {
      return false;
    }

    if (importMethod === 'text' && textContent.trim().length > 0) {
      return false;
    }

    return true;
  };

  const renderLeftSide = () =>
    isDisplayPreviewLeftSide() && (
      <Card className="w-full">
        <CardHeader>
          {contentType === 'youtube' && transcriptSegments.length > 0 && (
            <Tabs
              defaultValue="segments"
              value={activeTranscriptView}
              onValueChange={(value) => setActiveTranscriptView(value as 'full' | 'segments')}
              className="mt-2"
            >
              <TabsList>
                <TabsTrigger value="segments">Segmented View</TabsTrigger>
                <TabsTrigger value="full">Full Text</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </CardHeader>
        <CardContent>
          {contentType === 'youtube' && (
            <div className="space-y-4">
              {videoInfo?.title && <h3 className="text-lg font-medium">{videoInfo.title}</h3>}
              <div className="aspect-video">
                <iframe
                  className="w-full h-full rounded-md"
                  src={getYoutubeEmbedUrl(inputUrl)}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {contentType === 'website' && <WebsiteView />}

          <div className="relative">
            <div className="max-h-[10em] h-auto overflow-y-auto p-4 rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {contentType === 'youtube' &&
              transcriptSegments.length > 0 &&
              activeTranscriptView === 'segments' ? (
                <div>
                  {transcriptSegments.map((segment, index) => (
                    <div key={index} className="group p-2 hover:bg-muted rounded">
                      <div className="flex items-start gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-0.5 hover:text-primary"
                          onClick={() => navigateToTime(segment.startTime)}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(segment.startTime)}
                        </Button>
                        <p>{segment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : extractedContent ? (
                <MarkdownContent content={extractedContent} className="prose max-w-none" />
              ) : (
                <p className="text-muted-foreground">No content available</p>
              )}
            </div>

            <Button
              size="sm"
              className="absolute top-2 right-2 bg-muted hover:bg-muted"
              onClick={() => copyToClipboard(extractedContent)}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <div className="container mx-auto py-4 max-h-[60%] overflow-hidden">
      <div
        className={`grid grid-cols-1 ${isDisplayPreviewLeftSide() ? 'md:grid-cols-2' : ''} gap-6`}
      >
        {renderLeftSide()}
        <SelectMethod />
      </div>
    </div>
  );
};

export default ContentDetailView;
