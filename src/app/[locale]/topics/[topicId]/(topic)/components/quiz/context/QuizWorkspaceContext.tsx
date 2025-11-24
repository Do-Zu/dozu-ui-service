'use client';

import { createContext, ReactNode, useContext } from 'react';
import useQuizWorkspaceState, { QuizWorkspaceState } from '../../../hooks/useQuizWorkspace';

const QuizWorkspaceContext = createContext<QuizWorkspaceState | null>(null);

export function QuizWorkspaceProvider({ children }: { children: ReactNode }) {
    const value = useQuizWorkspaceState();
    return <QuizWorkspaceContext.Provider value={value}>{children}</QuizWorkspaceContext.Provider>;
}

export function useQuizWorkspace() {
    const ctx = useContext(QuizWorkspaceContext);
    if (!ctx) {
        throw new Error('useQuizWorkspace must be used inside <QuizWorkspaceProvider>');
    }
    return ctx;
}
