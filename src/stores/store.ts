// src/stores/store.ts
import { configureStore } from '@reduxjs/toolkit';
import bookSlice from './features/book/bookSlice';

// Cấu hình Redux Store
export const store = configureStore({
  reducer: {
    book: bookSlice,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
