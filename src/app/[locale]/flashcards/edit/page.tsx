'use client'

import { postRequest } from "@/api/api";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ArrowBigLeft, Edit, Import, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IFlashcard } from "../components/Flashcard";
import useFetch from "@/hooks/useFetch";

interface IBasicFlashcard {
    id: number
    front: string
    back: string
}

interface IFlashcardReturned {
    topicId: number,
    flashcardId: number,
    front: string,
    back: string
}

interface IFlashcardServer {
    flashcardId: number
    topicId: number
    isUpdated: boolean
    isDeleted: boolean
}

interface IHardFlashcard extends IBasicFlashcard {
    serverInfo?: IFlashcardServer
}

// const test: IHardFlashcard = { id: 1, front: 'one', back: 'một', serverInfo: { flashcardId: 1, topicId: 1, isUpdated: false, isDeleted: false } }

type IFlashcardAdded = Pick<IFlashcard, 'front' | 'back'>; 
type IFlashcardUpdated = Pick<IFlashcard, 'flashcardId' | 'front' | 'back'>;
type IFlashcardDeleted = number;

interface FlashcardsSubmit {
    flashcardsAdded?: IFlashcardAdded[]
    flashcardsUpdated?: IFlashcardUpdated[]
    flashcardsDeleted?: IFlashcardDeleted[]
} 

const initialFlashcardsCount = 3;
const flashcardsJump = 3;

function isEmptyArray(array: any[]): boolean {
    return array.length === 0;
}

function createInitialFlashcard(id: number) : IBasicFlashcard {
    return { id, front: '', back: '' };
}

function createInitialFlashcards(count: number): IBasicFlashcard[] {
    console.log('createInitialFlashcards');
    const initialFlashcards : IBasicFlashcard[] = [];
    for(let i = 0; i < count; ++i) {
        initialFlashcards.push(createInitialFlashcard(i));
    }
    return initialFlashcards;
}

function getFlashcardType(flashcard: IHardFlashcard): 'client' | 'server' {
    return flashcard.serverInfo ? 'server' : 'client';
}

