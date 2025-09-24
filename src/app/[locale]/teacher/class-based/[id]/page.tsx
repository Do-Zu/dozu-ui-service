'use client';

import TeacherTopicLibrary from '@/app/[locale]/topics/components/ui/TeacherTopicLibrary';
import { useParams } from 'next/navigation';

export default function Page() {
    const params = useParams();
    const classId = Number(params?.id as string);

    return (
        <div className="flex flex-col h-full mt-4">
            <TeacherTopicLibrary classId={classId} />
        </div>
    );
}
