import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ICreateTopicForClassPayload, ICreateTopicPayload } from '@/services/topic/topic.service';
import { useFeeds } from '../../teacher/feeds/hooks/useFeeds';
import { ICreateClassFeedBody, ICreateClassFeedPayload } from '@/services/class-based-learning/classFeed.service';
import { IDefaultFeed } from '../../teacher/feeds/components/modals/CreateFeedModal';
import feedHelper from '@/utils/feeds/feed.helper';
import toastHelper from '@/utils/toast.helper';

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
    isTopicModalOpen: boolean;
    setIsTopicModalOpen: (open: boolean) => void;
    handleOnClickSave: (topic: ICreateTopicPayload) => Promise<void>;

    isCreateFeedModalOpen?: boolean;
    setIsCreateFeedModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    handleCreateFeedModalOpen?: () => void;
    createFeedLoading?: boolean;
    handleCreateFeedClick?: (feed: ICreateClassFeedBody) => Promise<void>;
    defaultFeed?: IDefaultFeed | null;
    handleCancelFeedClick?: () => void;
}

export const useContentGeneration = ({
    sseData,
    sseStatus,
    classProps = { mode: MODE_ACCESS_PAGE_ROLE.personal },
}: UseContentGenerationProps): UseContentGenerationReturn => {
    const [dataGenerated, setDataGenerated] = useState<TypeDataGenerated>(null);
    const [isTopicModalOpen, setIsTopicModalOpen] = useState<boolean>(false);

    const classId = classProps.mode === MODE_ACCESS_PAGE_ROLE.classBased ? classProps.classId : null;
    const useFeedsHook = classId
        ? useFeeds({
              classId,
          })
        : null;
    const createFeed = useFeedsHook?.createFeed;
    const {
        isOpen: isCreateFeedModalOpen,
        setIsOpen: setIsCreateFeedModalOpen,
        open: openCreateFeedModal,
        close: closeCreateFeedModal,
        loading: createFeedLoading,
        createAsync: createFeedAsync,
    } = createFeed ?? {};

    async function handleCreateFeedClick(feed: ICreateClassFeedBody) {
        if (!classId) {
            toastHelper.showErrorMessage(
                'Only can create feed if learning mode is ClassBased and requiring role teacher to do this action',
            );
            return;
        }
        if (feed.link === undefined || feed.link?.length === 0) {
            feed.link = null;
        }
        const value: ICreateClassFeedPayload = { ...feed, classId };
        await createFeedAsync!(value);

        closeCreateFeedModal?.();
        dispatch(resetImportDialog());
        router.push(ROUTES.TEACHER.CLASS_BASED_ID(classId));
    }

    function handleCancelFeedClick() {
        if (!classId) {
            toastHelper.showErrorMessage(
                'Only can create feed if learning mode is ClassBased and requiring role teacher to do this action',
            );
            return;
        }

        closeCreateFeedModal?.();
        dispatch(resetImportDialog());
        router.push(ROUTES.TEACHER.CLASS_BASED_ID(classId));
    }

    const [defaultFeed, setDefaultFeed] = useState<IDefaultFeed | null>(null);

    const router = useRouter();
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

    const handleRedirectAfterGenerateSuccess = (topicId: string | number | undefined) => {
        if (topicId === undefined) {
            router.replace(ROUTES.LANDING);
            return;
        }

        switch (contentType) {
            case CONTENT_TYPE_GENERATE.FLASH_CARD:
                router.replace(ROUTES.FLASHCARDS_BROWSE(topicId));
                break;
            case CONTENT_TYPE_GENERATE.QUIZ:
                router.replace(ROUTES.QUIZ_START(topicId));
                break;
            case CONTENT_TYPE_GENERATE.MIND_MAP:
                router.replace(ROUTES.MINDMAP_VIEW(topicId));
                break;
            default:
                router.replace(ROUTES.LANDING);
        }
    };

    const handleOnClickSave = async (topic: ICreateTopicPayload) => {
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
                topic,
                contentType,
                contentData,
            });
        } else if (classProps.mode === MODE_ACCESS_PAGE_ROLE.classBased) {
            const { classId } = classProps;
            const topicInClass: ICreateTopicForClassPayload = { ...topic, classId };
            result = await ContentCreationService.createContentForClass({
                topic: topicInClass,
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
            toast({
                description: 'Your content has been attached to the new topic.',
                variant: 'default',
            });
            if (classProps.mode === MODE_ACCESS_PAGE_ROLE.personal) {
                dispatch(resetImportDialog());
                handleRedirectAfterGenerateSuccess(result?.topicId);
            } else {
                setIsTopicModalOpen(false);
                const contentType = detectContentType(sseData);
                if (contentType !== null && result.topicId) {
                    const contentTypeDisplayName = getContentTypeDisplayName(contentType);
                    const link = feedHelper.getLink(result.topicId, contentType);
                    const defaultFeed: IDefaultFeed = {
                        title: `${contentTypeDisplayName} is now available`,
                        content: `${contentTypeDisplayName} has been generated and is now available in topic '${result?.topicName}'`,
                        link,
                    };
                    setDefaultFeed(defaultFeed);
                }
                openCreateFeedModal?.();
            }
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
        isTopicModalOpen,
        setIsTopicModalOpen,
        handleOnClickSave,

        isCreateFeedModalOpen,
        setIsCreateFeedModalOpen,
        handleCreateFeedModalOpen: openCreateFeedModal,
        createFeedLoading,
        handleCreateFeedClick,
        defaultFeed,
        handleCancelFeedClick,
    };
};
