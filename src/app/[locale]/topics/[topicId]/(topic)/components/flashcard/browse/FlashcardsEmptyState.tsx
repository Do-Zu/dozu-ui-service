import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function FlashcardsEmptyState() {
    const tFlashcardLearning = useTranslations('flashcard.learning');
    const router = useRouter();

    function handleBackClick() {
        router.back();
    }

    function handleGenerateClick() {
        // TODO: Logic generate flashcards
        console.log('Generate flashcards clicked');
    }

    return (
        <div className="flex flex-col p-8">
            <div className="flex flex-col gap-4">
                <p>{tFlashcardLearning('flashcardsEmpty')}</p>
                <Button
                    onClick={handleGenerateClick}
                    className="w-[10%] px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                    Generate
                </Button>
            </div>
        </div>
    );
}
