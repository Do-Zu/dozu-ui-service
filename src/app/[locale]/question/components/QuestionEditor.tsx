'use client';

import { useEffect } from 'react';
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
import { buildContentFromQuestionsForFlashcards } from '@/app/[locale]/question/utils/buildGenPayload';
import ContentGenerationPreview from '@/app/[locale]/generate/components/ContentGenerationPreview';
import { useContentGeneration } from '@/app/[locale]/generate/hooks/useContentGeneration';
import { CONTENT_TYPE_GENERATE } from '@/app/[locale]/generate/types';
import { handleConvertToFlashcardsSubmitted } from '@/app/[locale]/flashcards/components/FlashcardEditor';
import flashcardService from '@/services/flashcard/flashcard.service';
import { useQuizWorkspace } from '@/app/[locale]/topics/[topicId]/(topic)/components/quiz/context/QuizWorkspaceContext';

const questionsJump = 3;

function createInitialQuestion(id: number): IQuestion {
    return {
        id,
        questionText: '',
        choices: ['', '', '', ''],
        correctIndex: 0,
        questionType: 'MULTIPLE_CHOICE',
    } as IQuestion;
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
    const {setGeneratedQuestionsForEdit } = useQuizWorkspace();
    const { regenerate, previewOpen, setPreviewOpen, sseData, sseStatus, loading } = useGenerateFromExisting();
    const { contentType, dataGenerated, setDataGenerated, isContentReady } = useContentGeneration({
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
        // check if question list is empty
        if (!Array.isArray(questions) || questions.length === 0) {
            toast({
                title: 'No questions to save',
                description: 'Please add at least one question before saving.',
                variant: 'destructive',
            });
            return;
        }

        // check if all questions are valid (title, >=2 answers, correct index)
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
            setGeneratedQuestionsForEdit(null);
            if (topic?.topicId !== undefined) {
                router.push(ROUTES.QUIZ_DASBOARD(topic.topicId));
            }
        } catch (err) {
            console.error(err);
            toast({ title: 'Error saving questions', variant: 'destructive' });
        }
    };

    const hasAnyValidQuestion = (list: IQuestion[]) => {
        return list.some(
            (q) =>
                !q.serverInfo?.isDeleted &&
                q.questionText.trim().length > 0 &&
                Array.isArray(q.choices) &&
                q.choices.some((c) => (c ?? '').trim().length > 0),
        );
    };

    // check: must have title, >=2 answers not empty, valid correctIndex
    const hasAllValidQuestions: (list: IQuestion[]) => boolean = (list: IQuestion[]): boolean => {
        if (!Array.isArray(list) || list.length === 0) return false;

        return list.every((q) => {
            const hasValidText = q.questionText?.trim().length > 0;
            const nonEmptyChoices = Array.isArray(q.choices) ? q.choices.filter((c) => c?.trim().length > 0) : [];
            const hasEnoughChoices = nonEmptyChoices.length >= 2;

            //duplicate check (case-insensitive)
            const lowerChoices = nonEmptyChoices.map((c) => c.toLowerCase());
            const hasDuplicateChoices = new Set(lowerChoices).size !== lowerChoices.length;

            const hasValidCorrectIndex =
                typeof q.correctIndex === 'number' &&
                q.correctIndex >= 0 &&
                q.correctIndex < q.choices.length &&
                q.choices[q.correctIndex]?.trim().length > 0;
            return hasValidText && hasEnoughChoices && !hasDuplicateChoices && hasValidCorrectIndex;
        });
    };

    const handleGenerateFlashcards = async () => {
        if (!topic) return;

        if (!hasAnyValidQuestion(questions)) {
            toast({ description: 'There are no questions to create flashcards', variant: 'destructive' });
            return;
        }

        const payload = buildContentFromQuestionsForFlashcards(topic.topicId, questions);
        await regenerate(payload, 'flashcard');
    };

    const handleSaveGeneratedToThisTopic = async () => {
        if (!topic) return;
        if (!dataGenerated) {
            toast({ description: 'No data to save', variant: 'destructive' });
            return;
        }

        if (contentType === CONTENT_TYPE_GENERATE.FLASH_CARD) {
            const batchFlashcards = handleConvertToFlashcardsSubmitted(dataGenerated as any);
            if (!batchFlashcards) {
                toast({ description: 'No valid flashcards to save', variant: 'destructive' });
                return;
            }
            await flashcardService.batchFlashcardsForTopic({ topicId: topic.topicId, flashcards: batchFlashcards });
            toast({ description: 'Saved Flashcards to topic', variant: 'default' });
        }
    };

    const canSaveGenerated =
        contentType === CONTENT_TYPE_GENERATE.FLASH_CARD && Array.isArray(dataGenerated) && dataGenerated.length > 0;

    if (previewOpen) {
        return (
            <div className="px-[4rem] py-7 bg-muted min-h-screen">
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

    return (
        <div className="px-[4rem] py-7 bg-muted">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {shouldShowBackButton && <BackButton />}
                    <h1 className="text-[1.7rem] font-bold text-primary">
                        {topic ? topic.name : 'Questions Generated'}
                    </h1>
                </div>
                <div className="flex gap-4">
                    <Button onClick={handleGenerateFlashcards} disabled={!hasAnyValidQuestion(questions) || loading}>
                        Generate Flashcards
                    </Button>
                    <Button>
                        <Import size={24} /> Import
                    </Button>
                    {shouldShowSaveButton && (
                        <Button onClick={handleOnClickSave}>
                            <Save size={24} /> Save
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 mt-7">
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
                            onDelete={handleDeleteQuestion}
                        />
                    ))}

                <div className="col-span-12 flex justify-center">
                    <Button onClick={handleAddQuestions}>+ Add Questions</Button>
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center bg-white px-6 py-5 rounded-xl shadow-lg">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-gray-800 font-medium">Generating flashcards...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionEditor;
