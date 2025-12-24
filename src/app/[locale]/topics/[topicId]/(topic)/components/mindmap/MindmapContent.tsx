import CustomReactFlowNode from '@/app/[locale]/mindmap/components/CustomReactFlowNode';
import FloatingEdge from '@/app/[locale]/mindmap/components/FloatingEdge';
import MindmapButtonsPanel from '@/app/[locale]/mindmap/components/MindmapButtonsPanel';
import NodeDetails from '@/app/[locale]/topics/[topicId]/(topic)/components/mindmap/node/NodeDetails';
import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
import Spinner from '@/components/ui/spinner';
import { ColorMode, ReactFlow, Controls, Background, BackgroundVariant, Panel } from '@xyflow/react';
// import { Background, BackgroundVariant, ColorMode, Controls, Panel, ReactFlow, useReactFlow } from '@xyflow/react';
import { useTheme } from 'next-themes';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Generate from '../generate/Generate';
import { v4 as uuidv4 } from 'uuid';
import { getFilteredEdges, getFilteredNodes, getLayoutedElements, getUpdatedEdges } from '@/utils/mindmap/mindmapUtils';
import { GeneratedNode } from '@/utils/mindmap/mindmapUtils';
import { GeneratedEdge } from '@/utils/mindmap/mindmapUtils';
import { mindmapLayoutElkOptions } from '@/app/[locale]/mindmap/constants';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import NodeFlashcardsBrowse from '../flashcard/node/NodeFlashcardsBrowse';
import { useAppSelector } from '@/stores/hooks';
import { useDispatch } from 'react-redux';
import { closeSheet } from '@/stores/features/mindmap/selectedNodeSlice';
import NodeFlashcardsEdit from '../flashcard/node/NodeFlashcardsEdit';
import NodeFlashcardsLinker from '../flashcard/node/NodeFlashcardsLinker';
import NodeFlashcardsLearning from '../flashcard/node/NodeFlashcardsLearning';
import { UserRoleEnum } from '@/utils/constants/roles';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { IGenerateNodeFlashcardsItem } from '../../types/generate.type';
import MultiNodeFlashcardsPreview from '../flashcard/node/MultiNodeFlashcardsPreview';
import MultiNodeGeneratePanel from '../flashcard/node/MultiNodeGeneratePanel';
import MindmapGenerate from './components/MindmapGenerate';
import RoadmapButtonPanel from '@/app/[locale]/mindmap/components/RoadmapButtonPanel';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import Roadmap from './components/Roadmap';

//set react flow to use custom nodes & edges
const nodeTypes = {
    'custom-react-flow-node': CustomReactFlowNode,
};
const edgeTypes = {
    floating: FloatingEdge,
};

interface StudentProps {
    role: UserRoleEnum.USER;
}
interface TeacherProps {
    role: UserRoleEnum.TEACHER;
}

type Props = { mode: ILearningMode } & (StudentProps | TeacherProps);

type FlashcardsViewMode = 'idle' | 'browse' | 'edit' | 'link' | 'learning' | 'multiNodePreview';

type NodeFlashcardPanelMode = {
    mode: 'flashcard';
    data: {
        viewMode: FlashcardsViewMode;
    };
};

type NodeRoadmapPanelMode = {
    mode: 'roadmap';
};

type NodePanelMode = NodeFlashcardPanelMode | NodeRoadmapPanelMode | { mode: 'idle' };

