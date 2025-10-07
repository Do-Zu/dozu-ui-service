'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { setRouterRef } from '@/utils/routerService';
import { Background, BackgroundVariant, ColorMode, Controls, Panel, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import GeneratingSkeleton from '@/components/generative/GeneratingSkeleton';
import { toast } from '@/hooks/use-toast';
import DownloadButton from '@/components/mindmap/button/DownloadButton';

import FileSheet from '../../components/FileSheet';
import FloatingEdge from '../../components/FloatingEdge';
import { useMindMapContext } from '../../context/MindMapContext';
import ViewFileButton from '../../../../../components/mindmap/button/ViewFileButton';

import {
    IFlashcardCreateInput,
    IFlashcardsBatchInput,
    IFlashcardUpdateInput,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import LoadingPage from '@/app/loading';
import flashcardService from '@/services/flashcard/flashcard.service';
import { useAppSelector } from '@/stores/hooks';
import { IFlashcardWithServer } from '../../../flashcards/components/FlashcardEditor';
import ContentGenerationPreview from '../../../generate/components/ContentGenerationPreview';
import { useContentGeneration } from '../../../generate/hooks/useContentGeneration';
import NodeSheetViewOnly from '../../components/NodeSheetViewOnly';
import ReactFlowNodeInClass from '../../components/ReactFlowNodeInClass';
import { useTheme } from 'next-themes';

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
    const { resolvedTheme } = useTheme();
    const colorMode = resolvedTheme as ColorMode;
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
                colorMode={colorMode}
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
