'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { IPreferences } from '@/services/schedule/schedule.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Target } from 'lucide-react';

interface Props {
    initialData?: IPreferences;
    onChange?: (preferences: Partial<IPreferences>) => void;
}

export default function StudyPreference({ initialData, onChange }: Props) {
    const [studyDuration, setStudyDuration] = useState<number>(60);
    const [customDuration, setCustomDuration] = useState('');
    const [studyMethods, setStudyMethods] = useState<string[]>([]);
    const [studyPreferencesTime, setStudyPreferencesTime] = useState<string[]>([]);

    const StudyPreferenceInDate = useMemo(() => ['Sáng', 'Chiều', 'Tối'], []);

    const methodsLearning = useMemo(() => ['Questions', 'Flashcards'], []);

    // Initialize from API data
    useEffect(() => {
        if (initialData) {
            setStudyDuration(initialData?.studyDuration || 60);
            setStudyMethods(initialData?.studyMethods || []);
            setStudyPreferencesTime(initialData?.studyPreferences || []);
        }
    }, [initialData]);

    const handlePreferredTimeChange = (time: string) => {
        setStudyPreferencesTime((prev) => {
            const newPreferences = prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time];

            if (onChange) {
                onChange({ studyPreferences: newPreferences });
            }
            return newPreferences;
        });
    };

    const handleStudyDurationChange = (duration: number) => {
        setStudyDuration(duration);
        if (onChange) {
            onChange({ studyDuration: duration });
        }
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
        setStudyMethods(newMethods);

        if (onChange) {
            onChange({ studyMethods: newMethods });
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Study Time Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-primary" />
                        Bạn thích học vào thời gian nào trong ngày?
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
                        Thời lượng học trung bình?
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="duration-select" className="text-sm font-medium">
                            Chọn thời lượng có sẵn
                        </Label>
                        <Select
                            value={studyDuration.toString()}
                            onValueChange={(value) => handleStudyDurationChange(Number(value))}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Chọn thời lượng phiên học" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">30 phút</SelectItem>
                                <SelectItem value="45">45 phút</SelectItem>
                                <SelectItem value="60">1 giờ</SelectItem>
                                <SelectItem value="120">2 giờ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative">
                        <Label htmlFor="custom-duration" className="text-sm font-medium">
                            Thời gian tùy chỉnh (phút)
                        </Label>
                        <Input
                            id="custom-duration"
                            type="number"
                            placeholder="Ví dụ: 90"
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
                        Phương pháp học bạn thường áp dụng?
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
