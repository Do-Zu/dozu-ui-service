'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info, PlusCircle, Settings, SquarePen, Trash2 } from 'lucide-react';
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
import ankiSettingUtil from './utils/ankiSetting.util';
import CreateSettingModal from './components/CreateSettingModal';
import { useTranslations } from 'next-intl';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UpdateSettingModal, { IUpdatingSetting } from './components/UpdateSettingModal';
import { DeleteSettingModal, IDeletingSetting } from './components/DeleteSettingModal';
import { DEFAULT_ANKI_SETTING } from '@/services/anki-setting/constant';
import ResetToDefaultModal from './components/ResetToDefaultModal';

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

function AnkiSettingsPage() {
    const params = useParams();
    let { topicId } = params as { topicId: string | number };
    topicId = Number(topicId);
    if (isNaN(topicId)) {
        return <div>No topic id is provided</div>;
    }

    const tCommon = useTranslations('common');

    const {
        data: topic,
        loading: topicLoading,
        error: topicError,
    } = useFetch<ITopic>(() => topicService.getTopicById(topicId));

    const {
        data: ankiSettings,
        setData: setAnkiSettings,
        error: ankiSettingsError,
        loading: ankiSettingsLoading,
    } = useFetch<{ settings: IAnkiSetting[]; activeSettingId: number }>(() =>
        ankiSettingService.getUserSettingsForTopic({ topicId }),
    );

    const { loading: updateSettingAndAssignToTopicLoading, execute: updateSettingAndAssignToTopicAsync } = usePost<
        { settingId: number; data: IUpdateAnkiSettingBody; topicId: number },
        IAnkiSetting
    >(ankiSettingService.updateSettingAndAssignToTopic, 'PATCH', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess(data) {
            toastHelper.showSuccessMessage('Update setting successfully');
            setAnkiSettings((prev) => {
                if (!prev) return null;
                const updatedSettings = prev.settings.map((setting) => {
                    return setting.ankiSettingId === data.ankiSettingId ? data : setting;
                });
                return { ...prev, settings: updatedSettings, activeSettingId: data.ankiSettingId };
            });
        },
    });

    const { loading: createSettingLoading, execute: createSettingAsync } = usePost<{ name: string }, IAnkiSetting>(
        ankiSettingService.createSetting,
        'POST',
        {
            onError(error) {
                toastHelper.showErrorMessage(error);
            },
            onSuccess(data) {
                toastHelper.showSuccessMessage('Create setting successfully');
                setIsCreateSettingModalOpen(false);
                setAnkiSettings((prev) => {
                    if (!prev) return null;
                    return { ...prev, settings: [...prev.settings, data] };
                });
                setSelectedAnkiSettingId(data.ankiSettingId);
            },
        },
    );

    const { loading: deleteSettingLoading, execute: deleteSettingAsync } = usePost<{ settingId: number }, number>(
        ankiSettingService.deleteSetting,
        'DELETE',
        {
            onError(error) {
                toastHelper.showErrorMessage(error);
            },
            onSuccess(deletedSettingId) {
                toastHelper.showSuccessMessage('Delete setting successfully');
                setIsDeleteSettingModalOpen(false);
                setAnkiSettings((prev) => {
                    if (!prev) return null;
                    const filteredSettings = prev.settings.filter(
                        (setting) => setting.ankiSettingId !== deletedSettingId,
                    );
                    const defaultSettingId = filteredSettings.find((e) => e.isDefault)?.ankiSettingId;
                    const newActiveSettingId =
                        prev.activeSettingId === deletedSettingId ? defaultSettingId : prev.activeSettingId;
                    if (!newActiveSettingId) {
                        toastHelper.showErrorMessage('Cannot find the default setting, please try again.');
                        return prev;
                    }
                    setSelectedAnkiSettingId(newActiveSettingId);
                    return { ...prev, settings: filteredSettings, activeSettingId: newActiveSettingId };
                });
            },
        },
    );

    const [learningSteps, setLearningSteps] = useState<string>('');
    const [relearningSteps, setRelearningSteps] = useState<string>('');

    // create new setting states
    const [isCreateSettingModalOpen, setIsCreateSettingModalOpen] = useState<boolean>(false);

    // update existing setting states
    const [isUpdateSettingModalOpen, setIsUpdateSettingModalOpen] = useState<boolean>(false);
    const [updatingSetting, setUpdatingSetting] = useState<IUpdatingSetting>();

    // delete existing setting states
    const [isDeleteSettingModalOpen, setIsDeleteSettingModalOpen] = useState<boolean>(false);
    const [deletingSetting, setDeletingSetting] = useState<IDeletingSetting>();

    // reset to default setting warning
    const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

    // manage current anki setting
    const [selectedAnkiSettingId, setSelectedAnkiSettingId] = useState<number>();
    const [selectedAnkiSetting, setSelectedAnkiSetting] = useState<IAnkiSetting | null>();

    useEffect(() => {
        if (ankiSettings) {
            setSelectedAnkiSettingId(ankiSettings.activeSettingId);
        }
    }, [ankiSettings?.activeSettingId]);

    useEffect(() => {
        if (ankiSettings && selectedAnkiSettingId) {
            setSelectedAnkiSetting(ankiSettings.settings.find((e) => e.ankiSettingId === selectedAnkiSettingId));
        }
    }, [ankiSettings?.settings, selectedAnkiSettingId]);

    useEffect(() => {
        if (selectedAnkiSetting) {
            setLearningSteps(ankiSettingUtil.formatStepsForDisplay(selectedAnkiSetting.learningSteps));
            setRelearningSteps(ankiSettingUtil.formatStepsForDisplay(selectedAnkiSetting.relearningSteps));
        }
    }, [selectedAnkiSetting?.learningSteps, selectedAnkiSetting?.relearningSteps]);

    function handleCreateSettingModalOpen() {
        setIsCreateSettingModalOpen(true);
    }

    function handleUpdateSettingModalOpen() {
        setIsUpdateSettingModalOpen(true);
        if (selectedAnkiSetting) {
            setUpdatingSetting({ ankiSettingId: selectedAnkiSetting.ankiSettingId, name: selectedAnkiSetting.name });
        }
    }

    function handleDeleteSettingModalOpen() {
        setIsDeleteSettingModalOpen(true);
        if (selectedAnkiSetting) {
            setDeletingSetting({ ankiSettingId: selectedAnkiSetting.ankiSettingId, name: selectedAnkiSetting.name });
        }
    }

    function handleResetModalOpen() {
        setIsResetModalOpen(true);
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
            setSelectedAnkiSetting((prev) =>
                prev ? { ...prev, [field]: ankiSettingUtil.getValidatedAnkiValue(field, event.target.value) } : null,
            );
        }
    }

    function handleFieldBlur(
        field: keyof Pick<IAnkiSetting, 'learningSteps' | 'relearningSteps'>,
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const str = event.target.value;
        const { values, stringForDisplay } = ankiSettingUtil.validateSteps(str);
        if (field === 'learningSteps') {
            setSelectedAnkiSetting((prev) => (prev ? { ...prev, learningSteps: values } : null));
        }
        if (field === 'relearningSteps') {
            setSelectedAnkiSetting((prev) => (prev ? { ...prev, relearningSteps: values } : null));
        }
    }

    function handleSettingSelect(value: string) {
        setSelectedAnkiSettingId(Number(value));
    }

    async function handleSaveChangesClick() {
        if (!selectedAnkiSetting) return;
        const { userId, isDefault, ankiSettingId, ...rest } = selectedAnkiSetting;
        await updateSettingAndAssignToTopicAsync({
            settingId: selectedAnkiSetting.ankiSettingId,
            data: { ...rest },
            topicId: topicId as number,
        });
    }

    async function handleCreateSettingClick({ name }: { name: string }) {
        if (!name) {
            toastHelper.showErrorMessage(tCommon('validation.required', { name: tCommon('labels.name') }));
            return;
        }
        await createSettingAsync({ name });
    }

    async function handleUpdateSettingClick({ ankiSettingId, name }: { ankiSettingId: number; name: string }) {
        if (!name) {
            toastHelper.showErrorMessage(tCommon('validation.required', { name: tCommon('labels.name') }));
            return;
        }
        setAnkiSettings((prev) => {
            if (!prev) return null;
            const updatedSettings = prev.settings.map((setting) => {
                return setting.ankiSettingId === ankiSettingId ? { ...setting, name } : setting;
            });
            return { ...prev, settings: updatedSettings };
        });
        setIsUpdateSettingModalOpen(false);
    }

    async function handleDeleteSettingClick({ ankiSettingId }: { ankiSettingId: number }) {
        await deleteSettingAsync({ settingId: ankiSettingId });
    }

    function handleResetToDefaultClick() {
        const defaultSettingValue = DEFAULT_ANKI_SETTING;
        setSelectedAnkiSetting((prev) => {
            if (!prev) return null;
            return { ...prev, ...defaultSettingValue };
        });
        setIsResetModalOpen(false);
    }

    if (topicError || ankiSettingsError) {
        return <div>Error: {topicError || ankiSettingsError}</div>;
    }
    if (topicLoading || ankiSettingsLoading) {
        return <LoadingPage />;
    }
    if (!topic || !ankiSettings || !selectedAnkiSettingId || !selectedAnkiSetting) {
        return (
            <div className="container mx-auto py-10 max-w-4xl">
                <h1 className="text-3xl font-bold mb-2">Anki Settings</h1>
                <p className="text-muted-foreground mb-8">Customize your spaced repetition learning schedule.</p>
                <p>Something went wrong. Please try again.</p>
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
                            <Select value={selectedAnkiSettingId.toString()} onValueChange={handleSettingSelect}>
                                <SelectTrigger className="w-[240px]">
                                    <SelectValue placeholder="Select a profile" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ankiSettings.settings.map((setting) => (
                                        <SelectItem
                                            key={setting.ankiSettingId}
                                            value={setting.ankiSettingId.toString()}
                                        >
                                            {setting.isDefault
                                                ? setting.name + ' (Used as your default setting for all topics)'
                                                : setting.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedAnkiSetting.isDefault ? null : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" aria-label="Manage profile">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" side="top">
                                        <DropdownMenuItem onSelect={handleUpdateSettingModalOpen}>
                                            <SquarePen className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={handleDeleteSettingModalOpen}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            <Button variant="outline" size="icon" onClick={handleCreateSettingModalOpen}>
                                <PlusCircle className="h-4 w-4" />
                                <span className="sr-only">Create new profile</span>
                            </Button>

                            <CreateSettingModal
                                isOpen={isCreateSettingModalOpen}
                                setIsOpen={setIsCreateSettingModalOpen}
                                onSubmit={handleCreateSettingClick}
                                loading={createSettingLoading}
                            />

                            <UpdateSettingModal
                                isOpen={isUpdateSettingModalOpen}
                                setIsOpen={setIsUpdateSettingModalOpen}
                                setting={updatingSetting}
                                onSubmit={handleUpdateSettingClick}
                                loading={updateSettingAndAssignToTopicLoading}
                            />

                            <DeleteSettingModal
                                isOpen={isDeleteSettingModalOpen}
                                setIsOpen={setIsDeleteSettingModalOpen}
                                setting={deletingSetting}
                                onSubmit={handleDeleteSettingClick}
                                loading={deleteSettingLoading}
                            />
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
                                value={selectedAnkiSetting.graduatingInterval}
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
                                value={selectedAnkiSetting.easyInterval}
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
                                value={selectedAnkiSetting.startingEase}
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
                                value={selectedAnkiSetting.easyBonus}
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
                                value={selectedAnkiSetting.intervalModifier}
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
                                value={selectedAnkiSetting.hardInterval}
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
                                value={selectedAnkiSetting.minimumInterval}
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
                                value={selectedAnkiSetting.maximumInterval}
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
                                value={selectedAnkiSetting.newInterval}
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
                                value={selectedAnkiSetting.newCardsPerDay}
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
                                value={selectedAnkiSetting.maximumReviewsPerDay}
                                onChange={(e) => handleFieldChange('maximumReviewsPerDay', e)}
                            />
                        </SettingsField>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 flex justify-end gap-2">
                <Button variant="outline" onClick={handleResetModalOpen}>
                    Reset to Default
                </Button>
                <Button onClick={handleSaveChangesClick} disabled={updateSettingAndAssignToTopicLoading}>
                    {updateSettingAndAssignToTopicLoading ? 'Saving...' : 'Save changes'}
                </Button>

                <ResetToDefaultModal
                    isOpen={isResetModalOpen}
                    setIsOpen={setIsResetModalOpen}
                    onSubmit={handleResetToDefaultClick}
                />
            </div>
        </div>
    );
}

export default AnkiSettingsPage;
