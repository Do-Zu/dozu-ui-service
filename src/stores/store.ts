// src/stores/store.ts
import { configureStore } from '@reduxjs/toolkit';
import bookSlice from './features/book/bookSlice';
import authSlice from './features/auth/authSlice';

// Cấu hình Redux Store
export const store = configureStore({
  reducer: {
    book: bookSlice,
    auth: authSlice,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
