'use client';

import LanguageSwitcher from '@/components/toolbar/LanguageSwitcher';
import ThemeToggle from '@/components/toolbar/ThemeToggle';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useSearchParams } from 'next/navigation';
import { logout, setCredentials, updateAccessToken } from '@/stores/features/auth/authSlice';
import { useEffect, Suspense } from 'react';
import usePost from '@/hooks/usePost';
import Axios from '@/api/axios';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useUserSession } from '@/app/[locale]/auth/hooks/useUserSession';
import { ROUTES } from '@/utils/constants/routes';

function TokenHandler() {
  // const dispatch = useAppDispatch();
  // const searchParams = useSearchParams();

  // const token = searchParams?.get('token');

  // useEffect(() => {
  //   if (token) {
  //     dispatch(updateAccessToken(token));
  //   }
  // }, [token, dispatch]);

  return null;
}

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, clearAuthData } = useAuth();

  useEffect(() => {
    const refreshToken = async () => {
      try {
        const result = await Axios.post(
          '/auth/refresh-token',
          {},
          {
            withCredentials: true,
          },
        );
        // Handle success (e.g., store new token)
        const decoded: any = jwtDecode(result.data.data.accessToken);
        const userId = decoded.user.userId;
        const username = decoded.user.username;

        dispatch(
          setCredentials({
            accessToken: result.data.data.accessToken,
            userId,
            username,
          }),
        );
      } catch (error) {
        console.error('Failed to refresh token', error);
        // Optional: redirect to login
      }
    };
    refreshToken();
  }, []);

  const handleLogout = async () => {
    try {
      await execute({}); // Assumes this calls /auth/logout and clears the cookie

      clearAuthData();

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
    <>
      <div className="max-w-7xl mx-auto flex p-2 justify-between items-center h-full bg-background/95 backdrop-blur-md border-b border-muted dark:border-muted/50">
        {/* Logo or Home Link */}
        <Link href="/" className="text-lg font-bold text-primary">
          Dozu
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <Button disabled={loading} className="w-full" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Link href={ROUTES.LOGIN}>
              <Button className="w-full">Login</Button>
            </Link>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <TokenHandler />
      </Suspense>
    </>
  );
}
