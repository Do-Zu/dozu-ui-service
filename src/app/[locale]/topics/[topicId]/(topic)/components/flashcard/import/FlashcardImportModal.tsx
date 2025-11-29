import { Modal } from '@/components/modal/Modal';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { IFlashcardPreview } from './FlashcardPreview';
import FlashcardImportText from './FlashcardImportText';
import FlashcardImportCsv from './FlashcardImportCsv';
import { useTranslations } from 'next-intl';

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onSubmit: (flashcards: IFlashcardPreview[]) => void;
}

export default function FlashcardImportModal({ isOpen, setIsOpen, onSubmit }: Props) {
    const tFlashcardImport = useTranslations('flashcard.import');
    const [importMethod, setImportMethod] = useState<string>('text');
    const [flashcards, setFlashcards] = useState<IFlashcardPreview[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setFlashcards([]);
        }
    }, [isOpen]);

    function handleSubmit(flashcards: IFlashcardPreview[]) {
        onSubmit(flashcards);
        setFlashcards([]);
        setIsOpen(false);
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={tFlashcardImport('title')}
            body={
                <Tabs
                    defaultValue="text"
                    value={importMethod}
                    onValueChange={(value) => {
                        setImportMethod(value);
                    }}
                >
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="text" className="flex items-center gap-2">
                            <span>Text</span>
                        </TabsTrigger>
                        <TabsTrigger value="file" className="flex items-center gap-2">
                            <span>File</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="mt-4">
                        <FlashcardImportText
                            flashcards={flashcards}
                            setFlashcards={setFlashcards}
                            onSubmit={handleSubmit}
                        />
                    </TabsContent>

                    <TabsContent value="file" className="mt-4">
                        <FlashcardImportCsv
                            flashcards={flashcards}
                            setFlashcards={setFlashcards}
                            onSubmit={handleSubmit}
                        />
                    </TabsContent>
                </Tabs>
            }
            contentStyle="top-[10%] left-[50%] max-w-[80vw] -translate-x-1/2 -translate-y-0"
        />
    );
}
