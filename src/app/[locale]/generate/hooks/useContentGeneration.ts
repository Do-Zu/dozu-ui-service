import { useState, useEffect } from 'react';
import { ISseData, IFlashcardsFromSSE, CONTENT_TYPE_GENERATE } from '../types';
import { handleConvertToFlashcardsEdited, IFlashcardWithServer } from '../../flashcards/components/FlashcardEditor';
import { detectContentType, getContentTypeDisplayName } from '../utils/contentTypeDetector';
import { ContentType, TypeDataGenerated } from '../components/ContentGenerationPreview';
import { toast } from '@/hooks/use-toast';
import router from 'next/router';
import { ContentCreationService } from '../services/contentCreation.service';
import { resetImportDialog } from '../stores/features/importDialogSlice';
import { useCardImportDispatch } from './useReduxStore';

export interface UseContentGenerationProps {
    sseData: ISseData | null;
    sseStatus: string;
}

export interface UseContentGenerationReturn {
    contentType: ContentType | null;
    dataGenerated: TypeDataGenerated;
    //TODO: Extend this to handle other content types
    setDataGenerated: (data: TypeDataGenerated) => void;
    isContentReady: boolean;
    topicName: string;
    setTopicName: (name: string) => void;
    topicDescription: string;
    setTopicDescription: (description: string) => void;
    isTopicModalOpen: boolean;
    setIsTopicModalOpen: (open: boolean) => void;
    handleOnClickSave: () => Promise<void>;
}

export const useContentGeneration = ({ sseData, sseStatus }: UseContentGenerationProps): UseContentGenerationReturn => {
    const [dataGenerated, setDataGenerated] = useState<TypeDataGenerated>(null);
    const [topicName, setTopicName] = useState<string>('');
    const [topicDescription, setTopicDescription] = useState<string>('');
    const [isTopicModalOpen, setIsTopicModalOpen] = useState<boolean>(false);

    const dispatch = useCardImportDispatch();

    const contentType = detectContentType(sseData);
    const isContentReady = Boolean(sseData?.data?.data) && sseStatus === 'completed';

    const handleParseData = (data: object[] | null): object[] => {
        if (!data || data.length === 0) {
            return [];
        }

        if (contentType === CONTENT_TYPE_GENERATE.FLASH_CARD) {
            return handleConvertToFlashcardsEdited({
                type: 'generative',
                flashcardsProp: data as IFlashcardsFromSSE,
            });
        } else if (contentType === CONTENT_TYPE_GENERATE.MIND_MAP) {
            return data;
        }

        //TODO: Add parsing logic for other content types
        // For now, return empty array for unsupported types
        return [];
    };

    const handleOnClickSave = async () => {
        const contentData = dataGenerated;

        if (!contentData) {
            toast({
                description: 'No content to save',
                variant: 'destructive',
            });
            return;
        }

        const result = await ContentCreationService.createContent({
            topicName,
            topicDescription,
            contentType,
            contentData,
        });

        if (result.success) {
            dispatch(resetImportDialog());
            toast({
                title: `${getContentTypeDisplayName(contentType)} created successfully!`,
                description: 'Your content has been attached to the new topic.',
                variant: 'default',
            });
            router.push('/home');
        } else {
            toast({
                description: result.error || 'Failed to create content',
                variant: 'destructive',
            });
        }
    };

    // Process SSE data when it changes
    useEffect(() => {
        if (sseData && sseStatus === 'completed') {
            if (!sseData?.data?.data) {
                setDataGenerated(null);
            } else {
                const parsedData = handleParseData(sseData.data.data);
                setDataGenerated(parsedData);
            }
        }
    }, [sseData, sseStatus, contentType]);

    return {
        contentType,
        dataGenerated,
        setDataGenerated,
        isContentReady,
        topicName,
        setTopicName,
        topicDescription,
        setTopicDescription,
        isTopicModalOpen,
        setIsTopicModalOpen,
        handleOnClickSave,
    };
};
