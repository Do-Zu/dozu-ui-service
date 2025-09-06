'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/stores/hooks';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { setRouterRef } from '@/utils/routerService';
import { Background, BackgroundVariant, Controls, Panel, ReactFlow, ReactFlowProvider } from '@xyflow/react';

import GeneratingSkeleton from '@/components/generative/GeneratingSkeleton';
import { toast } from '@/hooks/use-toast';
import {
    handleConvertToFlashcardsSubmitted,
    IFlashcardWithServer,
} from '@/app/[locale]/flashcards/components/FlashcardEditor';
import {
    IFlashcardsBatchInput,
    IFlashcardCreateInput,
    IFlashcardUpdateInput,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import ContentGenerationPreview from '@/app/[locale]/generate/components/ContentGenerationPreview';
import { useContentGeneration } from '@/app/[locale]/generate/hooks/useContentGeneration';
import DownloadButton from '@/app/[locale]/mindmap/components/buttons/DownloadButton';
import ViewFileButton from '@/app/[locale]/mindmap/components/buttons/ViewFileButton';
import FileSheet from '@/app/[locale]/mindmap/components/FileSheet';
import FloatingEdge from '@/app/[locale]/mindmap/components/FloatingEdge';
import NodeSheetViewOnly from '@/app/[locale]/mindmap/components/NodeSheetViewOnly';
import ReactFlowNodeInClass from '@/app/[locale]/mindmap/components/ReactFlowNodeInClass';
import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
import LoadingPage from '@/app/loading';
import flashcardService from '@/services/flashcard/flashcard.service';

import '@xyflow/react/dist/style.css';

const defaultEdgeOptions = {
    type: 'floating',
};

const nodeTypes = {
    'custom-react-flow-node': ReactFlowNodeInClass,
};

const edgeTypes = {
    floating: FloatingEdge,
};

export default function MindmapContent() {
    const router = useRouter();

    const {
        isLoading,
        topicId,
        nodes,
        edges,
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

    if (isLoading) {
        return <LoadingPage />;
    }

    if (!topicId) {
        return <div>No topic id is provided</div>;
    }

    if (sseStatus === 'open') {
        return <GeneratingSkeleton />;
    }

    const handleSaveContentGenerated = async () => {
        let flashcardsSubmitted = handleConvertToFlashcardsSubmitted(dataGenerated as IFlashcardWithServer[]);
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

            toast({ description: 'Flashcards saved' });

            router.push(`/flashcards/edit/${topicId}`);
        } catch (err) {
            toast({ description: 'Failed to save flashcards' });
        }
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
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
            >
                <Panel position="top-left">
                    <ViewFileButton />
                </Panel>
                <Panel position="top-center">
                    <div className="flex gap-2 ">
                        <DownloadButton />
                    </div>
                    <FileSheet />
                    <NodeSheetViewOnly />
                </Panel>
                <Controls />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}
