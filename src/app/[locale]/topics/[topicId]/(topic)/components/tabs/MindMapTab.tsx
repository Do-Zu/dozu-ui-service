import { MindMapProvider } from '@/app/[locale]/mindmap/context/MindMapContext';
import MindmapContent from '../mindmap/MindmapContent';

export default function MindmapTab() {
    return (
        <MindMapProvider>
            <MindmapContent />
        </MindMapProvider>
    );
}
