'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface InitialQuizConfig {
    limit?: number;
    shuffle?: boolean;
}
interface CreateQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (quizData: { name: string; description?: string; initialConfig?: InitialQuizConfig }) => void;
    quizType: string;
    maxQuestions?: number;
    defaultName?: string;
    defaultDescription?: string;
    setGlobalLoading?: (loading: boolean) => void;
}

const CreateQuizModal = ({
    isOpen,
    onClose,
    onSubmit,
    quizType,
    maxQuestions,
    defaultName = '',
    defaultDescription = '',
    setGlobalLoading,
}: CreateQuizModalProps) => {
    const [name, setName] = useState(defaultName);
    const [description, setDescription] = useState(defaultDescription);
    const [limitInput, setLimitInput] = useState('');
    const parsedLimit = limitInput.trim() === '' ? undefined : Number(limitInput);

    const isLimitInvalid =
        quizType === 'initial' &&
        limitInput.trim() !== '' &&
        parsedLimit !== undefined &&
        (Number.isNaN(parsedLimit) ||
            !Number.isInteger(parsedLimit) ||
            parsedLimit < 1 ||
            (maxQuestions !== undefined && parsedLimit > maxQuestions));

    const [shuffle, setShuffle] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setName(defaultName);
            setDescription(defaultDescription);
            setLimitInput('');
            setShuffle(true);
        }
    }, [isOpen, defaultName, defaultDescription]);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        if (isLimitInvalid) return;
        try {
            setGlobalLoading?.(true);
            const initialConfig =
                quizType === 'initial'
                    ? {
                          shuffle,
                          limit: parsedLimit ?? maxQuestions,
                      }
                    : undefined;
            await onSubmit({ name: name.trim(), description: description?.trim(), initialConfig });
        } finally {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Quiz — Type: {quizType}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Quiz name" />
                    {quizType === 'initial' && (
                        <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                            <div className="text-sm font-medium">Initial quiz options</div>

                            {/* limit */}
                            <div className="space-y-1">
                                <label className="text-sm text-muted-foreground">Number of questions</label>

                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={limitInput}
                                    placeholder={
                                        maxQuestions ? `Max ${maxQuestions} questions` : 'Enter number of questions'
                                    }
                                    onChange={(e) => setLimitInput(e.target.value)}
                                />

                                {isLimitInvalid && (
                                    <p className="text-sm text-red-500">
                                        {Number.isNaN(parsedLimit)
                                            ? 'Please enter a valid number'
                                            : `Limit must be between 1 and ${maxQuestions}`}
                                    </p>
                                )}
                            </div>

                            {/* shuffle */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="shuffle"
                                    type="checkbox"
                                    checked={shuffle}
                                    onChange={(e) => setShuffle(e.target.checked)}
                                />
                                <label htmlFor="shuffle" className="text-sm text-muted-foreground cursor-pointer">
                                    Shuffle questions
                                </label>
                            </div>
                        </div>
                    )}

                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                    />
                </div>

                <DialogFooter className="mt-4">
                    <Button onClick={handleSubmit} disabled={!name.trim() || isLimitInvalid}>
                        Save Quiz
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateQuizModal;
