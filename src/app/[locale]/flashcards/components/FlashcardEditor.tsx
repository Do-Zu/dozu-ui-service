'use client';

import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Edit, ImagePlus, Import, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    IFlashcardBatchResult,
    IFlashcardCreateInput,
    IFlashcardsBatchInput,
    IFlashcardsWithTopicName,
    IFlashcardUpdateInput,
    IImageSaveInput,
} from '../types/flashcard.type';
import { IFlashcardsFromSSE, IGenerateFlashcardItem } from '../../generate/types';
import BackButton from './BackButton';
import { toast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/utils/constants/routes';
import usePost from '@/hooks/usePost';
import { any } from 'zod';
import flashcardService from '@/services/flashcard/flashcard.service';
import toastHelper from '@/utils/toast.helper';
import FlashcardImportModal from './import/FlashcardImportModal';
import { IFlashcardPreview } from './import/FlashcardPreview';
import ImagesPreviewModal, { IUnspashImage } from './ImagesPreview';
import { IFlashcard as IFlashcardType } from '../types/flashcard.type';
import { useGenerateFromExisting } from '@/app/[locale]/generate/hooks/useGenerateFromExisting';
import { buildContentFromFlashcardsForQuiz } from '@/app/[locale]/question/utils/buildGenPayload';
import ContentGenerationPreview from '@/app/[locale]/generate/components/ContentGenerationPreview';
import { useContentGeneration } from '@/app/[locale]/generate/hooks/useContentGeneration';
import { CONTENT_TYPE_GENERATE } from '@/app/[locale]/generate/types';
import { handleConvertToQuestionsSubmitted } from '@/app/[locale]/question/utils/handleConvertToQuestionsSubmitted';
import { postRequest } from '@/api/api';



interface IFlashcard {
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

export interface IFlashcardWithServer extends IFlashcard {
    serverInfo?: IFlashcardServer;
}

const initialFlashcardsCount = 3;
const flashcardsJump = 3;

function isEmptyArray(array: any[]): boolean {
    return array.length === 0;
}

function createInitialFlashcard(id: number): IFlashcard {
    return { id, front: '', back: '' };
}

function createInitialFlashcards(count: number): IFlashcard[] {
    const initialFlashcards: IFlashcard[] = [];
    for (let i = 0; i < count; ++i) {
        initialFlashcards.push(createInitialFlashcard(i));
    }
    return initialFlashcards;
}

function getFlashcardType(flashcard: IFlashcardWithServer): 'client' | 'server' {
    return flashcard.serverInfo ? 'server' : 'client';
}

export function handleConvertToFlashcardsSubmitted(flashcards: IFlashcardWithServer[]): IFlashcardsBatchInput | null {
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

interface BaseProps {
    shouldShowBackButton?: boolean;
    shouldShowSaveButton?: boolean;
    flashcards: IFlashcardWithServer[];
    setFlashcards: (flashcards: IFlashcardWithServer[]) => void;
    topic?: {
        topicId: string | number;
        name: string;
    };
}

interface FlashcardsFromSSEProp {
    type: 'generative';
    flashcardsProp: IFlashcardsFromSSE;
}

interface FlashcardsWithTopicNameProp {
    type: 'manual';
    flashcardsProp: IFlashcardsWithTopicName;
}

type Props = BaseProps;

export function handleConvertToFlashcardsEdited(
    prop: FlashcardsFromSSEProp | FlashcardsWithTopicNameProp,
): IFlashcardWithServer[] {
    const { type, flashcardsProp } = prop;
    let initialFlashcards: IFlashcardWithServer[];
    if (type === 'manual') {
        if (isEmptyArray(flashcardsProp.flashcards)) {
            initialFlashcards = createInitialFlashcards(initialFlashcardsCount);
        } else {
            initialFlashcards = flashcardsProp.flashcards.map((flashcard, index) => {
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
    } else {
        initialFlashcards = flashcardsProp?.map((flashcard: IGenerateFlashcardItem, index: number) => {
            return {
                id: index,
                front: flashcard.q,
                back: flashcard.a,
            };
        });
        for (let i = initialFlashcards.length; i % 3 !== 0; ++i) {
            initialFlashcards.push(createInitialFlashcard(i));
        }
    }
    return initialFlashcards;
}

const FlashcardEditor = ({
    shouldShowBackButton = true,
    shouldShowSaveButton = true,
    flashcards,
    setFlashcards,
    topic,
}: Props) => {
    const tCommon = useTranslations('common');
    const tFlashcardEdit = useTranslations('flashcard.edit');
    const [flashcardsCount, setFlashcardsCount] = useState<number>(initialFlashcardsCount);
    const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
    const [isAddImageModalOpen, setIsAddImageModalOpen] = useState<boolean>(false);
    const [selectingFlashcard, setSelectingFlashcard] = useState<IFlashcard | null>();
    const [imagesPreview, setImagesPreview] = useState<IUnspashImage[] | null>(null);
    const { regenerate, previewOpen, setPreviewOpen, sseData, sseStatus } = useGenerateFromExisting();
    const { contentType, dataGenerated, setDataGenerated, isContentReady } = useContentGeneration({ sseData, sseStatus });

    const { loading: batchLoading, execute: batchFlashcards } = usePost<
        { topicId: string | number; flashcards: IFlashcardsBatchInput },
        IFlashcardBatchResult
    >(({ topicId, flashcards }) => flashcardService.batchFlashcardsForTopic({ topicId, flashcards }), 'POST', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess(data) {
            const { flashcardsAdded, flashcardsUpdated } = data;

            // delete section
            let newFlashcards = flashcards.filter(
                (card) => !(!card.serverInfo || (card.serverInfo && card.serverInfo.isDeleted)),
            );

            // update section
            const updatedMap = new Map<number, IFlashcardType>();
            for (const card of flashcardsUpdated) {
                updatedMap.set(card.flashcardId, card);
            }
            newFlashcards = newFlashcards.map((card) => {
                if (card.serverInfo && updatedMap.has(card.serverInfo.flashcardId)) {
                    const cardUpdated = updatedMap.get(card.serverInfo.flashcardId);
                    if (!cardUpdated) {
                        return card;
                    }
                    const cardWithServer: IFlashcardWithServer = {
                        ...card,
                        front: cardUpdated.front,
                        back: cardUpdated.back,
                        imageUrl: cardUpdated.imageUrl,
                        thumb: undefined,
                        image: undefined,
                        serverInfo: {
                            flashcardId: cardUpdated.flashcardId,
                            topicId: cardUpdated.topicId,
                            isUpdated: false,
                            isDeleted: false,
                        },
                    };
                    return cardWithServer;
                } else {
                    return card;
                }
            });

            // create section
            const lastId = newFlashcards.length === 0 ? 0 : newFlashcards[newFlashcards.length - 1].id;
            let startId = lastId + 1;
            for (const cardAdded of flashcardsAdded) {
                const cardWithServer: IFlashcardWithServer = {
                    ...cardAdded,
                    id: startId,
                    front: cardAdded.front,
                    back: cardAdded.back,
                    imageUrl: cardAdded.imageUrl,
                    thumb: undefined,
                    image: undefined,
                    serverInfo: {
                        flashcardId: cardAdded.flashcardId,
                        topicId: cardAdded.topicId,
                        isUpdated: false,
                        isDeleted: false,
                    },
                };
                newFlashcards.push(cardWithServer);
                ++startId;
            }
            if(newFlashcards.length === 0) {
                for(let i = 0; i < 3; ++i) {
                    newFlashcards.push(createInitialFlashcard(i));
                }
            }
            for (let i = newFlashcards.length; i % 3 !== 0; ++i) {
                newFlashcards.push(createInitialFlashcard(startId++));
            }
            setFlashcards(newFlashcards);

            toastHelper.showSuccessMessage(tCommon('messages.updateSuccess', { name: 'Flashcards' }));
        },
    });

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
        if (!flashcards) return;
        if (flashcardsCount === flashcardsJump) return;
        let newFlashcards = [...flashcards];
        const lastId = newFlashcards[newFlashcards.length - 1].id;
        let startId = lastId + 1;
        for (let i = flashcardsCount - flashcardsJump; i < flashcardsCount; ++i) {
            newFlashcards.push({ id: startId, front: '', back: '' });
            ++startId;
        }
        setFlashcards(newFlashcards);
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
        if (!flashcards) return;
        let newFlashcards: IFlashcardWithServer[] = flashcards;
        let { order, text } = flashcard;

        if (type === 'client') {
            if (side === 'front') {
                newFlashcards = flashcards.map((flashcard, index) => {
                    return index === order ? { ...flashcard, front: text } : flashcard;
                });
            } else if (side === 'back') {
                newFlashcards = flashcards.map((flashcard, index) => {
                    return index === order ? { ...flashcard, back: text } : flashcard;
                });
            }
        } else if (type === 'server') {
            if (side === 'front') {
                newFlashcards = flashcards.map((flashcard, index) => {
                    return flashcard.serverInfo && index === order
                        ? {
                              ...flashcard,
                              front: text,
                              serverInfo: { ...flashcard.serverInfo, isUpdated: true, isDeleted: false },
                          }
                        : flashcard;
                });
            } else {
                newFlashcards = flashcards.map((flashcard, index) => {
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

        setFlashcards(newFlashcards);
    }

    function handleAddFlashcardsCount() {
        setFlashcardsCount((prevCount) => prevCount + flashcardsJump);
    }

    function handleDeleteFlashcard(type: 'client' | 'server', flashcardId: number) {
        if (!flashcards) return;
        let newFlashcards: IFlashcardWithServer[] = flashcards;

        if (type === 'client') {
            newFlashcards = flashcards.filter((flashcard) => flashcard.id !== flashcardId);

            newFlashcards.push({
                id: newFlashcards[newFlashcards.length - 1].id + 1,
                front: '',
                back: '',
            });
        } else if (type === 'server') {
            newFlashcards = flashcards.map((flashcard) => {
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
        setFlashcards(newFlashcards);
    }

    function handleAddFlashcardsImported(flashcardsImported: IFlashcardPreview[]) {
        const newFlashcards = [...flashcards];
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
        setFlashcards(newFlashcards);
        setIsImportModalOpen(false);
    }

    async function handleSaveClick() {
        const flashcardsSubmitted = handleConvertToFlashcardsSubmitted(flashcards);
        if (!topic || !flashcardsSubmitted) {
            toast({
                title: 'Topic or flashcards submitted is null',
                variant: 'destructive',
            });
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

    async function handleAddImageModalOpen(card: IFlashcard) {
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
        newFlashcards = flashcards.map((flashcard) => {
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
        setFlashcards(newFlashcards);
        setIsAddImageModalOpen(false);
        toastHelper.showSuccessMessage('Insert image into card successfully');
    } 

    function getUsableFlashcardsForGen(cards: IFlashcardWithServer[]) {
       return cards.filter(
         (c) =>
         !c.serverInfo?.isDeleted &&
         c.front.trim() !== '' &&
         c.back.trim() !== ''
        );
    }

    function hasAnyValidFlashcard(cards: IFlashcardWithServer[]) {
      return getUsableFlashcardsForGen(cards).length > 0;
    }


    const handleGenerateQuiz = async () => {
       if (!topic) return;
         if (!hasAnyValidFlashcard(flashcards)) {
           toast({ description: 'No valid flashcards to create quiz', variant: 'destructive' });
           return;
         }
       const payload = buildContentFromFlashcardsForQuiz(topic.topicId, flashcards);
       await regenerate(payload, 'quiz');
    };

    const handleSaveGeneratedToThisTopic = async () => {
       if (!topic) return;
       if (!isContentReady || !dataGenerated) {
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
       contentType === CONTENT_TYPE_GENERATE.QUIZ &&
       Array.isArray(dataGenerated) &&
       dataGenerated.length > 0;
    
    if (previewOpen) {
     return (
    <div className="px-[4rem] py-7 bg-muted min-h-screen">
      <ContentGenerationPreview
        shouldCreateTopic={false}
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


    if (!flashcards) {
        return <div>No Flashcards found</div>;
    }

    return (
        <div className="px-[4rem] py-7 bg-muted">
            <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-4 items-center">
                    {shouldShowBackButton ? <BackButton /> : null}
                    <div className="text-primary text-[1.7rem] font-bold">
                        {topic ? topic.name : 'Flashcards Generated'}
                    </div>
                </div>
                <div className="flex flex-row gap-4">
                    <Button className="flex flex-row items-center" onClick={handleGenerateQuiz} disabled={!hasAnyValidFlashcard(flashcards)}>
                       Generate Quiz
                    </Button>

                    <Button className="flex flex-row items-center" onClick={handleImportModalOpen}>
                        <Import size={24} />
                        <div className="text-base">{tFlashcardEdit('import')}</div>
                    </Button>

                    {shouldShowSaveButton ? (
                        <Button
                            onClick={handleSaveClick}
                            className="flex flex-row items-center"
                            disabled={batchLoading}
                        >
                            <Save size={24} />
                            <div className="text-base">
                                {batchLoading ? tCommon('status.saving') : tFlashcardEdit('save')}
                            </div>
                        </Button>
                    ) : null}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 flex-col mt-7">
                {flashcards?.map((flashcard, index) => {
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

                <div className="col-span-12 flex justify-center">
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

        </div>

    );
    
};

export default FlashcardEditor;
