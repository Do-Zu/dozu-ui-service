import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
    DEFAULT_METHOD_SELECT,
    IMPORT_METHOD,
    ImportMethod,
    LIST_METHOD_LEARNING_GENERATE,
} from '../../constants/resource';

export type TypeMethodImport = ImportMethod;
export interface ImportDialogState {
    step: number;
    importMethod: TypeMethodImport;
    files: File[];
    isProcessing: boolean;
    isUploading: boolean;
    suggestedMethods: string[];
    selectedMethod: string;
}

const initialState: ImportDialogState = {
    step: 1,
    importMethod: IMPORT_METHOD.FILE,
    files: [],
    isProcessing: false,
    isUploading: false,
    suggestedMethods: LIST_METHOD_LEARNING_GENERATE,
    selectedMethod: DEFAULT_METHOD_SELECT,
};

const importDialogSlice = createSlice({
    name: 'importDialog',
    initialState,
    reducers: {
        setStep: (state, action: PayloadAction<number>) => {
            state.step = action.payload;
        },

        setImportMethod: (state, action: PayloadAction<ImportMethod>) => {
            state.importMethod = action.payload;
        },

        setFiles: (state, action: PayloadAction<File[]>) => {
            state.files = action.payload;
        },

        setIsProcessing: (state, action: PayloadAction<boolean>) => {
            state.isProcessing = action.payload;
        },

        setIsUploading: (state, action: PayloadAction<boolean>) => {
            state.isUploading = action.payload;
        },

        setSuggestedMethods: (state, action: PayloadAction<string[]>) => {
            state.suggestedMethods = action.payload;
        },

        setSelectedMethod: (state, action: PayloadAction<string>) => {
            state.selectedMethod = action.payload;
        },

        startUploading: (state) => {
            state.isUploading = true;
        },

        stopUploading: (state) => {
            state.isUploading = false;
        },

        startProcessing: (state) => {
            state.isProcessing = true;
        },

        stopProcessing: (state) => {
            state.isProcessing = false;
        },

        resetImportDialog: () => initialState,
    },
});

export const {
    setStep,
    setImportMethod,
    setFiles,
    setIsProcessing,
    setSuggestedMethods,
    setSelectedMethod,
    startProcessing,
    resetImportDialog,
    setIsUploading,
    startUploading,
    stopUploading,
    stopProcessing,
} = importDialogSlice.actions;

export default importDialogSlice.reducer;
