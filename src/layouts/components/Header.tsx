'use client';

import React from 'react';
import Navbar from '@/components/toolbar/Navbar';

interface IHeaderProps {
    isLoggedIn?: boolean;
    username?: string;
    className?: string;
}

const Header: React.FC<IHeaderProps> = ({ className = '' }) => {
    return (
        <header
            className={`sticky top-0 w-full backdrop-blur ${className}`}
            style={{
                height: 'var(--header-height)',
                zIndex: 50,
                maxHeight: 'var(--max-header-height)',
            }}
        >
            <Navbar />
        </header>
    );
};

export default Header;
