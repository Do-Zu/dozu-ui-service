import { useState, useCallback } from 'react';
import { IFlashcard, IDueAnkiCard, IAnkiCardReviewed } from '@/app/[locale]/flashcards/types/flashcard.type';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';
import { isAfter } from 'date-fns';

export default function useFlashCardWorkSpace() {
    const [flashcards, setFlashcards] = useState<IFlashcard[] | null>(null);
    const [learningFlashcards, setLearningFlashcards] = useState<IDueAnkiCard[] | null>(null);
    const [ankiSettings, setAnkiSettings] = useState<{ settings: IAnkiSetting[]; activeSettingId: number } | null>(
        null,
    );
    const [generatingFlashcards, setGeneratingFlashcards] = useState<{ q: string; a: string }[] | null>(null);

    const onReviewCard = useCallback(
        ({ currentCard, reviewedCard }: { currentCard: IDueAnkiCard; reviewedCard: IAnkiCardReviewed | null }) => {
            const updatedLearningFlashcards = [...(learningFlashcards ?? [])];
            updatedLearningFlashcards.shift();
            if (reviewedCard) {
                // INSERT this card to a suitable position (to maintain ORDER by nextReview)
                let inserted = false;
                for (let i = 0; i < updatedLearningFlashcards.length; ++i) {
                    const card = updatedLearningFlashcards[i];

                    if (isAfter(new Date(reviewedCard.nextReview), new Date(card.nextReview))) continue;

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

    return {
        flashcards,
        learningFlashcards,
        ankiSettings,
        setFlashcards,
        setLearningFlashcards,
        setAnkiSettings,
        onReviewCard,
        generatingFlashcards,
        setGeneratingFlashcards,
    };
}
