'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { ShowIf } from '../ui/ShowIf';
import { LearningModeSelect } from './LearningModeSelect';

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
    const { isAuthenticated, clearAuthData } = useAuth();
    const { isStudent } = useRoleChecker();
    const router = useRouter();

    // useEffect(() => {
    //     const refreshToken = async () => {
    //         try {
    //             const result = await Axios.post(
    //                 '/auth/refresh-token',
    //                 {},
    //                 {
    //                     withCredentials: true,
    //                 },
    //             );
    //             // Handle success (e.g., store new token)
    //             const decoded: any = jwtDecode(result.data.data.accessToken);
    //             const userId = decoded.user.userId;
    //             const username = decoded.user.username;

    //             dispatch(
    //                 setCredentials({
    //                     accessToken: result.data.data.accessToken,
    //                     userId,
    //                     username,
    //                 }),
    //             );
    //         } catch (error) {
    //             console.error('Failed to refresh token', error);
    //             // Optional: redirect to login
    //         }
    //     };
    //     refreshToken();
    // }, []);

    return (
        <>
            <div className="mx-auto flex px-4 py-2 justify-between items-center h-full border-b border-transparent bg-gradient-to-r from-background/70 via-background/40 to-background/70 dark:from-slate-950/60 dark:via-slate-900/40 dark:to-slate-950/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/40">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 dark:from-indigo-300 dark:via-sky-300 dark:to-cyan-300 bg-clip-text text-transparent"
                    >
                        Dozu
                    </Link>
                    <ShowIf when={isStudent} children={<LearningModeSelect />} />
                </div>
                <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-wide text-muted-foreground/70">
                    {/* <span className="hidden sm:inline">Knowledge Platform</span> */}
                </div>
            </div>

            <Suspense fallback={null}>
                <TokenHandler />
            </Suspense>
        </>
    );
}
