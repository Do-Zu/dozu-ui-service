import { configureStore } from '@reduxjs/toolkit';
import authSlice from './features/auth/authSlice';
import selectedNodeSlice from './features/mindmap/selectedNodeSlice';
import subscriptionSlice from './features/subscription/subscriptionSlice';
import learningModeSlice from './features/class-based-learning/learningModeSlice';
import inputSetSlice from './features/inputSet/inputSetSlice';
import pomodoroSlice from './features/pomodoro/pomodoroSlice';
import isEditingMindmapSlice from './features/mindmap/isEditingMindmapSlice';
import packageSlice from './features/package/packageSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            auth: authSlice,

            selectedNodeSlice: selectedNodeSlice,

            isEditingMindmapSlice: isEditingMindmapSlice,

            subscription: subscriptionSlice,

            learningMode: learningModeSlice,

            inputSet: inputSetSlice,

            pomodoro: pomodoroSlice,

            package: packageSlice,
        },
        devTools: process.env.NODE_ENV !== 'production',
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
