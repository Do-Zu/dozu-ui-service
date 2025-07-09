import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { closeSheet, setIsSheetOpen } from '@/stores/features/mindmap/selectedNodeSlice';
import { useAppSelector } from '@/stores/hooks';
import { Bot, CopyPlus, DiamondPlus, PanelRightClose, SquarePen, TableOfContents, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addChildNode, changeNodeLabel, deleteNode } from './mindmapUtils';
import { toast } from '@/hooks/use-toast';
import { AppEdge, AppNode } from '../mindmap.type';
import { Input } from '@/components/ui/input';
import { useReactFlow } from '@xyflow/react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const NodeSheet = () => {
    const router = useRouter();

    const { screenToFlowPosition, getNodes, getEdges, setNodes, setEdges } = useReactFlow<AppNode, AppEdge>();
    const nodes = getNodes();
    const edges = getEdges();

    const isSheetOpen = useAppSelector((state) => state.selectedNodeSlice.isSheetOpen);
    const selectedNodeData = useAppSelector((state) => state.selectedNodeSlice.selectedNodeData);
    const [isEditing, setIsEditing] = useState(false);
    const [newLabel, setNewLabel] = useState(selectedNodeData?.label || '');
    const [newDescription, setNewDescription] = useState(selectedNodeData?.description || '');

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
            changeNodeLabel({ nodes, nodeId: selectedNodeData?.nodeId, newLabel, newDescription, setNodes });
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

    const onChangeNewDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewDescription(e.target.value);
    };

    const handleAddChild = () => {
        addChildNode({ screenToFlowPosition, setNodes, setEdges, currentNodeId: selectedNodeData.nodeId });
    };

    const handleAddFlashcards = () => {
        router.push(`/mindmap/add-flashcard?topicId=${selectedNodeData.topicId}&nodeId=${selectedNodeData.nodeId}`);
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
                <div className="grid w-full gap-3">
                    <Label>Description</Label>
                    {isEditing ? (
                        <Textarea value={newDescription} onChange={onChangeNewDescription} />
                    ) : (
                        <p>{selectedNodeData.description}</p>
                    )}
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
                    <Button onClick={handleAddFlashcards} variant="outline" className="w-full">
                        <Bot />
                        Generate flashcards
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
