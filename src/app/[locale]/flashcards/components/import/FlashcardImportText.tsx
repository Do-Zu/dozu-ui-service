import { ChangeEvent, useEffect, useState } from 'react';
import FlashcardsPreview, { IFlashcardPreview } from './FlashcardPreview';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import flashcardContentConverter from '@/utils/import/flashcardContentConverter';
import toastHelper from '@/utils/toast.helper';

export default function FlashcardImportText({
    flashcards,
    setFlashcards,
    onSubmit,
}: {
    flashcards: IFlashcardPreview[];
    setFlashcards: (data: IFlashcardPreview[]) => void;
    onSubmit: (flashcards: IFlashcardPreview[]) => void;
}) {
    const [content, setContent] = useState<string>('');
    const [sideDivider, setSideDivider] = useState<string>(':');
    const [cardDivider, setCardDivider] = useState<string>('\n');

    useEffect(() => {
        setFlashcards(flashcardContentConverter.convertTextToFlashcards(content, sideDivider, cardDivider));
    }, [content, sideDivider, cardDivider]);

    function handleCardDividerChange(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.value === '\\n') {
            setCardDivider('\n');
        } else {
            setCardDivider(event.target.value);
        }
    }

    function handleSubmit() {
        onSubmit(flashcards);
        setContent('');
        toastHelper.showSuccessMessage('Add Flashcards from Text successfully');
    }

    return (
        <div className="flex flex-col gap-4">
            <Textarea
                placeholder={`Term 1: Definition 1\nTerm 2: Definition 2\n...`}
                rows={10}
                value={content}
                onChange={(event) => setContent(event.target.value)}
            />

            <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center gap-4">
                    <Label className="whitespace-nowrap">Between Term and Definition</Label>
                    <Input className="w-[10%]" value={sideDivider} onChange={(e) => setSideDivider(e.target.value)} />
                </div>

                <div className="flex flex-row items-center gap-4">
                    <Label className="whitespace-nowrap">Between Cards</Label>
                    <Input
                        className="w-[10%]"
                        value={cardDivider === '\n' ? '\\n' : cardDivider}
                        onChange={handleCardDividerChange}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div>Preview</div>
                <FlashcardsPreview flashcards={flashcards} />
            </div>

            <div>
                <Button onClick={handleSubmit}>Save</Button>
            </div>
        </div>
    );
}
