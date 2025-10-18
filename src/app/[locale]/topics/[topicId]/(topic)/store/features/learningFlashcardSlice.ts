import { IAnkiCardReviewed, IDueAnkiCard, IAnkiCardStatusCounts } from '@/app/[locale]/flashcards/types/flashcard.type';
import { FetchStatus, TopicState } from '../store';
import { createTopicAsyncThunk } from '../withTypes';
import flashcardService from '@/services/flashcard/flashcard.service';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAnkiStatus } from '@/types/anki';
import { isAfter } from 'date-fns';

type InitialState = {
    data: IDueAnkiCard[] | null;
    status: FetchStatus;
    error: string | null;
};

const initialState: InitialState = {
    data: null,
    status: 'idle',
    error: null,
};

export const fetchLearningFlashcards = createTopicAsyncThunk('learningFlashcards/fetch', async (topicId: number) => {
    const flashcards = await flashcardService.getDueAnkiCardsForTopic(topicId);
    return flashcards;
});

export const learningFlashcardsSlice = createSlice({
    name: 'learningFlashcards',
    initialState,
    reducers: {
        reviewCard: (
            state,
            action: PayloadAction<{ currentCard: IDueAnkiCard; reviewedCard: IAnkiCardReviewed | null }>,
        ) => {
            const { currentCard, reviewedCard } = action.payload;

            // update cards
            const cards = state.data;
            if (cards) {
                cards.shift();
                if (reviewedCard) {
                    // INSERT this card to a suitable position (to maintain ORDER by nextReview)
                    let inserted = false;
                    for (let i = 0; i < cards.length; ++i) {
                        const card = cards[i];
                        if (isAfter(reviewedCard.nextReview, card.nextReview)) continue;
                        cards.splice(i, 0, {
                            ...currentCard,
                            nextReview: reviewedCard.nextReview,
                            status: reviewedCard.status,
                            nextReviewDataByRatings: reviewedCard.nextReviewDataByRatings,
                        });
                        inserted = true;
                        break;
                    }

                    if (!inserted) {
                        cards.push({
                            ...currentCard,
                            nextReview: reviewedCard.nextReview,
                            status: reviewedCard.status,
                            nextReviewDataByRatings: reviewedCard.nextReviewDataByRatings,
                        });
                        inserted = true;
                    }
                }
            }
        },
    },
    extraReducers(builder) {
        builder.addCase(fetchLearningFlashcards.pending, (state, action) => {
            state.status = 'pending';
        });
        builder.addCase(fetchLearningFlashcards.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.data = action.payload;
        });
        builder.addCase(fetchLearningFlashcards.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message ?? 'Unknown error';
        });
    },
});

export default learningFlashcardsSlice.reducer;
export const { reviewCard } = learningFlashcardsSlice.actions;

// prevent from a case when flashcards is unchanged but still re-render - NEED TESTED
// export const selectLearningFlashcards = createSelector(
//     (state: TopicState) => state.learningFlashcards.cards.data,
//     (items) => items,
// );
export const selectLearningFlashcards = (state: TopicState) => state.learningFlashcards.data;
export const selectLearningFlashcardsStatus = (state: TopicState) => state.learningFlashcards.status;
export const selectLearningFlashcardsError = (state: TopicState) => state.learningFlashcards.error;
