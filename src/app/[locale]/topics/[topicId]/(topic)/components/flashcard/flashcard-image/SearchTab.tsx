import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckedState } from '@radix-ui/react-checkbox';
import { Loader2, Search } from 'lucide-react';
import React, { ChangeEventHandler, useEffect, useState } from 'react';
import { ILocalFlashcard } from '../edit/EditingFlashcards';
import { cn } from '@/lib/utils';
import EditImage from './EditImage';
import usePost from '@/hooks/usePost';
import flashcardService from '@/services/flashcard/flashcard.service';
import toastHelper from '@/utils/toast.helper';
import { IUnspashImage } from '@/app/[locale]/flashcards/types/flashcard.type';
import { useTranslations } from 'next-intl';

interface QueryItemProps {
    title: string;
    query: string;
    onQueryChange: ChangeEventHandler<HTMLTextAreaElement> | undefined;
    checked?: boolean;
    onCheckedChange?(checked: CheckedState): void;
}

function QueryItem({ title, query, onQueryChange, checked, onCheckedChange }: QueryItemProps) {
    const id = title.toLowerCase().replace(/\s+/g, '-');

    return (
        <div
            className={cn(
                'flex flex-col space-y-3 rounded-lg border p-4 shadow-sm transition-all duration-200',
                !checked ? 'opacity-50 bg-muted/30' : 'bg-card opacity-100 ring-1 ring-primary/20',
            )}
        >
            <div className="flex items-center justify-between">
                <Label htmlFor={`${id}-content`} className="font-semibold text-muted-foreground cursor-pointer">
                    {title}
                </Label>
                <div className="flex items-center space-x-2">
                    <Checkbox id={`${id}-checkbox`} checked={checked} onCheckedChange={onCheckedChange} />
                </div>
            </div>
            <Textarea
                id={`${id}-content`}
                className="resize-none min-h-[100px] text-base bg-background"
                value={query}
                onChange={onQueryChange}
            />
        </div>
    );
}

type IQueryType = 'front' | 'back';

interface Props {
    flashcard: ILocalFlashcard;
    onSaveImageClick: (params: { flashcard: ILocalFlashcard; image: IUnspashImage }) => void;
}

export default function SearchTab({ flashcard, onSaveImageClick }: Props) {
    const tCommon = useTranslations('common');
    const [frontQuery, setFrontQuery] = useState<string>('');
    const [backQuery, setBackQuery] = useState<string>('');
    const [queryType, setQueryType] = useState<IQueryType>('front');

    useEffect(() => {
        setFrontQuery(flashcard.front);
        setBackQuery(flashcard.back);
    }, [flashcard]);

    function onFrontQueryCheckedChange(checked: CheckedState) {
        if (checked === 'indeterminate') return;
        setQueryType('front');
    }

    function onBackQueryCheckedChange(checked: CheckedState) {
        if (checked === 'indeterminate') return;
        setQueryType('back');
    }

    const [searchedImages, setSearchedImages] = useState<IUnspashImage[] | null>(null);

    const { loading: searchImagesLoading, execute: searchImagesAsync } = usePost<string, IUnspashImage[]>(
        flashcardService.searchImages,
        'POST',
        {
            onError(error) {
                toastHelper.showErrorMessage(error);
            },
            onSuccess(data) {
                setSearchedImages(data);
            },
        },
    );

    async function onSearchClick() {
        const content = queryType === 'front' ? frontQuery : backQuery;
        if (!content) {
            toastHelper.showErrorMessage(tCommon('validation.required', { name: tCommon('labels.content') }));
            return;
        }
        await searchImagesAsync(content);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col">
                <Button
                    className="flex flex-row gap-2 self-end"
                    variant="outline"
                    onClick={onSearchClick}
                    disabled={searchImagesLoading}
                >
                    {searchImagesLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <Search />
                            Search
                        </>
                    )}
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <QueryItem
                    title="Term"
                    query={frontQuery}
                    onQueryChange={(e) => setFrontQuery(e.target.value)}
                    checked={queryType === 'front'}
                    onCheckedChange={onFrontQueryCheckedChange}
                />

                <QueryItem
                    title="Definition"
                    query={backQuery}
                    onQueryChange={(e) => setBackQuery(e.target.value)}
                    checked={queryType === 'back'}
                    onCheckedChange={onBackQueryCheckedChange}
                />
            </div>

            {searchedImages ? (
                <EditImage
                    images={searchedImages}
                    handleSaveClick={(image) => onSaveImageClick({ flashcard, image })}
                />
            ) : null}
        </div>
    );
}
