'use client';

import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { IQuestion } from '@/app/[locale]/question/types/question.type';

export interface QuestionCardProps {
  question: IQuestion;
  index: number;
  onChangeText: (index: number, text: string) => void;
  onChangeChoice: (questionIdx: number, choiceIdx: number, text: string) => void;
  onChangeCorrectIndex: (questionIdx: number, correctIdx: number) => void;
  onDelete: (id: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onChangeText,
  onChangeChoice,
  onChangeCorrectIndex,
  onDelete,
}) => {
  return (
    <div className="col-span-4 bg-white p-6 rounded-xl border shadow">
      <div className="flex justify-end gap-2">
        <Trash2 size={20} className="cursor-pointer" onClick={() => onDelete(question.id)} />
      </div>

      <Textarea
        placeholder="Question Text"
        value={question.questionText}
        onChange={(e) => onChangeText(index, e.target.value)}
      />

      <div className="mt-4 space-y-2">
        {question.choices.map((choice, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              checked={question.correctIndex === i}
              onChange={() => onChangeCorrectIndex(index, i)}
            />
            <Input
              value={choice}
              placeholder={`Choice ${i + 1}`}
              onChange={(e) => onChangeChoice(index, i, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
