import { useDispatch, useSelector, useStore } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, CardImportDispatch } from '../stores/store';

export const useCardImportDispatch: () => CardImportDispatch = useDispatch;
export const useCardImportSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = useStore;
