import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function FlashcardsEmptyState() {
    const tFlashcardLearning = useTranslations('flashcard.learning');
    const router = useRouter();

    function handleBackClick() {
        router.back();
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                    <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <p className="text-gray-700 max-w-md">{tFlashcardLearning('flashcardsEmpty')}</p>
                <div className="pt-4">
                    <Button
                        onClick={handleBackClick}
                        className="px-6 py-2  rounded-lg hover:bg-muted-foreground transition-colors border border-gray-300"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}