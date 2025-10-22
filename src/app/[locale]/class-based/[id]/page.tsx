'use client';

import { useClassBased } from '@/contexts/class-based';
import ClassDetails from './details/ClassDetails';

export default function Page() {
    const { classId } = useClassBased();

    if (!Number.isFinite(classId)) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col h-full mt-4">
            <ClassDetails />
        </div>
    );
}
