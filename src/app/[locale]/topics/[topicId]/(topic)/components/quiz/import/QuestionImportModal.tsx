'use client';

import { Modal } from '@/components/modal/Modal';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import QuestionImportText from './QuestionImportText';
import QuestionPreview, { IQuestionPreview } from './QuestionPreview';

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onSubmit: (questions: IQuestionPreview[]) => void;
}

export default function QuestionImportModal({ isOpen, setIsOpen, onSubmit }: Props) {
    const [importMethod, setImportMethod] = useState('text');
    const [questions, setQuestions] = useState<IQuestionPreview[]>([]);

    useEffect(() => {
        if (!isOpen) setQuestions([]);
    }, [isOpen]);

    function handleSubmit(data: IQuestionPreview[]) {
        onSubmit(data);
        setIsOpen(false);
        setQuestions([]);
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Import Questions"
            contentStyle="top-[10%] left-[50%] max-w-[80vw] -translate-x-1/2 -translate-y-0"
            body={
                <Tabs value={importMethod} onValueChange={setImportMethod} defaultValue="text">
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="text">Text</TabsTrigger>
                        <TabsTrigger value="file">CSV File</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="mt-4">
                        <QuestionImportText
                            questions={questions}
                            setQuestions={setQuestions}
                            onSubmit={handleSubmit}
                        />
                    </TabsContent>

                    {/* <TabsContent value="file" className="mt-4">
                        <QuestionImportCsv
                            questions={questions}
                            setQuestions={setQuestions}
                            onSubmit={handleSubmit}
                        />
                    </TabsContent> */}
                </Tabs>
            }
        />
    );
}
