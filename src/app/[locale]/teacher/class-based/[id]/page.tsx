'use client';

import classUtils from '@/app/[locale]/class-based/[id]/utils/class.utils';
import TeacherClassDashboard from './dashboard/TeacherClassDashboard';
import { withAuth } from '@/hoc/withAuth';
import { USER_ROLES } from '@/utils/constants/roles';
import { useParams, useSearchParams } from 'next/navigation';
import { ClassDashboardTab } from '@/app/[locale]/class-based/[id]/utils/class.constant';

const AuthComponent = withAuth(TeacherClassDashboard, { requiredRole: USER_ROLES.TEACHER });

export default function Page() {
    const params = useParams();
    const classId = Number(params?.id as string);
    const searchParams = useSearchParams();
    const defaultTab = classUtils.validateTabValue(searchParams?.get('defaultTab'));

    return (
        <div className="flex flex-col h-full mt-4">
            <AuthComponent classId={classId} defaultTab={defaultTab} />
        </div>
    );
}
