'use client';

import React from 'react';
import SelectMethod from '../../components/steps/SelectMethod';
import { useCardImportSelector } from '../../hooks/useReduxStore';
import { MarkdownContent } from '@/components/customs/markdown-content';
import { Card, CardContent } from '@/components/ui/card';

interface ContentDetailViewProps {
    onBack?: () => void;
}

const ContentDetailView: React.FC<ContentDetailViewProps> = ({ onBack }) => {
    const { activeTab, textContent } = useCardImportSelector((state) => state.contentExtraction);

    const { importMethod } = useCardImportSelector((state) => state.importDialog);

    // const [activeTranscriptView, setActiveTranscriptView] = useState<'full' | 'segments'>('segments');

    // const copyToClipboard = (content: string) => {
    //     if (!content) return;

    //     navigator.clipboard
    //         .writeText(content)
    //         .then(() => {
    //             toast({
    //                 title: 'Copied to clipboard',
    //                 description: 'The content has been copied to your clipboard',
    //             });
    //         })
    //         .catch(() => {
    //             toast({
    //                 title: 'Failed to copy',
    //                 description: 'Could not copy to clipboard',
    //                 variant: 'destructive',
    //             });
    //         });
    // };

    // const navigateToTime = (timeInSeconds: number) => {
    //     if (contentType === 'youtube' && inputUrl) {
    //         const videoId = extractYoutubeVideoId(inputUrl);
    //         if (videoId) {
    //             window.open(`https://youtube.com/watch?v=${videoId}&t=${timeInSeconds}`, '_blank');
    //         }
    //     }
    // };

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

    // const renderLeftSide = () => (
    //     <Card className="w-full">
    //         <CardContent>{textContent}</CardContent>
    //     </Card>
    // );

    return (
        <div className="container mx-auto py-4 max-h-[60%] overflow-hidden">
            <div className={`grid grid-cols-1 ${isDisplayPreviewLeftSide() ? 'md:grid-cols-2' : ''} gap-6`}>
                {/* {renderLeftSide()} */}
                <SelectMethod />
            </div>
        </div>
    );
};

export default ContentDetailView;
