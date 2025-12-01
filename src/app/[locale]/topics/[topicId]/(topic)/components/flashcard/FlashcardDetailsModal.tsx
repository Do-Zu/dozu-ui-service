import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Modal } from '@/components/modal/Modal';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { ILocalFlashcard } from './edit/EditingFlashcards';

interface Props {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    flashcard: ILocalFlashcard;
}

export default function FlashcardDetailsModal({ isOpen, setIsOpen, flashcard }: Props) {
    const { front, back, imageUrl, image } = flashcard;
    const currentImage = useMemo(() => {
        if (image?.type === 'unsplash') return image.data.url;
        if (image?.type === 'upload') return image.data;
        return imageUrl;
    }, [imageUrl, image]);

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Flashcard Details"
            body={
                <div className="flex flex-col space-y-4 max-h-[80vh] w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="inline-block rounded-lg overflow-hidden border max-w-full">
                                {currentImage ? (
                                    <img
                                        src={currentImage}
                                        alt="Flashcard image detail"
                                        className="max-w-full h-auto"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center bg-muted text-muted-foreground w-48 h-32">
                                        No image yet
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    <Card>
                        <CardHeader className="px-3 py-2">
                            <CardTitle className="text-lg font-semibold">Term</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[150px] w-full rounded-b-lg border-t p-4 bg-secondary/5">
                                <p className="whitespace-pre-wrap leading-relaxed text-base text-foreground">{front}</p>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Separator />

                    <Card>
                        <CardHeader className="px-3 py-2">
                            <CardTitle className="text-lg font-semibold">Definition</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[150px] w-full rounded-b-lg border-t p-4 bg-secondary/5">
                                <p className="whitespace-pre-wrap leading-relaxed text-base text-foreground">{back}</p>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            }
            contentStyle="top-[10%] left-[50%] max-w-[50vw] -translate-x-1/2 -translate-y-0"
        />
    );
}
