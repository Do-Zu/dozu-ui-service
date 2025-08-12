import React from 'react';
import { IFlashcard } from '../types/flashcard.type';

interface Props {
    style?: string;
    handleManualFlip?: Function;
    cardContainerRef: React.RefObject<HTMLDivElement>;
    cardRef: React.RefObject<HTMLDivElement>;
    flashcard: Pick<IFlashcard, 'front' | 'back'>;
}

export default function Flashcard(props: Props) {
    const { style, handleManualFlip = () => {}, cardContainerRef, cardRef, flashcard } = props;
    return (
        <div className={style} onClick={() => handleManualFlip()} ref={cardContainerRef}>
            <div
                className="relative w-full h-full bg-white dark:bg-gray-800"
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
                    className="absolute w-full h-full rounded-lg flex justify-center items-center text-2xl font-normal p-5"
                    style={{ transform: 'rotateX(180deg)', backfaceVisibility: 'hidden' }}
                >
                    {flashcard.back}
                </div>
            </div>
        </div>
    );
}
