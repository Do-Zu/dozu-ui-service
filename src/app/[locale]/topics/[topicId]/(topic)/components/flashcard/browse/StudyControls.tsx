import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ShowIf } from '@/components/ui/ShowIf';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { Clock, RotateCcw, Shuffle, SquarePen, Gamepad2, Brain, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
    style?: string;
    currentFlashcardIndex: number;
    flashcardsLength: number;
    autoPlayEnabled: boolean;
    handleAutoPlayToggle: () => void;
    handleResetProgress: () => void;
    autoPlaySpeed: number;
    handleAutoPlaySpeedChange: (value: number[]) => void;
    shuffleEnabled: boolean;
    handleShuffleToggle: () => void;
    handleEditFlashcardsClick: () => void;
    isFullScreen?: boolean;
}

export default function StudyControls({
    style,
    currentFlashcardIndex,
    flashcardsLength,
    autoPlayEnabled,
    handleAutoPlayToggle,
    handleResetProgress,
    autoPlaySpeed,
    handleAutoPlaySpeedChange,
    shuffleEnabled,
    handleShuffleToggle,
    handleEditFlashcardsClick,
    isFullScreen = false,
}: Props) {
    const { isTeacher } = useRoleChecker();
    const t = useTranslations('flashcard.study');
    const progress =
        flashcardsLength <= 1
            ? flashcardsLength === 1
                ? 100
                : 0
            : parseInt(((currentFlashcardIndex / (flashcardsLength - 1)) * 100).toFixed(0));

    return (
        <div
            className={cn(
                style,
                'bg-gray-100 dark:bg-gray-850 h-full w-full p-3 rounded-lg shadow-sm',
                'flex flex-col gap-3 overflow-auto max-h-screen',
                isFullScreen ? 'p-6 gap-6' : '',
            )}
        >
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                                {t('card')} {currentFlashcardIndex + 1} {t('of')} {flashcardsLength}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {progress}% {t('complete')}
                            </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-4">
                    <CardTitle className={cn('font-medium text-base')}>{t('studyOptions')}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="autoplay-switch"
                            className={cn('flex items-center gap-2 cursor-pointer font-medium')}
                        >
                            <Clock size={isFullScreen ? 16 : 12} />
                            <span>{t('autoPlay')}</span>
                        </Label>
                        <Switch id="autoplay-switch" checked={autoPlayEnabled} onCheckedChange={handleAutoPlayToggle} />
                    </div>

                    <div className="space-y-2">
                        <Label className={cn('flex items-center gap-2 font-medium')}>
                            <Clock size={isFullScreen ? 16 : 12} />
                            <span>
                                {t('speed')}: {autoPlaySpeed}s
                            </span>
                        </Label>
                        <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[autoPlaySpeed]}
                            onValueChange={handleAutoPlaySpeedChange}
                            disabled={!autoPlayEnabled}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="shuffle-switch"
                            className={cn('flex items-center gap-2 cursor-pointer font-medium')}
                        >
                            <Shuffle size={isFullScreen ? 16 : 12} />
                            <span>{t('shuffle')}</span>
                        </Label>
                        <Switch id="shuffle-switch" checked={shuffleEnabled} onCheckedChange={handleShuffleToggle} />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <Label className={cn('flex items-center gap-2 cursor-pointer font-medium')}>
                            <RotateCcw size={isFullScreen ? 16 : 12} />
                            <span>{t('resetProgress')}</span>
                        </Label>
                        <Button variant="outline" size="sm" onClick={handleResetProgress} className={cn('h-7 px-2')}>
                            {t('reset')}
                        </Button>
                    </div>

                    <ShowIf when={isTeacher}>
                        <div className="flex items-center justify-between">
                            <Label className={cn('flex items-center gap-2 font-medium')}>
                                <SquarePen size={isFullScreen ? 16 : 12} />
                                <span>{t('edit')}</span>
                            </Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditFlashcardsClick}
                                className={cn('h-7 px-2')}
                            >
                                {t('edit')}
                            </Button>
                        </div>
                    </ShowIf>
                </CardContent>
            </Card>
        </div>
    );
}
