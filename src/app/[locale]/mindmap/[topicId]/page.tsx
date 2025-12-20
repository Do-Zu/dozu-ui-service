'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Background, BackgroundVariant, ColorMode, Controls, Panel, ReactFlow, useReactFlow } from '@xyflow/react';
import { useAppSelector } from '@/stores/hooks';
import { toast } from '@/hooks/use-toast';
import { setRouterRef } from '@/utils/routerService';

import { Button } from '@/components/ui/button';

import ViewFileButton from '../../../../components/mindmap/button/ViewFileButton';
import CustomReactFlowNode from '../components/CustomReactFlowNode';
import FileSheet from '../components/FileSheet';
import FloatingEdge from '../components/FloatingEdge';
import NodeSheet from '../components/NodeSheet';
import { useMindMapContext } from '../context/MindMapContext';

import LoadingPage from '@/app/loading';
import flashcardService from '@/services/flashcard/flashcard.service';

import ContentGenerationPreview from '../../generate/components/ContentGenerationPreview';
import GeneratingSkeleton from '@/components/generative/GeneratingSkeleton';

import { useContentGeneration } from '../../generate/hooks/useContentGeneration';

import { IFlashcardWithServer } from '../../flashcards/components/FlashcardEditor';
import {
    IFlashcardCreateInput,
    IFlashcardsBatchInput,
    IFlashcardUpdateInput,
} from '../../flashcards/types/flashcard.type';

import '@xyflow/react/dist/style.css';
import { useTheme } from 'next-themes';
import { useSetCenterOnRoot } from '../hooks/useSetCenterOnRoot';

import MindmapButtonsPanel from '../components/MindmapButtonsPanel';
import RoadmapButtonPanel from '../components/RoadmapButtonPanel';

const defaultEdgeOptions = {
    type: 'floating',
};

const nodeTypes = {
    'custom-react-flow-node': CustomReactFlowNode,
};

const edgeTypes = {
    floating: FloatingEdge,
};

export default function page() {
    const { resolvedTheme } = useTheme();
    const colorMode = resolvedTheme as ColorMode;
    const router = useRouter();

    const {
        topicId,
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
        isProcessingRegisterGenerate,
    } = useMindMapContext();

    const { dataGenerated, setDataGenerated } = useContentGeneration({ sseData, sseStatus });

    const selectedNodeData = useAppSelector((state) => state.selectedNodeSlice.selectedNodeData);

    useEffect(() => {
        setRouterRef(router);
    }, [router]);

    useSetCenterOnRoot({ nodes });

    useEffect(() => {
        if (sseStatus === 'timeout' || sseStatus === 'error') {
            toast({
                description:
                    sseStatus === 'timeout'
                        ? 'The generation process timed out!'
                        : 'There was an error with the generation process. Please try again.',
            });
        } else if (sseData && sseStatus === 'completed') {
            const data = sseData?.data?.data;
            toast({
                description: 'Your content has been successfully generated.',
                variant: 'default',
            });
        }
    }, [sseData, sseStatus]);

    if (!topicId) {
        return <div>No topic id is provided</div>;
    }

    if (sseStatus === 'open') {
        return <GeneratingSkeleton />;
    }

    function handleConvertToFlashcardsSubmitted(flashcards: IFlashcardWithServer[]): IFlashcardsBatchInput | null {
        if (!flashcards) return null;

        let flashcardsFormatted = flashcards.map((flashcard) => {
            return {
                ...flashcard,
                front: flashcard.front.trim(),
                back: flashcard.back.trim(),
            };
        });

        let flashcardsAdded: IFlashcardCreateInput[];
        let flashcardsUpdated: IFlashcardUpdateInput[];
        let flashcardsDeleted: number[];

        let flashcardsFilter;

        flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
            return !flashcard.serverInfo && (flashcard.front !== '' || flashcard.back !== '');
        });
        flashcardsAdded = flashcardsFilter.map((flashcard) => ({
            front: flashcard.front,
            back: flashcard.back,
        }));

        flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
            return (
                flashcard.serverInfo &&
                flashcard.serverInfo.isUpdated &&
                flashcard.front !== '' &&
                flashcard.back !== ''
            );
        });
        flashcardsUpdated = flashcardsFilter.map((flashcard) => ({
            flashcardId: flashcard.serverInfo!.flashcardId,
            front: flashcard.front,
            back: flashcard.back,
        }));

        flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
            return (
                flashcard.serverInfo &&
                (flashcard.serverInfo.isDeleted ||
                    (flashcard.serverInfo.isUpdated && flashcard.front === '' && flashcard.back === ''))
            );
        });
        flashcardsDeleted = flashcardsFilter.map((flashcard) => flashcard.serverInfo!.flashcardId);

        if (
            (!flashcardsAdded || flashcardsAdded.length === 0) &&
            (!flashcardsUpdated || flashcardsUpdated.length === 0) &&
            (!flashcardsDeleted || flashcardsDeleted.length === 0)
        )
            return null;

        let dataSubmitted: IFlashcardsBatchInput = { flashcardsAdded, flashcardsUpdated, flashcardsDeleted };
        return dataSubmitted;
    }

    const handleSaveContentGenerated = async () => {
        let flashcardsSubmitted = handleConvertToFlashcardsSubmitted(dataGenerated as IFlashcardWithServer[]); //handle checks if needed - DuyND
        const nodeId = selectedNodeData?.nodeId;
        if (!nodeId || !flashcardsSubmitted) {
            toast({
                title: 'Fail to edit flashcards',
                variant: 'destructive',
            });
            return;
        }
        try {
            await flashcardService.batchFlashcardsForNode({
                topicId,
                nodeId,
                flashcards: flashcardsSubmitted,
            });
            toast({
                title: 'Edit Flashcards successfully',
                variant: 'default',
            });
            router.push(`/flashcards/edit/${topicId}`);
        } catch (err) {
            console.log(err);
            return;
        }
        toast({
            description: 'Flashcards saved successfully',
            variant: 'default',
        });
        //NOTE: Can reuse function handleOnClickSave
    };

    if (dataGenerated) {
        return (
            <div className="relative">
                <ContentGenerationPreview
                    sseData={sseData}
                    dataGenerated={dataGenerated}
                    setDataGenerated={setDataGenerated}
                    shouldCreateTopic={false}
                    shouldCreateFeed={false}
                    onSave={handleSaveContentGenerated}
                />
                <Button className="fixed bottom-5 right-64 z-50 w-32" onClick={handleSaveContentGenerated}>
                    Save
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            {isProcessingRegisterGenerate && <LoadingPage isOverlay={true} size={120} />}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                colorMode={colorMode}
                fitView
            >
                {/* <Panel position="top-left">
                    <ViewFileButton />
                </Panel> */}

                <MindmapButtonsPanel />
                <RoadmapButtonPanel />
                <FileSheet />
                <NodeSheet />
                <Controls />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}
