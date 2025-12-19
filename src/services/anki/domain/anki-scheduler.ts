import { IAnkiCard, IAnkiResult } from '@/app/[locale]/flashcards/types/flashcard.type';
import { IAnkiRating } from '@/types/anki';

/* 
    Anki scheduler Interface
*/
export default interface AnkiScheduler {
    /**
     *
     * @param card an AnkiCard instance
     * @param rating a rating that user clicks to rate the anki card's difficulty
     */
    schedule(card: IAnkiCard, rating: IAnkiRating): IAnkiResult;
}
