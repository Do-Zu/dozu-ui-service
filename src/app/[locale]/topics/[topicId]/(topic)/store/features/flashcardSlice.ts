import { IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';
import { FetchStatus, TopicState } from '../store';
import { createTopicAsyncThunk } from '../withTypes';
import flashcardService from '@/services/flashcard/flashcard.service';
import { createSlice } from '@reduxjs/toolkit';

type InitialState = {
    data: IFlashcard[] | null;
    status: FetchStatus;
    error: string | null;
};

const initialState: InitialState = {
    data: null,
    status: 'idle',
    error: null,
};

export const fetchFlashcards = createTopicAsyncThunk('flashcards/fetch', async (topicId: number) => {
    const flashcards = await flashcardService.getFlashcardsForTopic(topicId);
    return flashcards;
});

const flashcardsSlice = createSlice({
    name: 'flashcards',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder.addCase(fetchFlashcards.pending, (state, action) => {
            state.status = 'pending';
        });
        builder.addCase(fetchFlashcards.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.data = action.payload;
        });
        builder.addCase(fetchFlashcards.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message ?? 'Unknown error';
        });
    },
});

export default flashcardsSlice.reducer;
export const {} = flashcardsSlice.actions;

export const selectFlashcards = (state: TopicState) => state.flashcards.data;
export const selectFlashcardsStatus = (state: TopicState) => state.flashcards.status;
export const selectFlashcardsError = (state: TopicState) => state.flashcards.error;