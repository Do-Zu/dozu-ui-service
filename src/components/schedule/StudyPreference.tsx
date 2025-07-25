'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { IPreferences } from '@/services/schedule/schedule.types';

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
        setStudyPreferencesTime((prev) => [...prev, time]);
        if (onChange) {
            onChange({ studyPreferences: [...studyPreferencesTime, time] });
        }
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
        <div className="space-y-6">
            <div>
                <label className="font-medium">Bạn thích học vào thời gian nào trong ngày?</label>
                <div className="flex gap-6 mt-2">
                    {StudyPreferenceInDate?.map((time) => (
                        <label key={time} className="flex items-center gap-2">
                            <input
                                type="select"
                                name="preferredTime"
                                value={time}
                                checked={studyPreferencesTime.includes(time)}
                                onChange={() => handlePreferredTimeChange(time)}
                            />
                            {time}
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="font-medium">Thời lượng học trung bình?</label>
                <select
                    className="block mt-2 border rounded px-3 py-2"
                    value={studyDuration}
                    onChange={(e) => handleStudyDurationChange(Number(e.target.value))}
                >
                    <option value="">Chọn thời lượng phiên học</option>
                    <option value={30}>30 phút</option>
                    <option value={45}>45 phút</option>
                    <option value={60}>1 giờ</option>
                    <option value={120}>2 giờ</option>
                </select>
                <input
                    type="number"
                    className="block mt-2 border rounded px-3 py-2"
                    placeholder="Thời gian khác (phút)"
                    value={customDuration}
                    onChange={(e) => handleCustomDurationChange(e.target.value)}
                />
            </div>

            <div>
                <label className="font-medium">Phương pháp học bạn thường áp dụng?</label>
                <div className="flex flex-col mt-2 gap-2">
                    {methodsLearning?.map((method) => (
                        <label key={method} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                value={method}
                                checked={studyMethods.includes(method)}
                                onChange={() => handleCheckboxChange(method)}
                            />
                            {method}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
