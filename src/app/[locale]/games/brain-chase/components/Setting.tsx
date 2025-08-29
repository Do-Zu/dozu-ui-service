'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DEFAULT_SETTINGS, GameSettings, useBrainChase } from '../context/brainChaseContext';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';

export interface SettingProps {
  onOpenChange?: (open: boolean) => void;
}

export default function Setting({ onOpenChange }: SettingProps) {
  const t = useTranslations('games.brainChase.gameSettings');
  const {
    settings: settingInitial,
    updateSettings,
    gameActive,
    setShowSettings,
    resetGame,
    showSettings: isOpen,
    flashcards,
  } = useBrainChase();

  const [settings, setSettings] = useState<GameSettings>(settingInitial);

  // Calculate total flashcards available
  const totalFlashcards = flashcards?.length || 0;

  // Generate dynamic question count options based on available flashcards
  const getQuestionCountOptions = () => {
    const options = [];
    
    if (totalFlashcards > 0) {
      // Add standard options if enough flashcards available
      if (totalFlashcards >= 5) options.push({ value: 5, label: '5' });
      if (totalFlashcards >= 10) options.push({ value: 10, label: '10' });
      if (totalFlashcards >= 20) options.push({ value: 20, label: '20' });
      
      // Add "All" option if it's different from standard options
      if (![5, 10, 20].includes(totalFlashcards) && totalFlashcards > 1) {
        options.push({ 
          value: totalFlashcards, 
          label: `${totalFlashcards} (${t('all')})` 
        });
      }
      
      // If no standard options available, add the total as main option
      if (options.length === 0) {
        options.push({ 
          value: totalFlashcards, 
          label: `${totalFlashcards}` 
        });
      }
    }
    
    return options;
  };

  const questionOptions = getQuestionCountOptions();

  const handleOpenChange = (newOpen: boolean) => {
    setShowSettings(newOpen);
    if (!newOpen) {
      handleSettingsChange();
    }
  };

  const handleSettingsChange = (isClose = true, isResetGame = false) => {
    updateSettings(settings);

    if (isClose) setShowSettings(false);

    if (isResetGame && gameActive) resetGame();
  };

  const handleResetDefault = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const handleCancel = () => {
    setSettings(settingInitial);
    setShowSettings(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="bg-background w-[350px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">{t('title')}</SheetTitle>
          <SheetDescription>{t('description')}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Speed Setting */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">{t('speed')}</h3>
            <RadioGroup
              value={settings.speed}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  speed: value as 'slow' | 'medium' | 'fast',
                })
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="slow" id="speed-slow" />
                <Label htmlFor="speed-slow">{t('slow')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="speed-medium" />
                <Label htmlFor="speed-medium">{t('medium')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fast" id="speed-fast" />
                <Label htmlFor="speed-fast">{t('fast')}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Question Count Setting */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <h3 className="font-medium text-sm">{t('questionCount')}</h3>
              {/* <span className="text-sm font-medium">
                {settings.questionCount === 0 ? t('unlimited') : settings.questionCount}
              </span> */}
            </div>
            
            {/* Display available flashcards info */}
            <div className="text-xs text-muted-foreground">
              {totalFlashcards > 0 
                ? `${totalFlashcards} ${t('flashcardsAvailable')}`
                : t('noFlashcards')
              }
            </div>
            
            <RadioGroup
              value={settings.questionCount.toString()}
              onValueChange={(value) =>
                setSettings({ ...settings, questionCount: parseInt(value) })
              }
              className="flex flex-wrap gap-3"
            >
              {questionOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option.value.toString()} 
                    id={`questions-${option.value}`} 
                  />
                  <Label htmlFor={`questions-${option.value}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Time Limit Setting */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <h3 className="font-medium text-sm">{t('timeLimit')}</h3>
              <span className="text-sm font-medium">{settings.timeLimit} seconds</span>
            </div>
            <Slider
              value={[settings.timeLimit]}
              min={5}
              max={60}
              step={5}
              onValueChange={(value) => setSettings({ ...settings, timeLimit: value[0] })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5s</span>
              <span>60s</span>
            </div>
          </div>

          {/* Error Allowance Setting */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">{t('errorAllowance')}</h3>
            <RadioGroup
              value={settings.errorAllowance.toString()}
              onValueChange={(value) =>
                setSettings({ ...settings, errorAllowance: parseInt(value) })
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="errors-1" />
                <Label htmlFor="errors-1">{t('oneError')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="errors-2" />
                <Label htmlFor="errors-2">{t('twoErrors')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="errors-3" />
                <Label htmlFor="errors-3">{t('threeErrors')}</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <h3 className="font-medium  text-sm">{t('shuffleQuestions')}</h3>
          <Switch
            checked={settings.shuffleQuestions}
            onCheckedChange={(checked) => setSettings({ ...settings, shuffleQuestions: checked })}
            aria-label="Toggle question shuffling"
          />
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button onClick={handleResetDefault}>{t('reset')}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
