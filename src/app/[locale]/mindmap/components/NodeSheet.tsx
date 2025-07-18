import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { closeSheet, setIsSheetOpen } from '@/stores/features/mindmap/selectedNodeSlice';
import { useAppSelector } from '@/stores/hooks';
import { Bot, CopyPlus, DiamondPlus, FileText, SquarePen, TableOfContents, Trash } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addChildNode, changeNodeLabel, deleteNode } from './mindmapUtils';
import { toast } from '@/hooks/use-toast';
import { AppEdge, AppNode } from '../mindmap.type';
import { Input } from '@/components/ui/input';
import { useReactFlow } from '@xyflow/react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMindMapContext } from '../context/MindMapContext';
import { useEventSource } from '@/hooks/useEventSource';
import usePost from '@/hooks/usePost';
import { ApiResponsePubGenContent, ISseData } from '../../generate/types';
import { URL_API_GENERATE } from '../../generate/utils/constant';
import { compressContent } from '../../generate/helper/compress';
import LoadingPage from '@/app/loading';
import GeneratingSkeleton from '@/components/generative/GeneratingSkeleton';

const NodeSheet = () => {
    const router = useRouter();
    const { setCurrentPageNumber, setIsFileSheetOpen, extractTextByRange } = useMindMapContext();

    const { screenToFlowPosition, getNodes, getEdges, setNodes, setEdges } = useReactFlow<AppNode, AppEdge>();
    const nodes = getNodes();
    const edges = getEdges();

    const isSheetOpen = useAppSelector((state) => state.selectedNodeSlice.isSheetOpen);
    const selectedNodeData = useAppSelector((state) => state.selectedNodeSlice.selectedNodeData);
    const [isEditing, setIsEditing] = useState(false);
    const [newLabel, setNewLabel] = useState(selectedNodeData?.label || '');
    const [newDescription, setNewDescription] = useState(selectedNodeData?.description || '');
    const [pageStartIndex, setPageStartIndex] = useState(selectedNodeData?.pageStartIndex);
    const [pageEndIndex, setPageEndIndex] = useState(selectedNodeData?.pageEndIndex);

    const {
        loading: isLoadingRegisterGenerate,
        data: apiResponse,
        error: apiPostContentError,
        execute,
    } = usePost<unknown, ApiResponsePubGenContent>(URL_API_GENERATE, 'POST');

    const urlOfSSEGenerateJob = useMemo(() => {
        if (!apiResponse || !apiResponse.data || apiPostContentError) return null;
        const { data } = apiResponse;
        const jobId = data?.jobId;
        return `/event/generate/job/${jobId}`;
    }, [apiResponse, isLoadingRegisterGenerate]);

    const { data: sseData, status: sseStatus } = useEventSource<ISseData>(urlOfSSEGenerateJob);

    useEffect(() => {
        setPageStartIndex(selectedNodeData?.pageStartIndex);
        setPageEndIndex(selectedNodeData?.pageEndIndex);
    }, [selectedNodeData]);

    const dispatch = useDispatch();

    const handleDeleteNode = () => {
        if (!selectedNodeData?.nodeId) {
            toast({ description: 'Missing nodeId', variant: 'destructive' });
        } else {
            deleteNode({ nodeId: selectedNodeData?.nodeId, edges: edges, setNodes: setNodes, setEdges: setEdges });
            dispatch(closeSheet());
        }
    };

    if (!selectedNodeData) {
        return (
            <Sheet open={isSheetOpen} onOpenChange={(open) => dispatch(setIsSheetOpen(open))}>
                <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                        <SheetTitle>Error</SheetTitle>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        );
    }

    const handleEditTitle = () => {
        if (isEditing) {
            changeNodeLabel({
                nodes,
                nodeId: selectedNodeData?.nodeId,
                newLabel,
                newDescription,
                setNodes,
                pageStartIndex: pageStartIndex || 1,
                pageEndIndex: pageEndIndex || 1,
            });
            dispatch(closeSheet());
        } else {
            setNewLabel(selectedNodeData?.label);
            setNewDescription(selectedNodeData.description || '');
        }
        setIsEditing((isEditing) => !isEditing);
    };

    const onChangeNewLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewLabel(e.target.value);
    };

    const onChangePageStartIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageStartIndex(parseInt(e.target.value));
    };

    const onChangePageEndIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageEndIndex(parseInt(e.target.value));
    };

    const onChangeNewDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewDescription(e.target.value);
    };

    const handleAddChild = () => {
        addChildNode({ screenToFlowPosition, setNodes, setEdges, currentNodeId: selectedNodeData.nodeId });
    };

    const handleAddFlashcards = () => {
        router.push(`/mindmap/add-flashcard?topicId=${selectedNodeData.topicId}&nodeId=${selectedNodeData.nodeId}`);
    };

    const handleGenerateFlashcards = async () => {
        if (!pageStartIndex || !pageEndIndex) return;

        const { text } = await extractTextByRange(pageStartIndex, pageEndIndex);

        if (!text) {
            toast({ description: 'No text found in the specified page range.' });
            return;
        }
        const compressedContent = compressContent(text);

        await execute({
            content: compressedContent,
            method: 'file',
            type: 'flashcards',
        });
    };

    const handleViewFlashcards = () => {
        router.push(`/mindmap/nodes/${selectedNodeData.nodeId}/flashcard`);
    };

    const handleOnOpenChange = (open: boolean) => {
        if (!open) {
            setIsEditing(false);
        }
        dispatch(setIsSheetOpen(open));
    };

    const handleViewDocument = () => {
        setCurrentPageNumber(pageStartIndex || pageEndIndex || 1);
        setIsFileSheetOpen(true);
    };

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

    if (sseStatus === 'open') {
        return <GeneratingSkeleton />;
    }

    return (
        <Sheet open={isSheetOpen} onOpenChange={handleOnOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <Input value={newLabel} onChange={onChangeNewLabel} />
                            ) : (
                                selectedNodeData?.label
                            )}

                            <Button variant="ghost" onClick={handleEditTitle}>
                                <SquarePen />
                            </Button>
                        </div>
                    </SheetTitle>

                    <SheetDescription>Node ID: {selectedNodeData?.nodeId}</SheetDescription>
                </SheetHeader>
                {isLoadingRegisterGenerate && <LoadingPage isOverlay={true} size={120} />}
                <div className="grid w-full gap-3">
                    <Label>Description</Label>
                    {isEditing ? (
                        <Textarea value={newDescription} onChange={onChangeNewDescription} />
                    ) : (
                        <p>{selectedNodeData.description}</p>
                    )}
                    <div className="grid grid-cols-2 w-full gap-3">
                        <Label>Starts at page #</Label>

                        {isEditing ? (
                            <Input type="number" value={pageStartIndex} onChange={onChangePageStartIndex} />
                        ) : (
                            selectedNodeData?.pageStartIndex
                        )}
                    </div>
                    <div className="grid grid-cols-2 w-full gap-3">
                        <Label>Ends at page #</Label>
                        {isEditing ? (
                            <Input type="number" value={pageEndIndex} onChange={onChangePageEndIndex} />
                        ) : (
                            selectedNodeData?.pageEndIndex
                        )}
                    </div>
                </div>

                {/* <SheetFooter> */}
                <div className="flex flex-col gap-2 mt-6">
                    <Button onClick={handleAddChild} variant="outline" className="w-full">
                        <DiamondPlus />
                        Add child
                    </Button>
                    <Button onClick={handleAddFlashcards} variant="outline" className="w-full">
                        <CopyPlus />
                        Add flashcards
                    </Button>
                    <Button onClick={handleGenerateFlashcards} variant="outline" className="w-full">
                        <Bot />
                        Generate flashcards
                    </Button>
                    <Button onClick={handleViewDocument} variant="outline" className="w-full">
                        <FileText />
                        View document
                    </Button>
                    <Button onClick={handleViewFlashcards} variant="outline" className="w-full">
                        <TableOfContents />
                        View all linked flashcards
                    </Button>
                    <Button onClick={handleDeleteNode} variant="destructive">
                        <Trash />
                        Delete this node
                    </Button>
                    {/* <SheetClose asChild>
                        <Button variant="outline">
                            <PanelRightClose />
                            Close
                        </Button>
                    </SheetClose> */}
                </div>
                {/* </SheetFooter> */}
            </SheetContent>
        </Sheet>
    );
};

export default NodeSheet;
