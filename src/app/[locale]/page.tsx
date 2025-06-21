'use client';

import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { useEffect } from 'react';
import AuthSkeleton from '@/components/ui/auth-skeleton';

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get current locale from pathname
    const locale = pathname?.split('/')[1] || 'en';

    if (isAuthenticated || user?.isNewUser) {
      router.push(`/${locale}${ROUTES.HOME}`);
    } else {
      router.push(`/${locale}${ROUTES.WELCOME}`);
    }
  }, [isAuthenticated, router, pathname]);

  return <AuthSkeleton />;
}

export default HomePage;
