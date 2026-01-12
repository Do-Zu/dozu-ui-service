'use client';

import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/utils/constants/routes';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import LoadingPage from '@/app/loading';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/stores/hooks';
import { logout } from '@/stores/features/auth/authSlice';
import { useRoleChecker } from '@/hooks/useRoleChecker';

/**
 * Unified auth action button.
 * - Shows Login when unauthenticated.
 * - Shows Logout (with async call) when authenticated.
 * - Compact, glassy, supports collapsed sidebar (icon-only).
 */
export function AuthButton() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isAuthenticated, clearAuthData, currentPlanUser } = useAuth();
    const { isAdmin } = useRoleChecker();

    const name = currentPlanUser?.plan?.name?.toUpperCase();
    const shouldShowProBadge = name && currentPlanUser?.plan.tier === 1 && !isAdmin;

    const { execute, loading } = usePost<any, any>('/auth/logout', 'POST', {
        onError: () => toast({ description: 'Logout failed. Try again.' }),
        onSuccess: () => {
            clearAuthData();
        },
    });

    const handleLogout = async () => {
        try {
            await execute({});

            clearAuthData();

            dispatch(logout());

            router.replace(ROUTES.LANDING);
        } catch (error) {
            toast({
                description: 'There was an error logging you out. Please try again later.',
            });
        }
    };

    if (loading) return <LoadingPage isOverlay={true} />;

    if (!isAuthenticated) {
        return (
            <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-center gap-2 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur border-slate-300/60 dark:border-slate-600 hover:bg-white/80 dark:hover:bg-slate-700/70 transition-colors group-data-[collapsible=icon]:px-0"
            >
                <Link href={ROUTES.LOGIN} aria-label="Login">
                    <LogIn className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">Login</span>
                </Link>
            </Button>
        );
    }

    return (
        <div className="space-y-2">
            {shouldShowProBadge && (
                <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-bold group-data-[collapsible=icon]:hidden">{name}</span>
                </div>
            )}
            <Button
                disabled={loading}
                onClick={handleLogout}
                variant="outline"
                size="sm"
                aria-label="Logout"
                className="w-full justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-cyan-500/20 dark:from-indigo-400/15 dark:via-sky-400/15 dark:to-cyan-400/15 border-slate-300/60 dark:border-slate-600 hover:from-indigo-500/30 hover:via-sky-500/30 hover:to-cyan-500/30 dark:hover:from-indigo-400/25 dark:hover:via-sky-400/25 dark:hover:to-cyan-400/25 backdrop-blur group-data-[collapsible=icon]:px-0"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
        </div>
    );
}

export default AuthButton;
