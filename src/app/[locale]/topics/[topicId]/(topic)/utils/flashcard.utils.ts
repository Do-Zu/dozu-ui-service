import {
    IAnkiCardStatusCounts,
    IDueAnkiCard,
    IFlashcard,
    IFlashcardCreateInput,
    IFlashcardsBatchInput,
    IFlashcardUpdateInput,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import { FlashcardLearningMode } from '../components/flashcard/FlashcardContent';
import { IFlashcardCounts } from '../../../types/topic.type';
import { IAnkiStatus } from '@/types/anki';
import { IEditingFlashcard, ILocalFlashcard } from '../components/flashcard/edit/EditingFlashcards';

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

    public prepareFlashcardsForSubmit(flashcards: IEditingFlashcard[]): IFlashcardsBatchInput | null {
        if (!flashcards) return null;

        let flashcardsFormatted = flashcards.map((flashcard) => {
            return {
                ...flashcard,
                front: flashcard.front.trim(),
                back: flashcard.back.trim(),
            };
        });

        let flashcardsAdded: IFlashcardCreateInput[];
        let flashcardsUpdated: IFlashcardUpdateInput[];
        let flashcardsDeleted: number[];

        let flashcardsFilter;

        flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
            return !flashcard.serverInfo && (flashcard.front !== '' || flashcard.back !== '');
        });
        flashcardsAdded = flashcardsFilter.map((flashcard) => ({
            front: flashcard.front,
            back: flashcard.back,
            image: flashcard.image ? flashcard.image : undefined,
        }));

        flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
            return (
                flashcard.serverInfo &&
                flashcard.serverInfo.isUpdated &&
                !flashcard.serverInfo.isDeleted &&
                (flashcard.front !== '' || flashcard.back !== '')
            );
        });
        flashcardsUpdated = flashcardsFilter.map((flashcard) => ({
            flashcardId: flashcard.serverInfo!.flashcardId,
            front: flashcard.front,
            back: flashcard.back,
            image: flashcard.image ? flashcard.image : undefined,
        }));

        flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
            return (
                flashcard.serverInfo &&
                (flashcard.serverInfo.isDeleted ||
                    (flashcard.serverInfo.isUpdated && flashcard.front === '' && flashcard.back === ''))
            );
        });
        flashcardsDeleted = flashcardsFilter.map((flashcard) => flashcard.serverInfo!.flashcardId);

        if (
            (!flashcardsAdded || flashcardsAdded.length === 0) &&
            (!flashcardsUpdated || flashcardsUpdated.length === 0) &&
            (!flashcardsDeleted || flashcardsDeleted.length === 0)
        )
            return null;

        let dataSubmitted: IFlashcardsBatchInput = { flashcardsAdded, flashcardsUpdated, flashcardsDeleted };
        return dataSubmitted;
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
