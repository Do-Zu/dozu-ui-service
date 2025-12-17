import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { closeSheet } from '@/stores/features/mindmap/selectedNodeSlice';
import { useAppSelector } from '@/stores/hooks';
import { useReactFlow } from '@xyflow/react';
import {
    ChevronDown,
    CopyPlus,
    DiamondPlus,
    Edit,
    GraduationCap,
    Layers,
    LayoutGrid,
    SquarePen,
    Trash,
    X,
    HelpCircle,
    Save,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppEdge, AppNode } from '../../../../../../../../types/mindmap/mindmap.type';
import { addChildNode, changeNodeLabel, deleteNode } from '../../../../../../../../utils/mindmap/mindmapUtils';
import Reference from '../../reference/Reference';
import { UserRoleEnum } from '@/utils/constants/roles';
import { EnumLearningMaterial, IReturnItemFileReference } from '../../../types';
import ReferenceDocumentViaPage from '../../../../../../mindmap/components/ReferenceDocumentViaPage';
import { isNullOrEmpty, toNumber } from '@/utils';
import Generate from '../../generate/Generate';
import { METHOD_LEARNING } from '@/utils/constants/method';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { IResponseFlashCardGenerate } from '../../../hooks/useFlashCardWorkSpace';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { IStartGenerateFn } from '../../../types/generate.type';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ReferenceEdit from '../../flashcard/node/reference/ReferenceEdit';
import DefaultGenerateButton from '../../generate/DefaultGenerateButton';
import toastHelper from '@/utils/toast.helper';
import useMultiNodeFlashcardsGenerate from '../../../hooks/useMultiNodeFlashcardsGenerate';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import DataStatus from '@/components/errors/DataStatus';

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

