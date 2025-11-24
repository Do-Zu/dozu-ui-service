'use client';

import { Dispatch, SetStateAction, useState } from 'react';

export type QuizMode = 'generate' | 'history' | 'edit';
export type QuizViewMode = 'list' | 'detail';

export interface IQuizStatistics {
    totalQuizzes: number;
    averageScore: number;
    perfectScoreCount: number;
    averageQuestionsPerQuiz: number;
}

export interface QuizHistoryItem {
    quizResultId: number;
    quizId: number;
    correctAnswersCount: number;
    questionsCount: number;
    timeReviewed: string;
    quizTitle?: string;
}

export interface QuizWorkspaceState {
    quizMode: QuizMode;
    setQuizMode: Dispatch<SetStateAction<QuizMode>>;

    statistics: IQuizStatistics | null;
    setStatistics: Dispatch<SetStateAction<IQuizStatistics | null>>;

    history: QuizHistoryItem[];
    setHistory: Dispatch<SetStateAction<QuizHistoryItem[]>>;

    quizDetail: any | null;
    setQuizDetail: Dispatch<SetStateAction<any | null>>;

    selectedType: string;
    setSelectedType: Dispatch<SetStateAction<string>>;

    viewMode: QuizViewMode;
    setViewMode: Dispatch<SetStateAction<QuizViewMode>>;

    selectedQuizResultId: number | null;
    setSelectedQuizResultId: Dispatch<SetStateAction<number | null>>;

    loadingOverlay: boolean;
    setLoadingOverlay: Dispatch<SetStateAction<boolean>>;

    isCreateModalOpen: boolean;
    setIsCreateModalOpen: Dispatch<SetStateAction<boolean>>;

    defaultName: string;
    setDefaultName: Dispatch<SetStateAction<string>>;

    defaultDescription: string;
    setDefaultDescription: Dispatch<SetStateAction<string>>;

    showOnboarding: boolean;
    setShowOnboarding: Dispatch<SetStateAction<boolean>>;
}

export default function useQuizWorkspaceState(): QuizWorkspaceState {
    const [quizMode, setQuizMode] = useState<QuizMode>('generate');

    const [statistics, setStatistics] = useState<IQuizStatistics | null>(null);
    const [history, setHistory] = useState<QuizHistoryItem[]>([]);
    const [quizDetail, setQuizDetail] = useState<any | null>(null);

    const [selectedType, setSelectedType] = useState<string>('');
    const [viewMode, setViewMode] = useState<QuizViewMode>('list');
    const [selectedQuizResultId, setSelectedQuizResultId] = useState<number | null>(null);

    const [loadingOverlay, setLoadingOverlay] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    const [defaultName, setDefaultName] = useState<string>('');
    const [defaultDescription, setDefaultDescription] = useState<string>('');
    const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

    return {
        quizMode,
        setQuizMode,
        statistics,
        setStatistics,
        history,
        setHistory,
        quizDetail,
        setQuizDetail,
        selectedType,
        setSelectedType,
        viewMode,
        setViewMode,
        selectedQuizResultId,
        setSelectedQuizResultId,
        loadingOverlay,
        setLoadingOverlay,
        isCreateModalOpen,
        setIsCreateModalOpen,
        defaultName,
        setDefaultName,
        defaultDescription,
        setDefaultDescription,
        showOnboarding,
        setShowOnboarding,
    };
}
