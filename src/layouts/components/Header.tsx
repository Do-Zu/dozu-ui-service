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
      className={`sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur ${className}`}
    >
      <Navbar />
    </header>
  );
};

export default Header;
