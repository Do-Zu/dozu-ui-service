import { AppNode } from '@/types/mindmap/mindmap.type';
import { NodesData } from '../types/generate.type';
import toastHelper from '@/utils/toast.helper';
import { EnumLearningMaterial, ITranscriptSegment } from '../types';
import { useTopicWorkspace } from '../context/TopicWorkspaceContext';
import { PdfPageText } from '@/hooks/usePdfReader';

interface Props {
    nodes: AppNode[];
    nodeIds: string[];
}

type FunctionResult<DataType> =
    | {
          ok: false;
          type: string;
          message: string;
      }
    | {
          ok: true;
          data: DataType;
      };

type PrepareGeneratedData = {
    content: string;
    customOptions: {
        nodesData: NodesData;
    };
};

export default function useMultiNodeFlashcardsGenerate({ nodes, nodeIds }: Props) {
    const { learningMaterial, pdfPageTexts, getLearningMaterialContent } = useTopicWorkspace();

    function validateNodeIds(nodeIds: string[]): FunctionResult<AppNode[]> {
        let ok: boolean = true;
        let message: string = '',
            type: string = '';
        const data: AppNode[] = [];
        for (const id of nodeIds) {
            const node = nodes.find((item) => item.data.nodeId === id);
            if (!node) {
                ok = false;
                message = 'Node not found, please try again.';
                type = 'error';
                break;
            }
            data.push(node);
        }

        if (!ok) return { ok, type, message };
        return { ok, data };
    }

    function validateNodeRanges(nodes: AppNode[]): FunctionResult<{ start: number; end: number }> {
        let ok: boolean = true;
        let message: string = '',
            type: string = '';
        let start = 1000000;
        let end = 0;
        for (const node of nodes) {
            if (learningMaterial?.type === EnumLearningMaterial.file) {
                if (node.data.pageStartIndex === undefined || node.data.pageEndIndex === undefined) {
                    ok = false;
                    message = 'Page index is not available yet';
                    type = 'default';
                    break;
                }
                if (node.data.pageStartIndex > node.data.pageEndIndex) {
                    ok = false;
                    message = 'Start section should be less than or equal to end section.';
                    type = 'default';
                    break;
                }
                start = Math.min(start, node.data.pageStartIndex);
                end = Math.max(end, node.data.pageEndIndex);
            }
            if (
                learningMaterial?.type === EnumLearningMaterial.youtube ||
                learningMaterial?.type === EnumLearningMaterial.media
            ) {
                if (node.data.startSegment === undefined || node.data.endSegment === undefined) {
                    ok = false;
                    message = 'Start or end segment is not available yet';
                    type = 'default';
                    break;
                }
                if (node.data.startSegment > node.data.endSegment) {
                    ok = false;
                    message = 'Start section should be less than or equal to end section.';
                    type = 'default';
                    break;
                }
                start = Math.min(start, node.data.startSegment);
                end = Math.max(end, node.data.endSegment);
            }
        }

        if (!ok) return { ok, type, message };
        return { ok, data: { start, end } };
    }

    // todo: use useCallback with dependency selectedNodesData
    function prepareGeneratedDataForPdf({
        nodes,
        pageTexts,
    }: {
        nodes: AppNode[];
        pageTexts: PdfPageText[] | null;
    }): NodesData {
        const nodesData: NodesData = [];

        for (const nodeFound of nodes) {
            const { nodeId, label, description } = nodeFound.data;
            const { pageStartIndex, pageEndIndex } = nodeFound.data as { pageStartIndex: number; pageEndIndex: number };
            const startSection = pageTexts?.find((item) => item.page === pageStartIndex)?.text.slice(0, 50);
            const endPageContent = pageTexts?.find((item) => item.page === pageEndIndex)?.text;
            const endSection = endPageContent?.slice(endPageContent.length - 50, endPageContent.length);
            nodesData.push({
                nodeId,
                label,
                description,
                startSection: startSection ?? '',
                endSection: endSection ?? '',
            });
        }

        return nodesData;
    }

    function prepareGeneratedDataForMediaSegments({
        nodes,
        segments,
    }: {
        nodes: AppNode[];
        segments: ITranscriptSegment[];
    }): NodesData {
        const nodesData: NodesData = [];

        for (const nodeFound of nodes) {
            const { nodeId, label, description } = nodeFound.data;
            const { startSegment: startSegmentTime, endSegment: endSegmentTime } = nodeFound.data as {
                startSegment: number;
                endSegment: number;
            };

            const startSegmentContent = segments.find((item) => item.startTime === startSegmentTime)?.text.slice(0, 50);
            const endSegmentContent = segments.find((item) => item.startTime === endSegmentTime)?.text;
            const endSection = endSegmentContent?.slice(endSegmentContent.length - 50, endSegmentContent.length);

            nodesData.push({
                nodeId,
                label,
                description,
                startSection: startSegmentContent ?? '',
                endSection: endSection ?? '',
            });
        }

        return nodesData;
    }

    function prepareGeneratedData(): FunctionResult<PrepareGeneratedData> {
        const validateNodeIdsResult = validateNodeIds(nodeIds);
        if (!validateNodeIdsResult.ok) return validateNodeIdsResult;
        const nodesForGeneration = validateNodeIdsResult.data;
        const validateNodeRangesResult = validateNodeRanges(nodesForGeneration);
        if (!validateNodeRangesResult.ok) return validateNodeRangesResult;
        const { start, end } = validateNodeRangesResult.data;
        if (start > end) {
            return {
                ok: false,
                message: 'Start section should be less than or equal to end section.',
                type: 'default',
            };
        }
        const content = getLearningMaterialContent({ start, end });

        if (learningMaterial?.type === EnumLearningMaterial.file) {
            const nodesData = prepareGeneratedDataForPdf({
                nodes: nodesForGeneration,
                pageTexts: pdfPageTexts.current,
            });
            return {
                ok: true,
                data: {
                    content,
                    customOptions: { nodesData },
                },
            };
        } else if (
            learningMaterial?.type === EnumLearningMaterial.youtube ||
            learningMaterial?.type === EnumLearningMaterial.media
        ) {
            const nodesData = prepareGeneratedDataForMediaSegments({
                nodes: nodesForGeneration,
                segments: learningMaterial.content as ITranscriptSegment[],
            });
            return {
                ok: true,
                data: {
                    content,
                    customOptions: { nodesData },
                },
            };
        } else {
            return {
                ok: false,
                message: 'Pdf, youtube, or media type is required.',
                type: 'error',
            };
        }
    }

    function onHandleBeforeGenerate() {
        if (nodeIds.length === 0 || nodeIds.length > 10) {
            throw new Error('Please select between 1 and 10 nodes.');
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
