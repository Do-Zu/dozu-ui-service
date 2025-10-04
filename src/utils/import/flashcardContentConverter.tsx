import { IFlashcardPreview } from "@/app/[locale]/flashcards/components/import/FlashcardPreview";

class FlashcardContentConverter {
    public convertTextToFlashcards(text: string, sideDivider: string, cardDivider: string): IFlashcardPreview[] {
        const cards = text.split(cardDivider);
        const result = cards
            .filter((card) => card !== null && card !== undefined && card.length > 0)
            .map((card) => {
                const tokenIndex = card.indexOf(sideDivider);
                if (tokenIndex === -1) return { front: card, back: '' };
                let front = card.substring(0, tokenIndex);
                let back = card.substring(tokenIndex + 1, card.length);
                return { front, back: back };
            });
        return result;
    }
}

export default new FlashcardContentConverter();