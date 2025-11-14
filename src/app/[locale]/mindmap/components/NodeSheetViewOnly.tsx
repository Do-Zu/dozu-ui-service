'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { setIsSheetOpen } from '@/stores/features/mindmap/selectedNodeSlice';
import { useAppSelector } from '@/stores/hooks';
import { FileText, TableOfContents } from 'lucide-react';

import { useMindMapContext } from '../context/MindMapContext';

const NodeSheetViewOnly = () => {
    const router = useRouter();
    const { setCurrentPageNumber, setIsFileSheetOpen } = useMindMapContext();

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

                            {/* <Button variant="ghost" onClick={handleEditTitle}>
                                <SquarePen />
                            </Button> */}
                        </div>
                    </SheetTitle>

                    {/* <SheetDescription>Node ID: {selectedNodeData?.nodeId}</SheetDescription> */}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto pr-2">
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
                    {/* <Button onClick={handleViewDocument} variant="outline" className="w-full">
                        <FileText />
                        View document
                    </Button> */}
                    <Button onClick={handleViewFlashcards} variant="outline" className="w-full">
                        <TableOfContents />
                        View all linked flashcards
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

export default NodeSheetViewOnly;
