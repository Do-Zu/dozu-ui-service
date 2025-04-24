import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for the dialog state management
export interface ImportDialogState {
  step: number;
  importMethod: string;
  files: File[];
  isProcessing: boolean;
  suggestedMethods: string[];
  selectedMethod: string;
}

const initialState: ImportDialogState = {
  step: 1,
  importMethod: 'file',
  files: [],
  isProcessing: false,
  suggestedMethods: ['flashcards', 'notes', 'quiz'],
  selectedMethod: 'flashcards',
};

const importDialogSlice = createSlice({
  name: 'importDialog',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    setImportMethod: (state, action: PayloadAction<string>) => {
      state.importMethod = action.payload;
    },
    setFiles: (state, action: PayloadAction<File[]>) => {
      state.files = action.payload;
    },

    setIsProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setSuggestedMethods: (state, action: PayloadAction<string[]>) => {
      state.suggestedMethods = action.payload;
    },
    setSelectedMethod: (state, action: PayloadAction<string>) => {
      state.selectedMethod = action.payload;
    },
    startProcessing: (state) => {
      state.isProcessing = true;
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
} = importDialogSlice.actions;

export default importDialogSlice.reducer;
