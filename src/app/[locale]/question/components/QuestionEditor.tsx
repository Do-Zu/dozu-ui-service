'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Import } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { postRequest } from '@/api/api';
import BackButton from '../../flashcards/components/BackButton';
import { IQuestion } from '@/app/[locale]/question/types/question.type';
import { handleConvertToQuestionsSubmitted } from '@/app/[locale]/question/utils/handleConvertToQuestionsSubmitted';
import { ROUTES } from '@/utils/constants/routes';
import QuestionCard from '../components/QuestionCard';
import { useGenerateFromExisting } from '@/app/[locale]/generate/hooks/useGenerateFromExisting';
import ContentGenerationPreview from '@/app/[locale]/generate/components/ContentGenerationPreview';
import { useContentGeneration } from '@/app/[locale]/generate/hooks/useContentGeneration';
import { CONTENT_TYPE_GENERATE } from '@/app/[locale]/generate/types';
import {
    handleConvertToFlashcardsSubmitted,
    IFlashcardWithServer,
} from '@/app/[locale]/flashcards/components/FlashcardEditor';
import flashcardService from '@/services/flashcard/flashcard.service';
import { useOptionalQuizWorkspace } from '@/app/[locale]/topics/[topicId]/(topic)/components/quiz/context/QuizWorkspaceContext';
import QuestionImportModal from '@/app/[locale]/topics/[topicId]/(topic)/components/quiz/import/QuestionImportModal';
import { IQuestionPreview } from '@/app/[locale]/topics/[topicId]/(topic)/components/quiz/import/QuestionPreview';

const questionsJump = 3;

function createInitialQuestion(id: number): IQuestion {
    return {
        id,
        questionText: '',
        choices: ['', '', '', ''],
        correctIndex: 0,
        questionType: 'Multiple Choice',
    } as IQuestion;
}

function isValidByType(q: IQuestion): boolean {
    const textOk = q.questionText.trim().length > 0;
    if (!textOk) return false;

    const nonEmptyChoices = q.choices.filter((c) => c?.trim().length > 0);

    switch (q.questionType) {
        case 'Free Response':
        case 'Fill in the blank':
            return nonEmptyChoices.length >= 1;

        case 'True or False':
        case 'Multiple Choice':
        default:
            return nonEmptyChoices.length >= 2;
    }
}

interface Props {
    shouldShowBackButton?: boolean;
    shouldShowSaveButton?: boolean;
    questions: IQuestion[];
    setQuestions: (questions: IQuestion[]) => void;
    topic?: {
        topicId: string | number;
        name: string;
    };
}

