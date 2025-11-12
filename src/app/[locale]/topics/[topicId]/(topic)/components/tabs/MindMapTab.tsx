import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';

import { MindMapProvider } from '@/app/[locale]/mindmap/context/MindMapContext';
import MindmapContent from '../mindmap/MindmapContent';

export default function MindmapTab() {
    const {
        tab,
        topicId,
        flashcards,
        learningFlashcards,
        setTopic,
        setFlashcards,
        setLearningFlashcards,
        setAnkiSettings,
    } = useTopicWorkspace();

    return (
        <MindMapProvider>
            <MindmapContent />
        </MindMapProvider>
    );
}
