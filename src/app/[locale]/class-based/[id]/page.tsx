'use client';

import ClassTopicLibrary from '@/app/[locale]/topics/components/class-based/ClassTopicLibrary';
import { useClassBased } from '@/contexts/class-based';

export default function Page() {
    const { classId } = useClassBased();

    if (!classId) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col h-full mt-4">
            <ClassTopicLibrary />
        </div>
    );
}
