import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ShowIf } from '@/components/ui/ShowIf';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { Clock, RotateCcw, Shuffle, SquarePen, SquareChevronDown, Gamepad2, Brain, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    style?: string;
    currentFlashcardIndex: number;
    flashcardsLength: number;
    autoPlayEnabled: boolean;
    handleOnChangeAutoPlayEnabled: () => void;
    handleResetProgress: () => void;
    autoPlaySpeed: number;
    handleOnChangeAutoPlaySpeed: (value: number[]) => void;
    shuffleEnabled: boolean;
    handleOnChangeShuffleEnabled: () => void;
    handleClickEditFlashcards: () => void;
    handleOnClickLearning: () => void;
    handleOnClickGame: () => void;
    handleOnClickMemoryMatch: () => void;
}

export default function StudyControls({
    style,
    currentFlashcardIndex,
    flashcardsLength,
    autoPlayEnabled,
    handleOnChangeAutoPlayEnabled,
    handleResetProgress,
    autoPlaySpeed,
    handleOnChangeAutoPlaySpeed,
    shuffleEnabled,
    handleOnChangeShuffleEnabled,
    handleClickEditFlashcards,
    handleOnClickLearning,
    handleOnClickGame,
    handleOnClickMemoryMatch,
}: Props) {
    const { isTeacher } = useRoleChecker();
    const t = useTranslations('flashcard.study');
    const progress = parseInt(((currentFlashcardIndex / (flashcardsLength - 1)) * 100).toFixed(0));

    return (
        <div className={style}>
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                                {' '}
                                {/* Giảm font chữ */}
                                {t('card')} {currentFlashcardIndex + 1} {t('of')} {flashcardsLength}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {progress}% {t('complete')}
                            </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-sm font-semibold">Study Options</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="autoplay-switch" className="flex items-center gap-2 cursor-pointer text-sm">
                            <Clock size={16} />
                            <span>{t('autoPlay')}</span>
                        </Label>
                        <Switch
                            id="autoplay-switch"
                            checked={autoPlayEnabled}
                            onCheckedChange={handleOnChangeAutoPlayEnabled}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">
                            <Clock size={16} />
                            <span>
                                {t('speed')}: {autoPlaySpeed}s
                            </span>
                        </Label>
                        <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[autoPlaySpeed]}
                            onValueChange={handleOnChangeAutoPlaySpeed}
                            disabled={!autoPlayEnabled}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="shuffle-switch" className="flex items-center gap-2 cursor-pointer text-sm">
                            <Shuffle size={16} />
                            <span>{t('shuffle')}</span>
                        </Label>
                        <Switch
                            id="shuffle-switch"
                            checked={shuffleEnabled}
                            onCheckedChange={handleOnChangeShuffleEnabled}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <Label className="flex items-center gap-2 text-sm">
                            <RotateCcw size={16} />
                            <span>{t('resetProgress')}</span>
                        </Label>
                        <Button variant="outline" size="sm" onClick={handleResetProgress} className="h-7 px-2 text-xs">
                            {t('reset')}
                        </Button>
                    </div>

                    <ShowIf when={isTeacher}>
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2 text-sm">
                                <SquarePen size={16} />
                                <span>{t('edit')}</span>
                            </Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClickEditFlashcards}
                                className="h-7 px-2 text-xs"
                            >
                                {t('edit')}
                            </Button>
                        </div>
                    </ShowIf>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-sm font-semibold">Other Modes</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="flex flex-col space-y-1">
                        <Button
                            variant="ghost"
                            className="justify-start gap-2 h-8 text-sm"
                            onClick={handleOnClickLearning}
                        >
                            <BookOpen className="h-4 w-4" /> <span>{t('learning')}</span>
                        </Button>
                        <Button variant="ghost" className="justify-start gap-2 h-8 text-sm" onClick={handleOnClickGame}>
                            <Gamepad2 className="h-4 w-4" /> <span>Brain Chase</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className="justify-start gap-2 h-8 text-sm"
                            onClick={handleOnClickMemoryMatch}
                        >
                            <Brain className="h-4 w-4" /> <span>Memory</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
