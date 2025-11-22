import { useTranslations } from 'next-intl';
import Generate from '../../generate/Generate';

export default function FlashcardsEmptyState() {
    const tFlashcardLearning = useTranslations('flashcard.learning');

    return (
        <div className="flex flex-col">
            <Generate type="flashcard" />
        </div>
    );
}
