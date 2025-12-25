'use client';

import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { IQuestion } from '@/app/[locale]/question/types/question.type';

export interface QuestionCardClassProps {
    question: IQuestion;
    index: number;
    onChangeText: (index: number, text: string) => void;
    onChangeChoice: (questionIdx: number, choiceIdx: number, text: string) => void;
    onChangeCorrectIndex: (questionIdx: number, correctIdx: number) => void;
    onDelete: (id: number) => void;
    allQuestions: IQuestion[];
}

const QuestionCardClass: React.FC<QuestionCardClassProps> = ({
    question,
    index,
    onChangeText,
    onChangeChoice,
    onChangeCorrectIndex,
    onDelete,
    allQuestions,
}) => {
    // track duplicate states per choice
    const [duplicateIndexes, setDuplicateIndexes] = useState<number[]>([]);
    const [isDuplicateQuestion, setIsDuplicateQuestion] = useState(false);

    // detect duplicate answers
    useEffect(() => {
        const trimmedChoices = question.choices.map((c) => c.trim().toLowerCase());
        const dups: number[] = [];
        trimmedChoices.forEach((choice, idx) => {
            if (choice && trimmedChoices.filter((c) => c === choice).length > 1) {
                dups.push(idx);
            }
        });
        setDuplicateIndexes(dups);
    }, [question.choices]);

    // detect duplicate questionText among all questions
    useEffect(() => {
        if (!question.questionText?.trim()) {
            setIsDuplicateQuestion(false);
            return;
        }

        const currentText = question.questionText.trim().toLowerCase();

        const duplicates = allQuestions.filter(
            (q, i) => i !== index && q.questionText.trim().toLowerCase() === currentText,
        );

        setIsDuplicateQuestion(duplicates.length > 0);
    }, [question.questionText, allQuestions, index]);

    return (
        <div
            className={`col-span-4 bg-white p-6 rounded-xl border shadow transition-all duration-200 ${
                isDuplicateQuestion ? 'border-red-500' : 'border-border'
            }`}
        >
            <div className="flex justify-end gap-2">
                <Trash2 size={20} className="cursor-pointer" onClick={() => onDelete(question.id)} />
            </div>

            <div className="relative">
                <Textarea
                    placeholder="Question Text"
                    value={question.questionText}
                    onChange={(e) => onChangeText(index, e.target.value)}
                    className={isDuplicateQuestion ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
            </div>

            <div className="mt-4 space-y-2">
                {question.choices.map((choice, i) => {
                    const isDuplicateChoice = duplicateIndexes.includes(i);
                    return (
                        <div key={i} className="flex items-center gap-2 relative">
                            <input
                                type="radio"
                                checked={question.correctIndex === i}
                                onChange={() => onChangeCorrectIndex(index, i)}
                            />
                            <Input
                                value={choice}
                                placeholder={`Choice ${i + 1}`}
                                onChange={(e) => onChangeChoice(index, i, e.target.value)}
                                className={isDuplicateChoice ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionCardClass;