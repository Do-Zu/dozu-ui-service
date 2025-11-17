import { useTranslations } from 'next-intl';

export default function FlashcardsEmptyState() {
    const tFlashcardLearning = useTranslations('flashcard.learning');

    return (
        <div className="flex flex-col p-8">
            <div className="flex flex-col gap-4">
                <p>{tFlashcardLearning('flashcardsEmpty')}</p>
            </div>
        </div>
    );
}
