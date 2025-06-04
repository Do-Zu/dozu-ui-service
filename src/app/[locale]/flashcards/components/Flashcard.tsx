import React from 'react';

export interface IFlashcard {
  flashcardId: number;
  topicId: number;
  front: string;
  back: string;
  status: string;
}

interface Props {
  style?: string;
  handleManualFlip?: Function;
  cardContainerRef: React.RefObject<HTMLDivElement>;
  cardRef: React.RefObject<HTMLDivElement>;
  flashcard: IFlashcard;
}

export default function Flashcard(props: Props) {
  const { style, handleManualFlip = () => {}, cardContainerRef, cardRef, flashcard } = props;
  return (
    <div className={style} onClick={() => handleManualFlip()} ref={cardContainerRef}>
      <div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        ref={cardRef}
      >
        <div
          className="absolute w-full h-full rounded-lg bg-white flex justify-center items-center text-[28px] font-normal p-5"
          style={{ transform: 'rotateX(0deg)', backfaceVisibility: 'hidden' }}
        >
          {flashcard.front}
        </div>

        <div
          className="absolute w-full h-full rounded-lg bg-white flex justify-center items-center text-[28px] font-normal p-5"
          style={{ transform: 'rotateX(180deg)', backfaceVisibility: 'hidden' }}
        >
          {flashcard.back}
        </div>
      </div>
    </div>
  );
}
