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

const questionsJump = 3;

function createInitialQuestion(id: number): IQuestion {
    return {
        id,
        questionText: '',
        choices: ['', '', '', ''],
        correctIndex: 0,
    };
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
    const { regenerate, previewOpen, setPreviewOpen, sseData, sseStatus } = useGenerateFromExisting();
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
        const dataSubmitted = handleConvertToQuestionsSubmitted(questions);
        try {
            await postRequest(`/questions/batch?topicId=${topic?.topicId}`, dataSubmitted);
            toast({ title: 'Questions saved successfully' });
            router.push(ROUTES.HOME);
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
        if (!isContentReady || !dataGenerated) {
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
      contentType === CONTENT_TYPE_GENERATE.FLASH_CARD &&
      Array.isArray(dataGenerated) &&
      dataGenerated.length > 0;

    if (previewOpen) {
    return (
    <div className="px-[4rem] py-7 bg-muted min-h-screen">
      <ContentGenerationPreview
        shouldCreateTopic={false}
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
                    <Button onClick={handleGenerateFlashcards} disabled={!hasAnyValidQuestion(questions)}>
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
        </div>
    );
};

export default QuestionEditor;
