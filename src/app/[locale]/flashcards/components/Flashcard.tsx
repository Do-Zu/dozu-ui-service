import React from 'react';
import { IFlashcard } from '../types/flashcard.type';
import { ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Props {
    style?: string;
    handleManualFlip?: Function;
    cardContainerRef: React.RefObject<HTMLDivElement>;
    cardRef: React.RefObject<HTMLDivElement>;
    flashcard: Pick<IFlashcard, 'front' | 'back' | 'imageUrl'>;

    handleAddImageClick?: (front: string) => void;
}

export default function Flashcard(props: Props) {
    const { style, handleManualFlip = () => {}, cardContainerRef, cardRef, flashcard, handleAddImageClick } = props;
    return (
        <div className={style} onClick={() => handleManualFlip()} ref={cardContainerRef}>
            <div
                className="relative w-full h-full bg-white dark:bg-gray-700 rounded-md"
                style={{ transformStyle: 'preserve-3d' }}
                ref={cardRef}
            >
                <div
                    className="absolute w-full h-full rounded-lg flex justify-center items-center text-2xl font-normal p-5"
                    style={{ transform: 'rotateX(0deg)', backfaceVisibility: 'hidden' }}
                >
                    {flashcard.front}
                </div>

                <div
                    className={`absolute w-full h-full rounded-lg flex flex-col gap-2 items-center text-2xl font-normal p-5 ${flashcard.imageUrl ? 'justify-start' : 'justify-center'}`}
                    style={{ transform: 'rotateX(180deg)', backfaceVisibility: 'hidden' }}
                >
                    {flashcard.imageUrl ? (
                        <Image
                            src={flashcard.imageUrl}
                            alt="Flashcard image"
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-full h-[80%] object-contain"
                        />
                    ) : null}
                    <div>{flashcard.back}</div>
                </div>
            </div>

            <Button
                className="absolute bottom-2 right-2 text-sm"
                variant="ghost"
                onClick={() => handleAddImageClick?.(flashcard.front)}
            >
                <ImagePlus />
            </Button>
        </div>
    );
}
