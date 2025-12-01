import { Modal } from '@/components/modal/Modal';
import { Dispatch, SetStateAction, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ILocalFlashcard } from '../edit/EditingFlashcards';
import SearchTab from './SearchTab';
import { IUnspashImage } from '@/app/[locale]/flashcards/types/flashcard.type';
import UploadTab from './UploadTab';

interface Props {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    flashcard: ILocalFlashcard;
    onSaveImageClick: (params: { flashcard: ILocalFlashcard; image: IUnspashImage }) => void;
    onUploadImageSuccess: (params: { flashcard: ILocalFlashcard; imageUrl: string }) => void;
}

type IAddImageMethod = 'upload' | 'search';

export default function EditImageModal({
    isOpen,
    setIsOpen,
    flashcard,
    onSaveImageClick,
    onUploadImageSuccess,
}: Props) {
    const [addImageMethod, setAddImageMethod] = useState<IAddImageMethod>('search');

    function handleUploadImageSuccess(imageUrl: string) {
        onUploadImageSuccess({ flashcard, imageUrl });
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Add your own image to a flashcard"
            body={
                <Tabs
                    defaultValue="search"
                    value={addImageMethod}
                    onValueChange={(value) => {
                        setAddImageMethod(value as IAddImageMethod);
                    }}
                >
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="search" className="flex items-center gap-2">
                            <span>Fast search</span>
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                            <span>Upload</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="mt-6">
                        <SearchTab flashcard={flashcard} onSaveImageClick={onSaveImageClick} />
                    </TabsContent>

                    <TabsContent value="upload" className="mt-4">
                        <UploadTab onUploadSuccess={handleUploadImageSuccess} />
                    </TabsContent>
                </Tabs>
            }
            contentStyle="top-[10%] left-[50%] max-w-[80vw] -translate-x-1/2 -translate-y-0"
        />
    );
}
