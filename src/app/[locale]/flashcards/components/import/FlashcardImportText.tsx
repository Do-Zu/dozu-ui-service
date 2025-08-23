import { ChangeEvent, useEffect, useState } from 'react';
import FlashcardsPreview, { IFlashcardPreview } from './FlashcardPreview';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import flashcardContentConverter from '@/utils/import/flashcardContentConverter';
import toastHelper from '@/utils/toast.helper';
import { useTranslations } from 'next-intl';

export default function FlashcardImportText({
    flashcards,
    setFlashcards,
    onSubmit,
}: {
    flashcards: IFlashcardPreview[];
    setFlashcards: (data: IFlashcardPreview[]) => void;
    onSubmit: (flashcards: IFlashcardPreview[]) => void;
}) {
    const tCommon = useTranslations('common');
    const tImportText = useTranslations('flashcard.import.importText');
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
        toastHelper.showSuccessMessage(tImportText('importSuccess'));
    }

    return (
        <div className="flex flex-col gap-4">
            <Textarea
                placeholder={tImportText('placeholder')}
                rows={10}
                value={content}
                onChange={(event) => setContent(event.target.value)}
            />

            <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center gap-4">
                    <Label className="whitespace-nowrap">{tImportText('sideDividerLabel')}</Label>
                    <Input className="w-[10%]" value={sideDivider} onChange={(e) => setSideDivider(e.target.value)} />
                </div>

                <div className="flex flex-row items-center gap-4">
                    <Label className="whitespace-nowrap">{tImportText('cardDividerLabel')}</Label>
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
                <Button onClick={handleSubmit}>{tCommon('actions.save')}</Button>
            </div>
        </div>
    );
}
