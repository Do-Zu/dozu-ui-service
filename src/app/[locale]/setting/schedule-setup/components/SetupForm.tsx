'use client';

import LoadingPage from '@/app/loading';
import FreeTimeSelector from '@/components/schedule/FreeTimeSelector';
import StudyPreference from '@/components/schedule/StudyPreference';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useGetSchedulePreferences, useUpdateSchedulePreferences } from '@/hooks/useSchedule';
import { IFreeTime, IUpdateSchedulePreferencePayload } from '@/services/schedule/schedule.types';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
    onComplete: () => void;
};

export default function SetupForm({ onComplete }: Props) {
    const t = useTranslations('schedule.setup');
    const [formData, setFormData] = useState<IUpdateSchedulePreferencePayload>({
        preferences: {
            studyMethods: [],
            studyDuration: 60,
        },
        studyPreferences: [],
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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const result = await updatePreferences(formData);
            if (result) {
                onComplete();
            }
        } catch (error) {
            toast({
                description: t('messages.saveError'),
                variant: 'destructive',
            });
        }
    };

    if (loadingPreferences) {
        return <LoadingPage />;
    }

    return (
        <div className="space-y-8 p-6 bg-white rounded shadow">
            <section>
                <h2 className="text-xl font-semibold mb-2">{t('freeTime.title')}</h2>
                <p className="text-sm text-gray-500 mb-4">{t('freeTime.description')}</p>
                <FreeTimeSelector initialData={formData?.freeTime} onChange={handleFreeTimeChange} />
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">{t('studyHabits.title')}</h2>
                <p className="text-sm text-gray-500 mb-4">{t('studyHabits.description')}</p>
                <StudyPreference initialData={formData} onChange={setFormData} />
            </section>

            <div className="text-right">
                <Button
                    disabled={updating}
                    onClick={handleSubmit}
                    className="bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                    <span className="text-sm font-medium">{updating ? t('actions.saving') : t('actions.save')}</span>
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {t('messages.errorOccurred', { error })}
                </div>
            )}
        </div>
    );
}
