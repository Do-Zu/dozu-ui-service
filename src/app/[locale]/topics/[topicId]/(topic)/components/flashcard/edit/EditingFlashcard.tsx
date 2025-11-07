'use client';

import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';

import { Edit, ImagePlus, Import, Save, Trash2 } from 'lucide-react';
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
} from '@/app/[locale]/flashcards/types/flashcard.type';
import ImagesPreviewModal, { IUnspashImage } from '@/app/[locale]/flashcards/components/ImagesPreview';
import { IFlashcardPreview } from '@/app/[locale]/flashcards/components/import/FlashcardPreview';
import FlashcardImportModal from '@/app/[locale]/flashcards/components/import/FlashcardImportModal';
import { useRequireFlashcards, useRequireLearningFlashcards } from '../../../context/useRequireFlashcardContent';
import { useRequireTopic } from '../../../context/useRequireTopic';

interface ILocalFlashcard {
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

const initialFlashcardsCount = 3;
const flashcardsJump = 3;

function isEmptyArray(array: any[]): boolean {
    return array.length === 0;
}

function createInitialFlashcard(id: number): ILocalFlashcard {
    return { id, front: '', back: '' };
}

function createInitialFlashcards(count: number): ILocalFlashcard[] {
    const initialFlashcards: ILocalFlashcard[] = [];
    for (let i = 0; i < count; ++i) {
        initialFlashcards.push(createInitialFlashcard(i));
    }
    return initialFlashcards;
}

function getFlashcardType(flashcard: IEditingFlashcard): 'client' | 'server' {
    return flashcard.serverInfo ? 'server' : 'client';
}

export function handleConvertToFlashcardsSubmitted(flashcards: IEditingFlashcard[]): IFlashcardsBatchInput | null {
    if (!flashcards) return null;

    let flashcardsFormatted = flashcards.map((flashcard) => {
        return {
            ...flashcard,
            front: flashcard.front.trim(),
            back: flashcard.back.trim(),
        };
    });

    let flashcardsAdded: IFlashcardCreateInput[];
    let flashcardsUpdated: IFlashcardUpdateInput[];
    let flashcardsDeleted: number[];

    let flashcardsFilter;

    flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
        return (
            !flashcard.serverInfo &&
            (flashcard.front !== '' ||
                flashcard.back !== '' ||
                (flashcard.image !== null && flashcard.image !== undefined))
        );
    });
    flashcardsAdded = flashcardsFilter.map((flashcard) => ({
        front: flashcard.front,
        back: flashcard.back,
        image: flashcard.image ? flashcard.image : undefined,
    }));

    flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
        return (
            flashcard.serverInfo &&
            flashcard.serverInfo.isUpdated &&
            (flashcard.front !== '' ||
                flashcard.back !== '' ||
                (flashcard.image !== null && flashcard.image !== undefined))
        );
    });
    flashcardsUpdated = flashcardsFilter.map((flashcard) => ({
        flashcardId: flashcard.serverInfo!.flashcardId,
        front: flashcard.front,
        back: flashcard.back,
        image: flashcard.image ? flashcard.image : undefined,
    }));

    flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
        return (
            flashcard.serverInfo &&
            (flashcard.serverInfo.isDeleted ||
                (flashcard.serverInfo.isUpdated && flashcard.front === '' && flashcard.back === ''))
        );
    });
    flashcardsDeleted = flashcardsFilter.map((flashcard) => flashcard.serverInfo!.flashcardId);

    if (
        (!flashcardsAdded || flashcardsAdded.length === 0) &&
        (!flashcardsUpdated || flashcardsUpdated.length === 0) &&
        (!flashcardsDeleted || flashcardsDeleted.length === 0)
    )
        return null;

    let dataSubmitted: IFlashcardsBatchInput = { flashcardsAdded, flashcardsUpdated, flashcardsDeleted };
    return dataSubmitted;
}

export function handleConvertToFlashcardsEdited(flashcards: IFlashcard[]): IEditingFlashcard[] {
    let initialFlashcards: IEditingFlashcard[];
    if (isEmptyArray(flashcards)) {
        initialFlashcards = createInitialFlashcards(initialFlashcardsCount);
    } else {
        initialFlashcards = flashcards.map((flashcard, index) => {
            return {
                id: index,
                front: flashcard.front,
                back: flashcard.back,
                imageUrl: flashcard.imageUrl,
                serverInfo: {
                    flashcardId: flashcard.flashcardId,
                    topicId: flashcard.topicId,
                    isUpdated: false,
                    isDeleted: false,
                },
            };
        });
        for (let i = initialFlashcards.length; i % 3 !== 0; ++i) {
            initialFlashcards.push(createInitialFlashcard(i));
        }
    }
    return initialFlashcards;
}

