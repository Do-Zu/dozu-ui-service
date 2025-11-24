import CustomReactFlowNode from '@/app/[locale]/mindmap/components/CustomReactFlowNode';
import FloatingEdge from '@/app/[locale]/mindmap/components/FloatingEdge';
import MindmapButtonsPanel from '@/app/[locale]/mindmap/components/MindmapButtonsPanel';
import NodeSheet from '@/app/[locale]/mindmap/components/NodeSheet';
import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
import Spinner from '@/components/ui/spinner';
import { ColorMode, ReactFlow, Controls, Background, BackgroundVariant } from '@xyflow/react';
// import { Background, BackgroundVariant, ColorMode, Controls, Panel, ReactFlow, useReactFlow } from '@xyflow/react';
import { useTheme } from 'next-themes';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Generate from '../generate/Generate';
import { v4 as uuidv4 } from 'uuid';
import {
    GeneratedEdge,
    GeneratedNode,
    getLayoutedElements,
    getUpdatedEdges,
} from '@/app/[locale]/mindmap/utils/mindmap.utils';
import { mindmapLayoutElkOptions } from '@/app/[locale]/mindmap/constants';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import EditingFlashcards from '../flashcard/edit/EditingFlashcards';
import NodeFlashcardsBrowse from '../flashcard/node/NodeFlashcardsBrowse';
import { useAppSelector } from '@/stores/hooks';
import { useDispatch } from 'react-redux';
import { closeSheet, openSheet } from '@/stores/features/mindmap/selectedNodeSlice';
import NodeFlashcardsEdit from '../flashcard/node/NodeFlashcardsEdit';
import NodeFlashcardsLinker from '../flashcard/node/NodeFlashcardsLinker';
import NodeFlashcardsLearning from '../flashcard/node/NodeFlashcardsLearning';

//set react flow to use custom nodes & edges
const nodeTypes = {
    'custom-react-flow-node': CustomReactFlowNode,
};
const edgeTypes = {
    floating: FloatingEdge,
};

