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
    useMemo,
    useRef,
    useState,
} from 'react';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';
import { TopicWorkspaceTabValue } from '../types';
import useFlashCardWorkSpace, { IResponseFlashCardGenerate } from '../hooks/useFlashCardWorkSpace';
import useGamesWorkSpace, { GameType } from '../hooks/useGamesWorkSpace';
import { useSearchParams } from 'next/navigation';
import { ILearningMaterial } from '../service/learningMaterial.service';
import { METHOD_LEARNING } from '@/utils/constants/method';
import useYoutubePlayer from '../hooks/useYoutubePlayer';
import usePdfToolBar from '../hooks/usePdfToolBar';
import { YouTubePlayer } from 'react-youtube';
import { INote } from '../types/note.type';
import useNoteWorkspace from '../hooks/useNoteWorkspace';
import { FlashcardTab } from '../components/flashcard/FlashcardContent';

export type TypeTopicId = number;

interface ContextType {
    tab: TopicWorkspaceTabValue;
    topicId: TypeTopicId;
    topic: ITopic | null;
    flashcards: IFlashcard[] | null;
    learningFlashcards: IDueAnkiCard[] | null;
    ankiSettings: { settings: IAnkiSetting[]; activeSettingId: number } | null;
    learningMaterial: ILearningMaterial | null;
    isPdfViewerFullscreen: boolean;
    pageNumber: number;
    contentTextOrigin: MutableRefObject<string>;
    player: YouTubePlayer | null;

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

    generatingFlashcards: IResponseFlashCardGenerate[] | null;
    setGeneratingFlashcards: Dispatch<SetStateAction<IResponseFlashCardGenerate[] | null>>;
    flashcardTab: FlashcardTab;
    setFlashcardTab: Dispatch<SetStateAction<FlashcardTab>>;

    selectedGame: GameType;
    selectGame: (game: GameType) => void;
    resetGame: () => void;

    setIsPdfViewerFullScreen: Dispatch<SetStateAction<boolean>>;
    setLearningMaterial: Dispatch<SetStateAction<ILearningMaterial | null>>;
    setPageNumber: Dispatch<SetStateAction<number>>;
    setPlayer: Dispatch<SetStateAction<YouTubePlayer | null>>;
    seekTo: (seconds: number) => void;

    note: INote | null;
    setNote: Dispatch<SetStateAction<INote | null>>;

    selectingContentText: string;
    setSelectingContentText: Dispatch<SetStateAction<string>>;
}

const TopicWorkspaceContext = createContext<ContextType | null>(null);

interface IProviderProps {
    topicIdInit: TypeTopicId;
    children: ReactNode;
}

const DEFAULT_TAB = 'overview';

const ALLOWED_TABS: TopicWorkspaceTabValue[] = [DEFAULT_TAB, ...Object.values(METHOD_LEARNING)];

export function TopicWorkspaceProvider({ children, topicIdInit }: IProviderProps) {
    const searchParams = useSearchParams();

    const activeTab = useMemo(() => {
        const raw = searchParams?.get('tab') as TopicWorkspaceTabValue;
        return ALLOWED_TABS.includes(raw) ? raw : DEFAULT_TAB;
    }, [searchParams]);

    const [tab, setTab] = useState<TopicWorkspaceTabValue>(activeTab);

    const [topic, setTopic] = useState<ITopic | null>(null);
    const [learningMaterial, setLearningMaterial] = useState<ILearningMaterial | null>(null);

    const topicIdRef = useRef<TypeTopicId>(topicIdInit);

    const contentTextOrigin = useRef<string>('');
    const [selectingContentText, setSelectingContentText] = useState<string>('');

    const { isPdfViewerFullscreen, pageNumber, setIsPdfViewerFullScreen, setPageNumber } = usePdfToolBar();
    const { player, setPlayer, seekTo } = useYoutubePlayer();

    const {
        flashcards,
        learningFlashcards,
        ankiSettings,
        setFlashcards,
        setLearningFlashcards,
        setAnkiSettings,
        onReviewCard,
        generatingFlashcards,
        setGeneratingFlashcards,
        flashcardTab,
        setFlashcardTab,
    } = useFlashCardWorkSpace();

    const { selectedGame, selectGame, resetGame } = useGamesWorkSpace();

    const { note, setNote } = useNoteWorkspace();

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
            learningMaterial,
            pageNumber,
            player,
            setTab,
            setTopicId,
            setTopic,
            setFlashcards,
            setLearningFlashcards,
            onReviewCard,
            setAnkiSettings,
            setIsPdfViewerFullScreen,
            setLearningMaterial,
            setPageNumber,
            setPlayer,
            seekTo,
            generatingFlashcards,
            setGeneratingFlashcards,
            flashcardTab,
            setFlashcardTab,
            selectedGame,
            selectGame,
            resetGame,
            note,
            setNote,
            selectingContentText,
            setSelectingContentText,
        }),
        [
            tab,
            topic,
            flashcards,
            learningFlashcards,
            ankiSettings,
            isPdfViewerFullscreen,
            learningMaterial,
            pageNumber,
            player,
            seekTo,
            generatingFlashcards,
            flashcardTab,
            selectedGame,
            selectGame,
            resetGame,
            note,
            selectingContentText,
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
