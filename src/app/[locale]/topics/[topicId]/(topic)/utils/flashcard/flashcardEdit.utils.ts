import { IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';
import { IEditingFlashcard } from '../../components/flashcard/edit/FlashcardsEdit';

class FlashcardEditUtils {
    public isFlashcardEditing(originalFlashcards: IFlashcard[], flashcard: IEditingFlashcard) {
        if (!flashcard.serverInfo) return false;
        const originalFlashcard = originalFlashcards.find(
            (card) => card.flashcardId === flashcard.serverInfo?.flashcardId,
        );

        if (!originalFlashcard) return false;
        return flashcard.front !== originalFlashcard.front || flashcard.back !== originalFlashcard.back;
    }

    public isFlashcardNew(flashcard: IEditingFlashcard) {
        return flashcard.serverInfo === undefined;
    }

    public isFlashcardDeleted(flashcard: IEditingFlashcard) {
        return flashcard.serverInfo?.isDeleted === true;
    }
}

export default new FlashcardEditUtils();
