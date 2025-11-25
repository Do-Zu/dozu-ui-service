'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import DataStatus from '@/components/errors/DataStatus';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { quizService } from '@/app/[locale]/quiz/services/quiz.service';

import QuizHistoryList from './QuizHistoryList';
import QuizResultDetailPanel from './QuizResultDetailPanel';
import { useQuizWorkspace } from '../context/QuizWorkspaceContext';
import { QuizHistoryItem } from '../../../hooks/useQuizWorkspace';

export default function QuizHistoryTab() {
    const { topicId } = useTopicWorkspace();
    const {
        history,
        setHistory,
        viewMode,
        setViewMode,
        selectedQuizResultId,
        setSelectedQuizResultId,
        quizDetail,
        setQuizDetail,
    } = useQuizWorkspace();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchHistoryWithTitle = async () => {
        setError(null);
        setLoading(true);

        try {
            const response = await quizService.getQuizHistory(String(topicId));
            const historyList: QuizHistoryItem[] = Array.isArray(response.data) ? response.data : [];

            const historyWithTitles = await Promise.all(
                historyList.map(async (quiz) => {
                    try {
                        const quizDetail = await quizService.getQuizById(quiz.quizId);
                        const quizData = quizDetail?.data as { name?: string } | undefined;

                        return {
                            ...quiz,
                            quizTitle: quizData?.name ?? `Quiz #${quiz.quizId}`,
                        };
                    } catch {
                        return { ...quiz, quizTitle: `Quiz #${quiz.quizId}` };
                    }
                }),
            );

            setHistory(historyWithTitles);
        } catch (err) {
            console.error('Error fetching quiz history:', err);
            setError('Failed to load quiz history. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistoryWithTitle();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId]);

    useEffect(() => {
        const fetchDetail = async () => {
            if (viewMode !== 'detail' || !selectedQuizResultId) return;
            setDetailLoading(true);
            try {
                const response = await quizService.getQuizResultDetail(String(selectedQuizResultId));
                setQuizDetail(response.data);
            } catch (e) {
                console.error(e);
            } finally {
                setDetailLoading(false);
            }
        };

        fetchDetail();
    }, [viewMode, selectedQuizResultId, setQuizDetail]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-primary rounded-full mb-3" />
                <p className="text-sm font-medium">Loading quiz history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-10">
                <p className="text-red-500 font-medium mb-3">{error}</p>
                <Button onClick={fetchHistoryWithTitle}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-y-auto">
            {viewMode === 'list' && (
                <>
                    <h2 className="text-xl font-semibold mb-4">History of Quiz</h2>
                    <QuizHistoryList
                        items={history}
                        onSelect={(quiz) => {
                            setSelectedQuizResultId(quiz.quizResultId);
                            setViewMode('detail');
                        }}
                    />
                </>
            )}

            {viewMode === 'detail' && (
                <QuizResultDetailPanel
                    loading={detailLoading}
                    quizDetail={quizDetail}
                    onBack={() => {
                        setViewMode('list');
                        setQuizDetail(null);
                    }}
                />
            )}
        </div>
    );
}
