'use client';

import SetupForm from '@/app/[locale]/setting/schedule-setup/components/SetupForm';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const ScheduleSetupPage = () => {
    const router = useRouter();
    const t = useTranslations('schedule.setup');

    const handleComplete = () => {
        // You can add success notification here if needed
        // For now, we'll just refresh or navigate back
        router.refresh();
    };

    return (
        <div className="max-w-full p-6 bg-white rounded-md shadow-sm overflow-auto">
            <h1 className="text-xl font-semibold">{t('pageTitle')}</h1>
            <SetupForm onComplete={handleComplete} />
        </div>
    );
};

export default ScheduleSetupPage;
