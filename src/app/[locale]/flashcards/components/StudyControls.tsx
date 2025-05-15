import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Pause, Play, RotateCcw, Settings, Shuffle, SquareChevronDown, SquarePen, XCircle } from "lucide-react";
import { ReactNode } from "react";

interface Props {
    style?: string
    currentFlashcardIndex: number
    flashcardsLength: number
    CustomElement?: ReactNode

    handleClickBackFlashcard: () => void
    handleClickNextFlashcard: () => void
    
    isPlaying: boolean
    handleClickIsPlaying: () => void

    autoPlayEnabled: boolean
    handleOnChangeAutoPlayEnabled: () => void

    handleResetProgress: () => void

    autoPlaySpeed: number
    handleOnChangeAutoPlaySpeed: (value: number[]) => void

    shuffleEnabled: boolean
    handleOnChangeShuffleEnabled: () => void

    handleClickEditFlashcards: () => void
}

export default function StudyControls(props: Props) {
    const { style } = props;
    const { currentFlashcardIndex, flashcardsLength } = props;
    const { handleClickBackFlashcard, handleClickNextFlashcard } = props;
    const { isPlaying, handleClickIsPlaying } = props;
    const { autoPlayEnabled, handleOnChangeAutoPlayEnabled } = props;
    const { handleResetProgress } = props;
    const { autoPlaySpeed, handleOnChangeAutoPlaySpeed } = props;
    const { shuffleEnabled, handleOnChangeShuffleEnabled } = props;
    const { handleClickEditFlashcards } = props;

    const { CustomElement } = props;

    function renderProgressSection(style: string) {
        const progress = parseInt((currentFlashcardIndex / (flashcardsLength - 1) * 100).toFixed(0));
        return (
            <div className={style}>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                        Card {currentFlashcardIndex + 1} of {flashcardsLength}
                    </span>
                    <span className="text-sm text-gray-600">{progress}
                        % Complete
                    </span>
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
                            onClick={handleClickBackFlashcard}
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
                            onClick={handleClickIsPlaying}
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
                            onClick={handleClickNextFlashcard}
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
                <Switch checked={autoPlayEnabled} onCheckedChange={handleOnChangeAutoPlayEnabled} />
            </div>
        )
    }

    function renderResetProgressSection(style: string) {
        return (
            <div className={style}>
                <div className="flex flex-row items-center gap-2">
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
                        onValueChange={handleOnChangeAutoPlaySpeed}
                    />
                </div>
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
                <Switch checked={shuffleEnabled} onCheckedChange={handleOnChangeShuffleEnabled} />
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
                                    className='h-8 px-2 text-gray-600 p-0'
                                    onClick={handleClickEditFlashcards}
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

    function renderBackFirstSection(style: string) {
        return (
            <div className={style}>
                <div className="flex flex-row items-center gap-2">
                    <SquareChevronDown size={16}/>
                    <Label className="text-sm text-gray-600">Back first</Label>
                </div>
                <Switch />
            </div>
        )
    }

    return (
        <div className={style}>
            {renderProgressSection('flex flex-col')}
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
                {renderBackFirstSection('col-span-6 flex flex-row gap-2 items-center justify-between')}
                
            </div>

            <div className="grid grid-cols-12 gap-3">
                {renderEditSection('col-span-6')}
                {/* <div className="col-span-6"></div> */}
                {CustomElement ? CustomElement : null}
            </div>

            
        </div>
    )
}