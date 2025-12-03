import { getRequest, putRequest } from '@/api/api';
import { ILinkFlashcardsToNodePayload, INodeFlashcards } from '@/types/mindmap/mindmap.type';

class MindmapService {
    public async getNodeFlashcards({ nodeId }: { nodeId: string }): Promise<INodeFlashcards> {
        const response = await getRequest<INodeFlashcards, any>(`/mindmap/nodes/${nodeId}`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async linkFlashcardsToNode({
        topicId,
        nodeId,
        unlinkedFlashcards,
        linkedFlashcards,
    }: ILinkFlashcardsToNodePayload) {
        const response = await putRequest<
            { linkedFlashcards: number[]; unlinkedFlashcards: number[] },
            { flashcardId: number; nodeId: string | null }[]
        >(`/mindmap/${topicId}/nodes/${nodeId}`, { linkedFlashcards, unlinkedFlashcards });
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new MindmapService();
