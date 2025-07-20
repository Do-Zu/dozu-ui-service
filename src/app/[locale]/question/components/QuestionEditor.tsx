'use client';

import { useState, useEffect } from 'react';
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

const initialQuestionsCount = 3;
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
    const [questionsCount, setQuestionsCount] = useState<number>(initialQuestionsCount);

    const handleAddQuestions = () => {
        setQuestionsCount((prev) => prev + questionsJump);
    };

    useEffect(() => {
        if (!questions) return;
        if (questionsCount <= questions.length) return;

        const newQuestions = [...questions];
        const lastId = newQuestions.length > 0 ? newQuestions[newQuestions.length - 1].id : -1;
        let startId = lastId + 1;

        for (let i = questions.length; i < questionsCount; ++i) {
            newQuestions.push(createInitialQuestion(startId++));
        }

        setQuestions(newQuestions);
    }, [questionsCount]);

    const handleChangeQuestionText = (order: number, text: string) => {
        setQuestions(questions.map((q, i) => (i === order ? { ...q, questionText: text } : q)));
    };

    const handleChangeChoice = (questionIdx: number, choiceIdx: number, text: string) => {
        setQuestions(
            questions.map((q, i) => {
                if (i !== questionIdx) return q;
                const updatedChoices = [...q.choices];
                updatedChoices[choiceIdx] = text;
                return { ...q, choices: updatedChoices };
            }),
        );
    };

    const handleChangeCorrectIndex = (questionIdx: number, correctIdx: number) => {
        setQuestions(questions.map((q, i) => (i === questionIdx ? { ...q, correctIndex: correctIdx } : q)));
    };

    const handleDeleteQuestion = (id: number) => {
        setQuestions(questions.filter((q) => q.id !== id));
    };

    const handleOnClickSave = async () => {
        const dataSubmitted = handleConvertToQuestionsSubmitted(questions);
        try {
            await postRequest(`/questions/batch?topicId=${topic?.topicId}`, dataSubmitted);
            toast({ title: 'Questions saved successfully' });
            router.push(ROUTES.HOME);
        } catch (err) {
            console.error(err);
        }
    };

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
                {questions.map((question, index) => (
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
