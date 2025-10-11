'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info, PlusCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useFetch from '@/hooks/useFetch';
import ankiSettingService from '@/services/anki-setting/ankiSetting.service';
import LoadingPage from '@/app/loading';
import { IAnkiSetting, IUpdateAnkiSettingBody } from '@/types/anki-setting/ankiSetting.type';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useParams } from 'next/navigation';
import topicService from '@/services/topic/topic.service';
import { ITopic } from '../../../types/topic.type';

const SettingsField = ({
    label,
    description,
    children,
}: {
    label: string;
    description?: string;
    children: React.ReactNode;
}) => (
    <div className="grid grid-cols-3 items-center gap-4">
        <div className="col-span-1">
            <Label className="font-medium flex items-center gap-2">
                {label}
                {description && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info size={14} className="text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{description}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </Label>
        </div>
        <div className="col-span-2">{children}</div>
    </div>
);

// needs to be used by data from backend
const ankiSettingProfiles = [{ id: '1', name: 'Default' }];

function AnkiSettingsPage() {
    const params = useParams();
    let { topicId } = params as { topicId: string | number };
    topicId = Number(topicId);
    if (isNaN(topicId)) {
        return <div>No topic id is provided</div>;
    }

    const {
        data: topic,
        loading: topicLoading,
        error: topicError,
    } = useFetch<ITopic>(() => topicService.getTopicById(topicId));

    const {
        data: ankiSetting,
        setData: setAnkiSetting,
        error: ankiSettingError,
        loading: ankiSettingLoading,
    } = useFetch<IAnkiSetting>(ankiSettingService.getDefaultSetting);

    const { loading: updateSettingLoading, execute: updateSetting } = usePost<
        { settingId: number; data: IUpdateAnkiSettingBody },
        IAnkiSetting
    >(ankiSettingService.updateSetting, 'PATCH', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess(data) {
            toastHelper.showSuccessMessage('Update setting successfully');
        },
    });

    const [firstFetch, setFirstFetch] = useState<boolean>(true);
    const [learningSteps, setLearningSteps] = useState<string>('');
    const [relearningSteps, setRelearningSteps] = useState<string>('');

    useEffect(() => {
        if (ankiSetting && firstFetch) {
            setLearningSteps(formatStepsForDisplay(ankiSetting.learningSteps));
            setRelearningSteps(formatStepsForDisplay(ankiSetting.relearningSteps));
            setFirstFetch(false);
        }
    }, [ankiSetting]);

    function formatStepsForDisplay(steps: number[] | undefined): string {
        if (!steps) return '';
        const strings: string[] = [];

        for (const step of steps) {
            if (step % 1440 === 0) {
                strings.push(step / 1440 + 'd');
            } else if (step % 60 === 0) {
                strings.push(step / 60 + 'h');
            } else {
                strings.push(step + 'm');
            }
        }
        return strings.join(' ');
    }

    function validateSteps(steps: string) {
        const values: number[] = [];
        const strings: string[] = [];
        const tokens = steps.split(' ');
        const regex = /^\d+[a-zA-Z]$/;
        for (const token of tokens) {
            if (!regex.test(token)) {
                continue;
            }
            const lastChar = token[token.length - 1];
            const val = parseInt(token.substring(0, token.length - 1)) || 1;
            if (lastChar === 'm') {
                values.push(val);
                strings.push(token);
            }
            if (lastChar === 'h') {
                values.push(val * 60);
                strings.push(token);
            }
            if (lastChar === 'd') {
                values.push(val * 1440);
                strings.push(token);
            }
        }
        return {
            values,
            stringForDisplay: strings.join(' '),
        };
    }

    function getValidatedAnkiValue(
        field: keyof Omit<IAnkiSetting, 'ankiSettingId' | 'userId' | 'isDefault' | 'learningSteps' | 'relearningSteps'>,
        value: string,
    ): number {
        const num = parseFloat(value);
        let result = num;

        if (field === 'graduatingInterval') {
            result = Math.floor(clamp(num || 1, 1, 9999));
        } else if (field === 'easyInterval') {
            result = Math.floor(clamp(num || 1, 1, 9999));
        } else if (field === 'minimumInterval') {
            result = Math.floor(clamp(num || 1, 1, 9999));
        } else if (field === 'maximumInterval') {
            result = Math.floor(clamp(num || 1, 1, 36500));
        } else if (field === 'startingEase') {
            result = clamp(num || 1.31, 1.31, 5);
            result = Math.round(result * 100) / 100;
        } else if (field === 'easyBonus') {
            result = clamp(num || 1, 1, 5);
            result = Math.round(result * 100) / 100;
        } else if (field === 'intervalModifier') {
            result = clamp(num || 0.5, 0.5, 2);
            result = Math.round(result * 100) / 100;
        } else if (field === 'hardInterval') {
            result = clamp(num || 0.5, 0.5, 1.3);
            result = Math.round(result * 100) / 100;
        } else if (field === 'newInterval') {
            result = clamp(num || 0, 0, 1);
            result = Math.round(result * 100) / 100;
        } else if (field === 'newCardsPerDay') {
            result = Math.floor(clamp(num || 0, 0, 9999));
        } else if (field === 'maximumReviewsPerDay') {
            result = Math.floor(clamp(num || 0, 0, 9999));
        } else {
            result = num || 0;
        }

        return result;
    }

    function clamp(value: number, min: number, max: number): number {
        if (isNaN(value)) return min;
        return Math.min(Math.max(value, min), max);
    }

    function handleFieldChange(
        field: keyof Omit<IAnkiSetting, 'ankiSettingId' | 'userId' | 'isDefault'>,
        event: ChangeEvent<HTMLInputElement>,
    ) {
        if (field === 'learningSteps') {
            setLearningSteps(event.target.value);
        } else if (field === 'relearningSteps') {
            setRelearningSteps(event.target.value);
        } else {
            setAnkiSetting((prev) =>
                prev ? { ...prev, [field]: getValidatedAnkiValue(field, event.target.value) } : null,
            );
        }
    }

    function handleFieldBlur(
        field: keyof Pick<IAnkiSetting, 'learningSteps' | 'relearningSteps'>,
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const str = event.target.value;
        const { values, stringForDisplay } = validateSteps(str);
        if (field === 'learningSteps') {
            setAnkiSetting((prev) => (prev ? { ...prev, learningSteps: values } : null));
            setLearningSteps(stringForDisplay);
        }
        if (field === 'relearningSteps') {
            setAnkiSetting((prev) => (prev ? { ...prev, relearningSteps: values } : null));
            setRelearningSteps(stringForDisplay);
        }
    }

    async function handleSubmit() {
        if (!ankiSetting) return;
        const { userId, isDefault, ankiSettingId, ...rest } = ankiSetting;
        await updateSetting({ settingId: ankiSetting.ankiSettingId, data: { ...rest } });
    }

    if (ankiSettingError || topicError) {
        return <div>Error: {ankiSettingError || topicError}</div>;
    }
    if (ankiSettingLoading || topicLoading) {
        return <LoadingPage />;
    }
    if (!ankiSetting || !topic) {
        return (
            <div className="container mx-auto py-10 max-w-4xl">
                <h1 className="text-3xl font-bold mb-2">Anki Settings</h1>
                <p className="text-muted-foreground mb-8">Customize your spaced repetition learning schedule.</p>
                <p>This account doesn’t have a default setting yet. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">Anki Settings</h1>
            <p className="text-lg text-muted-foreground">
                For topic: <span className="font-semibold text-primary">{topic.name}</span>
            </p>
            <p className="text-muted-foreground mt-4 mb-8">Customize your spaced repetition learning schedule.</p>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="setting-profile">Choose a setting profile for this topic.</Label>
                            <p className="text-sm text-muted-foreground">You can view or edit it anytime.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value='1'>
                                <SelectTrigger className="w-[240px]">
                                    <SelectValue placeholder="Select a profile" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ankiSettingProfiles.map((profile) => (
                                        <SelectItem key={profile.id} value={profile.id}>
                                            {profile.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon">
                                <PlusCircle className="h-4 w-4" />
                                <span className="sr-only">Create new profile</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="space-y-8">
                {/* === GROUP 1: NEW CARDS === */}
                <Card>
                    <CardHeader>
                        <CardTitle>New Cards</CardTitle>
                        <CardDescription>Settings for cards you are learning for the first time.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <SettingsField
                            label="Learning Steps"
                            description="Intervals in minutes for learning new cards. e.g., '1, 10, 60'"
                        >
                            <Input
                                id="learningSteps"
                                value={learningSteps}
                                onChange={(e) => handleFieldChange('learningSteps', e)}
                                onBlur={(e) => handleFieldBlur('learningSteps', e)}
                            />
                        </SettingsField>
                        <SettingsField
                            label="Graduating Interval"
                            description="Days to wait before seeing a card again after it graduates from the learning phase."
                        >
                            <Input
                                id="graduatingInterval"
                                type="number"
                                value={ankiSetting.graduatingInterval}
                                onChange={(e) => handleFieldChange('graduatingInterval', e)}
                            />
                        </SettingsField>
                        <SettingsField
                            label="Easy Interval"
                            description="Days to wait if you press 'Easy' on a new card."
                        >
                            <Input
                                id="easyInterval"
                                type="number"
                                value={ankiSetting.easyInterval}
                                onChange={(e) => handleFieldChange('easyInterval', e)}
                            />
                        </SettingsField>
                    </CardContent>
                </Card>

                {/* === GROUP 2: REVIEWS === */}
                <Card>
                    <CardHeader>
                        <CardTitle>Reviews</CardTitle>
                        <CardDescription>Settings for cards you are reviewing over time.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <SettingsField
                            label="Starting Ease"
                            description="The initial easiness factor for new cards (in percent)."
                        >
                            <Input
                                id="startingEase"
                                type="number"
                                step="0.1"
                                value={ankiSetting.startingEase}
                                onChange={(e) => handleFieldChange('startingEase', e)}
                            />
                        </SettingsField>
                        <SettingsField
                            label="Easy Bonus"
                            description="An extra multiplier applied to the interval when you rate a card 'Easy'."
                        >
                            <Input
                                id="easyBonus"
                                type="number"
                                step="0.1"
                                value={ankiSetting.easyBonus}
                                onChange={(e) => handleFieldChange('easyBonus', e)}
                            />
                        </SettingsField>
                        <SettingsField
                            label="Interval Modifier"
                            description="A multiplier applied to all calculated intervals."
                        >
                            <Input
                                id="intervalModifier"
                                type="number"
                                step="0.1"
                                value={ankiSetting.intervalModifier}
                                onChange={(e) => handleFieldChange('intervalModifier', e)}
                            />
                        </SettingsField>
                        <SettingsField
                            label="Hard Interval"
                            description="Multiplier for the next interval when you rate a card 'Hard'."
                        >
                            <Input
                                id="hardInterval"
                                type="number"
                                step="0.1"
                                value={ankiSetting.hardInterval}
                                onChange={(e) => handleFieldChange('hardInterval', e)}
                            />
                        </SettingsField>

                        <Separator />
                        <SettingsField
                            label="Minimum Interval"
                            description="The minimum number of days for a review interval."
                        >
                            <Input
                                id="minimumInterval"
                                type="number"
                                value={ankiSetting.minimumInterval}
                                onChange={(e) => handleFieldChange('minimumInterval', e)}
                            />
                        </SettingsField>
                        <SettingsField
                            label="Maximum Interval"
                            description="The maximum number of days for a review interval."
                        >
                            <Input
                                id="maximumInterval"
                                type="number"
                                value={ankiSetting.maximumInterval}
                                onChange={(e) => handleFieldChange('maximumInterval', e)}
                            />
                        </SettingsField>
                    </CardContent>
                </Card>

                {/* === GROUP 3: LAPSES (when forgeting) === */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lapses</CardTitle>
                        <CardDescription>
                            Settings for when you forget a review card and it enters the relearning phase.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <SettingsField
                            label="Relearning Steps"
                            description="Intervals in minutes for relearning a forgotten card."
                        >
                            <Input
                                id="relearningSteps"
                                value={relearningSteps}
                                onChange={(e) => handleFieldChange('relearningSteps', e)}
                                onBlur={(e) => handleFieldBlur('relearningSteps', e)}
                            />
                        </SettingsField>
                        <SettingsField
                            label="New Interval"
                            description="Percentage of the previous interval to set after a lapse."
                        >
                            <Input
                                id="newInterval"
                                type="number"
                                step="0.1"
                                value={ankiSetting.newInterval}
                                onChange={(e) => handleFieldChange('newInterval', e)}
                            />
                        </SettingsField>
                    </CardContent>
                </Card>

                {/* === GROUP 4: LIMITS (per day) === */}
                <Card>
                    <CardHeader>
                        <CardTitle>Limits</CardTitle>
                        <CardDescription>Daily limits for your study sessions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <SettingsField
                            label="New Cards per Day"
                            description="The maximum number of new cards to introduce each day."
                        >
                            <Input
                                id="newCardsPerDay"
                                type="number"
                                value={ankiSetting.newCardsPerDay}
                                onChange={(e) => handleFieldChange('newCardsPerDay', e)}
                            />
                        </SettingsField>
                        <SettingsField
                            label="Maximum Reviews per Day"
                            description="The maximum number of review cards to show each day."
                        >
                            <Input
                                id="maximumReviewsPerDay"
                                type="number"
                                value={ankiSetting.maximumReviewsPerDay}
                                onChange={(e) => handleFieldChange('maximumReviewsPerDay', e)}
                            />
                        </SettingsField>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 flex justify-end gap-2">
                <Button variant="outline">Reset to Default</Button>
                <Button onClick={handleSubmit} disabled={updateSettingLoading}>
                    {updateSettingLoading ? 'Saving...' : 'Save changes'}
                </Button>
            </div>
        </div>
    );
}

export default AnkiSettingsPage;
