'use client';

import Link from 'next/link';
import { RootState } from '@/stores/store';
import { useSelector } from 'react-redux';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { Fragment } from 'react';
import { ShowIf } from '../ui/ShowIf';
import { LearningModeSelect } from './LearningModeSelect';
import Pomodoro from '../pomodoro/Pomodoro';
import Image from 'next/image';

export default function Navbar() {
    const { currentPlanUser } = useAuth();
    const { isStudent } = useRoleChecker();
    const { isDisplay: isDisplayPomodoro } = useSelector((state: RootState) => state.pomodoro);

    const isPro = currentPlanUser?.plan?.name?.toLowerCase().includes('pro') ?? false;

    return (
        <Fragment>
            <div className="mx-auto flex px-4 py-2 justify-between items-center h-full border-b border-transparent bg-gradient-to-r from-background/70 via-background/40 to-background/70 dark:from-slate-950/60 dark:via-slate-900/40 dark:to-slate-950/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/40">
                <div className="flex items-center gap-3">
                    <Image
                        src="https://res.cloudinary.com/dsvllb1am/image/upload/v1764839005/icon_a1vkdp.png"
                        alt="logo"
                        width={40}
                        height={40}
                    />
                    <Link href="/" className="text-lg font-bold ">
                        Dozu
                    </Link>
                    {isPro && (
                        <span className="px-2 py-1 text-xs font-bold bg-[#1d2721] text-[#3cb371] border border-[#3cb37199] rounded-3xl shadow-md">
                            PRO
                        </span>
                    )}
                    <ShowIf when={isStudent}>
                        <LearningModeSelect />
                    </ShowIf>
                </div>

                <div className="flex items-center gap-3">
                    {isDisplayPomodoro && <Pomodoro position="top-center" positionY={-6} positionX={-30} />}
                </div>
            </div>
        </Fragment>
    );
}
