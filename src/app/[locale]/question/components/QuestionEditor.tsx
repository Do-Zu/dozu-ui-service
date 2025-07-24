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

  // 🚀 Khởi tạo nếu chưa có dữ liệu ban đầu
  useEffect(() => {
    if (questions.length === 0) {
      const initial = Array.from({ length: questionsJump }, (_, i) =>
        createInitialQuestion(i)
      );
      setQuestions(initial);
    }
  }, []);

  const handleAddQuestions = () => {
    const lastId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) : -1;
    const newQuestions = Array.from({ length: questionsJump }, (_, i) =>
      createInitialQuestion(lastId + i + 1)
    );
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
          : q
      )
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
      })
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
          : q
      )
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
