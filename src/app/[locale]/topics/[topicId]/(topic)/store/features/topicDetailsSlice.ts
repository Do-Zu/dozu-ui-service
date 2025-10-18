import { ITopic, IUpdateTopicResponse } from '@/app/[locale]/topics/types/topic.type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FetchStatus, TopicState } from '../store';
import topicService from '@/services/topic/topic.service';
import { createTopicAsyncThunk } from '../withTypes';
import { reviewCard } from './learningFlashcardSlice';
import { IAnkiStatus } from '@/types/anki';

type InitialState = {
    data: ITopic | null;
    status: FetchStatus;
    error: string | null;
};

const initialState: InitialState = {
    data: null,
    status: 'idle',
    error: null,
};

export const fetchTopicOverview = createTopicAsyncThunk('topicOverview/fetch', async (topicId: number) => {
    const topic = await topicService.getTopicById(topicId);
    return topic;
});

const topicDetailsSlice = createSlice({
    name: 'topicDetails',
    initialState,
    reducers: {
        updateTopic: (state, action: PayloadAction<IUpdateTopicResponse>) => {
            const { name, description, imageUrl } = action.payload;
            if (state.data) {
                state.data = { ...state.data, name, description, imageUrl };
            }
        },
    },
    extraReducers(builder) {
        builder.addCase(fetchTopicOverview.pending, (state, action) => {
            state.status = 'pending';
        });
        builder.addCase(fetchTopicOverview.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.data = action.payload;
        });
        builder.addCase(fetchTopicOverview.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message ?? 'Unknown error';
        });
        builder.addCase(reviewCard, (state, action) => {
            const { currentCard, reviewedCard } = action.payload;
            // update cards status count
            const currentFlashcardStatus =
                currentCard.status === IAnkiStatus.RELEARNING ? IAnkiStatus.LEARNING : currentCard.status;
            if (state.data?.flashcardCounts) {
                state.data.flashcardCounts[currentFlashcardStatus]--;
                if (reviewedCard) {
                    const newStatus =
                        reviewedCard.status === IAnkiStatus.RELEARNING ? IAnkiStatus.LEARNING : reviewedCard.status;
                    state.data.flashcardCounts[newStatus]++;
                }
            }
        });
    },
});

export default topicDetailsSlice.reducer;
export const { updateTopic } = topicDetailsSlice.actions;

export const selectTopicDetails = (state: TopicState) => state.topicDetails.data;
export const selectTopicDetailsStatus = (state: TopicState) => state.topicDetails.status;
export const selectTopicDetailsError = (state: TopicState) => state.topicDetails.error;
export const selectFlashcardCounts = (state: TopicState) => state.topicDetails.data?.flashcardCounts;
