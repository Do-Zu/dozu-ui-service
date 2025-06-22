'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const { user } = useAuth();
  const router = useRouter();

  const goHome = () => {
    router.push('/home');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <h1 className="text-xl font-semibold">Admin Panel</h1>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={goHome}>
          Home
        </Button>
      </div>
    </header>
  );
}
