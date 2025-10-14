'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ISchedulePreference, IUpdateSchedulePreferencePayload } from '@/services/schedule/schedule.types';
import { BookOpen, Clock, Target } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

interface Props {
    initialData: ISchedulePreference;
    onChange: Dispatch<SetStateAction<IUpdateSchedulePreferencePayload>>;
}

export default function StudyPreference({ initialData, onChange }: Props) {
    const StudyPreferenceInDate = useMemo(() => ['Morning', 'Afternoon', 'Evening'], []);
    const methodsLearning = useMemo(() => ['Questions', 'Flashcards'], []);

    // Use state instead of useMemo for reactive values
    const [studyDuration, setStudyDuration] = useState<number>(60);
    const [studyMethods, setStudyMethods] = useState<string[]>([]);
    const [studyPreferencesTime, setStudyPreferencesTime] = useState<string[]>([]);
    const [customDuration, setCustomDuration] = useState('');

    // Update local state when initialData changes
    useEffect(() => {
        if (initialData) {
            setStudyDuration(initialData?.preferences?.studyDuration || 60);
            setStudyMethods(initialData?.preferences?.studyMethods || []);
            setStudyPreferencesTime(initialData?.studyPreferences || []);
        }
    }, [initialData]);

    const handlePreferredTimeChange = (time: string) => {
        const newPreferenceTime = studyPreferencesTime.includes(time)
            ? studyPreferencesTime.filter((t) => t !== time)
            : [...studyPreferencesTime, time];

        // Update local state
        setStudyPreferencesTime(newPreferenceTime);

        // Update parent state
        onChange((prev) => {
            const newPreferences: IUpdateSchedulePreferencePayload = {
                ...prev,
                studyPreferences: newPreferenceTime,
            };
            return newPreferences;
        });
    };

    const handleStudyDurationChange = (duration: number) => {
        // Update local state
        setStudyDuration(duration);

        // Update parent state
        onChange((prev) => {
            const newPreferences: IUpdateSchedulePreferencePayload = {
                ...prev,
                preferences: {
                    ...prev.preferences,
                    studyDuration: duration,
                },
            };
            return newPreferences;
        });
    };

    const handleCustomDurationChange = (value: string) => {
        setCustomDuration(value);
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue > 0) {
            handleStudyDurationChange(numValue);
        }
    };

    const handleCheckboxChange = (value: string) => {
        let newMethods: string[];

        if (studyMethods.includes(value)) {
            newMethods = studyMethods.filter((item) => item !== value);
        } else {
            newMethods = [...studyMethods, value];
        }

        // Update local state
        setStudyMethods(newMethods);

        // Update parent state
        if (onChange) {
            onChange((prev) => {
                const newPreferences: IUpdateSchedulePreferencePayload = {
                    ...prev,
                    preferences: {
                        ...prev.preferences,
                        studyMethods: newMethods,
                    },
                };
                return newPreferences;
            });
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Study Time Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-primary" />
                        What time of day do you like to study?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        {StudyPreferenceInDate?.map((time) => (
                            <Button
                                key={time}
                                variant={studyPreferencesTime.includes(time) ? 'default' : 'outline'}
                                onClick={() => handlePreferredTimeChange(time)}
                                className="transition-all duration-200 hover:scale-105"
                            >
                                {time}
                                {studyPreferencesTime.includes(time) && (
                                    <Badge variant="secondary" className="ml-2 h-2 w-2 p-0 rounded-full bg-white" />
                                )}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Study Duration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5 text-primary" />
                        Average study duration?
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="duration-select" className="text-sm font-medium">
                            Select available duration
                        </Label>
                        <Select
                            value={studyDuration.toString()}
                            onValueChange={(value) => handleStudyDurationChange(Number(value))}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Chọn thời lượng phiên học" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="45">45 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="120">2 hour</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative">
                        <Label htmlFor="custom-duration" className="text-sm font-medium">
                            Custom time (minutes)
                        </Label>
                        <Input
                            id="custom-duration"
                            type="number"
                            placeholder="Example: 90"
                            value={customDuration}
                            onChange={(e) => handleCustomDurationChange(e.target.value)}
                            className="mt-2"
                            min="1"
                            max="480"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Study Methods */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                        What learning method do you usually use?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {methodsLearning?.map((method) => (
                            <div
                                key={method}
                                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <Checkbox
                                    id={method}
                                    checked={studyMethods.includes(method)}
                                    onCheckedChange={() => handleCheckboxChange(method)}
                                />
                                <Label
                                    htmlFor={method}
                                    className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {method}
                                </Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
