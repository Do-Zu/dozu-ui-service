import { configureStore } from '@reduxjs/toolkit';
import authSlice from './features/auth/authSlice';
import selectedNodeSlice from './features/mindmap/selectedNodeSlice';
import subscriptionSlice from './features/subscription/subscriptionSlice';
import learningModeSlice from './features/class-based-learning/learningModeSlice';
import inputSetSlice from './features/inputSet/inputSetSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice,
        selectedNodeSlice: selectedNodeSlice,
        subscription: subscriptionSlice,

        learningMode: learningModeSlice,

        inputSet: inputSetSlice,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
