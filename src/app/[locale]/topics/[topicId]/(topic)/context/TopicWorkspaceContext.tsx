import { IAnkiCardReviewed, IDueAnkiCard, IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';
import { ITopic } from '../../../types/topic.type';
import React, {
    createContext,
    Dispatch,
    MutableRefObject,
    ReactNode,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';
import { TopicWorkspaceTabValue } from '../types';
import useFlashCardWorkSpace from '../hooks/useFlashCardWorkSpace';
import { useSearchParams } from 'next/navigation';

export type TypeTopicId = number;
interface ContextType {
    tab: TopicWorkspaceTabValue;
    topicId: TypeTopicId;
    topic: ITopic | null;
    flashcards: IFlashcard[] | null;
    learningFlashcards: IDueAnkiCard[] | null;
    ankiSettings: { settings: IAnkiSetting[]; activeSettingId: number } | null;
    setTab: Dispatch<SetStateAction<TopicWorkspaceTabValue>>;
    setTopicId: (topicId: TypeTopicId) => void;
    setTopic: Dispatch<SetStateAction<ITopic | null>>;
    setFlashcards: Dispatch<SetStateAction<IFlashcard[] | null>>;
    setLearningFlashcards: Dispatch<SetStateAction<IDueAnkiCard[] | null>>;
    setAnkiSettings: Dispatch<SetStateAction<{ settings: IAnkiSetting[]; activeSettingId: number } | null>>;

    onReviewCard: (args: {
        currentCard: IDueAnkiCard;
        reviewedCard: IAnkiCardReviewed | null;
    }) => IDueAnkiCard[] | null;

    isPdfViewerFullscreen: boolean;
    setIsPdfViewerFullScreen: Dispatch<SetStateAction<boolean>>;

    contentTextOrigin: MutableRefObject<string>;
}

const TopicWorkspaceContext = createContext<ContextType | null>(null);

interface IProviderProps {
    topicIdInit: TypeTopicId;
    children: ReactNode;
}

const DEFAULT_TAB = 'overview';

export function TopicWorkspaceProvider({ children, topicIdInit }: IProviderProps) {
    const searchParams = useSearchParams();

    const activeTab = useMemo(() => {
        return (searchParams?.get('tab') ?? DEFAULT_TAB) as TopicWorkspaceTabValue;
    }, [searchParams]);

    const [tab, setTab] = useState<TopicWorkspaceTabValue>(activeTab);

    const [topic, setTopic] = useState<ITopic | null>(null);

    const topicIdRef = useRef<TypeTopicId>(topicIdInit);

    const contentTextOrigin = useRef<string>('');

    const [isPdfViewerFullscreen, setIsPdfViewerFullScreen] = useState<boolean>(false);

    const {
        flashcards,
        learningFlashcards,
        ankiSettings,
        setFlashcards,
        setLearningFlashcards,
        setAnkiSettings,
        onReviewCard,
    } = useFlashCardWorkSpace();

    const setTopicId = useCallback((topicIdArg: TypeTopicId) => {
        topicIdRef.current = topicIdArg;
    }, []);

    const value = useMemo(
        () => ({
            tab,
            topicId: topicIdRef.current,
            topic,
            flashcards,
            learningFlashcards,
            ankiSettings,
            isPdfViewerFullscreen,
            contentTextOrigin,
            setTab,
            setTopicId,
            setTopic,
            setFlashcards,
            setLearningFlashcards,
            onReviewCard,
            setAnkiSettings,
            setIsPdfViewerFullScreen,
        }),
        [
            tab,
            topic,
            flashcards,
            learningFlashcards,
            ankiSettings,
            isPdfViewerFullscreen,
            setTab,
            setTopic,
            setFlashcards,
            setLearningFlashcards,
            onReviewCard,
            setAnkiSettings,
            setIsPdfViewerFullScreen,
        ],
    );

    return <TopicWorkspaceContext.Provider value={value}>{children}</TopicWorkspaceContext.Provider>;
}

export function useTopicWorkspace() {
    const context = useContext(TopicWorkspaceContext);
    if (!context) {
        throw new Error('useTopicWorkspace must be used inside <TopicWorkspaceProvider>');
    }
    return context;
}
