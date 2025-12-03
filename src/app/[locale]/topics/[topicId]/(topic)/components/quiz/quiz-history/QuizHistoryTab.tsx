'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { quizService } from '@/app/[locale]/quiz/services/quiz.service';

import QuizHistoryList from './QuizHistoryList';
import QuizResultDetailPanel from './QuizResultDetailPanel';
import { useQuizWorkspace } from '../context/QuizWorkspaceContext';
import { QuizHistoryItem } from '../../../hooks/useQuizWorkspace';
import FilterBar from '../ui/FilterBar';

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

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const [search, setSearch] = useState('');
    const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'med' | 'low'>('all');
    const [sortDate, setSortDate] = useState<'newest' | 'oldest'>('newest');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    /** fetch history */
    const fetchHistoryWithTitle = async () => {
        setLoading(true);
        try {
            const response = await quizService.getQuizHistory(String(topicId));
            const historyList: QuizHistoryItem[] = Array.isArray(response.data) ? response.data : [];

            const historyWithTitles = await Promise.all(
                historyList.map(async (quiz) => {
                    try {
                        const quizDetail = await quizService.getQuizById(quiz.quizId);
                        const quizData = quizDetail?.data as { name?: string };
                        return { ...quiz, quizTitle: quizData?.name ?? `Quiz #${quiz.quizId}` };
                    } catch {
                        return { ...quiz, quizTitle: `Quiz #${quiz.quizId}` };
                    }
                }),
            );

            setHistory(historyWithTitles);
        } catch {
            setError('Failed to load quiz history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistoryWithTitle();
    }, [topicId]);

    /** filtering */
    const filteredHistory = useMemo(() => {
        let list = [...history];

        const s = search.toLowerCase();
        if (s) {
            list = list.filter((item) => {
                const title = item.quizTitle?.toLowerCase() || '';
                const score = Math.round((item.correctAnswersCount / (item.questionsCount || 1)) * 100);
                return title.includes(s) || String(score).includes(s) || item.timeReviewed.toLowerCase().includes(s);
            });
        }

        list = list.filter((item) => {
            const percent = Math.round((item.correctAnswersCount / (item.questionsCount || 1)) * 100);
            if (scoreFilter === 'high') return percent >= 90;
            if (scoreFilter === 'med') return percent >= 70 && percent < 90;
            if (scoreFilter === 'low') return percent < 70;
            return true;
        });

        list.sort((a, b) => {
            const t1 = new Date(a.timeReviewed).getTime();
            const t2 = new Date(b.timeReviewed).getTime();
            return sortDate === 'newest' ? t2 - t1 : t1 - t2;
        });

        return list;
    }, [history, search, scoreFilter, sortDate]);

    const paginatedHistory = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredHistory.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredHistory, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, scoreFilter, sortDate]);

    /** fetch detail */
    useEffect(() => {
        const fetchDetail = async () => {
            if (viewMode !== 'detail' || !selectedQuizResultId) return;
            setDetailLoading(true);

            try {
                const response = await quizService.getQuizResultDetail(String(selectedQuizResultId));
                setQuizDetail(response.data);
            } finally {
                setDetailLoading(false);
            }
        };

        fetchDetail();
    }, [viewMode, selectedQuizResultId]);

    if (loading) return <div className="py-10 text-center">Loading...</div>;
    if (error) return <div className="py-10 text-center text-red-500">{error}</div>;

    return (
        <div className="w-full h-full flex flex-col min-h-0">
            {viewMode === 'list' && (
                <>
                    <h2 className="text-xl font-semibold mb-4">History of Quiz</h2>

                    <FilterBar
                        search={search}
                        setSearch={setSearch}
                        scoreFilter={scoreFilter}
                        setScoreFilter={setScoreFilter}
                        sortDate={sortDate}
                        setSortDate={setSortDate}
                    />

                    <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                        <QuizHistoryList
                            items={paginatedHistory}
                            onSelect={(quiz) => {
                                setSelectedQuizResultId(quiz.quizResultId);
                                setViewMode('detail');
                            }}
                        />
                    </div>

                    <div className="py-4 border-t border-border bg-background flex justify-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                        >
                            Prev
                        </Button>

                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} / {Math.max(1, Math.ceil(filteredHistory.length / ITEMS_PER_PAGE))}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= Math.ceil(filteredHistory.length / ITEMS_PER_PAGE)}
                            onClick={() => setCurrentPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}

            {viewMode === 'detail' && (
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
                    <QuizResultDetailPanel
                        loading={detailLoading}
                        quizDetail={quizDetail}
                        onBack={() => {
                            setViewMode('list');
                            setQuizDetail(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
