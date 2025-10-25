import React, { useEffect, useMemo } from 'react';
import PreviewMindmap from './PreviewMindmap';

import { Button } from '@/components/ui/button';
import { postRequest } from '@/api/api';
import { ITopic } from '../../topics/types/topic.type';
import Axios from '@/api/axios';
import { Card } from '@/components/ui/card';

import { v4 as uuidv4 } from 'uuid';
import { CustomEdge, CustomNode } from '../../../../types/mindmap/mindmap.type';

interface GenerateMindmapCardProps {
    mindmapData: any;
    topicName: string;
    setTopicName: (name: string) => void;
    setDataGenerated: (
        dataGenerated: {
            nodes: CustomNode[];
            edges: CustomEdge[];
        } | null,
    ) => void;
}

interface GeneratedEdge {
    id: string;
    source: string;
    target: string;
}

interface GeneratedNode {
    id: string;
    position: { x: number; y: number };
    data: {
        label: string;
        description: string;
        pageStartIndex: number;
        pageEndIndex: number;
        isRoot: boolean;
    };
}

const GenerateMindmapCard = ({ mindmapData, topicName, setTopicName, setDataGenerated }: GenerateMindmapCardProps) => {
    const getUpdatedEdges = (oldId: string, newId: string, edges: GeneratedEdge[]) => {
        const updatedEdges = edges.map((edge: GeneratedEdge) => {
            if (edge.source === oldId) {
                edge.source = newId;
            }
            if (edge.target === oldId) {
                edge.target = newId;
            }
            return edge;
        });
        return updatedEdges;
    };

    const getUpdatedMindmapData = (nodes: GeneratedNode[], edges: GeneratedEdge[]) => {
        let updatedEdges = edges.map((edge: any) => ({
            ...edge,
            type: 'floating',
        }));

        const updatedNodes = mindmapData?.nodes?.map((node: any) => {
            const oldId = node.id;
            const newId = uuidv4();
            updatedEdges = getUpdatedEdges(oldId, newId, updatedEdges);
            return {
                ...node,
                id: newId,
                data: {
                    ...node.data,
                    nodeId: newId,
                },
                type: 'custom-react-flow-node',
            };
        });
        return { nodes: updatedNodes, edges: updatedEdges };
    };

    // const updatedMindmapData = getUpdatedMindmapData(mindmapData.nodes, mindmapData.edges);
    const updatedMindmapData = useMemo(
        () => getUpdatedMindmapData(mindmapData.nodes, mindmapData.edges),
        [mindmapData.nodes, mindmapData.edges],
    );

    useEffect(() => {
        setDataGenerated(updatedMindmapData);
    }, [updatedMindmapData]);

    return (
        <div className="w-full flex">
            <div className="flex-auto grid w-full items-center gap-3">
                <PreviewMindmap initialNodes={updatedMindmapData.nodes} initialEdges={updatedMindmapData.edges} />
            </div>
        </div>
    );
};

export default GenerateMindmapCard;
