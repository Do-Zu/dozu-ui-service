'use client';

import SetupForm from '@/app/[locale]/setting/schedule-setup/components/SetupForm';
import { useRouter } from 'next/navigation';

const ScheduleSetupPage = () => {
    const router = useRouter();

    const handleComplete = () => {
        // You can add success notification here if needed
        // For now, we'll just refresh or navigate back
        router.refresh();
    };

    return (
        <div className="p-6 bg-white rounded-md shadow-sm">
            <h1 className="text-xl font-semibold">Schedule Setup</h1>
            <SetupForm onComplete={handleComplete} />
        </div>
    );
};

export default ScheduleSetupPage;
