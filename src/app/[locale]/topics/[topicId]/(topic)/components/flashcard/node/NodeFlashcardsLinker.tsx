import React, { useCallback, useEffect, useState } from 'react';
import { useRequireFlashcards } from '../../../context/useRequireFlashcardContent';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import mindmapService from '../../../service/mindmap.service';
import usePost from '@/hooks/usePost';
import { ILinkFlashcardsToNodePayload, INodeFlashcards } from '@/types/mindmap/mindmap.type';
import toastHelper from '@/utils/toast.helper';
import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
import { IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';
import GenerateFlashcards from '../browse/GenerateFlashcards';
import { isListEmpty } from '@/utils';

interface Props {
    nodeId: string;
    onClose: () => void;
}

interface ILinkedFlashcard {
    flashcardId: number;
    isLinked: boolean;
}

export default function NodeFlashcardsLinker({ nodeId, onClose }: Props) {
    const tFlashcardCommon = useTranslations('flashcard.common');
    const { flashcards, setFlashcards } = useRequireFlashcards();
    const { setLearningFlashcards } = useTopicWorkspace();
    const [linkedFlashcards, setLinkedFlashcards] = useState<ILinkedFlashcard[]>([]);
    const [linkingFlashcards, setLinkingFlashcards] = useState<number[]>([]);
    const { nodes } = useMindMapContext();

    useEffect(() => {
        const linkedFlashcards: ILinkedFlashcard[] = flashcards
            .filter((card) => card.nodeId === nodeId)
            .map((card) => ({ flashcardId: card.flashcardId, isLinked: true }));
        setLinkedFlashcards(linkedFlashcards);
        setLinkingFlashcards([]);
    }, [nodeId, flashcards]);

    const { topicId } = useTopicWorkspace();
    const { execute: linkFlashcardsToNodeAsync, loading: linkFlashcardsToNodeLoading } = usePost<
        ILinkFlashcardsToNodePayload,
        { flashcardId: number; nodeId: string | null }[]
    >(mindmapService.linkFlashcardsToNode, 'PUT', {
        onSuccess(data) {
            toastHelper.showSuccessMessage('Link flashcards to node successfully');
            setLinkingFlashcards([]);
            setFlashcards((prev) => {
                if (!prev) return prev;
                return prev.map((card) => {
                    const foundCard = data.find((e) => e.flashcardId === card.flashcardId);
                    if (!foundCard) return card;
                    return { ...card, nodeId: foundCard.nodeId };
                });
            });
            setLearningFlashcards((prev) => {
                if (!prev) return prev;
                return prev.map((card) => {
                    const foundCard = data.find((e) => e.flashcardId === card.flashcardId);
                    if (!foundCard) return card;
                    return { ...card, nodeId: foundCard.nodeId };
                });
            });
        },
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
    });

    function onCheckedChange({ checked, flashcardId }: { checked: CheckedState; flashcardId: number }) {
        if (checked === 'indeterminate') return;
        if (linkedFlashcards.find((card) => card.flashcardId === flashcardId) !== undefined) {
            setLinkedFlashcards((prev) => {
                return prev.map((card) => {
                    if (card.flashcardId !== flashcardId) return card;
                    return { ...card, isLinked: checked };
                });
            });
        } else {
            if (checked) {
                setLinkingFlashcards((prev) => [...prev, flashcardId]);
            } else {
                setLinkingFlashcards((prev) => prev.filter((id) => id !== flashcardId));
            }
        }
    }

    const isChecked = useCallback(
        ({ flashcardId }: { flashcardId: number }) => {
            const linkedCard = linkedFlashcards.find((card) => card.flashcardId === flashcardId);
            return (linkedCard !== undefined && linkedCard.isLinked) || linkingFlashcards.includes(flashcardId);
        },
        [linkedFlashcards, linkingFlashcards],
    );

    async function handleSaveClick() {
        const unlinkedFlashcards: number[] = linkedFlashcards
            .filter((card) => card.isLinked === false)
            .map((card) => card.flashcardId);
        await linkFlashcardsToNodeAsync({ topicId, nodeId, linkedFlashcards: linkingFlashcards, unlinkedFlashcards });
    }

    function getNodeLabel(flashcard: IFlashcard): string {
        if (!flashcard.nodeId) return '';
        const node = nodes.find((node) => node.data.nodeId === flashcard.nodeId);
        return node === undefined ? '' : node.data.label;
    }

    if (isListEmpty(flashcards)) {
        return <GenerateFlashcards message="There is no flashcard in this topic. Let's generate some." />;
    }

    return (
        <div className="flex flex-col">
            <div className="sticky top-0 z-50 w-full bg-background border-b shadow-sm">
                <div className="flex justify-end items-center px-[4rem] py-4">
                    <div className="flex flex-row items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSaveClick}
                            disabled={linkFlashcardsToNodeLoading}
                            className="text-muted-foreground hover:text-primary"
                        >
                            {linkFlashcardsToNodeLoading ? (
                                <span className="flex items-center">
                                    <RefreshCw size={18} className="animate-spin" />
                                </span>
                            ) : (
                                <Save size={18} />
                            )}
                        </Button>
                        <Button
                            className="text-muted-foreground hover:text-primary"
                            size="icon"
                            variant="ghost"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <ScrollArea>
                <div className="px-[4rem] py-7 bg-background">
                    <div className="mt-7 flex flex-col gap-6 bg-background">
                        {flashcards.map((flashcard, index) => {
                            const nodeLabel = getNodeLabel(flashcard);
                            return (
                                <div
                                    key={flashcard.flashcardId}
                                    className="rounded-xl border shadow-sm p-6 flex flex-col bg-muted/60 dark:bg-muted/40 text-card-foreground"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-muted-foreground select-none">
                                                {index + 1}
                                            </span>
                                            {nodeLabel ? (
                                                <span className="text-sm text-muted-foreground">({nodeLabel})</span>
                                            ) : null}
                                        </div>

                                        <Checkbox
                                            id={`link-${flashcard.flashcardId}`}
                                            checked={isChecked({ flashcardId: flashcard.flashcardId })}
                                            onCheckedChange={(checked) =>
                                                onCheckedChange({ checked, flashcardId: flashcard.flashcardId })
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor={`front-${flashcard.flashcardId}`} className="font-semibold">
                                                {tFlashcardCommon('front')}
                                            </Label>
                                            <Textarea
                                                id={`front-${flashcard.flashcardId}`}
                                                disabled
                                                placeholder={tFlashcardCommon('front')}
                                                className="
                                                    resize-none min-h-[70px]
                                                    bg-input dark:bg-muted
                                                    border border-border
                                                    focus-visible:ring-1 focus-visible:ring-primary/60
                                                    rounded-lg
                                                    text-card-foreground
                                                    placeholder:text-muted-foreground/60
                                            "
                                                value={flashcard.front}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor={`back-${flashcard.flashcardId}`} className="font-semibold">
                                                {tFlashcardCommon('back')}
                                            </Label>
                                            <Textarea
                                                id={`back-${flashcard.flashcardId}`}
                                                disabled
                                                placeholder={tFlashcardCommon('back')}
                                                className="
                                                    resize-none min-h-[70px]
                                                    bg-input dark:bg-muted
                                                    border border-border
                                                    focus-visible:ring-1 focus-visible:ring-primary/60
                                                    rounded-lg
                                                    text-card-foreground
                                                    placeholder:text-muted-foreground/60
                                            "
                                                value={flashcard.back}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
