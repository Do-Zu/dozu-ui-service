'use client';

import { useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { IResponseFlashCardGenerate } from '../../../hooks/useFlashCardWorkSpace';
import { createObjectExtractor, normalizeAndExtract } from '@/hooks/generate/normalizeStreamByStructure';
import { Label } from '@radix-ui/react-label';
import { useTranslations } from 'next-intl';
import { flashcardItemGap, flashcardItemHeight } from '../edit/FlashcardsEdit';

const FlashcardStreamPreview = ({ raw }: { raw: string }) => {
    const tFlashcardCommon = useTranslations('flashcard.common');
    const listRef = useRef<HTMLDivElement | null>(null);

    const result = normalizeAndExtract<IResponseFlashCardGenerate>(
        raw,
        createObjectExtractor<IResponseFlashCardGenerate>(['q', 'a']),
    );

    const flashcardItems = result.items;

    useEffect(() => {
        const lastItem = listRef.current?.lastElementChild as HTMLElement | null;
        lastItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [flashcardItems.length]);

    return (
        <div className="w-full rounded-md bg-background px-4 py-3 text-sm shadow-sm">
            <div className="bg-background px-16 py-7">
                <div ref={listRef} className="mt-7 flex flex-col bg-background">
                    {flashcardItems &&
                        flashcardItems?.map((flashcard, index) => (
                            <div
                                key={`flashcard-prev-${index}`}
                                className="flex flex-col rounded-xl border bg-muted/60 p-6 text-card-foreground shadow-sm dark:bg-muted/40"
                                style={{ height: flashcardItemHeight, marginBottom: flashcardItemGap }}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-baseline gap-2">
                                        <span className="select-none text-xl font-bold text-muted-foreground">
                                            {index + 1}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={`front-${index}`} className="font-semibold">
                                            {tFlashcardCommon('front')}
                                        </Label>
                                        <Textarea
                                            id={`front-${index}`}
                                            placeholder={tFlashcardCommon('front')}
                                            className="
                                                min-h-[70px] resize-none
                                                rounded-lg border
                                                border-border bg-input
                                                text-card-foreground placeholder:text-muted-foreground/60
                                                focus-visible:ring-1
                                                focus-visible:ring-primary/60
                                                dark:bg-muted
                                        "
                                            value={flashcard.q}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={`back-${index}`} className="font-semibold">
                                            {tFlashcardCommon('back')}
                                        </Label>
                                        <Textarea
                                            id={`back-${index}`}
                                            placeholder={tFlashcardCommon('back')}
                                            className="
                                                min-h-[70px] resize-none
                                                rounded-lg border
                                                border-border bg-input
                                                text-card-foreground placeholder:text-muted-foreground/60
                                                focus-visible:ring-1
                                                focus-visible:ring-primary/60
                                                dark:bg-muted
                                        "
                                            value={flashcard.a}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default FlashcardStreamPreview;
