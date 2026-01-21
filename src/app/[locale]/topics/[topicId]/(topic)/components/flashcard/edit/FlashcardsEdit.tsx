'use client';

import { Textarea } from '@/components/ui/textarea';
import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { Edit, FileSearch, ImagePlus, Import, Plus, RefreshCw, Save, Sparkles, Trash2, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import usePost from '@/hooks/usePost';
import flashcardService from '@/services/flashcard/flashcard.service';
import toastHelper from '@/utils/toast.helper';
import { useGenerateFromExisting } from '@/app/[locale]/generate/hooks/useGenerateFromExisting';
import { buildContentFromFlashcardsForQuiz } from '@/app/[locale]/question/utils/buildGenPayload';
import ContentGenerationPreview from '@/app/[locale]/generate/components/ContentGenerationPreview';
import { useContentGeneration } from '@/app/[locale]/generate/hooks/useContentGeneration';
import { CONTENT_TYPE_GENERATE } from '@/app/[locale]/generate/types';
import { handleConvertToQuestionsSubmitted } from '@/app/[locale]/question/utils/handleConvertToQuestionsSubmitted';
import { postRequest } from '@/api/api';
import {
    IFlashcardCreateInput,
    IFlashcardsBatchInput,
    IFlashcardUpdateInput,
    IImageSaveInput,
    IFlashcard,
    IDueAnkiCard,
    IUnspashImage,
} from '@/app/[locale]/flashcards/types/flashcard.type';
import { IFlashcardPreview } from '@/app/[locale]/topics/[topicId]/(topic)/components/flashcard/import/FlashcardPreview';
import FlashcardImportModal from '@/app/[locale]/topics/[topicId]/(topic)/components/flashcard/import/FlashcardImportModal';
import { useRequireTopic } from '../../../context/useRequireTopic';
import { Label } from '@/components/ui/label';
import DataStatus from '@/components/errors/DataStatus';
import flashcardUtils, { initialFlashcardsCount } from '../../../utils/flashcard.utils';
import { IResponseFlashCardGenerate } from '../../../hooks/useFlashCardWorkSpace';
import EditImageModal from '../flashcard-image/EditImageModal';
import FlashcardDetailsModal from '../FlashcardDetailsModal';
import flashcardEditUtils from '../../../utils/flashcard/flashcardEdit.utils';
import { isListEmpty } from '@/utils';
import FlashcardsPanelControls from '../node/FlashcardsPanelControls';

export interface ILocalFlashcard {
    id: number;
    front: string;
    back: string;
    imageUrl?: string | null; // current imageUrl
    thumb?: string; // thumb url for displaying image temporarily if user don't save
    image?: IImageSaveInput; // image to save later
}

interface IFlashcardServer {
    flashcardId: number;
    topicId: number;
    isUpdated: boolean;
    isDeleted: boolean;
}

export interface IEditingFlashcard extends ILocalFlashcard {
    serverInfo?: IFlashcardServer;
}

export const flashcardItemHeight = 300;
export const flashcardItemGap = 20;

interface Props {
    flashcards: IFlashcard[]; // flashcards of node or topic
    generatingFlashcards: IResponseFlashCardGenerate[] | null;
    isSaving: boolean;
    onSaveClick: (editingFlashcards: IEditingFlashcard[]) => void;
    emptyComponent?: React.ReactNode;
    generateComponent?: React.ReactNode;
    onClose?: () => void;
    isPanelFullscreen?: boolean;
    onPanelToggle?: () => void;
    label?: string;
}

export default function FlashcardsEdit({
    flashcards,
    generatingFlashcards,
    isSaving,
    onSaveClick,
    emptyComponent,
    generateComponent,
    onClose,
    isPanelFullscreen,
    onPanelToggle,
    label,
}: Props) {
    const tCommon = useTranslations('common');
    const tFlashcardCommon = useTranslations('flashcard.common');
    const tFlashcardEdit = useTranslations('flashcard.edit');
    const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
    const [isAddImageModalOpen, setIsAddImageModalOpen] = useState<boolean>(false); // add image modal
    const [selectingFlashcard, setSelectingFlashcard] = useState<ILocalFlashcard | null>();
    const { regenerate, previewOpen, setPreviewOpen, sseData, sseStatus, loading } = useGenerateFromExisting();
    const { contentType, dataGenerated, setDataGenerated, isContentReady } = useContentGeneration({
        sseData,
        sseStatus,
    });

    const { topic } = useRequireTopic();
    const [editingFlashcards, setEditingFlashcards] = useState<IEditingFlashcard[]>([]);
    const ref = useRef<HTMLDivElement>(null);

    const [isFlashcardDetailsModalOpen, setIsFlashcardDetailsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        let editingFlashcards = flashcardUtils.convertToEditingFlashcards(flashcards);
        let firstGeneratingFlashcardIndex: number | null = null;
        if (generatingFlashcards && generatingFlashcards.length > 0) {
            firstGeneratingFlashcardIndex = editingFlashcards.length;
            const lastId = editingFlashcards.length === 0 ? -1 : editingFlashcards[editingFlashcards.length - 1].id;
            const result = generatingFlashcards.map((card, index) => ({
                id: lastId + index + 1,
                front: card.q,
                back: card.a,
            }));

            editingFlashcards = editingFlashcards.concat(result);
        }
        if (editingFlashcards.length === 0) {
            editingFlashcards = flashcardUtils.createInitialFlashcards(initialFlashcardsCount);
        }
        requestAnimationFrame(() => {
            if (ref.current && firstGeneratingFlashcardIndex !== null) {
                const scrollTo = (flashcardItemHeight + flashcardItemGap) * firstGeneratingFlashcardIndex;
                ref.current.scrollTo({ top: scrollTo, behavior: 'smooth' });
            }
        });
        setEditingFlashcards(editingFlashcards);
    }, [flashcards, generatingFlashcards]);

    function handleFlashcardChange({
        event,
        side,
        index,
    }: {
        event: ChangeEvent<HTMLTextAreaElement>;
        side: 'front' | 'back';
        index: number;
    }) {
        const value = event.target.value;
        setEditingFlashcards((prev) => {
            if (index < 0 || index >= prev.length) return prev;
            const currentFlashcard = prev[index];
            const type = flashcardUtils.getFlashcardType(currentFlashcard);
            const newFlashcards = prev.map((e, i) => {
                if (index !== i) return e;
                if (type === 'client') return { ...e, [side]: value };
                if (type === 'server' && e.serverInfo)
                    return { ...e, serverInfo: { ...e.serverInfo, isUpdated: true, isDeleted: false }, [side]: value };
                return e;
            });
            return newFlashcards;
        });
    }

    function handleAddBelowClick() {
        setEditingFlashcards((prev) => {
            const result = [...prev];
            const lastId = prev.length === 0 ? -1 : prev[prev.length - 1].id;
            result.push(flashcardUtils.createInitialFlashcard(lastId + 1));
            return result;
        });
    }

    function handleFlashcardDeleteClick(index: number) {
        setEditingFlashcards((prev) => {
            if (index < 0 || index >= prev.length) return prev;
            const currentFlashcard = prev[index];
            const type = flashcardUtils.getFlashcardType(currentFlashcard);
            if (type === 'client') {
                return prev.filter((e, i) => i !== index);
            }
            return prev.map((e, i) => {
                return i === index && e.serverInfo ? { ...e, serverInfo: { ...e.serverInfo, isDeleted: true } } : e;
            });
        });
    }

    function handleUndoDelete(index: number) {
        setEditingFlashcards((prev) => {
            return prev.map((e, i) => {
                if (i !== index || !e.serverInfo) return e;
                return { ...e, serverInfo: { ...e.serverInfo, isDeleted: false } };
            });
        });
    }

    function handleAddFlashcardsImported(flashcardsImported: IFlashcardPreview[]) {
        const newFlashcards = [...editingFlashcards];
        let firstIndex = newFlashcards.length - 1;
        for (; firstIndex >= 0; --firstIndex) {
            if (newFlashcards[firstIndex].front === '' && newFlashcards[firstIndex].back === '') {
                newFlashcards.pop();
            } else {
                break;
            }
        }
        const lastId = newFlashcards.length === 0 ? -1 : newFlashcards[newFlashcards.length - 1].id;
        let startId = lastId + 1;
        for (const card of flashcardsImported) {
            const { front, back } = card;
            newFlashcards.push({ id: startId, front, back });
            ++startId;
        }
        setEditingFlashcards(newFlashcards);
        setIsImportModalOpen(false);
    }

    function handleImportModalOpen() {
        setIsImportModalOpen(true);
    }

    function handleAddImageModalOpen(card: ILocalFlashcard) {
        setIsAddImageModalOpen(true);
        setSelectingFlashcard(card);
    }

    function handleFlashcardDetailsModalOpen(card: ILocalFlashcard) {
        setIsFlashcardDetailsModalOpen(true);
        setSelectingFlashcard(card);
    }

    function handleSaveImageClick({ flashcard, image }: { flashcard: ILocalFlashcard; image: IUnspashImage }) {
        const imageSaveInput = {
            id: image.id,
            url: image.url.small,
            downloadLocation: image.links.download_location,
        };
        toastHelper.showSuccessMessage('Insert image into card successfully');
        setEditingFlashcards((prev) => {
            return prev.map((editingFlashcard) => {
                return editingFlashcard.id === flashcard.id
                    ? {
                          ...editingFlashcard,
                          serverInfo: editingFlashcard.serverInfo
                              ? { ...editingFlashcard.serverInfo, isUpdated: true, isDeleted: false }
                              : undefined,
                          image: { type: 'unsplash', data: imageSaveInput },
                          thumb: image.url.thumb,
                      }
                    : editingFlashcard;
            });
        });
        setIsAddImageModalOpen(false);
    }

    function handleUploadImageSuccess({ flashcard, imageUrl }: { flashcard: ILocalFlashcard; imageUrl: string }) {
        setEditingFlashcards((prev) => {
            return prev.map((editingFlashcard) => {
                return editingFlashcard.id === flashcard.id
                    ? {
                          ...editingFlashcard,
                          serverInfo: editingFlashcard.serverInfo
                              ? { ...editingFlashcard.serverInfo, isUpdated: true, isDeleted: false }
                              : undefined,
                          image: { type: 'upload', data: imageUrl },
                          thumb: undefined,
                      }
                    : editingFlashcard;
            });
        });
        setIsAddImageModalOpen(false);
    }

    function getUsableFlashcardsForGen(cards: IEditingFlashcard[]) {
        return cards.filter((c) => !c.serverInfo?.isDeleted && c.front.trim() !== '' && c.back.trim() !== '');
    }

    function hasAnyValidFlashcard(cards: IEditingFlashcard[]) {
        return getUsableFlashcardsForGen(cards).length > 0;
    }

    const handleSaveGeneratedToThisTopic = async () => {
        if (!topic) return;
        if (!dataGenerated) {
            toast({ description: 'No data to save', variant: 'destructive' });
            return;
        }

        if (contentType === CONTENT_TYPE_GENERATE.QUIZ) {
            const batchQuestions = handleConvertToQuestionsSubmitted(dataGenerated as any);
            if (!batchQuestions) {
                toast({ description: 'There are no valid questions to save.', variant: 'destructive' });
                return;
            }
            await postRequest(`/questions/batch?topicId=${topic.topicId}`, batchQuestions);
            toast({ description: 'Saved Questions to topic', variant: 'default' });
        }
    };

    const canSaveGenerated =
        contentType === CONTENT_TYPE_GENERATE.QUIZ && Array.isArray(dataGenerated) && dataGenerated.length > 0;

    if (previewOpen) {
        return (
            <div className="min-h-screen bg-muted px-16 py-7">
                <ContentGenerationPreview
                    shouldCreateTopic={false}
                    shouldCreateFeed={false}
                    sseData={sseData}
                    dataGenerated={dataGenerated}
                    setDataGenerated={setDataGenerated}
                    onSave={handleSaveGeneratedToThisTopic}
                />
                <div className="mt-4 flex gap-3">
                    <Button onClick={handleSaveGeneratedToThisTopic} disabled={!canSaveGenerated}>
                        Save to this topic
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setPreviewOpen(false);
                            setDataGenerated(null);
                        }}
                    >
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    if (isListEmpty(editingFlashcards)) {
        return emptyComponent ? <>{emptyComponent}</> : <DataStatus variant="empty" />;
    }

    return (
        <div className="flex h-full flex-col">
            <div className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
                <div className="flex items-center justify-end px-16 pt-4">
                    <div className="flex w-full items-center justify-between">
                        {generateComponent ? (
                            <div className="flex flex-row items-center gap-4">{generateComponent}</div>
                        ) : null}

                        <div className="flex flex-row items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleImportModalOpen}
                                className="text-muted-foreground hover:text-primary"
                            >
                                <Import size={18} />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onSaveClick(editingFlashcards)}
                                disabled={isSaving}
                                className="text-muted-foreground hover:text-primary"
                            >
                                {isSaving ? (
                                    <span className="flex items-center">
                                        <RefreshCw size={18} className="animate-spin" />
                                    </span>
                                ) : (
                                    <Save size={18} />
                                )}
                            </Button>

                            <FlashcardsPanelControls
                                onClose={onClose}
                                isFullscreen={isPanelFullscreen}
                                onPanelToggle={onPanelToggle}
                            />
                        </div>
                    </div>
                </div>

                {label ? (
                    <div className="flex w-full justify-center px-16 pb-4">
                        <div className="w-full max-w-xl text-center">
                            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                                {label}
                            </span>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="h-full overflow-y-auto pb-8" ref={ref}>
                <div className="bg-background px-16 py-7">
                    <div className="mt-7 flex flex-col bg-background">
                        {editingFlashcards?.map((flashcard, index) => {
                            if (flashcardEditUtils.isFlashcardDeleted(flashcard))
                                return (
                                    <div
                                        key={flashcard.id}
                                        className="flex items-center justify-between rounded-xl border border-dashed bg-card/50 p-4 text-card-foreground shadow-sm"
                                    >
                                        <span className="select-none text-lg font-bold text-muted-foreground/80">
                                            {index + 1}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleUndoDelete(index)}
                                            className="font-semibold text-muted-foreground hover:text-primary"
                                        >
                                            <Undo2 size={16} className="mr-2" />
                                            Undo
                                        </Button>
                                    </div>
                                );

                            return (
                                <div
                                    key={flashcard.id}
                                    className="flex flex-col rounded-xl border bg-muted/60 p-6 text-card-foreground shadow-sm dark:bg-muted/40"
                                    style={{ height: flashcardItemHeight, marginBottom: flashcardItemGap }}
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-baseline gap-2">
                                            <span className="select-none text-xl font-bold text-muted-foreground">
                                                {index + 1}
                                            </span>
                                            {flashcard.serverInfo?.isUpdated &&
                                            flashcardEditUtils.isFlashcardEditing(flashcards, flashcard) ? (
                                                <span className="text-sm text-muted-foreground">(editing)</span>
                                            ) : null}
                                            {flashcardEditUtils.isFlashcardNew(flashcard) ? (
                                                <span className="text-sm text-muted-foreground">(new)</span>
                                            ) : null}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleFlashcardDetailsModalOpen(flashcard)}
                                                className="text-muted-foreground hover:border-primary/50 hover:text-primary"
                                            >
                                                <FileSearch size={18} />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleAddImageModalOpen(flashcard)}
                                                className="text-muted-foreground hover:border-primary/50 hover:text-primary"
                                            >
                                                <ImagePlus size={18} />
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleFlashcardDeleteClick(index)}
                                                className="text-muted-foreground hover:border-destructive/50 hover:text-red-500 dark:hover:text-red-600"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor={`front-${flashcard.id}`} className="font-semibold">
                                                {tFlashcardCommon('front')}
                                            </Label>
                                            <Textarea
                                                id={`front-${flashcard.id}`}
                                                placeholder={tFlashcardCommon('front')}
                                                className="
                                                min-h-[70px] resize-none
                                                rounded-lg border
                                                border-border bg-input
                                                text-card-foreground placeholder:text-muted-foreground/60
                                                focus-visible:ring-1
                                                focus-visible:ring-primary/60
                                                dark:bg-muted
                                        "
                                                value={flashcard.front}
                                                onChange={(event) =>
                                                    handleFlashcardChange({ event, side: 'front', index })
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor={`back-${flashcard.id}`} className="font-semibold">
                                                {tFlashcardCommon('back')}
                                            </Label>
                                            <Textarea
                                                id={`back-${flashcard.id}`}
                                                placeholder={tFlashcardCommon('back')}
                                                className="
                                                min-h-[70px] resize-none
                                                rounded-lg border
                                                border-border bg-input
                                                text-card-foreground placeholder:text-muted-foreground/60
                                                focus-visible:ring-1
                                                focus-visible:ring-primary/60
                                                dark:bg-muted
                                        "
                                                value={flashcard.back}
                                                onChange={(event) =>
                                                    handleFlashcardChange({ event, side: 'back', index })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="mt-2">
                            <Button
                                onClick={handleAddBelowClick}
                                variant="outline"
                                className="w-full border-2 border-dashed py-6 font-semibold text-muted-foreground hover:border-solid hover:border-primary hover:text-primary"
                            >
                                <Plus size={16} className="mr-2" />
                                Add below
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <FlashcardImportModal
                isOpen={isImportModalOpen}
                setIsOpen={setIsImportModalOpen}
                onSubmit={handleAddFlashcardsImported}
            />

            {selectingFlashcard ? (
                <EditImageModal
                    isOpen={isAddImageModalOpen}
                    setIsOpen={setIsAddImageModalOpen}
                    flashcard={selectingFlashcard}
                    onSaveImageClick={handleSaveImageClick}
                    onUploadImageSuccess={handleUploadImageSuccess}
                />
            ) : null}

            {selectingFlashcard ? (
                <FlashcardDetailsModal
                    isOpen={isFlashcardDetailsModalOpen}
                    setIsOpen={setIsFlashcardDetailsModalOpen}
                    flashcard={selectingFlashcard}
                />
            ) : null}

            {loading && (
                <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="flex flex-col items-center rounded-xl bg-white px-6 py-5 shadow-lg">
                        <div className="mb-3 size-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                        <p className="font-medium text-gray-800">Generating quiz...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
