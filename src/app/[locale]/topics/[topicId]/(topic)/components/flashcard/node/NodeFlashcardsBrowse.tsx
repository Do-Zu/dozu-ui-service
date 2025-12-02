import flashcardService from '@/services/flashcard/flashcard.service';
import { useRequireFlashcards } from '../../../context/useRequireFlashcardContent';
import FlashcardsBrowse from '../browse/FlashcardsBrowse';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import EmptyNodeFlashcards from './EmptyNodeFlashcards';

interface Props {
    nodeId: string;
    onClose: () => void;
}

export default function NodeFlashcardsBrowse({ nodeId, onClose }: Props) {
    const { topicId } = useTopicWorkspace();
    const { flashcards, setFlashcards } = useRequireFlashcards();
    const nodeFlashcards = flashcards.filter((item) => item.nodeId === nodeId);

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

    return (
        <FlashcardsBrowse
            flashcards={nodeFlashcards}
            // onStarToggle={handleToggleStar}
            emptyComponent={<EmptyNodeFlashcards onClose={onClose} />}
            onClose={onClose}
            enableFavouriteFlashcards={false}
            enableSidebar={false}
        />
    );
}
