import { IDueAnkiCard, IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';
import { FlashcardLearningMode } from '../components/flashcard/FlashcardContent';
import { IFlashcardCounts } from '../../../types/topic.type';
import { IAnkiStatus } from '@/types/anki';
class FlashcardUtils {
    private getRandomInt(max: number) {
        return Math.floor(Math.random() * (max + 1));
    }

    private getRandomArray(num: number) {
        const result = [];
        const check = Array(num).fill(false);

        for (let i = 0; i < num; ) {
            const rand = this.getRandomInt(num - 1);
            if (check[rand]) continue;
            check[rand] = true;
            result.push(rand);
            ++i;
        }
        return result;
    }

    public getFlashcardsShuffled(flashcards: IFlashcard[]): IFlashcard[] {
        const flashcardsRandom = [];
        const arrayRandom = this.getRandomArray(flashcards.length);
        for (const indexRandom of arrayRandom) {
            flashcardsRandom.push(flashcards[indexRandom]);
        }
        return flashcardsRandom;
    }

    public getDisplayModeName(mode: FlashcardLearningMode): string {
        return mode.charAt(0).toUpperCase() + mode.slice(1);
    }

    public recalculateFlashcardCounts({
        flashcards,
        learningFlashcards,
    }: {
        flashcards: IFlashcard[];
        learningFlashcards: IDueAnkiCard[];
    }): IFlashcardCounts {
        const updatedFlashcardCounts: IFlashcardCounts = {
            [IAnkiStatus.NEW]: 0,
            [IAnkiStatus.LEARNING]: 0,
            [IAnkiStatus.REVIEW]: 0,
            total: flashcards.length,
        };
        for (const card of learningFlashcards) {
            const newStatus = card.status === IAnkiStatus.RELEARNING ? IAnkiStatus.LEARNING : card.status;
            updatedFlashcardCounts[newStatus]++;
        }
        return updatedFlashcardCounts;
    }
}

export default new FlashcardUtils();
