import { configureStore } from '@reduxjs/toolkit';
import contentExtractionReducer from '../stores/features/contentExtractionSlice';
import importDialogReducer from '../stores/features/importDialogSlice';

export const store = configureStore({
    reducer: {
        contentExtraction: contentExtractionReducer,
        importDialog: importDialogReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type CardImportDispatch = typeof store.dispatch;
