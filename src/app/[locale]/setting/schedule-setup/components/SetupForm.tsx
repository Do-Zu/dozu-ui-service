'use client';

import LoadingPage from '@/app/loading';
import FreeTimeSelector from '@/components/schedule/FreeTimeSelector';
import StudyPreference from '@/components/schedule/StudyPreference';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useGetSchedulePreferences, useUpdateSchedulePreferences } from '@/hooks/useSchedule';
import { IFreeTime, IPreferences, IUpdateSchedulePreferencePayload } from '@/services/schedule/schedule.types';
import React, { useEffect, useState } from 'react';

type Props = {
    onComplete: () => void;
};

export default function SetupForm({ onComplete }: Props) {
    const [formData, setFormData] = useState<IUpdateSchedulePreferencePayload>({
        preferences: {
            studyMethods: [],
            studyPreferences: [],
            studyDuration: 60,
            interestedTopicTags: [],
            onboardingCompletedAt: new Date().toISOString(),
        },
        avgStudyDuration: null,
        freeTime: {},
    });

    const { data: existingPreferences, loading: loadingPreferences } = useGetSchedulePreferences();

    const { execute: updatePreferences, loading: updating, error } = useUpdateSchedulePreferences();

    useEffect(() => {
        if (existingPreferences) {
            setFormData(existingPreferences);
        }
    }, [existingPreferences]);

    const handleFreeTimeChange = (freeTime: IFreeTime) => {
        setFormData((prev) => ({
            ...prev,
            freeTime,
        }));
    };

    const handlePreferencesChange = (preferences: Partial<IPreferences>) => {
        setFormData((prev) => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                ...preferences,
            },
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const result = await updatePreferences(formData);
            if (result) {
                onComplete();
            }
        } catch (error) {
            toast({
                description: 'Không thể lưu cài đặt. Vui lòng thử lại sau.',
                variant: 'destructive',
            });
        }
    };

    if (loadingPreferences || updating) {
        return <LoadingPage />;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-white rounded shadow">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Có lỗi xảy ra: {error}
                </div>
            )}

            <section>
                <h2 className="text-xl font-semibold mb-2">Thời gian rảnh trong tuần</h2>
                <p className="text-sm text-gray-500 mb-4">Chọn khoảng thời gian bạn có thể học mỗi ngày</p>
                <FreeTimeSelector initialData={formData.freeTime} onChange={handleFreeTimeChange} />
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">Thói quen học</h2>
                <p className="text-sm text-gray-500 mb-4">Hệ thống sẽ gợi ý lịch học phù hợp với bạn hơn</p>
                <StudyPreference initialData={formData.preferences} onChange={handlePreferencesChange} />
            </section>

            <div className="text-right">
                <Button type="submit" disabled={updating}>
                    <span className="text-sm font-medium">{updating ? 'Đang lưu...' : 'Lưu'}</span>
                </Button>
            </div>
        </form>
    );
}
