'use client';

import { useClassBased } from '@/contexts/class-based';
import StudentClassDashboard from './dashboard/StudentClassDashboard';

export default function Page() {
    const { classId } = useClassBased();

    if (!Number.isFinite(classId)) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col h-full mt-4">
            <StudentClassDashboard />
        </div>
    );
}
