import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
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
    const { nodes } = useMindMapContext();
    const { flashcards } = useRequireFlashcards();
    const nodeFlashcards = flashcards.filter((item) => item.nodeId === nodeId);
    const nodeLabel = nodes.find((item) => item.data.nodeId === nodeId)?.data.label || 'Your selected node';

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
            label={nodeLabel}
        />
    );
}
