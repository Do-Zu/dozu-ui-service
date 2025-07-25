import { useState, useEffect } from 'react';
import router from 'next/router';
import { toast } from '@/hooks/use-toast';

import { ISseData, IFlashcardsFromSSE, CONTENT_TYPE_GENERATE, IQuestionsFromSSERaw } from '../types';
import { handleConvertToFlashcardsEdited, IFlashcardWithServer } from '../../flashcards/components/FlashcardEditor';
import { handleConvertToQuestionsEdited } from '../../question/utils/handleConvertToQuestionsEdited';
import { detectContentType, getContentTypeDisplayName } from '../utils/contentTypeDetector';
import { ContentType, TypeDataGenerated } from '../components/ContentGenerationPreview';
import { ContentCreationService } from '../services/contentCreation.service';
import { resetImportDialog } from '../stores/features/importDialogSlice';
import { useCardImportDispatch } from './useReduxStore';
import { ROUTES } from '@/utils/constants/routes';
import { ClassPropsInGenerate } from '../components/GeneratePage';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';

export interface UseContentGenerationProps {
    sseData: ISseData | null;
    sseStatus: string;
    classProps?: ClassPropsInGenerate;
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

export const useContentGeneration = ({
    sseData,
    sseStatus,
    classProps = { mode: MODE_ACCESS_PAGE_ROLE.personal },
}: UseContentGenerationProps): UseContentGenerationReturn => {
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
        } else if (contentType === CONTENT_TYPE_GENERATE.QUIZ) {
            return handleConvertToQuestionsEdited({
                type: 'generative',
                questionsProp: data as IQuestionsFromSSERaw,
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
        let result;
        if (classProps.mode === MODE_ACCESS_PAGE_ROLE.personal) {
            result = await ContentCreationService.createContent({
                topicName,
                topicDescription,
                contentType,
                contentData,
            });
        } else if (classProps.mode === MODE_ACCESS_PAGE_ROLE.classBased) {
            const { classId } = classProps;
            result = await ContentCreationService.createContentForClass({
                classId,
                topicName,
                topicDescription,
                contentType,
                contentData,
            });
        } else {
            result = {
                success: false,
                error: `Unsupported learning mode`,
            };
        }

        if (result.success) {
            dispatch(resetImportDialog());
            toast({
                title: `${getContentTypeDisplayName(contentType)} created successfully!`,
                description: 'Your content has been attached to the new topic.',
                variant: 'default',
            });
            setTimeout(() => {
                router.push(ROUTES.LANDING);
            }, 100);
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
