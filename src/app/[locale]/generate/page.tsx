'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { withAuth } from '@/hoc/withAuth';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';

// Dynamically import CardImport with no SSR
const GeneratePage = dynamic(() => import('./components/GeneratePage'), {
    ssr: false,
    loading: () => (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    ),
});

const AuthComponent = withAuth(GeneratePage, { requiredRole: 'user' });

export default function HomePage() {
    return (
        <Suspense
            fallback={
                <div className="h-screen flex items-center justify-center">
                    <Loader2 className="animate-spin h-8 w-8" />
                </div>
            }
        >
            <AuthComponent mode={MODE_ACCESS_PAGE_ROLE.personal} />
        </Suspense>
    );
}
