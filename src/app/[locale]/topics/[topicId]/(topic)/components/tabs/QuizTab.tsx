'use client';

import { useEffect, useState } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import useFetch from '@/hooks/useFetch';

import LoadingPage from '@/app/loading';
import DataStatus from '@/components/errors/DataStatus';

import { METHOD_LEARNING } from '@/utils/constants/method';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { LayoutGrid, History as HistoryIcon, Edit as EditIcon } from 'lucide-react';

import QuizTypeSelector from '@/app/[locale]/quiz/components/QuizTypeSelector';
import CreateQuizModal from '@/app/[locale]/quiz/components/CreateQuizModal';
import QuizOnboarding from '@/app/[locale]/quiz/components/QuizOnboarding';
import QuizResultDetail from '@/app/[locale]/quiz/components/QuizResultDetail';


import { quizService } from '@/app/[locale]/quiz/services/quiz.service';
import { toast } from '@/hooks/use-toast';

// chart
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// history + edit
import QuizCard from '@/app/[locale]/quiz/components/QuizCard';
import QuestionEditor from '@/app/[locale]/question/components/QuestionEditor';
import { IQuestion, IQuestionBasic } from '@/app/[locale]/question/types/question.type';
import { handleConvertToQuestionsEdited } from '@/app/[locale]/question/utils/handleConvertToQuestionsEdited';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type QuizMode = 'generate' | 'history' | 'edit';

interface IQuizStatistics {
    totalQuizzes: number;
    averageScore: number;
    perfectScoreCount: number;
    averageQuestionsPerQuiz: number;
}

interface QuizHistoryItem {
    quizResultId: number;
    quizId: number;
    correctAnswersCount: number;
    questionsCount: number;
    timeReviewed: string;
    quizTitle?: string;
}

interface IQuestionServer {
    questionId: number;
    topicId: number;
    isUpdated: boolean;
    isDeleted: boolean;
}

interface IQuestionWithServer extends IQuestion {
    serverInfo?: IQuestionServer;
}

interface IQuestionsWithTopicName {
    questions: IQuestionBasic[];
    topicName: string;
}

