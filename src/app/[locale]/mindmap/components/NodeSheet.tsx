import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { closeSheet, setIsSheetOpen } from '@/stores/features/mindmap/selectedNodeSlice';
import { useAppSelector } from '@/stores/hooks';
import { useReactFlow } from '@xyflow/react';
import { Bot, CopyPlus, DiamondPlus, FileText, SquarePen, TableOfContents, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { compressContent } from '../../generate/helper/compress';
import { useMindMapContext } from '../context/MindMapContext';
import { AppEdge, AppNode } from '../../../../types/mindmap/mindmap.type';
import { addChildNode, changeNodeLabel, deleteNode } from '../../../../utils/mindmap/mindmapUtils';

const NodeSheet = () => {
    const router = useRouter();
    const { setCurrentPageNumber, setIsFileSheetOpen, extractTextByRange, executeGenerate } = useMindMapContext();

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

    useEffect(() => {
        setPageStartIndex(selectedNodeData?.pageStartIndex);
        setPageEndIndex(selectedNodeData?.pageEndIndex);
    }, [selectedNodeData]);

    const dispatch = useDispatch();

    const handleDeleteNode = () => {
        if (!selectedNodeData?.nodeId) {
            toast({ description: 'Missing nodeId', variant: 'destructive' });
        } else {
            deleteNode({
                nodeId: selectedNodeData?.nodeId,
                edges: edges,
                setNodes: setNodes,
                setEdges: setEdges,
            });
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
        setIsEditing((prev) => !prev);
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
        addChildNode({ nodes, screenToFlowPosition, setNodes, setEdges, currentNodeId: selectedNodeData.nodeId });
        dispatch(closeSheet());
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

        await executeGenerate({
            content: compressedContent,
            method: 'file',
            type: 'flashcards',
        });
    };

    const handleViewFlashcards = () => {
        router.push(`/mindmap/nodes/${selectedNodeData.nodeId}/flashcard`);
    };

    const handleOnOpenChange = (open: boolean) => {
        if (!open) setIsEditing(false);
        dispatch(setIsSheetOpen(open));
    };

    const handleViewDocument = () => {
        setCurrentPageNumber(pageStartIndex || pageEndIndex || 1);
        setIsFileSheetOpen(true);
    };

    return (
        <Sheet open={isSheetOpen} onOpenChange={handleOnOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col space-y-4">
                <SheetHeader className="pb-3 border-b">
                    <SheetTitle>
                        <div className="flex items-center justify-between gap-2">
                            {isEditing ? (
                                <Input value={newLabel} onChange={onChangeNewLabel} placeholder="Enter node title" />
                            ) : (
                                <h2 className="text-lg font-semibold">{selectedNodeData?.label}</h2>
                            )}
                            <Button size="icon" variant="ghost" onClick={handleEditTitle}>
                                <SquarePen className="h-4 w-4" />
                            </Button>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto pr-2 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Description</Label>
                        {isEditing ? (
                            <Textarea
                                value={newDescription}
                                onChange={onChangeNewDescription}
                                placeholder="Write a short description..."
                                className="min-h-[100px]"
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {selectedNodeData.description || 'No description provided.'}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-sm font-medium">Start Page</Label>
                            {isEditing ? (
                                <Input type="number" value={pageStartIndex ?? ''} onChange={onChangePageStartIndex} />
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {selectedNodeData?.pageStartIndex ?? '—'}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm font-medium">End Page</Label>
                            {isEditing ? (
                                <Input type="number" value={pageEndIndex ?? ''} onChange={onChangePageEndIndex} />
                            ) : (
                                <p className="text-sm text-muted-foreground">{selectedNodeData?.pageEndIndex ?? '—'}</p>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground">Actions</Label>
                        <div className="grid grid-cols-1 gap-2">
                            <Button onClick={handleAddChild} variant="outline" className="justify-start gap-2">
                                <DiamondPlus className="h-4 w-4" /> Add Child
                            </Button>
                            <Button onClick={handleAddFlashcards} variant="outline" className="justify-start gap-2">
                                <CopyPlus className="h-4 w-4" /> Add Flashcards
                            </Button>
                            <Button
                                onClick={handleGenerateFlashcards}
                                variant="outline"
                                className="justify-start gap-2"
                            >
                                <Bot className="h-4 w-4" /> Generate Flashcards
                            </Button>
                            <Button onClick={handleViewDocument} variant="outline" className="justify-start gap-2">
                                <FileText className="h-4 w-4" /> View Document
                            </Button>
                            <Button onClick={handleViewFlashcards} variant="outline" className="justify-start gap-2">
                                <TableOfContents className="h-4 w-4" /> View Linked Flashcards
                            </Button>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <Button
                            onClick={handleDeleteNode}
                            variant="destructive"
                            className="w-full justify-center gap-2"
                        >
                            <Trash className="h-4 w-4" /> Delete Node
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default NodeSheet;