const EditingFlashcard = () => {
    const tCommon = useTranslations('common');
    const tFlashcardEdit = useTranslations('flashcard.edit');
    const [flashcardsCount, setFlashcardsCount] = useState<number>(initialFlashcardsCount);
    const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
    const [isAddImageModalOpen, setIsAddImageModalOpen] = useState<boolean>(false);
    const [selectingFlashcard, setSelectingFlashcard] = useState<ILocalFlashcard | null>();
    const [imagesPreview, setImagesPreview] = useState<IUnspashImage[] | null>(null);
    const { regenerate, previewOpen, setPreviewOpen, sseData, sseStatus, loading } = useGenerateFromExisting();
    const { contentType, dataGenerated, setDataGenerated, isContentReady } = useContentGeneration({
        sseData,
        sseStatus,
    });

    const { topic } = useRequireTopic();
    const { flashcards, setFlashcards } = useRequireFlashcards();
    const { setLearningFlashcards } = useRequireLearningFlashcards();
    const [editingFlashcards, setEditingFlashcards] = useState<IEditingFlashcard[]>([]);

    const { loading: batchLoading, execute: batchFlashcards } = usePost<
        { topicId: string | number; flashcards: IFlashcardsBatchInput },
        { flashcards: IFlashcard[]; dueAnkiCards: IDueAnkiCard[] }
    >(({ topicId, flashcards }) => flashcardService.batchFlashcardsForTopicState({ topicId, flashcards }), 'POST', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess(data) {
            setFlashcards(data.flashcards);
            setLearningFlashcards(data.dueAnkiCards);
            toastHelper.showSuccessMessage(tCommon('messages.updateSuccess', { name: 'Flashcards' }));
        },
    });

    useEffect(() => {
        const editingFlashcards = handleConvertToFlashcardsEdited(flashcards);
        setEditingFlashcards(editingFlashcards);
    }, [flashcards]);

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

    // fix, useEffect is not necessary
    useEffect(() => {
        if (!editingFlashcards) return;
        if (flashcardsCount === flashcardsJump) return;
        let newFlashcards = [...editingFlashcards];
        const lastId = newFlashcards[newFlashcards.length - 1].id;
        let startId = lastId + 1;
        for (let i = flashcardsCount - flashcardsJump; i < flashcardsCount; ++i) {
            newFlashcards.push({ id: startId, front: '', back: '' });
            ++startId;
        }
        setEditingFlashcards(newFlashcards);
    }, [flashcardsCount]);

    useEffect(() => {
        if (!isAddImageModalOpen) {
            setSelectingFlashcard(null);
            setImagesPreview(null);
        }
    }, [isAddImageModalOpen]);

    function handleFlashcardChange(
        side: 'front' | 'back',
        type: 'client' | 'server',
        flashcard: { order: number; text: string },
    ) {
        if (!editingFlashcards) return;
        let newFlashcards: IEditingFlashcard[] = editingFlashcards;
        let { order, text } = flashcard;

        if (type === 'client') {
            if (side === 'front') {
                newFlashcards = editingFlashcards.map((flashcard, index) => {
                    return index === order ? { ...flashcard, front: text } : flashcard;
                });
            } else if (side === 'back') {
                newFlashcards = editingFlashcards.map((flashcard, index) => {
                    return index === order ? { ...flashcard, back: text } : flashcard;
                });
            }
        } else if (type === 'server') {
            if (side === 'front') {
                newFlashcards = editingFlashcards.map((flashcard, index) => {
                    return flashcard.serverInfo && index === order
                        ? {
                              ...flashcard,
                              front: text,
                              serverInfo: { ...flashcard.serverInfo, isUpdated: true, isDeleted: false },
                          }
                        : flashcard;
                });
            } else {
                newFlashcards = editingFlashcards.map((flashcard, index) => {
                    return flashcard.serverInfo && index === order
                        ? {
                              ...flashcard,
                              back: text,
                              serverInfo: { ...flashcard.serverInfo, isUpdated: true, isDeleted: false },
                          }
                        : flashcard;
                });
            }
        }

        setEditingFlashcards(newFlashcards);
    }

    function handleAddFlashcardsCount() {
        setFlashcardsCount((prevCount) => prevCount + flashcardsJump);
    }

    function handleDeleteFlashcard(type: 'client' | 'server', flashcardId: number) {
        if (!editingFlashcards) return;
        let newFlashcards: IEditingFlashcard[] = editingFlashcards;

        if (type === 'client') {
            newFlashcards = editingFlashcards.filter((flashcard) => flashcard.id !== flashcardId);

            newFlashcards.push({
                id: newFlashcards[newFlashcards.length - 1].id + 1,
                front: '',
                back: '',
            });
        } else if (type === 'server') {
            newFlashcards = editingFlashcards.map((flashcard) => {
                return flashcard.serverInfo && flashcard.id === flashcardId
                    ? {
                          ...flashcard,
                          serverInfo: { ...flashcard.serverInfo, isUpdated: false, isDeleted: true },
                      }
                    : flashcard;
            });
            let startId = newFlashcards[newFlashcards.length - 1].id + 1;
            newFlashcards.push(createInitialFlashcard(startId));
        }
        setEditingFlashcards(newFlashcards);
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
        for (let i = newFlashcards.length; i % 3 !== 0; ++i) {
            newFlashcards.push(createInitialFlashcard(++startId));
        }
        setEditingFlashcards(newFlashcards);
        setIsImportModalOpen(false);
    }

    async function handleSaveClick() {
        const flashcardsSubmitted = handleConvertToFlashcardsSubmitted(editingFlashcards);
        if (!topic || !flashcardsSubmitted) {
            toastHelper.showSuccessMessage(tFlashcardEdit('messages.noFlashcardChanges'));
            return;
        }
        await batchFlashcards({
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

    async function handleSaveImageClick(image: IUnspashImage) {
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
        newFlashcards = editingFlashcards.map((flashcard) => {
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
        setEditingFlashcards(newFlashcards);
        setIsAddImageModalOpen(false);
        toastHelper.showSuccessMessage('Insert image into card successfully');
    }

    function getUsableFlashcardsForGen(cards: IEditingFlashcard[]) {
        return cards.filter((c) => !c.serverInfo?.isDeleted && c.front.trim() !== '' && c.back.trim() !== '');
    }

    function hasAnyValidFlashcard(cards: IEditingFlashcard[]) {
        return getUsableFlashcardsForGen(cards).length > 0;
    }

    const handleGenerateQuiz = async () => {
        if (!topic) return;
        if (!hasAnyValidFlashcard(editingFlashcards)) {
            toast({ description: 'No valid flashcards to create quiz', variant: 'destructive' });
            return;
        }
        const payload = buildContentFromFlashcardsForQuiz(topic.topicId, editingFlashcards);
        await regenerate(payload, 'quiz');
    };

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

    if (!editingFlashcards) {
        return <div>No Flashcards found</div>;
    }

    return (
        <div className="px-[4rem] py-7 bg-muted">
            <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-4 items-center">
                    <div className="text-primary text-[1.7rem] font-bold">
                        {topic ? topic.name : 'Flashcards Generated'}
                    </div>
                </div>
                <div className="flex flex-row gap-4">
                    <Button
                        className="flex flex-row items-center"
                        onClick={handleGenerateQuiz}
                        disabled={!hasAnyValidFlashcard(editingFlashcards) || loading}
                    >
                        Generate Quiz
                    </Button>

                    <Button className="flex flex-row items-center" onClick={handleImportModalOpen}>
                        <Import size={24} />
                        <div className="text-base">{tFlashcardEdit('import')}</div>
                    </Button>

                    <Button onClick={handleSaveClick} className="flex flex-row items-center" disabled={batchLoading}>
                        <Save size={24} />
                        <div className="text-base">
                            {batchLoading ? tCommon('status.saving') : tFlashcardEdit('save')}
                        </div>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 flex-col mt-7">
                {editingFlashcards?.map((flashcard, index) => {
                    if (flashcard.serverInfo?.isDeleted) return null;
                    return (
                        <div
                            key={flashcard.id}
                            className="col-span-4 bg-white p-8 text-center flex flex-col gap-4 rounded-xl border-2 dark:border-white"
                        >
                            <div className="flex flex-row justify-end">
                                <Button variant="ghost" size="icon" onClick={() => handleAddImageModalOpen(flashcard)}>
                                    <ImagePlus size={18} />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteFlashcard(getFlashcardType(flashcard), flashcard.id)}
                                >
                                    <Trash2 size={18} className="text-red-500 hover:text-red-600" />
                                </Button>
                            </div>
                            <div className="flex flex-col gap-4">
                                <Textarea
                                    placeholder="Front"
                                    className="resize-none"
                                    value={flashcard.front}
                                    onChange={(event) =>
                                        handleFlashcardChange('front', getFlashcardType(flashcard), {
                                            order: index,
                                            text: event.target.value,
                                        })
                                    }
                                />
                                <Textarea
                                    placeholder="Back"
                                    className="resize-none"
                                    value={flashcard.back}
                                    onChange={(event) =>
                                        handleFlashcardChange('back', getFlashcardType(flashcard), {
                                            order: index,
                                            text: event.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    );
                })}

                <div className="col-span-12 flex justify-center mb-10">
                    <Button onClick={handleAddFlashcardsCount}>+ {tFlashcardEdit('addCards')}</Button>
                </div>
            </div>

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
};

export default EditingFlashcard;
