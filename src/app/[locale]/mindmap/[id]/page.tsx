'use client';

import { Button } from '@/components/ui/button';
import { setRouterRef } from '@/utils/routerService';
import { Background, BackgroundVariant, Controls, Panel, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DownloadButton from '../components/buttons/DownloadButton';
import ViewFileButton from '../components/buttons/ViewFileButton.';
import CustomReactFlowNode from '../components/CustomReactFlowNode';
import FileSheet from '../components/FileSheet';
import FloatingEdge from '../components/FloatingEdge';
import NodeSheet from '../components/NodeSheet';
import { useMindMapContext } from '../context/MindMapContext';
import GeneratingSkeleton from '@/components/generative/GeneratingSkeleton';
import { toast } from '@/hooks/use-toast';

import LoadingPage from '@/app/loading';
import ContentGenerationPreview from '../../generate/components/ContentGenerationPreview';
import { useAppSelector } from '@/stores/hooks';
import { useContentGeneration } from '../../generate/hooks/useContentGeneration';
import {
    FlashcardsSubmitted,
    handleConvertToFlashcardsSubmitted,
    IFlashcardWithServer,
} from '../../flashcards/components/FlashcardEditor';
import { postRequest } from '@/api/api';
import { ROUTES } from '@/utils/constants/routes';
import { TypeDataGenerated } from '@/app/[locale]/generate/components/ContentGenerationPreview';
import { IFlashcardAdded, IFlashcardDeleted, IFlashcardUpdated } from '../../flashcards/types/flashcard.type';

const defaultEdgeOptions = {
    type: 'floating',
};

const nodeTypes = {
    'custom-react-flow-node': CustomReactFlowNode,
};

const edgeTypes = {
    floating: FloatingEdge,
};

export default function MindmapContent() {
    const router = useRouter();

    const {
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

    const {
        dataGenerated,
        setDataGenerated,
        setTopicName,
        setTopicDescription,
        isTopicModalOpen,
        setIsTopicModalOpen,
        handleOnClickSave,
    } = useContentGeneration({ sseData, sseStatus });

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
            console.log({ data });
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

    function handleConvertToFlashcardsSubmitted(flashcards: IFlashcardWithServer[]): FlashcardsSubmitted | null {
        if (!flashcards) return null;

        let flashcardsFormatted = flashcards.map((flashcard) => {
            return {
                ...flashcard,
                front: flashcard.front.trim(),
                back: flashcard.back.trim(),
            };
        });

        let flashcardsAdded: IFlashcardAdded[];
        let flashcardsUpdated: IFlashcardUpdated[];
        let flashcardsDeleted: IFlashcardDeleted[];

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

        let dataSubmitted: FlashcardsSubmitted = { flashcardsAdded, flashcardsUpdated, flashcardsDeleted };
        return dataSubmitted;
    }

    //TODO: Implement save content generated
    // That must be include nodeId
    console.log(dataGenerated);
    console.log(selectedNodeData);
    const handleSaveContentGenerated = async () => {
        let flashcardsSubmitted = handleConvertToFlashcardsSubmitted(dataGenerated as IFlashcardWithServer[]); //handle checks if needed - DuyND
        try {
            await postRequest(
                `/flashcards/batch/node?topicId=${topicId}&nodeId=${selectedNodeData?.nodeId}`,
                flashcardsSubmitted,
            );
            toast({
                title: 'Edit Flashcards successfully',
                variant: 'default',
            });
            router.push(ROUTES.HOME);
        } catch (err) {
            console.log(err);
            return;
        }
        toast({
            description: 'Implement this function to save generated content',
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
                    topicName={selectedNodeData?.label || ''}
                    setTopicName={setTopicName}
                    topicDescription={selectedNodeData?.description || ''}
                    setTopicDescription={setTopicDescription}
                    isTopicModalOpen={isTopicModalOpen}
                    setIsTopicModalOpen={setIsTopicModalOpen}
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
                        <Button disabled={isSaving} variant="outline" onClick={saveMindmap}>
                            <Save />
                            {isSaving ? 'Saving...' : 'Save mindmap'}
                        </Button>
                        <DownloadButton />
                    </div>
                    <FileSheet />
                    <NodeSheet />
                </Panel>
                <Controls />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}
