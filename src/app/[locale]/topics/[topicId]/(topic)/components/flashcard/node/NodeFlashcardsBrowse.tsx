import { useRequireFlashcards } from '../../../context/useRequireFlashcardContent';
import FlashcardsBrowse from '../browse/FlashcardsBrowse';
import EmptyNodeFlashcards from './EmptyNodeFlashcards';

interface Props {
    nodeId: string;
    onClose: () => void;
    isFullscreen: boolean;
    onPanelToggle: () => void;
}

export default function NodeFlashcardsBrowse({ nodeId, onClose, isFullscreen, onPanelToggle }: Props) {
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
            isPanelFullscreen={isFullscreen}
            onPanelToggle={onPanelToggle}
        />
    );
}
