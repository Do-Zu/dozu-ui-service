import { Button } from '@/components/ui/button';
import { METHOD_LEARNING } from '@/utils/constants/method';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';

export default function LearningFlashcardsEmptyState({ topicId }: { topicId: number }) {
    const tFlashcardLearning = useTranslations('flashcard.learning');
    const { setTab } = useTopicWorkspace();

    function handleRedirectReview() {
        setTab(METHOD_LEARNING.QUIZ);
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
                <h2 className="text-2xl font-semibold text-black">{tFlashcardLearning('greatJob')}</h2>
                <p className="text-gray-700 max-w-md">{tFlashcardLearning('flashcardsCompleted')}</p>
                <div className="pt-4">
                    <Button
                        onClick={handleRedirectReview}
                        className="px-6 py-2  rounded-lg transition-colors border border-gray-300"
                    >
                        {tFlashcardLearning('reviewKnowledge')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
