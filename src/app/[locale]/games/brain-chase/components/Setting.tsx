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
import { DEFAULT_SETTINGS, SettingValues, useBrainChase } from '../context/brainChaseContext';

export interface SettingProps {
  onOpenChange?: (open: boolean) => void;
}

export default function Setting({ onOpenChange }: SettingProps) {
  const {
    settings: settingInitial,
    updateSettings,
    gameActive,
    setShowSettings,
    resetGame,
    showSettings: isOpen,
  } = useBrainChase();

  const [settings, setSettings] = useState<SettingValues>(settingInitial);

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
          <SheetTitle className="text-xl font-bold">Game Settings</SheetTitle>
          <SheetDescription>Customize your game experience with these settings.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Speed Setting */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Answer Movement Speed</h3>
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
                <Label htmlFor="speed-slow">Slow</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="speed-medium" />
                <Label htmlFor="speed-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fast" id="speed-fast" />
                <Label htmlFor="speed-fast">Fast</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Question Count Setting */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <h3 className="font-medium text-sm">Number of Questions</h3>
              <span className="text-sm font-medium">
                {settings.questionCount === 0 ? 'Unlimited' : settings.questionCount}
              </span>
            </div>
            <RadioGroup
              value={settings.questionCount.toString()}
              onValueChange={(value) =>
                setSettings({ ...settings, questionCount: parseInt(value) })
              }
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="questions-5" />
                <Label htmlFor="questions-5">5</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10" id="questions-10" />
                <Label htmlFor="questions-10">10</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="20" id="questions-20" />
                <Label htmlFor="questions-20">20</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="questions-unlimited" />
                <Label htmlFor="questions-unlimited">Unlimited</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Time Limit Setting */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <h3 className="font-medium text-sm">Time Limit per Question</h3>
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
            <h3 className="font-medium text-sm">Error Allowance</h3>
            <RadioGroup
              value={settings.errorAllowance.toString()}
              onValueChange={(value) =>
                setSettings({ ...settings, errorAllowance: parseInt(value) })
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="errors-1" />
                <Label htmlFor="errors-1">1 error</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="errors-2" />
                <Label htmlFor="errors-2">2 errors</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="errors-3" />
                <Label htmlFor="errors-3">3 errors</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleResetDefault}>Reset</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