const QuestionEditor = ({
    shouldShowBackButton = true,
    shouldShowSaveButton = true,
    questions,
    setQuestions,
    topic,
}: Props) => {
    const router = useRouter();
    const [isImportOpen, setIsImportOpen] = useState(false);

    const quizWorkspace = useOptionalQuizWorkspace();
    const setGeneratedQuestionsForEdit = quizWorkspace?.setGeneratedQuestionsForEdit;

    const { previewOpen, setPreviewOpen, sseData, sseStatus, loading } = useGenerateFromExisting();

    const { contentType, dataGenerated, setDataGenerated } = useContentGeneration({
        sseData,
        sseStatus,
    });

    useEffect(() => {
        if (questions.length === 0) {
            const initial = Array.from({ length: questionsJump }, (_, i) => createInitialQuestion(i));
            setQuestions(initial);
        }
    }, []);

    const handleAddQuestions = () => {
        const lastId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) : -1;
        const newQuestions = Array.from({ length: questionsJump }, (_, i) => createInitialQuestion(lastId + i + 1));
        setQuestions([...questions, ...newQuestions]);
    };

    const handleAddQuestionsImported = (imported: IQuestionPreview[]) => {
        const cleaned = [...questions].filter(
            (q) => q.questionText.trim() !== '' || q.choices.some((c) => (c ?? '').trim() !== ''),
        );

        const lastId = cleaned.length > 0 ? Math.max(...cleaned.map((q) => q.id)) : -1;

        const newItems: IQuestion[] = imported.map((item, idx) => ({
            id: lastId + idx + 1,
            questionText: item.questionText,
            choices: item.choices,
            correctIndex: item.correctIndex,
            questionType: 'Multiple Choice',
        }));

        setQuestions([...cleaned, ...newItems]);
        setIsImportOpen(false);
    };

    const handleChangeQuestionText = (order: number, text: string) => {
        setQuestions(
            questions.map((q, i) =>
                i === order
                    ? {
                          ...q,
                          questionText: text,
                          serverInfo: q.serverInfo ? { ...q.serverInfo, isUpdated: true } : q.serverInfo,
                      }
                    : q,
            ),
        );
    };

    const handleChangeChoice = (questionIdx: number, choiceIdx: number, text: string) => {
        setQuestions(
            questions.map((q, i) => {
                if (i !== questionIdx) return q;
                const updatedChoices = [...q.choices];
                updatedChoices[choiceIdx] = text;
                return {
                    ...q,
                    choices: updatedChoices,
                    serverInfo: q.serverInfo ? { ...q.serverInfo, isUpdated: true } : q.serverInfo,
                };
            }),
        );
    };

    const handleChangeQuestionType = (questionIdx: number, questionType: string) => {
        setQuestions(
            questions.map((q, i) => {
                if (i !== questionIdx) return q;

                if (questionType === 'Free Response' || questionType === 'Fill in the blank') {
                    const safeAnswer =
                        q.correctIndex >= 0 && q.correctIndex < q.choices.length ? q.choices[q.correctIndex] : '';

                    return {
                        ...q,
                        questionType,
                        choices: [safeAnswer],
                        correctIndex: 0,
                        serverInfo: q.serverInfo ? { ...q.serverInfo, isUpdated: true } : q.serverInfo,
                    };
                }

                if (q.questionType === 'Free Response' || q.questionType === 'Fill in the blank') {
                    return {
                        ...q,
                        questionType,
                        choices: ['', '', '', ''],
                        correctIndex: 0,
                        serverInfo: q.serverInfo ? { ...q.serverInfo, isUpdated: true } : q.serverInfo,
                    };
                }

                return {
                    ...q,
                    questionType,
                    serverInfo: q.serverInfo ? { ...q.serverInfo, isUpdated: true } : q.serverInfo,
                };
            }),
        );
    };

    const handleChangeCorrectIndex = (questionIdx: number, correctIdx: number) => {
        setQuestions(
            questions.map((q, i) =>
                i === questionIdx
                    ? {
                          ...q,
                          correctIndex: correctIdx,
                          serverInfo: q.serverInfo ? { ...q.serverInfo, isUpdated: true } : q.serverInfo,
                      }
                    : q,
            ),
        );
    };

    const handleChangeSingleAnswer = (questionIdx: number, text: string) => {
        setQuestions(
            questions.map((q, i) =>
                i === questionIdx
                    ? {
                          ...q,
                          choices: [text],
                          correctIndex: 0,
                          serverInfo: q.serverInfo ? { ...q.serverInfo, isUpdated: true } : q.serverInfo,
                      }
                    : q,
            ),
        );
    };

    const handleDeleteQuestion = (id: number) => {
        const updatedQuestions = questions
            .map((q) => {
                if (q.id !== id) return q;
                if (q.serverInfo) {
                    return {
                        ...q,
                        serverInfo: {
                            ...q.serverInfo,
                            isDeleted: true,
                        },
                    };
                }
                return null;
            })
            .filter((q): q is IQuestion => q !== null);

        setQuestions(updatedQuestions);
    };

    const handleOnClickSave = async () => {
        if (!Array.isArray(questions) || questions.length === 0) {
            toast({
                title: 'No questions to save',
                description: 'Please add at least one question before saving.',
                variant: 'destructive',
            });
            return;
        }

        if (!hasAllValidQuestions(questions)) {
            toast({
                title: 'Invalid questions detected',
                description:
                    'Please make sure every question has a title, at least two non-empty and unique answers, and a valid correct answer index.',
                variant: 'destructive',
            });
            return;
        }

        const dataSubmitted = handleConvertToQuestionsSubmitted(questions);

        try {
            await postRequest(`/questions/batch?topicId=${topic?.topicId}`, dataSubmitted);
            toast({ title: 'Questions saved successfully' });
            setGeneratedQuestionsForEdit?.(null);
            quizWorkspace?.setQuizMode('generate');
            quizWorkspace?.setHasAnyQuestions(true);

            if (topic?.topicId !== undefined) {
                router.push(
                    ROUTES.TOPIC_WORKSPACE({
                        topicId: Number(topic.topicId),
                        tab: CONTENT_TYPE_GENERATE.QUIZ,
                    }),
                );
            }
        } catch (err) {
            console.error(err);
            toast({ title: 'Error saving questions', variant: 'destructive' });
        }
    };

    // const hasAnyValidQuestion = (list: IQuestion[]) => {
    //     return list.some(
    //         (q) =>
    //             !q.serverInfo?.isDeleted &&
    //             q.questionText.trim().length > 0 &&
    //             Array.isArray(q.choices) &&
    //             q.choices.some((c) => (c ?? '').trim().length > 0),
    //     );
    // };

    const hasAllValidQuestions = (list: IQuestion[]): boolean => {
        if (!Array.isArray(list) || list.length === 0) return false;

        return list.every((q) => {
            if (q.serverInfo?.isDeleted) return true;

            // điều kiện chung cho tất cả các loại câu hỏi
            if (!q.questionText?.trim()) return false;
            if (!Array.isArray(q.choices)) return false;

            const hasValidCorrectIndex =
                typeof q.correctIndex === 'number' &&
                q.correctIndex >= 0 &&
                q.correctIndex < q.choices.length &&
                q.choices[q.correctIndex]?.trim().length > 0;

            if (!hasValidCorrectIndex) return false;

            // điều kiện theo type
            if (!isValidByType(q)) return false;

            // điều kiện duplicate (BLOCK SAVE)
            const nonEmptyChoices = q.choices.filter((c) => c?.trim().length > 0);
            const lowerChoices = nonEmptyChoices.map((c) => c.toLowerCase());
            const hasDuplicateChoices = new Set(lowerChoices).size !== lowerChoices.length;

            if (hasDuplicateChoices) return false;

            return true;
        });
    };

    const handleSaveGeneratedToThisTopic = async () => {
        if (!topic) return;
        if (!dataGenerated) {
            toast({ description: 'No data to save', variant: 'destructive' });
            return;
        }

        if (contentType === CONTENT_TYPE_GENERATE.FLASH_CARD) {
            const batchFlashcards = handleConvertToFlashcardsSubmitted(dataGenerated as IFlashcardWithServer[]);
            if (!batchFlashcards) {
                toast({ description: 'No valid flashcards to save', variant: 'destructive' });
                return;
            }
            await flashcardService.batchFlashcardsForTopic({ topicId: topic.topicId, flashcards: batchFlashcards });
            toast({ description: 'Saved Flashcards to topic', variant: 'default' });
        }
    };

    const totalRealQuestions = questions.filter((q) => {
        if (q.serverInfo?.isDeleted) return false;

        const hasText = q.questionText.trim().length > 0;
        const hasChoice = q.choices.some((c) => (c ?? '').trim().length > 0);

        return hasText || hasChoice;
    }).length;

    const canSaveGenerated =
        contentType === CONTENT_TYPE_GENERATE.FLASH_CARD && Array.isArray(dataGenerated) && dataGenerated.length > 0;

    //PREVIEW KHI ĐANG GENERATE FLASHCARDS
    if (previewOpen) {
        return (
            <div className="min-h-screen bg-muted px-16 py-7">
                <ContentGenerationPreview
                    shouldCreateTopic={false}
                    shouldCreateFeed={false}
                    sseData={sseData}
                    dataGenerated={dataGenerated}
                    setDataGenerated={setDataGenerated}
                    onSave={handleSaveGeneratedToThisTopic}
                />
                <div className="mt-4 flex gap-3">
                    <Button onClick={handleSaveGeneratedToThisTopic} disabled={!canSaveGenerated}>
                        Save to this topic
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setPreviewOpen(false);
                            setDataGenerated(null);
                        }}
                    >
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    //MAIN UI
    return (
        <div className="flex h-full flex-col bg-muted">
            {/* HEADER STICKY giống FlashcardsEdit */}
            <div className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
                <div className="flex items-center justify-between px-16 py-4">
                    <div className="flex items-center gap-4">
                        {shouldShowBackButton && <BackButton />}
                        <div className="flex flex-col">
                            <span className="mt-1 text-xs text-muted-foreground">{totalRealQuestions} questions</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Import questions */}
                        <Button onClick={() => setIsImportOpen(true)} className="hover:opacity-80">
                            <Import size={18} />
                            <p>Import</p>
                        </Button>

                        {/* Save */}
                        {shouldShowSaveButton && (
                            <Button onClick={handleOnClickSave} className="flex items-center gap-2 hover:opacity-80">
                                <Save size={16} />
                                <span className="hidden sm:inline">Save</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* BODY SCROLLABLE */}
            <div className="h-full overflow-y-auto pb-8">
                <div className="px-16 py-7">
                    <div className="grid grid-cols-12 gap-6">
                        {questions
                            .filter((q) => !q.serverInfo?.isDeleted)
                            .map((question, index) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    allQuestions={questions}
                                    onChangeText={handleChangeQuestionText}
                                    onChangeChoice={handleChangeChoice}
                                    onChangeCorrectIndex={handleChangeCorrectIndex}
                                    onChangeQuestionType={handleChangeQuestionType}
                                    onChangeSingleAnswer={handleChangeSingleAnswer}
                                    onDelete={handleDeleteQuestion}
                                />
                            ))}

                        <div className="col-span-12 mt-2">
                            <Button
                                onClick={handleAddQuestions}
                                variant="outline"
                                className="w-full border-2 border-dashed py-6 font-semibold text-muted-foreground hover:border-solid hover:border-primary hover:text-primary"
                            >
                                + Add more questions
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* IMPORT MODAL */}
            <QuestionImportModal
                isOpen={isImportOpen}
                setIsOpen={setIsImportOpen}
                onSubmit={handleAddQuestionsImported}
            />

            {loading && (
                <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="flex flex-col items-center rounded-xl border border-border bg-background px-6 py-5 shadow-lg">
                        <div className="mb-3 size-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Generating flashcards from your questions...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionEditor;
