import { IAnkiCardReviewed, IDueAnkiCard, IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';
import { ITopic } from '../../../types/topic.type';
import React, {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import { isAfter } from 'date-fns';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';

export type TypeTopicId = number;
interface ContextType {
    topicId: number;
    topic: ITopic | null;
    flashcards: IFlashcard[] | null;
    learningFlashcards: IDueAnkiCard[] | null;
    ankiSettings: { settings: IAnkiSetting[]; activeSettingId: number } | null;

    setTopicId: Dispatch<SetStateAction<TypeTopicId>>;
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

    contentTextOrigin: string;
    setContentTextOrigin: Dispatch<SetStateAction<string>>;
}

const TopicWorkspaceContext = createContext<ContextType | null>(null);

interface IProviderProps {
    topicIdInit: TypeTopicId;
    children: ReactNode;
}
export function TopicWorkspaceProvider({ children, topicIdInit }: IProviderProps) {
    const [topicId, setTopicId] = useState<TypeTopicId>(topicIdInit);

    const [topic, setTopic] = useState<ITopic | null>(null);
    const [flashcards, setFlashcards] = useState<IFlashcard[] | null>(null);
    const [learningFlashcards, setLearningFlashcards] = useState<IDueAnkiCard[] | null>(null);
    const [ankiSettings, setAnkiSettings] = useState<{ settings: IAnkiSetting[]; activeSettingId: number } | null>(
        null,
    );
    const [contentTextOrigin, setContentTextOrigin] = useState<string>('');

    const [isPdfViewerFullscreen, setIsPdfViewerFullScreen] = useState<boolean>(false);

    const onReviewCard = useCallback(
        ({ currentCard, reviewedCard }: { currentCard: IDueAnkiCard; reviewedCard: IAnkiCardReviewed | null }) => {
            const updatedLearningFlashcards = [...(learningFlashcards ?? [])];
            updatedLearningFlashcards.shift();
            if (reviewedCard) {
                // INSERT this card to a suitable position (to maintain ORDER by nextReview)
                let inserted = false;
                for (let i = 0; i < updatedLearningFlashcards.length; ++i) {
                    const card = updatedLearningFlashcards[i];
                    if (isAfter(reviewedCard.nextReview, card.nextReview)) continue;
                    updatedLearningFlashcards.splice(i, 0, {
                        ...currentCard,
                        nextReview: reviewedCard.nextReview,
                        status: reviewedCard.status,
                        nextReviewDataByRatings: reviewedCard.nextReviewDataByRatings,
                    });
                    inserted = true;
                    break;
                }

                if (!inserted) {
                    updatedLearningFlashcards.push({
                        ...currentCard,
                        nextReview: reviewedCard.nextReview,
                        status: reviewedCard.status,
                        nextReviewDataByRatings: reviewedCard.nextReviewDataByRatings,
                    });
                    inserted = true;
                }
            }

            setLearningFlashcards(updatedLearningFlashcards);
            return updatedLearningFlashcards;
        },
        [learningFlashcards],
    );

    const value = useMemo(
        () => ({
            topicId,
            topic,
            flashcards,
            learningFlashcards,
            setTopicId,
            setTopic,
            setFlashcards,
            setLearningFlashcards,
            onReviewCard,
            ankiSettings,
            setAnkiSettings,
            isPdfViewerFullscreen,
            setIsPdfViewerFullScreen,
            contentTextOrigin,
            setContentTextOrigin,
        }),
        [
            topicId,
            topic,
            flashcards,
            learningFlashcards,
            setTopicId,
            setTopic,
            setFlashcards,
            setLearningFlashcards,
            onReviewCard,
            ankiSettings,
            setAnkiSettings,
            isPdfViewerFullscreen,
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