const MindmapContent = ({}) => {
    const {
        topicId,
        isLoading,
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        isSaving,
        saveMindmap,
        sseData,
        sseStatus,
        hasInitialized,
        isProcessingRegisterGenerate,
        executeGenerate,
    } = useMindMapContext();

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [hasShownModal, setHasShownModal] = useState(false);
    const [savePending, setSavePending] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // node flashcards section
    const dispatch = useDispatch();
    const selectedNodeData = useAppSelector((state) => state.selectedNodeSlice.selectedNodeData);
    const [isNodeFlashcardsBrowseOpen, setIsNodeFlashcardsBrowseOpen] = useState<boolean>(false);
    const [isNodeFlashcardsEditOpen, setIsNodeFlashcardsEditOpen] = useState<boolean>(false);
    const [isNodeFlashcardsLinkerOpen, setIsNodeFlashcardsLinkerOpen] = useState<boolean>(false);
    const [isNodeFlashcardsLearningOpen, setIsNodeFlashcardsLearningOpen] = useState<boolean>(false);

    const isNodeFlashcardsPanelOpen =
        isNodeFlashcardsBrowseOpen ||
        isNodeFlashcardsEditOpen ||
        isNodeFlashcardsLinkerOpen ||
        isNodeFlashcardsLearningOpen;

    function closeAllNodeFlashcardsPanels() {
        setIsNodeFlashcardsBrowseOpen(false);
        setIsNodeFlashcardsEditOpen(false);
        setIsNodeFlashcardsLinkerOpen(false);
        setIsNodeFlashcardsLearningOpen(false);
    }

    function onViewNodeFlashcardsClick() {
        dispatch(closeSheet());
        closeAllNodeFlashcardsPanels();
        setIsNodeFlashcardsBrowseOpen(true);
    }

    function onEditNodeFlashcardsClick() {
        dispatch(closeSheet());
        closeAllNodeFlashcardsPanels();
        setIsNodeFlashcardsEditOpen(true);
    }

    function onLinkNodeFlashcardsClick() {
        dispatch(closeSheet());
        closeAllNodeFlashcardsPanels();
        setIsNodeFlashcardsLinkerOpen(true);
    }

    function onLearnNodeFlashcardsClick() {
        dispatch(closeSheet());
        closeAllNodeFlashcardsPanels();
        setIsNodeFlashcardsLearningOpen(true);
    }

    function handleNodeFlashcardsBrowseClose() {
        setIsNodeFlashcardsBrowseOpen(false);
        dispatch(openSheet());
    }

    function handleNodeFlashcardsLinkerClose() {
        setIsNodeFlashcardsLinkerOpen(false);
        dispatch(openSheet());
    }

    function handleNodeFlashcardsLearningClose() {
        setIsNodeFlashcardsLearningOpen(false);
        dispatch(openSheet());
    }

    function handleNodeFlashcardsEditClose() {
        setIsNodeFlashcardsEditOpen(false);
        dispatch(openSheet());
    }

    const showNodeFlashcardsPanel = useCallback(() => {
        if (!selectedNodeData) return null;
        if (isNodeFlashcardsBrowseOpen) {
            return <NodeFlashcardsBrowse nodeId={selectedNodeData.nodeId} onClose={handleNodeFlashcardsBrowseClose} />;
        }
        if (isNodeFlashcardsEditOpen) {
            return <NodeFlashcardsEdit nodeId={selectedNodeData.nodeId} onClose={handleNodeFlashcardsEditClose} />;
        }
        if (isNodeFlashcardsLinkerOpen) {
            return <NodeFlashcardsLinker nodeId={selectedNodeData.nodeId} onClose={handleNodeFlashcardsLinkerClose} />;
        }
        if (isNodeFlashcardsLearningOpen) {
            return (
                <NodeFlashcardsLearning nodeId={selectedNodeData.nodeId} onClose={handleNodeFlashcardsLearningClose} />
            );
        }
    }, [
        selectedNodeData?.nodeId,
        isNodeFlashcardsBrowseOpen,
        isNodeFlashcardsEditOpen,
        isNodeFlashcardsLinkerOpen,
        isNodeFlashcardsLearningOpen,
    ]);

    useEffect(() => {
        if (hasInitialized && !hasShownModal && nodes.length === 1) {
            setShowGenerateModal(true);
            setHasShownModal(true);
        }
    }, [hasInitialized, hasShownModal, nodes.length]);

    const handleManualCreation = () => {
        setShowGenerateModal(false);
    };

    //pass website color theme along to react flow
    const { resolvedTheme } = useTheme();
    const colorMode = resolvedTheme as ColorMode;

    async function onGenerateSuccess(data: any) {
        const updatedMindmapData = getUpdatedMindmapData(data.nodes, data.edges);
        const layoutedMindmapData = await getLayoutedElements(
            updatedMindmapData.nodes,
            updatedMindmapData.edges,
            mindmapLayoutElkOptions,
        );
        setNodes(layoutedMindmapData.nodes);
        setEdges(layoutedMindmapData.edges);
        setSavePending(true);
        setShowGenerateModal(false);
        setIsGenerating(false);
    }

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

        return { nodes: updatedNodes, edges: updatedEdges };
    };

    // watch for nodes change
    useEffect(() => {
        if (savePending) {
            (async () => {
                setSavePending(false);
                await saveMindmap();
            })();
        }
    }, [savePending, saveMindmap]);

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div className="relative w-full h-full">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50} minSize={35}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        colorMode={colorMode}
                        fitView
                        minZoom={0.001}
                        className={showGenerateModal ? 'blur-sm' : ''}
                    >
                        <MindmapButtonsPanel />

                        <NodeSheet
                            onViewNodeFlashcardsClick={onViewNodeFlashcardsClick}
                            onLinkNodeFlashcardsClick={onLinkNodeFlashcardsClick}
                            onLearnNodeFlashcardsClick={onLearnNodeFlashcardsClick}
                            onEditNodeFlashcardsClick={onEditNodeFlashcardsClick}
                        />
                        <Controls position="bottom-right" />
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    </ReactFlow>

                    {/* Scoped Modal Overlay */}
                    {showGenerateModal && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div
                                className="pointer-events-auto bg-white dark:bg-slate-950 rounded-lg shadow-lg p-6 max-w-sm w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-lg font-semibold mb-2">Generate Mindmap</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Would you like to generate a mindmap for this topic, or create it manually?
                                </p>
                                <div className="flex gap-3 w-full">
                                    <div className="flex-1">
                                        <div className=" flex items-center justify-center py-4">
                                            <Button
                                                disabled={isGenerating}
                                                variant="outline"
                                                onClick={handleManualCreation}
                                                className="w-full"
                                            >
                                                Manual Creation
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <Generate
                                            onHandleBeforeGenerate={() => {
                                                setIsGenerating(true);
                                            }}
                                            type="mindmap"
                                            onSuccess={onGenerateSuccess}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </ResizablePanel>
                <ResizableHandle withHandle className={!isNodeFlashcardsPanelOpen ? 'hidden' : ''} />
                <ResizablePanel className={!isNodeFlashcardsPanelOpen ? 'hidden' : ''} defaultSize={50} minSize={35}>
                    <div className="h-full overflow-y-auto">{showNodeFlashcardsPanel()}</div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

export default MindmapContent;
