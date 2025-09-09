'use client';

import { useClassBased } from '@/contexts/class-based';
import StudentTopicLibrary from '../../topics/components/ui/StudentTopicLibrary';

export default function Page() {
    const { classId } = useClassBased();

    if (!Number.isFinite(classId)) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col h-full mt-4">
            <StudentTopicLibrary />
        </div>
    );
}
