'use client';

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export interface IQuestionPreview {
    questionText: string;
    choices: string[];
    correctIndex: number;
}

export default function QuestionPreview({ questions }: { questions: IQuestionPreview[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[5%]">#</TableHead>
                    <TableHead className="w-[30%]">Question</TableHead>
                    <TableHead className="w-[50%]">Choices</TableHead>
                    <TableHead className="w-[10%]">Correct</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {questions.map((q, index) => (
                    <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{q.questionText}</TableCell>
                        <TableCell>{q.choices.join(', ')}</TableCell>
                        <TableCell>{q.correctIndex}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
