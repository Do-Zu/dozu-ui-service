import {
    IAnkiCardStatusCounts,
    IDueAnkiCard,
    IFlashcard,
    IFlashcardCreateInput,
    IFlashcardsBatchInput,
    IFlashcardUpdateInput,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import { FlashcardTab } from '../components/flashcard/FlashcardContent';
import { IFlashcardCounts } from '../../../types/topic.type';
import { IAnkiStatus } from '@/types/anki';
import { IEditingFlashcard, ILocalFlashcard } from '../components/flashcard/edit/FlashcardsEdit';

export const initialFlashcardsCount = 3;
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

    public getDisplayModeName(tab: FlashcardTab): string {
        return tab.charAt(0).toUpperCase() + tab.slice(1);
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

    public getAnkiStatusCounts(learningFlashcards: IDueAnkiCard[]): IAnkiCardStatusCounts {
        const result: IAnkiCardStatusCounts = {
            [IAnkiStatus.NEW]: 0,
            [IAnkiStatus.LEARNING]: 0,
            [IAnkiStatus.REVIEW]: 0,
        };
        for (const card of learningFlashcards) {
            const newStatus = card.status === IAnkiStatus.RELEARNING ? IAnkiStatus.LEARNING : card.status;
            result[newStatus]++;
        }
        return result;
    }

    public createInitialFlashcard(id: number): ILocalFlashcard {
        return { id, front: '', back: '' };
    }

    public getFlashcardType(flashcard: IEditingFlashcard): 'client' | 'server' {
        return flashcard.serverInfo ? 'server' : 'client';
    }

    public createInitialFlashcards(count: number): ILocalFlashcard[] {
        const initialFlashcards: ILocalFlashcard[] = [];
        for (let i = 0; i < count; ++i) {
            initialFlashcards.push(this.createInitialFlashcard(i));
        }
        return initialFlashcards;
    }

    public convertToEditingFlashcards(flashcards: IFlashcard[]): IEditingFlashcard[] {
        const initialFlashcards: IEditingFlashcard[] = flashcards.map((flashcard, index) => {
            return {
                id: index,
                front: flashcard.front,
                back: flashcard.back,
                imageUrl: flashcard.imageUrl,
                serverInfo: {
                    flashcardId: flashcard.flashcardId,
                    topicId: flashcard.topicId,
                    isUpdated: false,
                    isDeleted: false,
                },
            };
        });
        return initialFlashcards;
    }

    public isInitialFlashcards(flashcards: IEditingFlashcard[]) {
        return flashcards.find((card) => card.front !== '' || card.back !== '') === undefined;
    }
}

export default new FlashcardUtils();
