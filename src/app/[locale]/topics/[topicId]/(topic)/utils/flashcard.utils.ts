import { IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';

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
}

export default new FlashcardUtils();