const Page = () => {

    let router = useRouter();

    const searchParamsClient = useSearchParams();
    const topicId = searchParamsClient.get('topicId')!;

    const flashcardSelector = useCallback((data: { flashcards: IFlashcard[] }) => data.flashcards, []);
    const { 
        data: flashcardsExisted, 
        // setData: setFlashcardsExisted, 
        loading: flashcardLoading, 
        error: flashcardError 
    } 
        = useFetch<IFlashcard[]>(`/flashcards?topicId=${topicId}`, flashcardSelector);

    const [flashcardsCount, setFlashcardsCount] = useState<number>(initialFlashcardsCount);
    const [flashcards, setFlashcards] = useState<IHardFlashcard[] | null>();

    useEffect(() => {
        if(!flashcardsExisted) return;

        let initialFlashcards: IHardFlashcard[];
        if(isEmptyArray(flashcardsExisted)) {
            initialFlashcards = createInitialFlashcards(initialFlashcardsCount);
        }
        else {
            initialFlashcards = flashcardsExisted.map((flashcard, index) => {
                return {
                    id: index,
                    front: flashcard.front,
                    back: flashcard.back,
                    serverInfo: {
                        flashcardId: flashcard.flashcardId,
                        topicId: flashcard.topicId,
                        isUpdated: false,
                        isDeleted: false
                    }
                }
            })
            for(let i = initialFlashcards.length; i % 3 !== 0; ++i) {
                initialFlashcards.push(createInitialFlashcard(i));
            }
        }
        setFlashcards(initialFlashcards);
        
    }, [flashcardsExisted]);

    useEffect(() => {
        if(!flashcards) return;
        if(flashcardsCount === flashcardsJump) return;
        let newFlashcards = [...flashcards];
        let lastId = newFlashcards[newFlashcards.length - 1].id;
        let startId = lastId + 1;
        for(let i = flashcardsCount - flashcardsJump; i < flashcardsCount; ++i) {
            newFlashcards.push({ id: startId, front: '', back: '' });
            ++startId;
        }
        setFlashcards(newFlashcards);
    }, [flashcardsCount]);

    function handleOnChangeFlashcard(side: 'front' | 'back', type: 'client' | 'server', flashcard: { order: number, text: string }) {
        if(!flashcards) return;
        let newFlashcards: IHardFlashcard[] = flashcards;
        let { order, text } = flashcard;

        if(type === 'client') {
            if(side === 'front') {
                newFlashcards = flashcards.map((flashcard, index) => {
                    return index === order ? {...flashcard, front: text} : flashcard
                })
            }
            else if(side === 'back') {
                newFlashcards = flashcards.map((flashcard, index) => {
                    return index === order ? {...flashcard, back: text} : flashcard
                })
            }
        } else if(type === 'server') {
            if(side === 'front') {
                newFlashcards = flashcards.map((flashcard, index) => {
                    return flashcard.serverInfo && index === order ? {...flashcard, front: text, serverInfo: { ...flashcard.serverInfo, isUpdated: true, isDeleted: false }} : flashcard;
                })
            }
            else {
                newFlashcards = flashcards.map((flashcard, index) => {
                    return flashcard.serverInfo && index === order ? {...flashcard, back: text, serverInfo: { ...flashcard.serverInfo, isUpdated: true, isDeleted: false }} : flashcard;
                })
            }
        }

        setFlashcards(newFlashcards);
    }

    function handleAddFlashcardsCount() {
        setFlashcardsCount((prevCount) => prevCount + flashcardsJump);
    }

    function handleDeleteFlashcard(type: 'client' | 'server', flashcardId: number) {
        if(!flashcards) return;
        let newFlashcards: IHardFlashcard[] = flashcards;

        if(type === 'client') {
            newFlashcards = flashcards.filter((flashcard) => flashcard.id !== flashcardId);
    
            newFlashcards.push({ id: newFlashcards[newFlashcards.length - 1].id + 1, front: '', back: '' });
        } else if(type === 'server') {
            newFlashcards = flashcards.map((flashcard) => {
                return flashcard.serverInfo && flashcard.id === flashcardId ? { ...flashcard, serverInfo: { ...flashcard.serverInfo, isUpdated: false, isDeleted: true } } : flashcard;
            })
            let startId = newFlashcards[newFlashcards.length - 1].id + 1;
            newFlashcards.push(createInitialFlashcard(startId));
        }
        setFlashcards(newFlashcards);
    }

    async function handleSave() {
        if(!flashcards) return;

        let flashcardsFormatted = flashcards.map((flashcard) => {
            return {
                ...flashcard,
                front: flashcard.front.trim(), back: flashcard.back.trim()
            }
        })
        console.log(flashcardsFormatted);

        let flashcardsAdded : IFlashcardAdded[];
        let flashcardsUpdated : IFlashcardUpdated[]
        let flashcardsDeleted : IFlashcardDeleted[];

        let flashcardsFilter;

        flashcardsFilter = flashcardsFormatted
            .filter((flashcard) => {
                return !flashcard.serverInfo && 
                    (flashcard.front !== '' || flashcard.back !== '')
            })
        flashcardsAdded = flashcardsFilter
            .map(flashcard => (
                { front: flashcard.front, back: flashcard.back }
            ));

        flashcardsFilter = flashcardsFormatted
            .filter((flashcard) => {
                return flashcard.serverInfo && 
                    flashcard.serverInfo.isUpdated && 
                    (flashcard.front !== '' && flashcard.back !== '');
            })
        flashcardsUpdated = flashcardsFilter
            .map(flashcard => (
                { flashcardId: flashcard.serverInfo!.flashcardId, front: flashcard.front, back: flashcard.back }
            ));

        flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
            return flashcard.serverInfo && 
                (flashcard.serverInfo.isDeleted || 
                    (flashcard.serverInfo.isUpdated 
                        && flashcard.front === '' 
                        && flashcard.back === ''
                    )
                );
        })
        flashcardsDeleted = flashcardsFilter.map(flashcard => flashcard.serverInfo!.flashcardId);

        if((!flashcardsAdded || flashcardsAdded.length === 0) && 
            (!flashcardsUpdated || flashcardsUpdated.length === 0) && 
            (!flashcardsDeleted || flashcardsDeleted.length === 0)
        ) return;

        let dataSubmit : FlashcardsSubmit = { flashcardsAdded, flashcardsUpdated, flashcardsDeleted };

        try {
            const responseData = await postRequest(`/flashcards/batch?topicId=${topicId}`, dataSubmit);
            router.push(`/en/flashcards/study?topicId=${topicId}`);
        } catch(err) {
            console.log(err);
        }
    }

    function handleClickBack() {
        router.back();
    }

    if(flashcardLoading) {
        return <div>Loading...</div>
    }

    if(flashcardError) {
        return <div>Error: { flashcardError } </div>
    }

    // console.log(flashcards);
    return (
        <div style={{ padding: '30px 70px', backgroundColor: '#F9FAFB' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 15 }}>
                    <Button onClick={handleClickBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ArrowBigLeft/>
                        <div style={{ fontSize: 14 }}>Back</div>
                    </Button>
                    <div style={{ color: '#1F2937', fontSize: 24, fontWeight: 'bold' }}>My Flashcards</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 15 }}>
                    <Button style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Import style={{ alignSelf: 'center' }} size={24}/> 
                        <div style={{ fontSize: 14 }}>Import</div>
                    </Button>

                    <Button onClick={handleSave} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Save style={{ alignSelf: 'center' }} size={24}/> 
                        <div style={{ fontSize: 14 }}>Save</div>
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-12 gap-8 flex flex-col" style={{ marginTop: 30 }}>

                {flashcards?.map((flashcard, index) => {
                    if(flashcard.serverInfo?.isDeleted) return null;
                    return (
                        <div key={flashcard.id} style={{ borderRadius: 12 }} className="col-span-4 bg-white p-8 text-center gap-4 flex flex-col gap-4">
                            <div className="flex flex-rol gap-4 justify-end">
                                <Edit size={20} style={{ cursor: 'pointer' }}/>
                                <Trash2 size={20} style={{ cursor: 'pointer' }} onClick={() => handleDeleteFlashcard(getFlashcardType(flashcard), flashcard.id)}/>
                            </div>
                            <div className="flex flex-col gap-4">
                                <Textarea 
                                    placeholder="Front" 
                                    className="resize-none" 
                                    value={flashcard.front}
                                    onChange={(event) => handleOnChangeFlashcard('front', getFlashcardType(flashcard), { order: index, text: event.target.value })}
                                />
                                <Textarea 
                                    placeholder="Back" 
                                    className="resize-none" 
                                    value={flashcard.back}
                                    onChange={(event) => handleOnChangeFlashcard('back', getFlashcardType(flashcard), { order: index, text: event.target.value })}
                                />
                            </div>
                        </div>
                    )
                })}

                <div className="col-span-12 flex justify-center">
                    <Button onClick={handleAddFlashcardsCount}>+ Add Cards</Button>
                </div>
            </div>

        </div>
    )
}

export default Page;