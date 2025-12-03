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

const flashcardItemHeight = 300;
const flashcardItemGap = 20;

interface Props {
    flashcards: IFlashcard[]; // flashcards of node or topic
    generatingFlashcards: IResponseFlashCardGenerate[] | null;
    isSaving: boolean;
    onSaveClick: (editingFlashcards: IEditingFlashcard[]) => void;
    emptyComponent?: React.ReactNode;
    generateComponent?: React.ReactNode;
    onClose?: () => void;
}

export default function FlashcardsEdit({
    flashcards,
    generatingFlashcards,
    isSaving,
    onSaveClick,
    emptyComponent,
    generateComponent,
    onClose,
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

    function onUploadImageSuccess({ flashcard, imageUrl }: { flashcard: ILocalFlashcard; imageUrl: string }) {
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
            <div className="px-[4rem] py-7 bg-muted min-h-screen">
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
        <div className="h-full flex flex-col">
            <div className="sticky top-0 z-50 w-full bg-background border-b shadow-sm">
                <div className="flex justify-end items-center px-[4rem] py-4">
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

            <div className="h-full overflow-y-auto pb-8" ref={ref}>
                <div className="px-[4rem] py-7 bg-background">
                    <div className="mt-7 flex flex-col bg-background">
                        {editingFlashcards?.map((flashcard, index) => {
                            if (flashcardEditUtils.isFlashcardDeleted(flashcard))
                                return (
                                    <div
                                        key={flashcard.id}
                                        className="rounded-xl border border-dashed shadow-sm p-4 flex justify-between items-center bg-card/50 text-card-foreground"
                                    >
                                        <span className="text-lg font-bold text-muted-foreground/80 select-none">
                                            {index + 1}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleUndoDelete(index)}
                                            className="text-muted-foreground font-semibold hover:text-primary"
                                        >
                                            <Undo2 size={16} className="mr-2" />
                                            Undo
                                        </Button>
                                    </div>
                                );

                            return (
                                <div
                                    key={flashcard.id}
                                    className="rounded-xl border shadow-sm p-6 flex flex-col bg-muted/60 dark:bg-muted/40 text-card-foreground"
                                    style={{ height: flashcardItemHeight, marginBottom: flashcardItemGap }}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-muted-foreground select-none">
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
                                                className="text-muted-foreground hover:text-primary hover:border-primary/50"
                                            >
                                                <FileSearch size={18} />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleAddImageModalOpen(flashcard)}
                                                className="text-muted-foreground hover:text-primary hover:border-primary/50"
                                            >
                                                <ImagePlus size={18} />
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleFlashcardDeleteClick(index)}
                                                className="text-muted-foreground hover:text-red-500 dark:hover:text-red-600 hover:border-destructive/50"
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
                                className="w-full border-dashed border-2 py-6 text-muted-foreground font-semibold hover:text-primary hover:border-primary hover:border-solid"
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
                    onUploadImageSuccess={onUploadImageSuccess}
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
                <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center bg-white px-6 py-5 rounded-xl shadow-lg">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-gray-800 font-medium">Generating quiz...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
