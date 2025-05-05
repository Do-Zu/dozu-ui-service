'use client'

import useFetch from "@/hooks/useFetch";
import { IFlashcard } from "../components/Flashcard";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import styles from './page.module.css';
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Pause, Play, RotateCcw, Settings, Shuffle, SquarePen, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Slider } from "../components/ui/slider";

const initialAutoPlaySpeed = 3;

function getRandomInt(max: number) {
    return Math.floor(Math.random() * (max + 1));
}

function getRandomArray(num: number) {
    const result = [];
    const check = Array(num).fill(false);

    for(let i = 0; i < num;) {
        const rand = getRandomInt(num - 1);
        if(check[rand]) continue;
        check[rand] = true;
        result.push(rand);
        ++i;
    }
    return result;
}

function getFlashcardsShuffled(flashcards: IFlashcard[]) : IFlashcard[] {
    const flashcardsRandom = [];
    const arrayRandom = getRandomArray(flashcards.length);
    for (const indexRandom of arrayRandom) {
        flashcardsRandom.push(flashcards[indexRandom]);
    } 
    return flashcardsRandom;
}

export default function Page() {

    const router = useRouter();
    const searchParamsClient = useSearchParams();
    const topicId = searchParamsClient.get('topicId')!;

    const flashcardSelector = (data: { flashcards: IFlashcard[] }) => data.flashcards;

    const { 
        data: flashcards, 
        setData: setFlashcardData, 
        loading: flashcardLoading, 
        error: flashcardError 
    } 
        = useFetch<IFlashcard[]>(`/flashcards?topicId=${topicId}`, flashcardSelector);

    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);

    const [isInitialFront, setIsInitialFront] = useState<boolean>(true);
    const [isFront, setIsFront] = useState<boolean>(isInitialFront);

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(false);
    const [autoPlaySpeed, setAutoPlaySpeed] = useState<number>(initialAutoPlaySpeed);

    const [shuffleEnabled, setShuffleEnabled] = useState<boolean>(false);

    const currentFlashcardIndexRef = useRef<number>(0);

    useEffect(() => {
        currentFlashcardIndexRef.current = currentFlashcardIndex;
    }, [currentFlashcardIndex]);
    
    const flashcardsShuffled = useMemo(() => {
        if(flashcards) return getFlashcardsShuffled(flashcards);
        return null;
    }, [shuffleEnabled]);

    function getCurrentFlashcard() {
        if(shuffleEnabled) {
            return flashcardsShuffled ? flashcardsShuffled[currentFlashcardIndex] : null;
        } else {
            return flashcards? flashcards[currentFlashcardIndex] : null;
        }
    }

    const currentFlashcard = getCurrentFlashcard();

    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(cardRef.current) {
            cardRef.current.style.transform = 'rotateX(0deg)';
            cardRef.current.style.transition = 'transform 0.6s';
        }
    }, [flashcards]);

    function handleClickBackFlashcard() {
        if(!isFront) {
            setIsFront(true);
            if(cardRef.current) {
                cardRef.current.style.transition = 'none';
                cardRef.current.style.transform = 'rotateX(0deg)';

                handleBackFlashcard();

                setTimeout(() => {
                    if(cardRef.current) cardRef.current.style.transition = 'transform 0.6s';
                }, 1000);
            }
        } else {
            handleBackFlashcard();
        }
    }

    function handleClickNextFlashcard() {
        if(!isFront) {
            setIsFront(true);
            if(cardRef.current) {
                cardRef.current.style.transition = 'none';
                cardRef.current.style.transform = 'rotateX(0deg)';

                handleNextFlashcard();

                setTimeout(() => {
                    if(cardRef.current) cardRef.current.style.transition = 'transform 0.6s';
                }, 1000);
            }
        } else {
            handleNextFlashcard();
        }
    }

    function handleBackFlashcard() {
        if(currentFlashcardIndex > 0) setCurrentFlashcardIndex(prevIndex => prevIndex - 1);
    }

    function handleNextFlashcard() {
        console.log(currentFlashcardIndex);
        if(flashcards && currentFlashcardIndex < flashcards.length - 1) setCurrentFlashcardIndex(prevIndex => prevIndex + 1);
    }
 
    function handleAutoFlip() {
        if(cardRef.current) {
            cardRef.current.style.transform = 'rotateX(180deg)';
        }
    }

    // không thể lật flashcard khi đang auto
    function handleNormalFlip() {
        if(cardRef.current && !autoPlayEnabled) {
            cardRef.current.style.transform = isFront ? 'rotateX(180deg)': 'rotateX(0deg)';
            setIsFront(prev => !prev);
        }
    }

    function handleClickEdit() {
        router.push(`/en/flashcards/edit?topicId=${topicId}`);
    }

    function handleResetProgress() {
        setCurrentFlashcardIndex(0);
    }    

    // ver2

    function handleAutoNextFlashcard() {
        console.log(currentFlashcardIndexRef);
        if(currentFlashcardIndexRef.current < flashcards!.length - 1) setCurrentFlashcardIndex(prev => prev + 1);
    }

    function initTask() {
        if(isFront) handleAutoFlip();
    
        return setTimeout(() => {
            if(cardRef.current) {
                cardRef.current.style.transition = 'none';
                cardRef.current.style.transform = 'rotateX(0deg)';

                // handleNextFlashcard();
                handleAutoNextFlashcard();
                if(currentFlashcardIndexRef.current === flashcards!.length - 1) setAutoPlayEnabled(false);

                setTimeout(() => {
                    if(cardRef.current) cardRef.current.style.transition = 'transform 0.6s';
                }, 100);
            }
        }, autoPlaySpeed * 1000);
    }

    function repeatTask() {
        // action 1
        handleAutoFlip();
    
        return setTimeout(() => {
            if(cardRef.current) {
                // chỉnh về front trước khi chuyển sang flashcard mới
                cardRef.current.style.transition = 'none';
                cardRef.current.style.transform = 'rotateX(0deg)';

                // action 2
                // handleNextFlashcard();
                handleAutoNextFlashcard();
                if(currentFlashcardIndexRef.current === flashcards!.length - 1) setAutoPlayEnabled(false);

                // set lại trạng thái flashcard, cần timeout để lần render sau mới thực thi
                setTimeout(() => {
                    if(cardRef.current) cardRef.current.style.transition = 'transform 0.6s';
                }, 100);
            }
        }, autoPlaySpeed * 1000);
    }

    useEffect(() => {
        if(!autoPlayEnabled) {
            return;
        }
        
        let mainTimerId: NodeJS.Timeout, intervalId: any;
        let initialTimerId: NodeJS.Timeout;
        let repeatedTimerId: NodeJS.Timeout;

        mainTimerId = setTimeout(() => {
            initialTimerId = initTask();
            // repeatTask();
            intervalId = setInterval(() => {
                repeatedTimerId = repeatTask();
            }, autoPlaySpeed * 1000 * 2);
        }, isFront ? autoPlaySpeed * 1000 : 0);
        // }, autoPlaySpeed * 1000);

        return () => {
            if(cardRef.current) {
                setIsFront(cardRef.current.style.transform === 'rotateX(0deg)');
            }
            clearTimeout(mainTimerId);
            clearTimeout(initialTimerId);
            clearInterval(intervalId);
            clearTimeout(repeatedTimerId);
        }
    }, [isFront, autoPlayEnabled, autoPlaySpeed]);

    if(flashcardLoading === true || !flashcards || !currentFlashcard) {
        return (
            <div>Loading flashcards...</div>
        )
    }

    if(flashcardError) {
        return (
            <div>Something went wrong with Flashcards</div>
        )
    }

    function renderProgressSection(style: string) {
        if(!flashcards) return null;
        const progress = parseInt((currentFlashcardIndex / (flashcards.length - 1) * 100).toFixed(0));
        return (
            <div className={style}>
                <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                    Card {currentFlashcardIndex + 1} of {flashcards.length}
                </span>
                <span className="text-sm text-gray-600">{progress}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
        )
    }

    function renderToolTipSection(style: string) {
        return (
            <div className={style}>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={handleClickBackFlashcard}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Previous card</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-full bg-red-50 hover:bg-red-100 border-red-200"
                        >
                            <XCircle className="h-6 w-6 text-red-500" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Mark as unknown</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-14 w-14 rounded-full bg-gray-200 hover:bg-gray-300"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>{isPlaying ? "Pause" : "Play"} study session</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-full bg-green-50 hover:bg-green-100 border-green-200"
                        >
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Mark as known</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={handleClickNextFlashcard}
                        >
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Next card</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        )
    }

    function renderAutoPlaySection(style: string) {
        return (
            <div className={style}>
                <div className="flex flex-row items-center gap-2">
                    <Clock size={16}/>
                    <Label className="text-sm text-gray-600">Auto-play</Label>
                </div>
                <Switch checked={autoPlayEnabled} onCheckedChange={() => setAutoPlayEnabled(!autoPlayEnabled)} />
            </div>
        )
    }

    function renderShuffleSection(style: string) {
        return (
            <div className={style}>
                <div className="flex flex-row items-center gap-2">
                    <Shuffle size={16}/>
                    <Label className="text-sm text-gray-600">Shuffle</Label>
                </div>
                <Switch checked={shuffleEnabled} onCheckedChange={() => setShuffleEnabled(!shuffleEnabled)} />
            </div>
        )
    }

    function renderEditSection(style: string) {
        return (
            <div className={style}>
                <div className="flex flex-row-items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-8 px-2 text-gray-600'
                                    onClick={handleClickEdit}
                                >
                                    <SquarePen className="h-4 w-4 mr-1"/>
                                    <span className="text-sm text-gray-600">Edit</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>Edit Flashcards</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        )
    }

    function renderResetProgressSection(style: string) {
        return (
            <div className={style}>
                <div className="flex flex-row items-center gap-2">
                    {/* <RotateCcw size={16} onClick={handleResetProgress}/>
                    <Label className="text-gray-600" style={{ fontSize: 12 }}>Reset Progress</Label> */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetProgress}
                                    className="h-8 px-2 text-gray-600"
                                    // disabled={autoPlayEnabled}
                                >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    <span className="text-gray-600">Reset Progress</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>Reset study session</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Settings/>
            </div>
        )
    }

    function renderAutoPlaySpeedSection(style: string) {
        return (
            <div className={style}>
                <div className="flex flex-row items-center gap-2">
                    <Clock size={16}/>
                    <Label className="text-sm text-gray-600">Speed: {autoPlaySpeed}s</Label>
                </div>
                <div>
                    <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[autoPlaySpeed]}
                        onValueChange={(value) => setAutoPlaySpeed(value[0])}
                    />
                </div>
            </div>
        )
    }

    function renderFlashcardButtonsSection(style: string) {
        return (
            <div className={style}>
                <button onClick={handleClickBackFlashcard} className={`${styles['circle-button']} ${styles.x}`}>X</button>
                <div>{currentFlashcardIndex + 1} / { flashcards!.length} </div>
                <button onClick={handleClickNextFlashcard} className={`${styles['circle-button']} ${styles.check}`}>✓</button>
            </div>
        )
    }

    function renderMainFlashcardSection() {
        if(!currentFlashcard) return;
        return (
            <div className={styles.cardContainer} onClick={() => handleNormalFlip()}>
                <div className={styles.card} ref={cardRef}>
                    <div className={styles.front}>
                        {currentFlashcard.front}
                    </div>
    
                    <div className={styles.back}>
                        {currentFlashcard.back}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', height: '90vh', backgroundColor: '#F3F4F6' }}>
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', margin: 5, marginBottom: 0, padding: 20 }}>
                <div style={{ backgroundColor: '#fff', padding: 10 }}>Back Study Concepts</div>
                <div style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 20 }} className="grid grid-cols-11 gap-5">

                    {/* Main Flashcard Section */}
                    <div style={{ backgroundColor: '#F3F4F6' }} className="col-span-8 flex flex-col justify-center items-center">
                        
                        {renderMainFlashcardSection()}
                        {renderFlashcardButtonsSection('flex flex-row gap-4 items-center mt-4')}
                    </div>

                    {/* Study Control Section */}
                    <div style={{ backgroundColor: '#F3F4F6' }} className="col-span-3 p-6 rounded-lg shadow-sm flex flex-col gap-6">

                        {renderProgressSection('')}
                        {renderToolTipSection('flex justify-center items-center gap-4')}

                        <div className="grid grid-cols-12 gap-3">

                            {renderAutoPlaySection('col-span-6 flex flex-row gap-2 items-center justify-between')}
                            {renderResetProgressSection('col-span-6 flex flex-row gap-2 items-center justify-between')}

                            <div className="col-span-6">
                                {renderAutoPlaySpeedSection('flex flex-col gap-2')}
                            </div>

                            <div className="col-span-6">
                                {/* Hi */}
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-3">
                            {renderShuffleSection('col-span-6 flex flex-row gap-2 items-center justify-between')}
                            {renderEditSection('col-span-6')}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}