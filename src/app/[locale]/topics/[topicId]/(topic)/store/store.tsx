import { configureStore } from '@reduxjs/toolkit';
import topicDetailsReducer from './features/topicDetailsSlice';
import flashcardsReducer from './features/flashcardSlice';
import learningFlashcardsReducer from './features/learningFlashcardSlice';

export const store = configureStore({
    reducer: {
        topicDetails: topicDetailsReducer,
        flashcards: flashcardsReducer,
        learningFlashcards: learningFlashcardsReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export type FetchStatus = 'idle' | 'pending' | 'succeeded' | 'failed';
export type TopicStore = typeof store;
export type TopicDispatch = typeof store.dispatch;
export type TopicState = ReturnType<typeof store.getState>;
