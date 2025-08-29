'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/stores/hooks';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { setRouterRef } from '@/utils/routerService';
import { Background, BackgroundVariant, Controls, Panel, ReactFlow, ReactFlowProvider } from '@xyflow/react';

import GeneratingSkeleton from '@/components/generative/GeneratingSkeleton';
import { toast } from '@/hooks/use-toast';
import { IFlashcardWithServer } from '@/app/[locale]/flashcards/components/FlashcardEditor';
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
                        {/* <Button disabled={isSaving} variant="outline" onClick={saveMindmap}>
                            <Save />
                            {isSaving ? 'Saving...' : 'Save mindmap'}
                        </Button> */}
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
