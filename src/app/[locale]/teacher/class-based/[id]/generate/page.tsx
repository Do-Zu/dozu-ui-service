'use client';

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { withAuth } from '@/hoc/withAuth';
import { useParams } from 'next/navigation';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { USER_ROLES } from '@/utils/constants/roles';

// Dynamically import CardImport with no SSR
const GeneratePage = dynamic(() => import('@/app/[locale]/generate/components/GeneratePage'), {
    ssr: false,
    loading: () => (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    ),
});

const AuthComponent = withAuth(GeneratePage, { requiredRole: USER_ROLES.TEACHER });

export default function HomePage() {
    let { id: classId } = useParams() as { id: string | string[] | number };

    if (typeof classId != 'string') {
        return <div>Invalid Params, classId must be a valid number</div>;
    }

    classId = Number(classId);

    if (isNaN(classId)) {
        return <div>Invalid Params, classId must be a valid number</div>;
    }

    return (
        <Suspense
            fallback={
                <div className="h-screen flex items-center justify-center">
                    <Loader2 className="animate-spin h-8 w-8" />
                </div>
            }
        >
            <AuthComponent mode={MODE_ACCESS_PAGE_ROLE.classBased} classId={classId} />
        </Suspense>
    );
}
