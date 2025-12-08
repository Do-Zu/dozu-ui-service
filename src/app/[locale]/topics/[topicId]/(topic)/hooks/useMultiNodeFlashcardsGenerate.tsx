import { AppNode } from '@/types/mindmap/mindmap.type';
import { NodesData } from '../types/generate.type';
import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
import toastHelper from '@/utils/toast.helper';
import { EnumLearningMaterial } from '../types';
import { useTopicWorkspace } from '../context/TopicWorkspaceContext';

interface Props {
    nodes: AppNode[];
    nodeIds: string[];
}

export default function useMultiNodeFlashcardsGenerate({ nodes, nodeIds }: Props) {
    const { learningMaterial } = useTopicWorkspace();
    const { extractTextByRange } = useMindMapContext();

    function validateNodeIdsForPdf() {
        // todo: handle appropriate page index
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
                message =
                    'Page index is not available yet. Please edit page indexes of your selected nodes to generate content.';
                break;
            }
            smallestPageStartIndex = Math.min(smallestPageStartIndex, pageStartIndex);
            largestPageEndIndex = Math.max(largestPageEndIndex, pageEndIndex);
        }

        if (!validNodesData) {
            throw new Error(message);
        }

        return { smallestPageStartIndex, largestPageEndIndex };
    }

    // todo: use useCallback with dependency selectedNodesData
    async function prepareGeneratedDataForPdf() {
        if (learningMaterial?.type !== EnumLearningMaterial.file) {
            throw new Error('Pdf type is required');
        }
        const { smallestPageStartIndex, largestPageEndIndex } = validateNodeIdsForPdf();
        const nodesData: NodesData = [];

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

        return { content: fullPageContent, customOptions: { nodesData } };
    }

    function validateNodeIdsForYoutube() {
        let validNodesData: boolean = true;
        let message: string = '';
        let smallestStartSegment: number = 1000000,
            largestStartSegment: number = 0;

        for (const id of nodeIds) {
            const nodeFound = nodes.find((item) => item.data.nodeId === id);
            if (!nodeFound) {
                validNodesData = false;
                message = 'Node not found, please try again.';
                break;
            }
            const { startSegment, endSegment } = nodeFound.data;
            if (!startSegment || !endSegment) {
                validNodesData = false;
                message =
                    'Start or end segment is not available yet. Please edit segments of your selected nodes to generate content.';
                break;
            }
            smallestStartSegment = Math.min(smallestStartSegment, startSegment);
            largestStartSegment = Math.max(largestStartSegment, endSegment);
        }

        if (!validNodesData) {
            throw new Error(message);
        }

        return { smallestStartSegment, largestStartSegment };
    }

    function prepareGeneratedDataForYoutube() {
        if (learningMaterial?.type !== EnumLearningMaterial.youtube || typeof learningMaterial.content === 'string') {
            throw new Error('Youtube type is required');
        }
        const { smallestStartSegment, largestStartSegment } = validateNodeIdsForYoutube();
        const nodesData: NodesData = [];

        let content: string = '';
        for (let segment = smallestStartSegment; segment < largestStartSegment; ) {
            const segmentFound = learningMaterial.content.find((item) => item.startTime === segment);
            const text = segmentFound?.text;
            const segmentIndex = segmentFound ? learningMaterial.content.indexOf(segmentFound) : -1;

            if (!text || segmentIndex === -1) throw new Error('Text not found in choosen segments.');

            const nextSegmentIndex = segmentIndex + 1;
            segment = learningMaterial.content[nextSegmentIndex].startTime;
            content += text;
        }

        for (const id of nodeIds) {
            const nodeFound = nodes.find((item) => item.data.nodeId === id) as AppNode;
            const { nodeId, label, description } = nodeFound.data;
            const { startSegment, endSegment } = nodeFound.data as { startSegment: number; endSegment: number };
            const startSection = learningMaterial.content.find((item) => item.startTime === startSegment)?.text;
            const endSection = learningMaterial.content.find((item) => item.startTime === endSegment)?.text;

            if (!startSection || !endSection) {
                throw new Error('Start or end section is required.');
            }

            nodesData.push({
                nodeId,
                label,
                description,
                startSection,
                endSection,
            });
        }

        return { content, customOptions: { nodesData } };
    }

    function prepareGeneratedData() {
        if (learningMaterial?.type === EnumLearningMaterial.file) {
            return prepareGeneratedDataForPdf();
        } else if (learningMaterial?.type === EnumLearningMaterial.youtube) {
            return prepareGeneratedDataForYoutube();
        } else {
            throw new Error('Pdf or youtube type is required.');
        }
    }

    function onHandleBeforeGenerate() {
        if (nodeIds.length > 10) {
            throw new Error('Maximum selected nodes to generate flashcards is 10, please select less than 10 nodes.');
        }
    }

    function onError(error: unknown) {
        toastHelper.showErrorMessage(error);
    }

    return {
        prepareGeneratedData,
        onHandleBeforeGenerate,
        onError,
        isVisible: nodeIds.length > 0,
    };
}
