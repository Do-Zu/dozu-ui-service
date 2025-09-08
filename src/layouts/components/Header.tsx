'use client';

import React from 'react';
import Navbar from '@/components/toolbar/Navbar';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface IHeaderProps {
    isLoggedIn?: boolean;
    username?: string;
    className?: string;
}

const Header: React.FC<IHeaderProps> = ({ className = '' }) => {
    return (
        <header
            className={`sticky top-0 w-full border-b border-transparent bg-gradient-to-r from-background/75 via-background/40 to-background/75 dark:from-slate-950/70 dark:via-slate-900/40 dark:to-slate-950/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 rounded-sm ${className}`}
            style={{
                height: 'var(--header-height)',
                zIndex: 50,
                maxHeight: 'var(--max-header-height)',
            }}
        >
            <div className="flex h-full items-center rounded-lg">
                <div className="flex-1 h-full ">
                    <Navbar />
                </div>
            </div>
        </header>
    );
};

export default Header;
