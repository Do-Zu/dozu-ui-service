import { useState, useCallback, useEffect } from 'react';
import {
    IFlashcard,
    IDueAnkiCard,
    IAnkiCardReviewed,
    IBatchFlashcardsInTopicResult,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';
import { isAfter } from 'date-fns';
import { FlashcardTab } from '../components/flashcard/FlashcardContent';
import useFetch from '@/hooks/useFetch';
import flashcardService from '@/services/flashcard/flashcard.service';
import ankiSettingService from '@/services/anki-setting/ankiSetting.service';
import { isNil } from '@/utils';
import { TopicWorkspaceTabValue } from '../types';
import toastHelper from '@/utils/toast.helper';
import { IAnkiStatus } from '@/types/anki';

export interface IResponseFlashCardGenerate {
    q: string;
    a: string;
    type: string;
}

export default function useFlashCardWorkSpace({
    topicId,
    currentTab,
}: {
    topicId: number;
    currentTab: TopicWorkspaceTabValue;
}) {
    const [flashcards, setFlashcards] = useState<IFlashcard[] | null>(null);
    const [learningFlashcards, setLearningFlashcards] = useState<IDueAnkiCard[] | null>(null);
    const [ankiSettings, setAnkiSettings] = useState<{ settings: IAnkiSetting[]; activeSettingId: number } | null>(
        null,
    );

    const {
        data: fetchedFlashcards,
        loading: flashcardsLoading,
        error: flashcardsError,
        refetch: refetchFlashcards,
    } = useFetch<IFlashcard[]>(() => flashcardService.getFlashcardsForTopic(topicId), {
        shouldRun: isNil(flashcards) && (currentTab === 'flashcard' || currentTab === 'mindmap'),
    });

    useEffect(() => {
        if (fetchedFlashcards) {
            setFlashcards(fetchedFlashcards);
        }
    }, [fetchedFlashcards]);

    const {
        data: fetchedLearningFlashcards,
        loading: learningFlashcardsLoading,
        error: learningFlashcardsError,
        refetch: refetchLearningFlashcards,
    } = useFetch<IDueAnkiCard[]>(() => flashcardService.getDueAnkiCardsForTopic(topicId), {
        shouldRun: isNil(learningFlashcards) && (currentTab === 'flashcard' || currentTab === 'mindmap'),
    });

    useEffect(() => {
        if (fetchedLearningFlashcards) {
            setLearningFlashcards(fetchedLearningFlashcards);
        }
    }, [fetchedLearningFlashcards]);

    const {
        data: fetchedAnkiSetting,
        loading: ankiSettingLoading,
        error: ankiSettingError,
        refetch: refetchAnkiSetting,
    } = useFetch<{
        settings: IAnkiSetting[];
        activeSettingId: number;
    }>(() => ankiSettingService.getUserSettingsForTopic({ topicId }), {
        shouldRun: isNil(ankiSettings) && (currentTab === 'flashcard' || currentTab === 'mindmap'),
    });

    useEffect(() => {
        if (fetchedAnkiSetting) {
            setAnkiSettings(fetchedAnkiSetting);
        }
    }, [fetchedAnkiSetting]);

    const flashcardContentLoading = flashcardsLoading || learningFlashcardsLoading || ankiSettingLoading;
    const flashcardContentError = flashcardsError || learningFlashcardsError || ankiSettingError;

    const [generatingFlashcards, setGeneratingFlashcards] = useState<IResponseFlashCardGenerate[] | null>(null);

    const onReviewCard = useCallback(
        ({ currentCard, reviewedCard }: { currentCard: IDueAnkiCard; reviewedCard: IAnkiCardReviewed | null }) => {
            const updatedLearningFlashcards = (learningFlashcards || []).filter(
                (card) => card.flashcardId !== currentCard.flashcardId,
            );
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
                        learningState: reviewedCard.learningState,
                    });
                    inserted = true;
                    break;
                }

                if (!inserted) {
                    updatedLearningFlashcards.push({
                        ...currentCard,
                        nextReview: reviewedCard.nextReview,
                        status: reviewedCard.status,
                        learningState: reviewedCard.learningState,
                    });
                    inserted = true;
                }
            }

            setLearningFlashcards(updatedLearningFlashcards);
            return updatedLearningFlashcards;
        },
        [learningFlashcards],
    );

    const [flashcardTab, setFlashcardTab] = useState<FlashcardTab>('browse');

    function applyCreate(list: IFlashcard[], created: IFlashcard[]) {
        if (!created || created.length === 0) return list;
        return [...list, ...created];
    }

    function applyUpdate(flashcard: IFlashcard | IDueAnkiCard, updatedMap: Map<number, IFlashcard | IDueAnkiCard>) {
        return updatedMap.get(flashcard.flashcardId) ?? flashcard;
    }

    function applyFilter(flashcard: IFlashcard | IDueAnkiCard, deletedSet: Set<number>) {
        return !deletedSet.has(flashcard.flashcardId);
    }

    function applyCreateForLearning(list: IDueAnkiCard[], createdList: IFlashcard[]) {
        const result: IDueAnkiCard[] = [...list];
        for (const createdItem of createdList) {
            if (!createdItem.learningState) {
                toastHelper.showErrorMessage('Failed to update learning flashcards.');
                break;
            }
            let inserted = false;
            const { flashcardId, front, back, imageUrl, nodeId, learningState } = createdItem;
            for (let i = 0; i < result.length; ++i) {
                const card = result[i];

                if (isAfter(new Date(createdItem.learningState.nextReview), new Date(card.nextReview))) continue;

                result.splice(i, 0, {
                    flashcardId,
                    front,
                    back,
                    imageUrl,
                    nodeId,
                    learningState,
                    nextReview: learningState.nextReview,
                    status: IAnkiStatus.NEW,
                });
                inserted = true;
                break;
            }

            if (!inserted) {
                result.push({
                    flashcardId,
                    front,
                    back,
                    imageUrl,
                    nodeId,
                    learningState,
                    nextReview: learningState.nextReview,
                    status: IAnkiStatus.NEW,
                });
                inserted = true;
            }
        }

        return result;
    }

    function onBatchFlashcardsSuccess(data: IBatchFlashcardsInTopicResult) {
        const { createdFlashcards, updatedFlashcards, deletedFlashcards } = data;
        setGeneratingFlashcards(null);
        setFlashcards((prev) => {
            if (!prev) return null;

            const updatedMap = new Map(updatedFlashcards.map((f) => [f.flashcardId, f]));
            const deletedSet = new Set(deletedFlashcards);

            let result = prev
                .map((fc) => applyUpdate(fc, updatedMap))
                .filter((fc) => applyFilter(fc, deletedSet)) as IFlashcard[];

            result = applyCreate(result, createdFlashcards);

            return result;
        });
        setLearningFlashcards((prev) => {
            if (!prev) return null;

            const updatedMap = new Map(updatedFlashcards.map((f) => [f.flashcardId, f]));
            const deletedSet = new Set(deletedFlashcards);

            let result = prev
                .map((fc) => applyUpdate(fc, updatedMap))
                .filter((fc) => applyFilter(fc, deletedSet)) as IDueAnkiCard[];
            result = applyCreateForLearning(result, createdFlashcards);

            return result;
        });
    }

    function onCreateFlashcardsSuccess(createdFlashcards: IFlashcard[]) {
        setFlashcards((prev) => {
            if (!prev) return null;
            const result = applyCreate(prev, createdFlashcards);
            return result;
        });
        setLearningFlashcards((prev) => {
            if (!prev) return null;
            const result = applyCreateForLearning(prev, createdFlashcards);
            return result;
        });
    }

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
        flashcardTab,
        setFlashcardTab,

        isFlashcardTabLoading: flashcardContentLoading,
        flashcardTabError: flashcardContentError,
        refetchFlashcards,
        refetchLearningFlashcards,
        refetchAnkiSetting,

        onBatchFlashcardsSuccess,
        onCreateFlashcardsSuccess,
    };
}
