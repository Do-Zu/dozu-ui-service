import {
    IBatchFlashcardsInTopicData,
    IFlashcard,
    InsertFlashcardsBody,
    IUpdateFlashcardsBody,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import { IEditingFlashcard } from '../../components/flashcard/edit/FlashcardsEdit';

class FlashcardEditUtils {
    public isFlashcardEditing(originalFlashcards: IFlashcard[], flashcard: IEditingFlashcard) {
        if (!flashcard.serverInfo) return false;
        const originalFlashcard = originalFlashcards.find(
            (card) => card.flashcardId === flashcard.serverInfo?.flashcardId,
        );

        if (!originalFlashcard) return false;
        return (
            flashcard.front !== originalFlashcard.front ||
            flashcard.back !== originalFlashcard.back ||
            flashcard.image !== undefined
        );
    }

    public isFlashcardNew(flashcard: IEditingFlashcard) {
        return flashcard.serverInfo === undefined;
    }

    public isFlashcardDeleted(flashcard: IEditingFlashcard) {
        return flashcard.serverInfo?.isDeleted === true;
    }

    public prepareFlashcardsForSubmit(flashcards: IEditingFlashcard[]): IBatchFlashcardsInTopicData | null {
        const normalized = this.normalizeFlashcards(flashcards);

        const createInputs = this.extractCreateInputs(normalized);
        const updateInputs = this.extractUpdateInputs(normalized);
        const deleteIds = this.extractDeleteIds(normalized);

        if (createInputs.length === 0 && updateInputs.length === 0 && deleteIds.length === 0) {
            return null;
        }

        return { createInputs, updateInputs, deleteIds };
    }

    private normalizeFlashcards(flashcards: IEditingFlashcard[]) {
        return flashcards.map((f) => ({
            ...f,
            front: f.front.trim(),
            back: f.back.trim(),
        }));
    }

    private extractCreateInputs(flashcards: IEditingFlashcard[]): InsertFlashcardsBody {
        return flashcards
            .filter((f) => !f.serverInfo && (f.front !== '' || f.back !== ''))
            .map((f) => ({
                front: f.front,
                back: f.back,
                // nodeId: f.nodeId,
                image: f.image ?? undefined,
            }));
    }

    private extractUpdateInputs(flashcards: IEditingFlashcard[]): IUpdateFlashcardsBody {
        return flashcards
            .filter(
                (f) =>
                    f.serverInfo &&
                    f.serverInfo.isUpdated &&
                    !f.serverInfo.isDeleted &&
                    (f.front !== '' || f.back !== ''),
            )
            .map((f) => ({
                flashcardId: f.serverInfo!.flashcardId,
                front: f.front,
                back: f.back,
                // nodeId: f.nodeId
                image: f.image ?? undefined,
            }));
    }

    private extractDeleteIds(flashcards: IEditingFlashcard[]): number[] {
        return flashcards
            .filter(
                (f) =>
                    f.serverInfo &&
                    (f.serverInfo.isDeleted || (f.serverInfo.isUpdated && f.front === '' && f.back === '')),
            )
            .map((f) => f.serverInfo!.flashcardId);
    }
}

export default new FlashcardEditUtils();
