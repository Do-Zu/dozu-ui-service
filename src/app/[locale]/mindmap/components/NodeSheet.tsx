import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { closeSheet, setIsSheetOpen } from '@/stores/features/mindmap/selectedNodeSlice';
import { useAppSelector } from '@/stores/hooks';
import { useReactFlow } from '@xyflow/react';
import {
    Bot,
    ChevronDown,
    CopyPlus,
    DiamondPlus,
    Edit,
    FileText,
    GraduationCap,
    Layers,
    LayoutGrid,
    Plus,
    SquarePen,
    TableOfContents,
    Trash,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { compressContent } from '../../generate/helper/compress';
import { useMindMapContext } from '../context/MindMapContext';
import { AppEdge, AppNode } from '../../../../types/mindmap/mindmap.type';
import { addChildNode, changeNodeLabel, deleteNode } from '../../../../utils/mindmap/mindmapUtils';
import Reference from '../../topics/[topicId]/(topic)/components/reference/Reference';
import { UserRoleEnum } from '@/utils/constants/roles';
import { EnumLearningMaterial, IReturnItemFileReference } from '../../topics/[topicId]/(topic)/types';
import ReferenceDocumentViaPage from './ReferenceDocumentViaPage';
import { isNullOrEmpty, toNumber } from '@/utils';
import Generate from '../../topics/[topicId]/(topic)/components/generate/Generate';
import { METHOD_LEARNING } from '@/utils/constants/method';
import { useTopicWorkspace } from '../../topics/[topicId]/(topic)/context/TopicWorkspaceContext';
import { IResponseFlashCardGenerate } from '../../topics/[topicId]/(topic)/hooks/useFlashCardWorkSpace';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';

enum FlashcardActionEnum {
    BROWSE = 'browse',
    LEARNING = 'learning',
    LINK = 'link',
    EDIT = 'edit',
    GENERATE = 'generate',
}
type FlashcardActionType = (typeof FlashcardActionEnum)[keyof typeof FlashcardActionEnum];
const flashcardActionsTypes: FlashcardActionType[] = Object.values(FlashcardActionEnum);

interface Props {
    onViewNodeFlashcardsClick?: () => void;
    onLinkNodeFlashcardsClick?: () => void;
    onLearnNodeFlashcardsClick?: () => void;
    onEditNodeFlashcardsClick?: () => void;
    setIsNodeFlashcardsEditOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    mode?: ILearningMode;
    role?: UserRoleEnum.USER | UserRoleEnum.TEACHER;
}

const NodeSheet = ({
    onViewNodeFlashcardsClick,
    onLinkNodeFlashcardsClick,
    onLearnNodeFlashcardsClick,
    onEditNodeFlashcardsClick,
    setIsNodeFlashcardsEditOpen,
    mode,
    role = UserRoleEnum.TEACHER,
}: Props) => {
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
    const [generatedContent, setGeneratedContent] = useState<string>('');

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);
    const availableFlashcardActions: FlashcardActionType[] = useMemo(() => {
        if (role === UserRoleEnum.TEACHER || mode === MODE_ACCESS_PAGE_ROLE.personal) return flashcardActionsTypes;
        if (role === UserRoleEnum.USER) return [FlashcardActionEnum.BROWSE, FlashcardActionEnum.LEARNING];
        return [];
    }, [mode, role]);

    const { setGeneratingFlashcards } = useTopicWorkspace();

    useEffect(() => {
        setPageStartIndex(selectedNodeData?.pageStartIndex);
        setPageEndIndex(selectedNodeData?.pageEndIndex);
    }, [selectedNodeData]);

    useEffect(() => {
        if (!pageStartIndex || !pageEndIndex) return;

        let isMounted = true;

        const getGeneratedContent = async () => {
            const { text } = await extractTextByRange(pageStartIndex, pageEndIndex);

            if (!text) {
                toast({ description: 'No text found in the specified page range.' });
                return;
            }

            if (isMounted) setGeneratedContent(text);
        };

        getGeneratedContent();

        return () => {
            isMounted = false;
        };
    }, [pageStartIndex, pageEndIndex]);

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
        const val = e.target.value;

        if (isNullOrEmpty(val)) {
            setPageStartIndex(undefined);
        }

        const pageNumber = parseInt(toNumber(val).toString(), 10);

        if (pageNumber <= 0) {
            toast({
                description: 'Invalid Page Number',
            });
            return;
        }

        setPageStartIndex(pageNumber);
    };

    const onChangePageEndIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (isNullOrEmpty(val)) {
            setPageEndIndex(undefined);
        }

        const pageNumber = parseInt(toNumber(val).toString(), 10);

        if (pageNumber <= 0) {
            toast({
                description: 'Invalid Page Number',
            });
            return;
        }

        setPageEndIndex(pageNumber);
    };

    const onChangeNewDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewDescription(e.target.value);
    };

    const handleAddChild = () => {
        addChildNode({ nodes, screenToFlowPosition, setNodes, setEdges, currentNodeId: selectedNodeData.nodeId });
        dispatch(closeSheet());
    };

    const handleAddFlashcards = () => {
        if (onLinkNodeFlashcardsClick) {
            onLinkNodeFlashcardsClick();
            return;
        }
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
        if (onViewNodeFlashcardsClick) {
            onViewNodeFlashcardsClick();
            return;
        }
        router.push(`/mindmap/nodes/${selectedNodeData.nodeId}/flashcard`);
    };

    const handleEditFlashcards = () => {
        if (onEditNodeFlashcardsClick) {
            onEditNodeFlashcardsClick();
            return;
        }
    };

    const handleLearnFlashcardsClick = () => {
        if (onLearnNodeFlashcardsClick) {
            onLearnNodeFlashcardsClick();
            return;
        }
    };

    const handleOnOpenChange = (open: boolean) => {
        if (!open) setIsEditing(false);
        dispatch(setIsSheetOpen(open));
    };

    const handleViewDocument = () => {
        setCurrentPageNumber(pageStartIndex || pageEndIndex || 1);
        setIsFileSheetOpen(true);
    };

    const onGenerateFlashcardsSuccess = (data: IResponseFlashCardGenerate[]) => {
        setGeneratingFlashcards(data);
        dispatch(setIsSheetOpen(false));
        setIsNodeFlashcardsEditOpen?.(true);
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

                    <Reference
                        content={`${selectedNodeData.label} : ${selectedNodeData.description}`}
                        triggerClassName="item-center"
                        customerBodyComponents={[
                            {
                                type: EnumLearningMaterial.file,
                                component: ({ references }) => (
                                    <ReferenceDocumentViaPage
                                        references={references as IReturnItemFileReference[]}
                                        isEditing={isEditing}
                                        pageStartIndex={pageStartIndex}
                                        pageEndIndex={pageEndIndex}
                                        setPageStartIndex={setPageStartIndex}
                                        setPageEndIndex={setPageEndIndex}
                                        onChangePageStartIndex={onChangePageStartIndex}
                                        onChangePageEndIndex={onChangePageEndIndex}
                                    />
                                ),
                            },
                        ]}
                    />

                    <div className="border-t pt-4 space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground">Actions</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {mode === MODE_ACCESS_PAGE_ROLE.personal || role === UserRoleEnum.TEACHER ? (
                                <>
                                    <Button onClick={handleAddChild} variant="outline" className="justify-start gap-2">
                                        <DiamondPlus className="h-4 w-4" /> Add Child
                                    </Button>
                                </>
                            ) : null}

                            <div className="flex flex-col space-y-2 w-full">
                                <Button
                                    variant="outline"
                                    onClick={toggleExpand}
                                    className="w-full justify-between pr-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <Layers className="h-4 w-4" />
                                        <span>Flashcard Actions</span>
                                    </div>
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                </Button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="flex flex-col space-y-2 pl-4">
                                        {availableFlashcardActions.includes(FlashcardActionEnum.GENERATE) ? (
                                            <Generate
                                                type={METHOD_LEARNING.FLASHCARD}
                                                customContent={generatedContent}
                                                onSuccess={onGenerateFlashcardsSuccess}
                                            />
                                        ) : null}
                                        {availableFlashcardActions.includes(FlashcardActionEnum.BROWSE) ? (
                                            <Button
                                                onClick={handleViewFlashcards}
                                                variant="outline"
                                                className="justify-start gap-2"
                                            >
                                                <LayoutGrid className="h-4 w-4" /> Browse Linked Flashcards
                                            </Button>
                                        ) : null}
                                        {availableFlashcardActions.includes(FlashcardActionEnum.LEARNING) ? (
                                            <Button
                                                onClick={handleLearnFlashcardsClick}
                                                variant="outline"
                                                className="justify-start gap-2"
                                            >
                                                <GraduationCap className="h-4 w-4" /> Learn Linked Flashcards
                                            </Button>
                                        ) : null}
                                        {availableFlashcardActions.includes(FlashcardActionEnum.LINK) ? (
                                            <Button
                                                onClick={handleAddFlashcards}
                                                variant="outline"
                                                className="justify-start gap-2"
                                            >
                                                <CopyPlus className="h-4 w-4" /> Link Flashcards
                                            </Button>
                                        ) : null}
                                        {availableFlashcardActions.includes(FlashcardActionEnum.EDIT) ? (
                                            <Button
                                                onClick={handleEditFlashcards}
                                                variant="outline"
                                                className="justify-start gap-2"
                                            >
                                                <Edit className="h-4 w-4" /> Edit Linked Flashcards
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {mode === MODE_ACCESS_PAGE_ROLE.personal || role === UserRoleEnum.TEACHER ? (
                        <>
                            <div className="border-t pt-4">
                                <Button
                                    onClick={handleDeleteNode}
                                    variant="destructive"
                                    className="w-full justify-center gap-2"
                                >
                                    <Trash className="h-4 w-4" /> Delete Node
                                </Button>
                            </div>
                        </>
                    ) : null}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default NodeSheet;