const MindmapContent = ({ mode, role }: Props) => {
    const {
        isLoading,
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        saveMindmap,
        hasInitialized,
        fitView,
        setIsNodeSheetOpen,
    } = useTopicWorkspace();

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [hasShownModal, setHasShownModal] = useState(false);
    const [savePending, setSavePending] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // node flashcards section
    const dispatch = useDispatch();
    const selectedNodeData = useAppSelector((state) => state.selectedNodeSlice.selectedNodeData);
    const selectedNodeIds = useAppSelector((state) => state.selectedNodeSlice.selectedNodeIds);
    const hiddenNodeIds = useAppSelector((state) => state.selectedNodeSlice.hiddenNodeIds);

    const isSheetOpen = useAppSelector((state) => state.selectedNodeSlice.isSheetOpen);

    const [isFlashcardsPanelFullscreen, setIsFlashcardsPanelFullscreen] = useState<boolean>(false);
    const [generatedNodeFlashcards, setGeneratedNodeFlashcards] = useState<IGenerateNodeFlashcardsItem[]>([]);

    const [nodePanelMode, setNodePanelMode] = useState<NodePanelMode>({ mode: 'idle' });
    const isNodeFlashcardsPanelOpen = nodePanelMode.mode === 'flashcard' && nodePanelMode.data.viewMode !== 'idle';
    const flashcardsViewMode = nodePanelMode.mode === 'flashcard' ? nodePanelMode.data.viewMode : 'idle';

    const isRoadmapPanelOpen = nodePanelMode.mode === 'roadmap';

    function onFlashcardsViewOpen(viewMode: FlashcardsViewMode) {
        dispatch(closeSheet());
        setNodePanelMode({
            mode: 'flashcard',
            data: { viewMode },
        });
    }

    function onFlashcardsViewClose() {
        setNodePanelMode({ mode: 'idle' });
        setIsFlashcardsPanelFullscreen(false);
        requestAnimationFrame(() => {
            fitView({ duration: 800 });
        });
    }

    function onNodeDetailsClose() {
        dispatch(closeSheet());
        setNodePanelMode({ mode: 'idle' });
        requestAnimationFrame(() => {
            fitView({ duration: 800 });
        });
    }

    function onGenerateMultiNodeFlashcardsSuccess(data: IGenerateNodeFlashcardsItem[]) {
        setGeneratedNodeFlashcards(data);
        dispatch(closeSheet());
        setNodePanelMode({
            mode: 'flashcard',
            data: {
                viewMode: 'multiNodePreview',
            },
        });
    }

    function onFlashcardsPanelToggle() {
        setIsFlashcardsPanelFullscreen((prev) => !prev);
    }

    function onRoadmapOpen() {
        dispatch(closeSheet());
        setNodePanelMode({ mode: 'roadmap' });
        requestAnimationFrame(() => {
            fitView({ duration: 800 });
        });
    }

    function onRoadmapClose() {
        setNodePanelMode({ mode: 'idle' });
        requestAnimationFrame(() => {
            fitView({ duration: 800 });
        });
    }

    const showNodeFlashcardsPanel = useCallback(() => {
        if (!selectedNodeData) return null;
        if (flashcardsViewMode === 'browse') {
            return (
                <NodeFlashcardsBrowse
                    nodeId={selectedNodeData.nodeId}
                    onClose={onFlashcardsViewClose}
                    isFullscreen={isFlashcardsPanelFullscreen}
                    onPanelToggle={onFlashcardsPanelToggle}
                />
            );
        }
        if (flashcardsViewMode === 'edit') {
            return (
                <NodeFlashcardsEdit
                    nodeId={selectedNodeData.nodeId}
                    onClose={onFlashcardsViewClose}
                    isFullscreen={isFlashcardsPanelFullscreen}
                    onPanelToggle={onFlashcardsPanelToggle}
                />
            );
        }
        if (flashcardsViewMode === 'link') {
            return (
                <NodeFlashcardsLinker
                    nodeId={selectedNodeData.nodeId}
                    onClose={onFlashcardsViewClose}
                    isFullscreen={isFlashcardsPanelFullscreen}
                    onPanelToggle={onFlashcardsPanelToggle}
                />
            );
        }
        if (flashcardsViewMode === 'learning') {
            return (
                <NodeFlashcardsLearning
                    nodeId={selectedNodeData.nodeId}
                    onClose={onFlashcardsViewClose}
                    isFullscreen={isFlashcardsPanelFullscreen}
                    onPanelToggle={onFlashcardsPanelToggle}
                />
            );
        }
        if (flashcardsViewMode === 'multiNodePreview') {
            return (
                <MultiNodeFlashcardsPreview
                    generatedNodeFlashcards={generatedNodeFlashcards}
                    onClose={onFlashcardsViewClose}
                    isFullscreen={isFlashcardsPanelFullscreen}
                    onPanelToggle={onFlashcardsPanelToggle}
                />
            );
        }
    }, [selectedNodeData?.nodeId, flashcardsViewMode]);

    useEffect(() => {
        if (isSheetOpen) {
            setNodePanelMode({ mode: 'idle' });
        }
    }, [isSheetOpen]);

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

    const filteredNodes = getFilteredNodes(nodes, hiddenNodeIds);
    const filteredEdges = getFilteredEdges(edges, hiddenNodeIds);

    return (
        <div className="relative w-full h-full">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50} minSize={35} className={isFlashcardsPanelFullscreen ? 'hidden' : ''}>
                    <ReactFlow
                        nodes={filteredNodes}
                        edges={filteredEdges}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        colorMode={colorMode}
                        fitView
                        minZoom={0.001}
                        className={showGenerateModal ? 'blur-sm' : 'rounded-md'}
                    >
                        <MindmapButtonsPanel mode={mode} role={role} />
                        <RoadmapButtonPanel onClick={onRoadmapOpen} />
                        <MultiNodeGeneratePanel
                            nodes={nodes}
                            nodeIds={selectedNodeIds}
                            onSuccess={onGenerateMultiNodeFlashcardsSuccess}
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
                                <div className="flex gap-6 w-full">
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
                                        <MindmapGenerate
                                            onHandleBeforeGenerate={() => {
                                                setIsGenerating(true);
                                            }}
                                            onSuccess={onGenerateSuccess}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </ResizablePanel>

                {isSheetOpen && (
                    <>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={20} minSize={20}>
                            <div className="h-full overflow-y-auto">
                                <NodeDetails
                                    onClose={onNodeDetailsClose}
                                    onViewNodeFlashcardsClick={() => onFlashcardsViewOpen('browse')}
                                    onLinkNodeFlashcardsClick={() => onFlashcardsViewOpen('link')}
                                    onLearnNodeFlashcardsClick={() => onFlashcardsViewOpen('learning')}
                                    onEditNodeFlashcardsClick={() => onFlashcardsViewOpen('edit')}
                                    setIsNodeFlashcardsEditOpen={() => onFlashcardsViewOpen('edit')}
                                    mode={mode}
                                    role={role}
                                />
                            </div>
                        </ResizablePanel>
                    </>
                )}

                {!isSheetOpen && isNodeFlashcardsPanelOpen && (
                    <>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={50} minSize={35}>
                            <div className="h-full overflow-y-auto">{showNodeFlashcardsPanel()}</div>
                        </ResizablePanel>
                    </>
                )}

                {!isSheetOpen && isRoadmapPanelOpen && (
                    <>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={20} minSize={20}>
                            <Roadmap mode={mode} role={role} onClose={onRoadmapClose} />
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </div>
    );
};

export default MindmapContent;
