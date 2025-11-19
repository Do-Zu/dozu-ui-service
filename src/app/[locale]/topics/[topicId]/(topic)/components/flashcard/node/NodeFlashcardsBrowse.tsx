import { IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';
import useFetch from '@/hooks/useFetch';
import { cn } from '@/lib/utils';
import flashcardService from '@/services/flashcard/flashcard.service';
import { useCallback, useEffect, useState } from 'react';
import Flashcard from '../Flashcard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import DataStatus from '@/components/errors/DataStatus';
import LoadingPage from '@/app/loading';
import mindmapService from '../../../service/mindmap.service';
import { INodeFlashcards } from '@/types/mindmap/mindmap.type';
import { useRequireFlashcards } from '../../../context/useRequireFlashcardContent';

interface Props {
    nodeId: string;
    onClose: () => void;
}

export default function NodeFlashcardsBrowse({ nodeId, onClose }: Props) {
    const { flashcards } = useRequireFlashcards();
    const [nodeFlashcards, setNodeFlashcards] = useState<IFlashcard[] | null>(null);
    useEffect(() => {
        setNodeFlashcards(flashcards.filter((card) => card.nodeId === nodeId));
    }, [nodeId, flashcards]);

    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
    const currentFlashcard = nodeFlashcards && nodeFlashcards.length > 0 ? nodeFlashcards[currentFlashcardIndex] : null;

    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const { key } = event;
            if (key === 'ArrowLeft') handleBackFlashcardClick();
            else if (key === 'ArrowRight') handleNextFlashcardClick();
            else if (key === 'ArrowUp' || key === 'ArrowDown' || key === ' ') {
                flipWithAnimation();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [nodeFlashcards, currentFlashcardIndex]);

    function setFlipInstantly(isFlipped: boolean) {
        setIsAnimating(false);
        setIsFlipped(isFlipped);
    }

    function handleBackFlashcardClick() {
        setFlipInstantly(false);
        if (currentFlashcardIndex > 0) setCurrentFlashcardIndex((prevIndex) => prevIndex - 1);
    }

    function handleNextFlashcardClick() {
        if (!nodeFlashcards) return;
        setFlipInstantly(false);
        if (currentFlashcardIndex < nodeFlashcards.length - 1) setCurrentFlashcardIndex((prevIndex) => prevIndex + 1);
    }

    function flipWithAnimation() {
        setIsAnimating(true);
        setIsFlipped((prev) => !prev);
    }

    if (!nodeFlashcards) {
        return <DataStatus variant="error" />;
    }

    if (nodeFlashcards.length === 0 || !currentFlashcard) {
        return <DataStatus variant="empty" />;
    }

    return (
        <div className="flex bg-gray-background w-full h-full">
            <div className="relative flex-1 p-5 overflow-hidden">
                {/* Main Flashcard Section */}
                <div
                    className={cn(
                        'relative bg-gray-100 dark:bg-gray-850 flex flex-col h-full items-center justify-center rounded-lg',
                        'transform-all duration-300 ease-in-out',
                        'w-full',
                    )}
                >
                    <div className="w-full flex justify-end px-4">
                        <Button className="hover:bg-background" size="icon" variant="ghost" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <Flashcard
                        front={currentFlashcard.front}
                        back={currentFlashcard.back}
                        imageUrl={currentFlashcard.imageUrl}
                        isFlipped={isFlipped}
                        isAnimating={isAnimating}
                        onClick={flipWithAnimation}
                        className="mt-2"
                    />

                    <div className="grid grid-cols-3 mt-4 gap-4">
                        <div className="col-start-2 col-end-3 flex flex-row gap-4 items-center">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-full"
                                onClick={handleBackFlashcardClick}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>

                            <div className="text-base">
                                {currentFlashcardIndex + 1} / {nodeFlashcards.length}{' '}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-full"
                                onClick={handleNextFlashcardClick}
                            >
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
