import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ShowIf } from '@/components/ui/ShowIf';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Clock,
    Pause,
    Play,
    RotateCcw,
    Settings,
    Shuffle,
    SquareChevronDown,
    SquarePen,
    XCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

interface Props {
    style?: string;
    currentFlashcardIndex: number;
    flashcardsLength: number;
    CustomElement?: ReactNode;

    // handleClickBackFlashcard: () => void;
    // handleClickNextFlashcard: () => void;

    // isPlaying: boolean;
    // handleClickIsPlaying: () => void;

    autoPlayEnabled: boolean;
    handleOnChangeAutoPlayEnabled: () => void;

    handleResetProgress: () => void;

    autoPlaySpeed: number;
    handleOnChangeAutoPlaySpeed: (value: number[]) => void;

    shuffleEnabled: boolean;
    handleOnChangeShuffleEnabled: () => void;

    handleClickEditFlashcards: () => void;
}

const labelStyle = 'text-sm text-foreground font-medium';

export default function StudyControls(props: Props) {
    const { isTeacher } = useRoleChecker();
    const t = useTranslations('flashcard.study');
    const { style } = props;
    const { currentFlashcardIndex, flashcardsLength } = props;
    const { autoPlayEnabled, handleOnChangeAutoPlayEnabled } = props;
    const { handleResetProgress } = props;
    const { autoPlaySpeed, handleOnChangeAutoPlaySpeed } = props;
    const { shuffleEnabled, handleOnChangeShuffleEnabled } = props;
    const { handleClickEditFlashcards } = props;

    const { CustomElement } = props;

    function renderProgressSection(style: string) {
        const progress = parseInt(((currentFlashcardIndex / (flashcardsLength - 1)) * 100).toFixed(0));
        return (
            <div className={style}>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                        {t('card')} {currentFlashcardIndex + 1} {t('of')} {flashcardsLength}
                    </span>
                    <span className="text-sm text-muted-foreground">{progress}% {t('complete')}</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
        );
    }

    function renderAutoPlaySection(style: string) {
        return (
            <div className={style}>
                <div className="flex flex-row items-center gap-2">
                    <Clock size={16} />
                    <Label className="text-sm text-muted-foreground">{t('autoPlay')}</Label>
                </div>
                <Switch checked={autoPlayEnabled} onCheckedChange={handleOnChangeAutoPlayEnabled} />
            </div>
        );
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
                                    className="h-8 px-2"
                                    // disabled={autoPlayEnabled}
                                >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    <span className="text-muted-foreground">{t('resetProgress')}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Reset study session</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        );
    }

    function renderAutoPlaySpeedSection(style: string) {
        return (
            <div className={style}>
                <div className="flex flex-row items-center gap-2">
                    <Clock size={16} />
                    <Label className="text-sm text-muted-foreground">{t('speed')}: {autoPlaySpeed}s</Label>
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
        );
    }

    function renderShuffleSection(style: string) {
        return (
            <div className={style}>
                <div className="flex flex-row items-center gap-2">
                    <Shuffle size={16} />
                    <Label className="text-sm text-muted-foreground">{t('shuffle')}</Label>
                </div>
                <Switch checked={shuffleEnabled} onCheckedChange={handleOnChangeShuffleEnabled} />
            </div>
        );
    }

    function renderEditSection(style: string) {
        return (
            <div className={style}>
                <div className="flex flex-row-items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={handleClickEditFlashcards}
                                >
                                    <SquarePen className="h-4 w-4 mr-1" />
                                    <span className="text-sm text-muted-foreground">{t('edit')}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit Flashcards</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        );
    }

    function renderBackFirstSection(style: string) {
        return (
            <div className={style}>
                <div className="flex flex-row items-center gap-2">
                    <SquareChevronDown size={16} />
                    <Label className="text-sm text-muted-foreground">Back first</Label>
                </div>
                <Switch />
            </div>
        );
    }

    return (
        <div className={style}>
            {renderProgressSection('flex flex-col')}

            <div className="grid grid-cols-12 gap-3">
                {renderAutoPlaySection('col-span-6 flex flex-row gap-2 items-center justify-between')}
                {renderResetProgressSection('col-span-6 flex flex-row gap-2 items-center justify-between')}
                <div className="col-span-6">{renderAutoPlaySpeedSection('flex flex-col gap-2')}</div>

                <div className="col-span-6">{/* Hi */}</div>
            </div>

            <div className="grid grid-cols-12 gap-3">
                {renderShuffleSection('col-span-6 flex flex-row gap-2 items-center justify-between')}
                {renderBackFirstSection('col-span-6 flex flex-row gap-2 items-center justify-between')}
            </div>

            <div className="grid grid-cols-12 gap-3">
                <ShowIf when={isTeacher}>
                    {renderEditSection('col-span-6')}
                </ShowIf>
                {/* <div className="col-span-6"></div> */}
                {CustomElement ? CustomElement : null}
            </div>
        </div>
    );
}
