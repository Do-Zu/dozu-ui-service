import { Button } from '@/components/ui/button';
import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { useMindMapContext } from '../../context/MindMapContext';
import toastHelper from '@/utils/toast.helper';


interface FindOuterLeafsParams {
    nodes: AppNode[];
    edges: AppEdge[];
    outerLeafs: string[];
    currNodeId: string;
}
interface RetracePathsParams {
    edges: AppEdge[];
    outerLeafs: string[];
}

const ExportToCSVButton = () => {
    const { nodes, edges } = useMindMapContext();
    const handleOnClickCSV = () => {
        let originNode = nodes.find((node) => node.data.isRoot);
        if (!originNode) {
            toastHelper.showErrorMessage('No root node');
            return;
        }
        let outerLeafs: string[] = [];

        const findOuterLeafs = ({ nodes, edges, outerLeafs, currNodeId }: FindOuterLeafsParams): string[] => {
            const validTargets = edges.filter((edge) => edge.source === currNodeId).map((edge) => edge.target);
            if (validTargets.length === 0) {
                outerLeafs.push(currNodeId);
            }
            for (let vt of validTargets) {
                findOuterLeafs({ nodes, edges, outerLeafs, currNodeId: vt });
            }
            return outerLeafs;
        };
        outerLeafs = findOuterLeafs({ nodes, edges, outerLeafs, currNodeId: originNode?.data.nodeId! });
        const retracePaths = ({ edges, outerLeafs }: RetracePathsParams) => {
            let pathArrays: string[][] = [];
            for (let leaf of outerLeafs) {
                let pathArray = [];
                pathArray.push(leaf);
                let nextNode = edges.find((edge) => edge.target === leaf)?.source;
                while (nextNode) {
                    pathArray.push(nextNode);
                    nextNode = edges.find((edge) => edge.target === nextNode)?.source;
                }
                pathArray = pathArray.reverse();
                let labelArray = pathArray.map((id) => nodes.find((node) => node.data.nodeId === id)?.data.label ?? id);
                pathArrays.push(labelArray);
            }
            return pathArrays;
        };
        const pathArrays = retracePaths({ edges, outerLeafs });
        const maxLength = Math.max(...pathArrays.map((path) => path.length));

        const handleDownloadCSV = (pathArrays: string[][], maxLength: any) => {
            //convert to csv string
            const header = Array.from({ length: maxLength }, (_, i) => i.toString());
            const paddedPaths = pathArrays.map((path) => {
                const padded = [...path];
                while (padded.length < maxLength - 1) {
                    padded.push('');
                }
                return padded;
            });
            const csvContent = [header, ...paddedPaths].map((row) => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'mindmap.csv';
            link.click();
            URL.revokeObjectURL(url);
        };
        handleDownloadCSV(pathArrays, maxLength);
    };

    return (
        <Button onClick={handleOnClickCSV}>
            <ChevronRight />
            Export - CHANGE TO USE TRANSLATION
        </Button>
    );
};

export default ExportToCSVButton;
