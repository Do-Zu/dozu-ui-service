import { AppNode } from '@/types/mindmap/mindmap.type';
import { NodesData } from '../types/generate.type';
import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
import toastHelper from '@/utils/toast.helper';

interface Props {
    nodes: AppNode[];
    nodeIds: string[];
}

export default function useMultiNodeFlashcardsGenerate({ nodes, nodeIds }: Props) {
    const { extractTextByRange } = useMindMapContext();

    function validateNodeIds() {
        // todo: handle appropriate page index
        const nodesData: NodesData = [];
        let validNodesData: boolean = true;
        let message: string = '';
        let smallestPageStartIndex: number = 10000,
            largestPageEndIndex: number = 0;
        for (const id of nodeIds) {
            const nodeFound = nodes.find((item) => item.data.nodeId === id);
            if (!nodeFound) {
                validNodesData = false;
                message = 'Node not found, please try again.';
                break;
            }
            const { pageStartIndex, pageEndIndex } = nodeFound.data;
            if (!pageStartIndex || !pageEndIndex) {
                validNodesData = false;
                message = 'No text found in the specified page range.';
                break;
            }
            smallestPageStartIndex = Math.min(smallestPageStartIndex, pageStartIndex);
            largestPageEndIndex = Math.max(largestPageEndIndex, pageEndIndex);
        }

        if (!validNodesData) {
            throw new Error(message);
        }

        return { nodesData, smallestPageStartIndex, largestPageEndIndex };
    }

    // todo: use useCallback with dependency selectedNodesData
    async function prepareGeneratedData() {
        const { nodesData, smallestPageStartIndex, largestPageEndIndex } = validateNodeIds();

        const pagesContent: { page: number; content: string }[] = [];
        for (let page = smallestPageStartIndex; page <= largestPageEndIndex; ++page) {
            const { text } = await extractTextByRange(page, page);
            pagesContent.push({ page, content: text });
        }
        const fullPageContent = pagesContent.map((p) => p.content).join('');

        for (const id of nodeIds) {
            const nodeFound = nodes.find((item) => item.data.nodeId === id) as AppNode;
            const { nodeId, label, description } = nodeFound.data;
            const { pageStartIndex, pageEndIndex } = nodeFound.data as { pageStartIndex: number; pageEndIndex: number };
            const startSection = pagesContent.find((item) => item.page === pageStartIndex)?.content.slice(0, 50);
            const endPageContent = pagesContent.find((item) => item.page === pageEndIndex)?.content;
            const endSection = endPageContent?.slice(endPageContent.length - 50, endPageContent.length);
            nodesData.push({
                nodeId,
                label,
                description,
                startSection: startSection ?? '',
                endSection: endSection || '',
            });
        }

        return { customContent: fullPageContent, customOptions: { nodesData } };
    }

    function onHandleBeforeGenerate() {
        if (nodeIds.length > 10) {
            throw new Error('Maximum selected nodes to generate flashcards is 10, please select less than 10 nodes.');
        }
    }

    function onFallBack(error: unknown) {
        toastHelper.showErrorMessage(error);
    }

    return {
        prepareGeneratedData,
        onHandleBeforeGenerate,
        onFallBack,
        isVisible: nodeIds.length > 0,
    };
}
