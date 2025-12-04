'use client';

import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import QuestionPreview, { IQuestionPreview } from './QuestionPreview';
import toastHelper from '@/utils/toast.helper';

interface Props {
    questions: IQuestionPreview[];
    setQuestions: (q: IQuestionPreview[]) => void;
    onSubmit: (q: IQuestionPreview[]) => void;
}

export default function QuestionImportText({ questions, setQuestions, onSubmit }: Props) {
    const [content, setContent] = useState('');

    useEffect(() => {
        const lines = content
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

        const parsed: IQuestionPreview[] = [];

        for (let line of lines) {
            const parts = line.split('|').map((p) => p.trim());
            if (parts.length < 4) continue;

            const questionText = parts[0];
            const correctIndex = Number(parts[parts.length - 1]);
            const choices = parts.slice(1, parts.length - 1);

            parsed.push({ questionText, choices, correctIndex });
        }

        setQuestions(parsed);
    }, [content]);

    return (
        <div className="flex flex-col gap-4">
            <Textarea
                rows={10}
                placeholder="Question | Choice1 | Choice2 | Choice3 | ... | CorrectIndex"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />

            <div>Preview</div>
            <QuestionPreview questions={questions} />

            <Button onClick={() => onSubmit(questions)}>Save Imported Questions</Button>
        </div>
    );
}
