import React, { useEffect, useState } from 'react';
import { IGenerateNodeFlashcardsItem } from '../../../types/generate.type';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save, Trash2, Undo2, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { flashcardItemGap, flashcardItemHeight, IEditingFlashcard } from '../edit/FlashcardsEdit';
import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import usePost from '@/hooks/usePost';
import flashcardService from '@/services/flashcard/flashcard.service';
import toastHelper from '@/utils/toast.helper';
import {
    ICreateFlashcardsForTopicPayload,
    IFlashcard,
    InsertFlashcardsBody,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';

interface MultiNodeEditingFlashcard {
    nodeId: string;
    editingFlashcards: IEditingFlashcard[];
}

interface Props {
    generatedNodeFlashcards: IGenerateNodeFlashcardsItem[];
    onClose?: () => void;
}

// handle logic view & edit & save flashcards of multiple nodes here
// !todo: handle set generatedNodeFlashcards to null if success
export default function MultiNodeFlashcardsPreview({ generatedNodeFlashcards, onClose }: Props) {
    const tFlashcardCommon = useTranslations('flashcard.common');
    const { topicId, onCreateFlashcardsSuccess } = useTopicWorkspace();
    const { nodes } = useMindMapContext();
    const [editingFlashcards, setEditingFlashcards] = useState<MultiNodeEditingFlashcard[]>([]);

    useEffect(() => {
        const result: MultiNodeEditingFlashcard[] = [];
        for (let i = 0; i < generatedNodeFlashcards.length; ++i) {
            const flashcardSet = generatedNodeFlashcards[i];
            const editingFlashcards: IEditingFlashcard[] = flashcardSet.flashcards.map((card, index) => ({
                id: index,
                front: card.q,
                back: card.a,
            }));
            const nodeEditingFlashcardSet: MultiNodeEditingFlashcard = {
                nodeId: flashcardSet.nodeId,
                editingFlashcards,
            };
            result.push(nodeEditingFlashcardSet);
        }
        setEditingFlashcards(result);
    }, [generatedNodeFlashcards]);

    const { loading, execute } = usePost<ICreateFlashcardsForTopicPayload, IFlashcard[]>(
        flashcardService.createFlashcardsForTopic,
        'POST',
        {
            onError(error) {
                toastHelper.showErrorMessage(error);
            },
            onSuccess(data) {
                toastHelper.showSuccessMessage('Create flashcards successfully.');
                onCreateFlashcardsSuccess(data);
                onClose?.();
            },
        },
    );

    function getNodeLabel(nodeId: string): string {
        const node = nodes.find((node) => node.data.nodeId === nodeId);
        return node === undefined ? '' : node.data.label;
    }

    async function onSaveClick() {
        const flashcardsInput: InsertFlashcardsBody = [];
        for (const nodeGroup of editingFlashcards) {
            const flashcardSet = nodeGroup.editingFlashcards.map((item) => {
                return { nodeId: nodeGroup.nodeId, front: item.front, back: item.back };
            });
            flashcardsInput.push(...flashcardSet);
        }
        await execute({ topicId, flashcards: flashcardsInput });
    }

    function handleFlashcardDeleteClick(nodeId: string, flashcardId: number) {
        setEditingFlashcards((prev) => {
            return prev.map((item) => {
                if (item.nodeId !== nodeId) return item;
                return {
                    ...item,
                    editingFlashcards: item.editingFlashcards.filter((e) => e.id !== flashcardId),
                };
            });
        });
    }

    function handleFlashcardInputChange(
        side: 'front' | 'back',
        value: string,
        { nodeId, flashcardId }: { nodeId: string; flashcardId: number },
    ) {
        setEditingFlashcards((prev) => {
            return prev.map((item) => {
                if (item.nodeId !== nodeId) return item;
                const result = item.editingFlashcards.map((e) => {
                    if (e.id !== flashcardId) return e;
                    return { ...e, [side]: value };
                });
                return {
                    ...item,
                    editingFlashcards: result,
                };
            });
        });
    }

    return (
        <div className="h-full flex flex-col">
            <div className="sticky top-0 z-50 w-full bg-background border-b shadow-sm">
                <div className="flex justify-end items-center px-[4rem] py-4">
                    <div className="flex w-full items-center justify-between">
                        <div className="flex w-full flex-row items-center gap-4 justify-end">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onSaveClick}
                                disabled={loading}
                                className="text-muted-foreground hover:text-primary"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <RefreshCw size={18} className="animate-spin" />
                                    </span>
                                ) : (
                                    <Save size={18} />
                                )}
                            </Button>

                            {onClose ? (
                                <Button
                                    className="text-muted-foreground hover:text-primary"
                                    size="icon"
                                    variant="ghost"
                                    onClick={onClose}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-full overflow-y-auto pb-8">
                <div className="px-[4rem] py-7 bg-background">
                    <div className="mt-7 flex flex-col bg-background">
                        {editingFlashcards?.map((group, groupIndex) => (
                            <div key={group.nodeId} className="flex flex-col gap-6">
                                {/* --- Node Label Header --- */}
                                <div className="text-lg font-semibold text-card-foreground">
                                    {getNodeLabel(group.nodeId) || `Node ${group.nodeId}`}
                                </div>

                                {/* --- Flashcards in this Node Group --- */}
                                {group.editingFlashcards.map((flashcard, index) => (
                                    <div
                                        key={`${group.nodeId}-${flashcard.id}`}
                                        className="rounded-xl border shadow-sm p-6 flex flex-col bg-muted/60 dark:bg-muted/40 text-card-foreground"
                                        style={{ height: flashcardItemHeight, marginBottom: flashcardItemGap }}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl font-bold text-muted-foreground select-none">
                                                    {index + 1}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleFlashcardDeleteClick(group.nodeId, flashcard.id)
                                                    }
                                                    className="text-muted-foreground hover:text-red-500 dark:hover:text-red-600 hover:border-destructive/50"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-2">
                                                <Label
                                                    htmlFor={`front-${group.nodeId}-${flashcard.id}`}
                                                    className="font-semibold"
                                                >
                                                    {tFlashcardCommon('front')}
                                                </Label>

                                                <Textarea
                                                    id={`front-${group.nodeId}-${flashcard.id}`}
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
                                                    onChange={(event) =>
                                                        handleFlashcardInputChange('front', event.target.value, {
                                                            nodeId: group.nodeId,
                                                            flashcardId: flashcard.id,
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Label
                                                    htmlFor={`back-${group.nodeId}-${flashcard.id}`}
                                                    className="font-semibold"
                                                >
                                                    {tFlashcardCommon('back')}
                                                </Label>

                                                <Textarea
                                                    id={`back-${group.nodeId}-${flashcard.id}`}
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
                                                    onChange={(event) =>
                                                        handleFlashcardInputChange('back', event.target.value, {
                                                            nodeId: group.nodeId,
                                                            flashcardId: flashcard.id,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Separator between node groups */}
                                {groupIndex !== editingFlashcards.length - 1 && <Separator className="my-8" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
