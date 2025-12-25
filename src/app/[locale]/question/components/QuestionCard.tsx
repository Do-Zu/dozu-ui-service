'use client';

import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { IQuestion } from '@/app/[locale]/question/types/question.type';
import { cn } from '@/lib/utils';

export interface QuestionCardProps {
    question: IQuestion;
    index: number;
    onChangeText: (index: number, text: string) => void;
    onChangeChoice: (questionIdx: number, choiceIdx: number, text: string) => void;
    onChangeCorrectIndex: (questionIdx: number, correctIdx: number) => void;
    onChangeQuestionType: (questionIdx: number, questionType: string) => void;
    onChangeSingleAnswer: (questionIdx: number, text: string) => void;
    onDelete: (id: number) => void;
    allQuestions: IQuestion[];
}

const QUESTION_TYPES = [
    'Multiple Choice',
    'True or False',
    'Free Response',
    'Fill in the blank',
] as const;

const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    index,
    onChangeText,
    onChangeChoice,
    onChangeCorrectIndex,
    onChangeQuestionType,
    onChangeSingleAnswer,
    onDelete,
    allQuestions,
}) => {
    const isSingleAnswer =
        question.questionType === 'Free Response' ||
        question.questionType === 'Fill in the blank';

    const [duplicateIndexes, setDuplicateIndexes] = useState<number[]>([]);
    const [isDuplicateQuestion, setIsDuplicateQuestion] = useState(false);

    /* uplicate choices (MC / TF only) */
    useEffect(() => {
        if (isSingleAnswer) {
            setDuplicateIndexes([]);
            return;
        }

        const trimmed = question.choices.map((c) => c.trim().toLowerCase());
        const dups: number[] = [];

        trimmed.forEach((choice, idx) => {
            if (choice && trimmed.filter((c) => c === choice).length > 1) {
                dups.push(idx);
            }
        });

        setDuplicateIndexes(dups);
    }, [question.choices, isSingleAnswer]);

    /* Duplicate question text  */
    useEffect(() => {
        if (!question.questionText?.trim()) {
            setIsDuplicateQuestion(false);
            return;
        }

        const current = question.questionText.trim().toLowerCase();
        const duplicates = allQuestions.filter(
            (q, i) => i !== index && q.questionText?.trim().toLowerCase() === current,
        );

        setIsDuplicateQuestion(duplicates.length > 0);
    }, [question.questionText, allQuestions, index]);

    return (
        <div
            className={cn(
                'col-span-12 bg-white p-6 rounded-xl border shadow transition-all',
                isDuplicateQuestion && 'border-red-500',
            )}
        >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-3">
                {/* Question type */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">
                        Question type
                    </span>
                    <select
                        value={question.questionType ?? 'Multiple Choice'}
                        onChange={(e) => onChangeQuestionType(index, e.target.value)}
                        className="text-xs rounded-md border bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {QUESTION_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Delete */}
                <Trash2
                    size={18}
                    className="cursor-pointer text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(question.id)}
                />
            </div>

            {/* QUESTION TEXT */}
            <Textarea
                placeholder="Question Text"
                value={question.questionText}
                onChange={(e) => onChangeText(index, e.target.value)}
                className={isDuplicateQuestion ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />

            {/* ANSWERS */}
            <div className="mt-4 space-y-2">
                {/* Free Response / Fill in the blank */}
                {isSingleAnswer ? (
                    <Input
                        value={question.choices[0] ?? ''}
                        placeholder={
                            question.questionType === 'Fill in the blank'
                                ? 'Correct word / phrase'
                                : 'Suggested answer'
                        }
                        onChange={(e) => {onChangeSingleAnswer(index, e.target.value)
                        }}
                    />
                ) : (
                    /* Multiple Choice / True False */
                    question.choices.map((choice, i) => {
                        const isDuplicateChoice = duplicateIndexes.includes(i);

                        return (
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
                                    className={
                                        isDuplicateChoice
                                            ? 'border-red-500 focus-visible:ring-red-500'
                                            : ''
                                    }
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default QuestionCard;
