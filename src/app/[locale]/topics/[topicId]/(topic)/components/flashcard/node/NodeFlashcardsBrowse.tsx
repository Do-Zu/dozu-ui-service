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
