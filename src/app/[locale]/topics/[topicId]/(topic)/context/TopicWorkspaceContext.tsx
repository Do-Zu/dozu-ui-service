import {
    IAnkiCardReviewed,
    IBatchFlashcardsInTopicResult,
    IDueAnkiCard,
    IFlashcard,
} from '@/app/[locale]/flashcards/types/flashcard.type';
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
import { EnumLearningMaterial, TopicWorkspaceTabValue } from '../types';
import useFlashCardWorkSpace, { IResponseFlashCardGenerate } from '../hooks/useFlashCardWorkSpace';
import useGamesWorkSpace, { GameType } from '../hooks/useGamesWorkSpace';
import { useSearchParams } from 'next/navigation';
import { ILearningMaterial } from '../service/learningMaterial.service';
import { METHOD_LEARNING } from '@/utils/constants/method';
import usePdfMaterial from '../hooks/usePdfMaterial';
import { INote, IContentReference } from '../types/note.type';
import useNoteWorkspace from '../hooks/useNoteWorkspace';
import { FlashcardTab } from '../components/flashcard/FlashcardContent';
import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import { FitView } from '@xyflow/react';
import { PdfPageText } from '@/hooks/usePdfReader';
import useMediaPlayer from '../hooks/media/useMediaPlayer';
import MediaPlayerController from '../media/core/MediaPlayerController';
import pdfMaterialUtils from '../utils/material/pdfMaterial.utils';
import mediaMaterialUtils from '../utils/material/mediaMaterial.utils';

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

    setIsPdfViewerFullscreen: Dispatch<SetStateAction<boolean>>;
    setLearningMaterial: Dispatch<SetStateAction<ILearningMaterial | null>>;
    setPageNumber: (page: number) => void;

    note: INote | null;
    setNote: Dispatch<SetStateAction<INote | null>>;

    selectingContentText: string;
    setSelectingContentText: Dispatch<SetStateAction<string>>;

    isFlashcardTabLoading: boolean;
    flashcardTabError: string | null;
    refetchFlashcards: () => Promise<void>;
    refetchLearningFlashcards: () => Promise<void>;
    refetchAnkiSetting: () => Promise<void>;
    onBatchFlashcardsSuccess: (data: IBatchFlashcardsInTopicResult) => void;
    onCreateFlashcardsSuccess: (data: IFlashcard[]) => void;

    isLearningContentFullscreen: boolean;
    setIsLearningContentFullscreen: Dispatch<SetStateAction<boolean>>;

    //mindmap
    isLoading: boolean;
    nodes: AppNode[];
    edges: AppEdge[];
    setNodes: (nodes: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void;
    setEdges: (edges: AppEdge[] | ((edges: AppEdge[]) => AppEdge[])) => void;
    onNodesChange: (changes: unknown) => void;
    onEdgesChange: (changes: unknown) => void;
    saveMindmap: () => Promise<void>;
    hasInitialized: boolean;
    fitView: FitView;
    setIsNodeSheetOpen: (open: boolean) => void;

    // pdf
    pdfPageTexts: MutableRefObject<PdfPageText[]>;
    totalPages: number | null;
    setTotalPages: Dispatch<SetStateAction<number | null>>;

    // media
    registerPlayer: (controller: MediaPlayerController) => void;
    play: () => void;
    seekTo: (seconds: number) => void;

    // for all types of material
    getLearningMaterialContent: (args: { start: number; end: number }) => string;

    // reference tracking
    getContentReference: () => IContentReference | null;
    getCurrentPosition: () => number | null;
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

    const [isLearningContentFullscreen, setIsLearningContentFullscreen] = useState<boolean>(false);
    const {
        totalPages,
        setTotalPages,
        pdfPageTexts,
        isPdfViewerFullscreen,
        pageNumber,
        setIsPdfViewerFullscreen,
        setPageNumber,
    } = usePdfMaterial();
    const { registerPlayer, play, seekTo, controllerRef } = useMediaPlayer();

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
        isFlashcardTabLoading,
        flashcardTabError,
        refetchFlashcards,
        refetchLearningFlashcards,
        refetchAnkiSetting,
        onBatchFlashcardsSuccess,
        onCreateFlashcardsSuccess,
    } = useFlashCardWorkSpace({ topicId: topicIdRef.current, currentTab: tab });

    const {
        isLoading,
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        saveMindmap,
        hasInitialized,
        fitView,
        setIsNodeSheetOpen,
    } = useMindMapContext();

    const { selectedGame, selectGame, resetGame } = useGamesWorkSpace();

    const { note, setNote } = useNoteWorkspace();

    const setTopicId = useCallback((topicIdArg: TypeTopicId) => {
        topicIdRef.current = topicIdArg;
    }, []);

    function getLearningMaterialContent({ start, end }: { start: number; end: number }) {
        if (start > end) throw new Error('Start section must not exceed end section.');
        if (learningMaterial?.type === EnumLearningMaterial.file) {
            return pdfMaterialUtils.getPdfContent({ pageTexts: pdfPageTexts.current, start, end });
        }
        if (
            learningMaterial?.type === EnumLearningMaterial.youtube ||
            learningMaterial?.type === EnumLearningMaterial.media
        ) {
            return mediaMaterialUtils.getMediaContent({
                segments: learningMaterial.content,
                start,
                end,
            });
        }
        throw new Error('Document type is not supported yet.');
    }

    const getContentReference = useCallback((): IContentReference | null => {
        if (!learningMaterial) return null;

        const reference: IContentReference = {
            type: learningMaterial.type as any,
        };

        if (learningMaterial.type === EnumLearningMaterial.youtube) {
            reference.timestamp = Math.floor(controllerRef.current?.getCurrentTime() || 0);
            reference.videoId = learningMaterial.videoId;
        } else if (learningMaterial.type === EnumLearningMaterial.file) {
            reference.page = pageNumber;
        } else if (learningMaterial.type === EnumLearningMaterial.media) {
            reference.timestamp = Math.floor(controllerRef.current?.getCurrentTime() || 0);
        }

        return reference;
    }, [learningMaterial, pageNumber, controllerRef]);

    const getCurrentPosition = useCallback((): number | null => {
        if (!learningMaterial) return null;

        if (
            learningMaterial.type === EnumLearningMaterial.youtube ||
            learningMaterial.type === EnumLearningMaterial.media
        ) {
            // Get current time from media player
            return controllerRef.current?.getCurrentTime() ?? null;
        }
        if (learningMaterial.type === EnumLearningMaterial.file) {
            return pageNumber;
        }

        return null;
    }, [learningMaterial, pageNumber, controllerRef]);

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
            setTab,
            setTopicId,
            setTopic,
            setFlashcards,
            setLearningFlashcards,
            onReviewCard,
            setAnkiSettings,
            setIsPdfViewerFullscreen,
            setLearningMaterial,
            setPageNumber,
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
            isFlashcardTabLoading,
            flashcardTabError,
            refetchFlashcards,
            refetchLearningFlashcards,
            refetchAnkiSetting,
            onBatchFlashcardsSuccess,
            onCreateFlashcardsSuccess,
            isLearningContentFullscreen,
            setIsLearningContentFullscreen,
            isLoading,
            nodes,
            edges,
            setNodes,
            setEdges,
            onNodesChange,
            onEdgesChange,
            saveMindmap,
            hasInitialized,
            fitView,
            setIsNodeSheetOpen,
            pdfPageTexts,
            totalPages,
            setTotalPages,
            registerPlayer,
            play,
            seekTo,
            getLearningMaterialContent,
            getContentReference,
            getCurrentPosition,
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
            generatingFlashcards,
            flashcardTab,
            selectedGame,
            selectGame,
            resetGame,
            note,
            selectingContentText,
            isFlashcardTabLoading,
            flashcardTabError,
            refetchFlashcards,
            refetchLearningFlashcards,
            refetchAnkiSetting,
            onBatchFlashcardsSuccess,
            onCreateFlashcardsSuccess,
            isLearningContentFullscreen,
            isLoading,
            nodes,
            edges,
            setNodes,
            setEdges,
            onNodesChange,
            onEdgesChange,
            saveMindmap,
            hasInitialized,
            fitView,
            setIsNodeSheetOpen,
            totalPages,
            registerPlayer,
            play,
            seekTo,
            getLearningMaterialContent,
            getContentReference,
            getCurrentPosition,
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
