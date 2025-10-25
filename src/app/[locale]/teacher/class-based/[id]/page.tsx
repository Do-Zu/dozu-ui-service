'use client';

import TeacherTopicLibrary from '@/app/[locale]/topics/components/ui/TeacherTopicLibrary';
import { withAuth } from '@/hoc/withAuth';
import { USER_ROLES } from '@/utils/constants/roles';
import { useParams } from 'next/navigation';

const AuthComponent = withAuth(TeacherTopicLibrary, { requiredRole: USER_ROLES.TEACHER });

export default function Page() {
    const params = useParams();
    const classId = Number(params?.id as string);

    return (
        <div className="flex flex-col h-full mt-4">
            <AuthComponent classId={classId} />
        </div>
    );
}
