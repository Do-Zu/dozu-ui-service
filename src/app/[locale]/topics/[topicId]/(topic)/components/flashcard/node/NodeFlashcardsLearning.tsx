import React, { useCallback, useEffect, useState } from 'react';
import { useRequireLearningFlashcards } from '../../../context/useRequireFlashcardContent';
import { IAnkiCardReviewed, IAnkiCardStatusCounts, IDueAnkiCard } from '@/app/[locale]/flashcards/types/flashcard.type';
import usePost from '@/hooks/usePost';
import flashcardService, { IFlashcardReviewByAnkiPayload } from '@/services/flashcard/flashcard.service';
import toastHelper from '@/utils/toast.helper';
import { IAnkiRating, IAnkiStatus } from '@/types/anki';
import LearningCard from '../learning/LearningCard';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import LearningFlashcardsEmptyState from '../learning/LearningFlashcardsEmptyState';
import flashcardUtils from '../../../utils/flashcard.utils';
import useAnkiSettings from '../../../hooks/useAnkiSettings';
import DataStatus from '@/components/errors/DataStatus';
import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';

interface Props {
    nodeId: string;
    onClose: () => void;
    isFullscreen: boolean;
    onPanelToggle: () => void;
}

export default function NodeFlashcardsLearning({ nodeId, onClose, isFullscreen, onPanelToggle }: Props) {
    const { nodes } = useMindMapContext();
    const nodeLabel = nodes.find((item) => item.data.nodeId === nodeId)?.data.label || 'Your selected node';
    const { topicId, onReviewCard } = useTopicWorkspace();
    const { learningFlashcards } = useRequireLearningFlashcards();
    const nodeLearningFlashcards = learningFlashcards.filter((card) => card.nodeId === nodeId);
    const flashcardStatusCounts = flashcardUtils.getAnkiStatusCounts(nodeLearningFlashcards);

    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);

    const currentFlashcard = nodeLearningFlashcards?.[0];

    const [shouldShowTrackingOptions, setShouldShowTrackingOptions] = useState<boolean>(false);
    const { currentAnkiSetting } = useAnkiSettings();

    const { loading: reviewFlashcardLoading, execute: reviewFlashcardAsync } = usePost<
        IFlashcardReviewByAnkiPayload,
        IAnkiCardReviewed | null
    >(
        ({ topicId, flashcardId, rating }) => flashcardService.reviewFlashcardByAnki({ topicId, flashcardId, rating }),
        'PATCH',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess: async (data) => {
                if (!nodeLearningFlashcards || !currentFlashcard) return;
                setFlipInstantly(false);
                setShouldShowTrackingOptions(false);
                onReviewCard({
                    currentCard: currentFlashcard,
                    reviewedCard: data,
                });
            },
        },
    );

    function flipWithAnimation() {
        if (shouldShowTrackingOptions) return;
        setIsAnimating(true);
        setIsFlipped((prev) => !prev);
        setShouldShowTrackingOptions(true);
    }

    function setFlipInstantly(isFlipped: boolean) {
        setIsAnimating(false);
        setIsFlipped(isFlipped);
    }

    const handleReviewFlashcardClick = useCallback(
        async (rating: IAnkiRating) => {
            if (!shouldShowTrackingOptions || !currentFlashcard) return;
            const { flashcardId } = currentFlashcard;
            await reviewFlashcardAsync({ topicId, flashcardId, rating });
        },
        [nodeLearningFlashcards, currentFlashcard, topicId, reviewFlashcardAsync, shouldShowTrackingOptions],
    );

    if (!nodeLearningFlashcards || nodeLearningFlashcards.length === 0 || !currentFlashcard) {
        return <LearningFlashcardsEmptyState topicId={topicId} />;
    }

    if (!currentAnkiSetting) {
        return <DataStatus variant="error" />;
    }

    return (
        <div className="h-full flex flex-col">
            <LearningCard
                flashcard={currentFlashcard}
                ankiSetting={currentAnkiSetting}
                shouldShowTrackingOptions={shouldShowTrackingOptions}
                isFlipped={isFlipped}
                isAnimating={isAnimating}
                onFlip={flipWithAnimation}
                handleRatingClick={handleReviewFlashcardClick}
                flashcardStatusCounts={flashcardStatusCounts}
                onClose={onClose}
                isPanelFullscreen={isFullscreen}
                onPanelToggle={onPanelToggle}
                label={nodeLabel}
            />
        </div>
    );
}
