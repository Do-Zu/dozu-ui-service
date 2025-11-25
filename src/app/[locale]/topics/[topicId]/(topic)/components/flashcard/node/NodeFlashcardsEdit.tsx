import { useTranslations } from 'next-intl';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { IEditingFlashcard, ILocalFlashcard } from '../edit/EditingFlashcards';
import ImagesPreviewModal, { IUnspashImage } from '@/app/[locale]/flashcards/components/ImagesPreview';
import { useRequireTopic } from '../../../context/useRequireTopic';
import { useRequireFlashcards, useRequireLearningFlashcards } from '../../../context/useRequireFlashcardContent';
import usePost from '@/hooks/usePost';
import { IDueAnkiCard, IFlashcard, IFlashcardsBatchInput } from '@/app/[locale]/flashcards/types/flashcard.type';
import flashcardService from '@/services/flashcard/flashcard.service';
import toastHelper from '@/utils/toast.helper';
import flashcardUtils, { initialFlashcardsCount } from '../../../utils/flashcard.utils';
import { IFlashcardPreview } from '@/app/[locale]/flashcards/components/import/FlashcardPreview';
import DataStatus from '@/components/errors/DataStatus';
import { Button } from '@/components/ui/button';
import { ImagePlus, Import, Plus, RefreshCw, Save, Trash2, Undo2, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FlashcardImportModal from '@/app/[locale]/flashcards/components/import/FlashcardImportModal';

interface Props {
    nodeId: string;
    onClose: () => void;
}

export default function NodeFlashcardsEdit({ nodeId, onClose }: Props) {
    const tCommon = useTranslations('common');
    const tFlashcardCommon = useTranslations('flashcard.common');
    const tFlashcardEdit = useTranslations('flashcard.edit');
    const tFlashcardLearning = useTranslations('flashcard.learning');
    const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
    const [isAddImageModalOpen, setIsAddImageModalOpen] = useState<boolean>(false);
    const [selectingFlashcard, setSelectingFlashcard] = useState<ILocalFlashcard | null>();
    const [imagesPreview, setImagesPreview] = useState<IUnspashImage[] | null>(null);

    const { topic } = useRequireTopic();
    const { flashcards, setFlashcards } = useRequireFlashcards();
    const { setLearningFlashcards } = useRequireLearningFlashcards();
    const [nodeEditingFlashcards, setNodeEditingFlashcards] = useState<IEditingFlashcard[]>([]);

    const { loading: batchLoading, execute: batchFlashcardsAsync } = usePost<
        { topicId: number; flashcards: IFlashcardsBatchInput },
        { flashcards: IFlashcard[]; dueAnkiCards: IDueAnkiCard[] }
    >(
        ({ topicId, flashcards }) => flashcardService.batchFlashcardsForNodeState({ topicId, nodeId, flashcards }),
        'POST',
        {
            onError(error) {
                toastHelper.showErrorMessage(error);
            },
            onSuccess(data) {
                setFlashcards(data.flashcards);
                setLearningFlashcards(data.dueAnkiCards);
                toastHelper.showSuccessMessage(tCommon('messages.updateSuccess', { name: 'Flashcards' }));
            },
        },
    );

    useEffect(() => {
        const nodeFlashcards = flashcards.filter((card) => card.nodeId === nodeId);
        let editingFlashcards = flashcardUtils.convertToEditingFlashcards(nodeFlashcards);
        // if (generatingFlashcards && generatingFlashcards.length > 0) {
        //     const lastId = editingFlashcards.length === 0 ? -1 : editingFlashcards[editingFlashcards.length - 1].id;
        //     const result = generatingFlashcards.map((card, index) => ({
        //         id: lastId + index + 1,
        //         front: card.q,
        //         back: card.a,
        //     }));

        //     editingFlashcards = editingFlashcards.concat(result);
        // }
        if (editingFlashcards.length === 0) {
            editingFlashcards = flashcardUtils.createInitialFlashcards(initialFlashcardsCount);
        }
        setNodeEditingFlashcards(editingFlashcards);
    }, [nodeId, flashcards]);

    const { loading: searchImagesLoading, execute: searchImagesAsync } = usePost<string, IUnspashImage[]>(
        flashcardService.searchImages,
        'POST',
        {
            onError(error) {
                toastHelper.showErrorMessage(error);
                setIsAddImageModalOpen(false);
            },
            onSuccess(data) {
                setImagesPreview(data);
            },
        },
    );

    useEffect(() => {
        if (!isAddImageModalOpen) {
            setSelectingFlashcard(null);
            setImagesPreview(null);
        }
    }, [isAddImageModalOpen]);

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
        setNodeEditingFlashcards((prev) => {
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
        setNodeEditingFlashcards((prev) => {
            const result = [...prev];
            const lastId = prev.length === 0 ? -1 : prev[prev.length - 1].id;
            result.push(flashcardUtils.createInitialFlashcard(lastId + 1));
            return result;
        });
    }

    function handleFlashcardDeleteClick(index: number) {
        setNodeEditingFlashcards((prev) => {
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

    function isFlashcardEditing(flashcard: IEditingFlashcard) {
        if (!flashcard.serverInfo) return false;
        const originalFlashcard = flashcards.find((card) => card.flashcardId === flashcard.serverInfo?.flashcardId);

        if (!originalFlashcard) return false;
        return flashcard.front !== originalFlashcard.front || flashcard.back !== originalFlashcard.back;
    }

    function isFlashcardNew(flashcard: IEditingFlashcard) {
        return flashcard.serverInfo === undefined;
    }

    function isFlashcardDeleted(flashcard: IEditingFlashcard) {
        return flashcard.serverInfo?.isDeleted === true;
    }

    function handleUndoDelete(index: number) {
        setNodeEditingFlashcards((prev) => {
            return prev.map((e, i) => {
                if (i !== index || !e.serverInfo) return e;
                return { ...e, serverInfo: { ...e.serverInfo, isDeleted: false } };
            });
        });
    }

    function handleAddFlashcardsImported(flashcardsImported: IFlashcardPreview[]) {
        const newFlashcards = [...nodeEditingFlashcards];
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
        setNodeEditingFlashcards(newFlashcards);
        setIsImportModalOpen(false);
    }

    async function handleSaveClick() {
        const flashcardsSubmitted = flashcardUtils.prepareFlashcardsForSubmit(nodeEditingFlashcards);
        if (!flashcardsSubmitted) {
            toastHelper.showSuccessMessage(tFlashcardEdit('messages.noFlashcardChanges'));
            return;
        }
        // setGeneratingFlashcards(null);
        await batchFlashcardsAsync({
            topicId: topic.topicId,
            flashcards: flashcardsSubmitted,
        });
    }

    function handleImportModalOpen() {
        setTimeout(() => {
            setIsImportModalOpen(true);
        }, 50);
    }

    async function handleAddImageModalOpen(card: ILocalFlashcard) {
        if (card.front === '') {
            toastHelper.showErrorMessage('Cannot search image with card having empty front');
            return;
        }
        setIsAddImageModalOpen(true);
        setSelectingFlashcard(card);
        await searchImagesAsync(card.front);
    }

    function handleSaveImageClick(image: IUnspashImage) {
        if (!selectingFlashcard) {
            toastHelper.showErrorMessage('No selecting flashcard');
            return;
        }
        const imageSaveInput = {
            id: image.id,
            url: image.url.small,
            downloadLocation: image.links.download_location,
        };
        let newFlashcards;
        newFlashcards = nodeEditingFlashcards.map((flashcard) => {
            return flashcard.id === selectingFlashcard.id
                ? {
                      ...flashcard,
                      image: imageSaveInput,
                      thumb: image.url.thumb,
                      serverInfo: flashcard.serverInfo
                          ? { ...flashcard.serverInfo, isUpdated: true, isDeleted: false }
                          : undefined,
                  }
                : flashcard;
        });
        setNodeEditingFlashcards(newFlashcards);
        setIsAddImageModalOpen(false);
        toastHelper.showSuccessMessage('Insert image into card successfully');
    }

    if (!nodeEditingFlashcards) {
        return <DataStatus variant="empty" />;
    }

    return (
        <div className="flex flex-col">
            <div className="sticky top-0 z-50 w-full bg-background border-b shadow-sm">
                <div className="flex justify-end items-center px-[4rem] py-4">
                    <div className="flex flex-row items-center gap-4">
                        {/* <Button
                            variant="ghost"
                            onClick={handleGenerateQuiz}
                            disabled={!hasAnyValidFlashcard(editingFlashcards) || loading}
                            className="text-muted-foreground hover:text-primary flex flex-rol gap-2"
                        >
                            <Sparkles size={18} />
                            Generate Quiz
                        </Button> */}

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
                            onClick={handleSaveClick}
                            disabled={batchLoading}
                            className="text-muted-foreground hover:text-primary"
                        >
                            {batchLoading ? (
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
                        {nodeEditingFlashcards?.map((flashcard, index) => {
                            if (isFlashcardDeleted(flashcard))
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
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-muted-foreground select-none">
                                                {index + 1}
                                            </span>
                                            {flashcard.serverInfo?.isUpdated && isFlashcardEditing(flashcard) ? (
                                                <span className="text-sm text-muted-foreground">(editing)</span>
                                            ) : null}
                                            {isFlashcardNew(flashcard) ? (
                                                <span className="text-sm text-muted-foreground">(new)</span>
                                            ) : null}
                                        </div>
                                        <div className="flex items-center gap-4">
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
            </ScrollArea>

            <FlashcardImportModal
                isOpen={isImportModalOpen}
                setIsOpen={setIsImportModalOpen}
                onSubmit={handleAddFlashcardsImported}
            />

            <ImagesPreviewModal
                isOpen={isAddImageModalOpen}
                setIsOpen={setIsAddImageModalOpen}
                currentThumb={selectingFlashcard?.thumb}
                currentImageUrl={selectingFlashcard?.imageUrl}
                images={imagesPreview}
                loading={searchImagesLoading}
                handleSaveClick={handleSaveImageClick}
            />
            {/* {loading && (
                <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center bg-white px-6 py-5 rounded-xl shadow-lg">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-gray-800 font-medium">Generating quiz...</p>
                    </div>
                </div>
            )} */}
        </div>
    );
}
