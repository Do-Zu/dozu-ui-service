'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import PreviewMindmap from './PreviewMindmap';

import { v4 as uuidv4 } from 'uuid';
import { CustomEdge, CustomNode } from '../../../../types/mindmap/mindmap.type';
import { mindmapLayoutElkOptions } from '../constants';
import { getLayoutedElements } from '../utils/mindmap.utils';

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
        color?: string;
    };
}

const GenerateMindmapCard = ({ mindmapData, topicName, setTopicName, setDataGenerated }: GenerateMindmapCardProps) => {
    const isMindmapUpdatedRef = useRef(false);
    const isMindmapLayoutedRef = useRef(false);

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

        const updatedNodes = nodes.map((node: any) => {
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
        isMindmapUpdatedRef.current = true;
        return { nodes: updatedNodes, edges: updatedEdges };
    };

    const [updatedMindmapData, setUpdatedMindmapData] = useState<any>({});

    useEffect(() => {
        if (mindmapData.nodes.length > 0 && mindmapData.edges.length) {
            setUpdatedMindmapData(getUpdatedMindmapData(mindmapData.nodes, mindmapData.edges));
        }
    }, [mindmapData.nodes, mindmapData.edges]);

    useEffect(() => {
        const applyElkLayout = async () => {
            if (!mindmapData?.nodes?.length) return;

            try {
                const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
                    updatedMindmapData.nodes,
                    updatedMindmapData.edges,
                    mindmapLayoutElkOptions,
                );

                // Optional: compress vertically or tweak spacing
                layoutedNodes.forEach((node) => {
                    node.position.y *= 0.7;
                });
                setUpdatedMindmapData({
                    nodes: layoutedNodes,
                    edges: layoutedEdges,
                });
                setDataGenerated({
                    nodes: layoutedNodes as any,
                    edges: layoutedEdges as any,
                });
            } catch (error) {
                console.error('ELK layout failed:', error);
                // fallback: at least set unlayouted data
                setDataGenerated(updatedMindmapData);
            }
        };

        if (
            isMindmapUpdatedRef.current &&
            !isMindmapLayoutedRef.current &&
            updatedMindmapData.nodes &&
            updatedMindmapData.nodes.length > 0 &&
            updatedMindmapData.edges &&
            updatedMindmapData.edges.length > 0
        ) {
            applyElkLayout();
            isMindmapLayoutedRef.current = true;
        }
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
