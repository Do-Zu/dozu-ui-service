import { ChangeEvent, useState } from 'react';
import { IFlashcardPreview } from './FlashcardPreview';
import Papa from 'papaparse';
import toastHelper from '@/utils/toast.helper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FlashcardsPreview from './FlashcardPreview';

export default function FlashcardImportCsv({
    flashcards,
    setFlashcards,
    onSubmit,
}: {
    flashcards: IFlashcardPreview[];
    setFlashcards: (data: IFlashcardPreview[]) => void;
    onSubmit: (flashcards: IFlashcardPreview[]) => void;
}) {
    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];

            Papa.parse(file, {
                header: false,
                skipEmptyLines: true,
                complete(results, file) {
                    const flashcardsImported: IFlashcardPreview[] = [];
                    const { data } = results;
                    for (const line of data) {
                        if (Array.isArray(line) && line.every((cell) => typeof cell === 'string')) {
                            if (line.length < 2) {
                                toastHelper.showErrorMessage('Invalid CSV file, please provide term and definition');
                                break;
                            } else {
                                if (line[0] !== '' || line[1] !== '')
                                    flashcardsImported.push({ front: line[0], back: line[1] });
                            }
                        } else {
                            toastHelper.showErrorMessage('Invalid CSV file, please import again');
                            break;
                        }
                    }
                    setFlashcards(flashcardsImported);
                },
            });
        }
    }

    function handleSubmit() {
        onSubmit(flashcards);
        toastHelper.showSuccessMessage('Add Flashcards from CSV successfully');
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Input type="file" accept=".csv" onChange={handleFileChange} />
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
