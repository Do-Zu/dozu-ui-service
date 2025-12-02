import flashcardService from '@/services/flashcard/flashcard.service';
import { useRequireFlashcards } from '../../../context/useRequireFlashcardContent';
import FlashcardsBrowse from './FlashcardsBrowse';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';

export default function TopicFlashcardsBrowse() {
    const { topicId } = useTopicWorkspace();
    const { flashcards, setFlashcards } = useRequireFlashcards();

    // Handle star toggle
    async function handleToggleStar(flashcardId: number) {
        try {
            const { flashcardId: updatedFlashcardId, isStar } = await flashcardService.toggleStar(topicId, flashcardId);
            // Update local flashcards state
            setFlashcards(
                (prev) => prev?.map((fc) => (fc.flashcardId === updatedFlashcardId ? { ...fc, isStar } : fc)) ?? [],
            );
        } catch (error) {
            console.error('Error toggling star:', error);
        }
    }

    return <FlashcardsBrowse flashcards={flashcards} onStarToggle={handleToggleStar} />;
}
