import { IAnkiCardReviewed, IDueAnkiCard, IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';
import { ITopic } from '../../../types/topic.type';
import React, { createContext, Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';
import { isAfter } from 'date-fns';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';

interface ContextType {
    topic: ITopic | null;
    flashcards: IFlashcard[] | null;
    learningFlashcards: IDueAnkiCard[] | null;
    ankiSettings: { settings: IAnkiSetting[]; activeSettingId: number } | null;

    setTopic: Dispatch<SetStateAction<ITopic | null>>;
    setFlashcards: Dispatch<SetStateAction<IFlashcard[] | null>>;
    setLearningFlashcards: Dispatch<SetStateAction<IDueAnkiCard[] | null>>;
    setAnkiSettings: Dispatch<SetStateAction<{ settings: IAnkiSetting[]; activeSettingId: number } | null>>;

    onReviewCard: (args: {
        currentCard: IDueAnkiCard;
        reviewedCard: IAnkiCardReviewed | null;
    }) => IDueAnkiCard[] | null;
}

const TopicWorkspaceContext = createContext<ContextType | null>(null);

export function TopicWorkspaceProvider({ children }: { children: React.ReactNode }) {
    const [topic, setTopic] = useState<ITopic | null>(null);
    const [flashcards, setFlashcards] = useState<IFlashcard[] | null>(null);
    const [learningFlashcards, setLearningFlashcards] = useState<IDueAnkiCard[] | null>(null);
    const [ankiSettings, setAnkiSettings] = useState<{ settings: IAnkiSetting[]; activeSettingId: number } | null>(
        null,
    );

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

    return (
        <TopicWorkspaceContext.Provider
            value={{
                topic,
                flashcards,
                learningFlashcards,
                setTopic,
                setFlashcards,
                setLearningFlashcards,
                onReviewCard,
                ankiSettings,
                setAnkiSettings,
            }}
        >
            {children}
        </TopicWorkspaceContext.Provider>
    );
}

export function useTopicWorkspace() {
    const context = useContext(TopicWorkspaceContext);
    if (!context) {
        throw new Error('usePersonalTopicWorkspace must be used inside <PersonalTopicWorkspaceProvider>');
    }
    return context;
}
