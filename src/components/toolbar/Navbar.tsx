'use client';

import LanguageSwitcher from '@/components/toolbar/LanguageSwitcher';
import ThemeToggle from '@/components/toolbar/ThemeToggle';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useSearchParams } from 'next/navigation';
import { logout, updateAccessToken } from '@/stores/features/auth/authSlice';
import { useEffect } from 'react';
import usePost from '@/hooks/usePost';
import { useRouter } from 'next/router';

export default function Navbar() {
  const dispatch = useAppDispatch();

  //receives token on redirect from backend in case of 3rd party logins (google)
  //todo: change to more secure method
  const searchParams = useSearchParams();
  //? router not mounted
  // const router = useRouter();

  const token = searchParams.get('token');
  useEffect(() => {
    if (token) {
      dispatch(updateAccessToken(token));
    }
  }, []);



  const handleLogout = async () => {
    try {
      await execute({}); // Assumes this calls /auth/logout and clears the cookie

      dispatch(logout());
      // router.push('/auth/login'); //todo:router not working
    } catch (error) {
      console.error('Logout failed:', error);
      //todo:catch error 
    }
  };

  const {
    loading,
    data: apiResponse,
    error: apiPostContentError,
    execute,
  } = usePost<any, any>('/auth/logout', 'POST');

  const accessToken = useAppSelector((state) => state.auth.accessToken);

  return (
    <div className="max-w-7xl mx-auto flex p-2 justify-between items-center h-full bg-background/95 backdrop-blur-md border-b border-muted dark:border-muted/50">
      {/* Logo or Home Link */}
      <Link href="/" className="text-lg font-bold text-primary">
        Dozu
      </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageSwitcher />
          {accessToken ? (
            <>
              <Button disabled={loading} className="w-full" onClick={handleLogout}>
                Logout
              </Button>
              <Link href="/onboarding">
                <Button className="w-full">Survey</Button>
              </Link>
            </>
          ) : (
            <Link href="/auth/login">
              <Button className="w-full">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
