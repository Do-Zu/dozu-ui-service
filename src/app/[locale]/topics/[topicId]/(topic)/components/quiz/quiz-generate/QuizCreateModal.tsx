'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CreateQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (quizData: { name: string; description?: string }) => void;
    quizType: string;
    defaultName?: string;
    defaultDescription?: string;
    setGlobalLoading?: (loading: boolean) => void;
}

const CreateQuizModal = ({
    isOpen,
    onClose,
    onSubmit,
    quizType,
    defaultName = '',
    defaultDescription = '',
    setGlobalLoading,
}: CreateQuizModalProps) => {
    const [name, setName] = useState(defaultName);
    const [description, setDescription] = useState(defaultDescription);

    useEffect(() => {
        if (isOpen) {
            setName(defaultName);
            setDescription(defaultDescription);
        }
    }, [isOpen, defaultName, defaultDescription]);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        try {
            setGlobalLoading?.(true);
            await onSubmit({ name: name.trim(), description: description?.trim() });
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
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                    />
                </div>

                <DialogFooter className="mt-4">
                    <Button onClick={handleSubmit} disabled={!name.trim()}>
                         Save Quiz
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateQuizModal;
