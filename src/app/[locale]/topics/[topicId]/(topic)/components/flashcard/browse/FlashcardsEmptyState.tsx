import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import Generate from '../../generate/Generate';

export default function FlashcardsEmptyState() {
    const tFlashcardLearning = useTranslations('flashcard.learning');

    function handleGenerateClick() {
        // TODO: Logic generate flashcards
        console.log('Generate flashcards clicked');
    }

    function onGenerateSuccess(data: any) {
        console.log({ data });
    }

    return (
        <div className="flex flex-col p-8">
            <div className="flex flex-col gap-4">
                <p>{tFlashcardLearning('flashcardsEmpty')}</p>
                <Generate type="flashcards" onSuccess={onGenerateSuccess} />
            </div>
        </div>
    );
}
