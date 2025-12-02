import { useRequireFlashcards } from '../../../context/useRequireFlashcardContent';
import FlashcardsBrowse from '../browse/FlashcardsBrowse';
import EmptyNodeFlashcards from './EmptyNodeFlashcards';

interface Props {
    nodeId: string;
    onClose: () => void;
}

export default function NodeFlashcardsBrowse({ nodeId, onClose }: Props) {
    const { flashcards } = useRequireFlashcards();
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