export default function QuizTab() {
    const { tab, topicId, topic } = useTopicWorkspace();

    const [quizMode, setQuizMode] = useState<QuizMode>('generate');
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
const [selectedQuizResultId, setSelectedQuizResultId] = useState<number | null>(null);


    // =================== COMMON STATE (generate quiz) ===================
    const [statistics, setStatistics] = useState<IQuizStatistics | null>(null);
    const [selectedType, setSelectedType] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [defaultName, setDefaultName] = useState('');
    const [defaultDescription, setDefaultDescription] = useState('');
    const [loadingOverlay, setLoadingOverlay] = useState(false);

    // =================== FETCH STATISTICS (for chart) ===================
    const {
        data: statsData,
        loading: statsLoading,
        error: statsError,
    } = useFetch<IQuizStatistics>(() => quizService.getStatistics(String(topicId)), {
        shouldRun: tab === METHOD_LEARNING.QUIZ,
    });

    useEffect(() => {
        if (statsData) setStatistics(statsData);
    }, [statsData]);

    // =================== GENERATE QUIZ HANDLERS ===================
    const handleSelectQuizType = async (type: string) => {
        try {
            const { data } = await quizService.generateQuiz(String(topicId), type);

            if (!Array.isArray(data) || data.length === 0) {
                toast({
                    title: 'Cannot create quiz',
                    description: (
                        <span className="text-sm">
                            There are no suitable questions to create a quiz. Please{' '}
                            <span
                                onClick={() => setShowOnboarding(true)}
                                className="underline cursor-pointer font-medium"
                            >
                                check the guide
                            </span>{' '}
                            to understand quiz types.
                        </span>
                    ),
                });
                return;
            }

            const labelMap: Record<string, string> = {
                initial: 'Initial',
                review: 'Review',
                ef_low: 'EF Low',
                new: 'New',
                random: 'Random',
                wrong: 'Wrong',
            };

            const now = new Date();
            const ts =
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
                    now.getDate(),
                ).padStart(2, '0')} ` +
                `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            setDefaultName(`${labelMap[type] || type} Quiz - ${ts}`);
            setDefaultDescription(
                `Auto-generated (${data.length} questions). You can rename or edit this description before starting.`,
            );
            setSelectedType(type);
            setIsCreateModalOpen(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateQuiz = async ({ name, description }: { name: string; description?: string }) => {
        try {
            setLoadingOverlay(true);
            const res = await quizService.createQuiz({
                topicId,
                name,
                description,
                questionIds: [],
            });

            const quizId = (res?.data as any)?.quizId;
            if (!quizId) throw new Error('Quiz creation failed');

            window.location.href = `/quiz/${topicId}/doing?quizId=${quizId}&type=${selectedType}`;
        } catch (err) {
            toast({
                title: 'Failed to create quiz',
                description: `${err}`,
                variant: 'destructive',
            });
        } finally {
            setLoadingOverlay(false);
        }
    };

    // =================== CHART DATA ===================
    const chartData = {
        labels: ['Total Quizzes', 'Average Score (%)', 'Perfect Scores', 'Avg Questions/Quiz'],
        datasets: [
            {
                label: 'Quiz Statistics',
                data: statistics
                    ? [
                          statistics.totalQuizzes,
                          statistics.averageScore,
                          statistics.perfectScoreCount,
                          statistics.averageQuestionsPerQuiz,
                      ]
                    : [0, 0, 0, 0],
                backgroundColor: '#4B89A3',
                borderColor: '#1E3A8A',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
    };

    // =================== RENDER STATE (stats) ===================
    if (statsLoading) return <LoadingPage />;
    if (statsError) return <DataStatus variant="error" title={statsError} />;

    // =================== MAIN RENDER ===================
    return (
        <div className="relative w-full h-full flex flex-col">
            {/* overlay tạo quiz */}
            {loadingOverlay && (
                <div className="absolute inset-0 bg-black/40 z-50 flex flex-col items-center justify-center text-white">
                    <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-white rounded-full mb-3" />
                    <span className="text-lg font-semibold">Creating your quiz...</span>
                </div>
            )}

            {/* TABS LIST (Generate / History / Edit Questions) */}
            <Tabs
                value={quizMode}
                onValueChange={(val) => setQuizMode(val as QuizMode)}
                className="w-full flex justify-center mb-4"
            >
                <TabsList className="w-[70%] grid grid-cols-3 rounded-2xl p-1">
                    <TabsTrigger
                        value="generate"
                        className="flex items-center justify-center gap-2 rounded-2xl"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        <span className="whitespace-nowrap">Generate Quiz</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="history"
                        className="flex items-center justify-center gap-2 rounded-2xl"
                    >
                        <HistoryIcon className="h-4 w-4" />
                        <span className="whitespace-nowrap">History</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="edit"
                        className="flex items-center justify-center gap-2 rounded-2xl"
                    >
                        <EditIcon className="h-4 w-4" />
                        <span className="whitespace-nowrap">Edit Questions</span>
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* CONTENT AREA */}
            <div className="flex-1 min-h-0 px-6 pb-4">
                {quizMode === 'generate' && (
                    <div className="w-full h-full">
                        <header className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {topic?.name ? `Quiz for "${topic.name}"` : 'Quiz'}
                            </h2>
                            <Button variant="outline" onClick={() => setShowOnboarding(true)}>
                                Quiz Guide
                            </Button>
                        </header>

                        <Separator className="mb-4" />

                        {/* Chọn type quiz */}
                        <QuizTypeSelector onSelectQuizType={handleSelectQuizType} />

                        {/* Chart Statistics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8 mt-6">
                            <div className="bg-muted p-6 rounded-lg shadow-md border border-border">
                                <Bar data={chartData} options={options} />
                            </div>
                        </div>

                        {/* Modal create quiz + Onboarding */}
                        <CreateQuizModal
                            isOpen={isCreateModalOpen}
                            onClose={() => setIsCreateModalOpen(false)}
                            onSubmit={handleCreateQuiz}
                            quizType={selectedType}
                            defaultName={defaultName}
                            defaultDescription={defaultDescription}
                            setGlobalLoading={setLoadingOverlay}
                        />

                        <QuizOnboarding open={showOnboarding} onOpenChange={setShowOnboarding} />
                    </div>
                )}

                {quizMode === 'history' && (
  <QuizHistoryPanel
    topicId={String(topicId)}
    viewMode={viewMode}
    setViewMode={setViewMode}
    selectedQuizResultId={selectedQuizResultId}
    setSelectedQuizResultId={setSelectedQuizResultId}
  />
)}


                {quizMode === 'edit' && (
                    <QuizQuestionEditorPanel
                        topicId={String(topicId)}
                        topicName={topic?.name ?? 'Questions'}
                    />
                )}
            </div>
        </div>
    );
}

/* ======================= HISTORY PANEL ======================= */

function QuizHistoryPanel({
  topicId,
  viewMode,
  setViewMode,
  selectedQuizResultId,
  setSelectedQuizResultId,
}: {
  topicId: string;
  viewMode: 'list' | 'detail';
  setViewMode: (v: 'list' | 'detail') => void;
  selectedQuizResultId: number | null;
  setSelectedQuizResultId: (id: number | null) => void;
}) {

    const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [quizDetail, setQuizDetail] = useState<any>(null);

useEffect(() => {
  if (viewMode === 'detail' && selectedQuizResultId) {
    (async () => {
      try {
        const response = await quizService.getQuizResultDetail(String(selectedQuizResultId));
        setQuizDetail(response.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }
}, [viewMode, selectedQuizResultId]);


    const fetchHistoryWithTitle = async () => {
        setError(null);
        setLoading(true);

        try {
            const response = await quizService.getQuizHistory(topicId);
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

            setQuizHistory(historyWithTitles);
        } catch (err) {
            console.error('Error fetching quiz history:', err);
            setError('Failed to load quiz history. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistoryWithTitle();
    }, [topicId]);

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
        <div className="space-y-3">
          {quizHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quiz has been taken yet.</p>
          ) : (
            quizHistory.map((quiz) => (
              <QuizCard
                key={quiz.quizResultId}
                quizId={quiz.quizId}
                quizTitle={quiz.quizTitle || `Quiz #${quiz.quizId}`}
                correctAnswersCount={quiz.correctAnswersCount}
                questionsCount={quiz.questionsCount}
                timeReviewed={quiz.timeReviewed}
                onClick={() => {
                  setSelectedQuizResultId(quiz.quizResultId);
                  setViewMode('detail');
                }}
              />
            ))
          )}
        </div>
      </>
    )}

    {viewMode === 'detail' && (
      <div className="px-4 py-4">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => {
            setViewMode('list');
            setQuizDetail(null);
          }}
        >
          ← Back
        </Button>

        {!quizDetail ? (
          <div className="text-muted-foreground">Loading quiz detail...</div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">{quizDetail.name || 'Quiz Detail'}</h2>
            <QuizResultDetail quizResult={quizDetail} />
          </>
        )}
      </div>
    )}

  </div>
);

}

/* ======================= EDIT QUESTION PANEL ======================= */

function QuizQuestionEditorPanel({ topicId, topicName }: { topicId: string; topicName: string }) {
    const {
        data: questionsExisted,
        loading,
        error,
    } = useFetch<IQuestionsWithTopicName>(`/questions?topicId=${topicId}`);

    const [questions, setQuestions] = useState<IQuestionWithServer[]>();

    useEffect(() => {
        if (!questionsExisted) return;
        const converted = handleConvertToQuestionsEdited({
            type: 'manual',
            questionsProp: questionsExisted,
        });
        setQuestions(converted);
    }, [questionsExisted]);

    if (loading) return <LoadingPage />;
    if (error) return <DataStatus variant="error" title={error} />;
    if (!questions) return <DataStatus variant="empty" />;

    return (
        <div className="w-full h-full overflow-y-auto rounded-lg border bg-muted">
            <QuestionEditor
                shouldShowBackButton={false}
                shouldShowSaveButton={true}
                questions={questions}
                setQuestions={setQuestions}
                topic={{ topicId, name: questionsExisted!.topicName || topicName }}
            />
        </div>
    );
}