const NodeDetails = ({
    onViewNodeFlashcardsClick,
    onLinkNodeFlashcardsClick,
    onLearnNodeFlashcardsClick,
    onEditNodeFlashcardsClick,
    setIsNodeFlashcardsEditOpen,
    mode,
    role = UserRoleEnum.TEACHER,
}: Props) => {
    const router = useRouter();

    const { screenToFlowPosition, getNodes, getEdges, setNodes, setEdges, fitView } = useReactFlow<AppNode, AppEdge>();
    const nodes = getNodes();
    const edges = getEdges();

    const selectedNodeData = useAppSelector((state) => state.selectedNodeSlice.selectedNodeData);
    const [isEditing, setIsEditing] = useState(false);
    const [newLabel, setNewLabel] = useState(selectedNodeData?.label || '');
    const [newDescription, setNewDescription] = useState(selectedNodeData?.description || '');

    // learning material section, handling pdf & youtube input set
    const { learningMaterial } = useTopicWorkspace();

    // pdf material states
    const [pageStartIndex, setPageStartIndex] = useState<number | undefined>();
    const [pageEndIndex, setPageEndIndex] = useState<number | undefined>();

    // youtube material states
    const [startSegment, setStartSegment] = useState<number | undefined>();
    const [endSegment, setEndSegment] = useState<number | undefined>();

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);
    const availableFlashcardActions: FlashcardActionType[] = useMemo(() => {
        if (role === UserRoleEnum.TEACHER || mode === MODE_ACCESS_PAGE_ROLE.personal) return flashcardActionsTypes;
        if (role === UserRoleEnum.USER) return [FlashcardActionEnum.BROWSE, FlashcardActionEnum.LEARNING];
        return [];
    }, [mode, role]);

    const { setGeneratingFlashcards, setIsLearningContentFullscreen, setPageNumber, seekTo } = useTopicWorkspace();
    const { prepareGeneratedData, onHandleBeforeGenerate } = useMultiNodeFlashcardsGenerate({
        nodes,
        nodeIds: selectedNodeData ? [selectedNodeData.nodeId] : [],
    });

    useEffect(() => {
        // pdf logic
        const pageStartIndex =
            learningMaterial?.type === EnumLearningMaterial.file ? selectedNodeData?.pageStartIndex : undefined;
        const pageEndIndex =
            learningMaterial?.type === EnumLearningMaterial.file ? selectedNodeData?.pageEndIndex : undefined;
        setPageStartIndex(pageStartIndex);
        setPageEndIndex(pageEndIndex);

        // youtube logic
        const startSegment =
            learningMaterial?.type === EnumLearningMaterial.youtube ? selectedNodeData?.startSegment : undefined;
        const endSegment =
            learningMaterial?.type === EnumLearningMaterial.youtube ? selectedNodeData?.endSegment : undefined;

        setStartSegment(startSegment);
        setEndSegment(endSegment);
    }, [selectedNodeData, learningMaterial?.type]);

    const dispatch = useDispatch();

    function closePanel() {
        dispatch(closeSheet());
    }

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
            closePanel();
        }
    };

    if (!selectedNodeData) {
        return <DataStatus variant="empty" title="Node not found." />;
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
                startSegment,
                endSegment,
            });
            closePanel();
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
            return;
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
            return;
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
        closePanel();
    };

    const handleAddFlashcards = () => {
        if (onLinkNodeFlashcardsClick) {
            onLinkNodeFlashcardsClick();
            return;
        }
        router.push(`/mindmap/add-flashcard?topicId=${selectedNodeData.topicId}&nodeId=${selectedNodeData.nodeId}`);
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

    const onGenerateFlashcardsSuccess = (data: IResponseFlashCardGenerate[]) => {
        setGeneratingFlashcards(data);
        closePanel();
        setIsNodeFlashcardsEditOpen?.(true);
    };

    function handleStartSegmentChange(value: string) {
        const seconds = parseInt(value);
        if (Number.isNaN(seconds)) {
            setStartSegment(undefined);
            return;
        }
        setStartSegment(seconds);
    }

    function handleEndSegmentChange(value: string) {
        const seconds = parseInt(value);
        if (Number.isNaN(seconds)) {
            setEndSegment(undefined);
            return;
        }
        setEndSegment(seconds);
    }

    function handlePageClick(page: number | undefined) {
        if (page === undefined) return;
        setIsLearningContentFullscreen(false);
        requestAnimationFrame(() => {
            setPageNumber(page);
        });
    }

    function handleSegmentClick(segment: number | undefined) {
        if (segment === undefined) return;
        setIsLearningContentFullscreen(false);
        seekTo(segment);
    }

    async function onGenerateClick(startGenerate: IStartGenerateFn) {
        try {
            const { content, customOptions } = await prepareGeneratedData();
            startGenerate(content, customOptions);
        } catch (err) {
            toastHelper.showErrorMessage(err);
        }
    }

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="border-b">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <Input value={newLabel} onChange={onChangeNewLabel} placeholder="Enter node title" />
                        ) : (
                            <h2 className="text-lg font-semibold truncate">{selectedNodeData?.label}</h2>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={handleEditTitle}>
                            {isEditing ? <Save className="h-4 w-4" /> : <SquarePen className="h-4 w-4" />}
                        </Button>

                        <Button
                            className="text-muted-foreground hover:text-primary"
                            size="icon"
                            variant="ghost"
                            onClick={closePanel}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex-1 overflow-y-auto pr-2 space-y-5 mt-2">
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
                                        isEditing={false}
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

                    <div className="space-y-2 pt-1 px-1 border-t">
                        <div className="flex items-center gap-1 mt-2">
                            <Label className="text-sm font-semibold">Customize Document Range</Label>

                            <TooltipProvider>
                                <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs text-sm">
                                        <p className="font-medium">
                                            Define the range used to generate flashcards and other content for this
                                            node.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {learningMaterial?.type === EnumLearningMaterial.file ? (
                            <ReferenceEdit
                                type="pdf"
                                isEditing={isEditing}
                                pageStartIndex={pageStartIndex}
                                onPageStartIndexChange={onChangePageStartIndex}
                                pageEndIndex={pageEndIndex}
                                onPageEndIndexChange={onChangePageEndIndex}
                                onPageClick={handlePageClick}
                            />
                        ) : null}

                        {learningMaterial?.type === EnumLearningMaterial.youtube ? (
                            <ReferenceEdit
                                type="youtube"
                                isEditing={isEditing}
                                segments={learningMaterial.content}
                                startSegment={startSegment}
                                onStartSegmentChange={handleStartSegmentChange}
                                endSegment={endSegment}
                                onEndSegmentChange={handleEndSegmentChange}
                                onSegmentClick={handleSegmentClick}
                            />
                        ) : null}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground">Actions</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {mode === MODE_ACCESS_PAGE_ROLE.personal || role === UserRoleEnum.TEACHER ? (
                                <Button onClick={handleAddChild} variant="outline" className="justify-start gap-2">
                                    <DiamondPlus className="h-4 w-4" /> Add Child
                                </Button>
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
                                                onSuccess={onGenerateFlashcardsSuccess}
                                                onHandleBeforeGenerate={onHandleBeforeGenerate}
                                                trigger={(startGenerate) => (
                                                    <DefaultGenerateButton
                                                        onClick={() => onGenerateClick(startGenerate)}
                                                    />
                                                )}
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
                        <div className="border-t pt-4">
                            <Button
                                onClick={handleDeleteNode}
                                variant="destructive"
                                className="w-full justify-center gap-2"
                            >
                                <Trash className="h-4 w-4" /> Delete Node
                            </Button>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
};

export default NodeDetails;
