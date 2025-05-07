'use client';

import LanguageSwitcher from '@/components/toolbar/LanguageSwitcher';
import ThemeToggle from '@/components/toolbar/ThemeToggle';
import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="max-w-7xl mx-auto flex p-2 justify-between items-center">
      {/* Logo or Home Link */}
      <Link href="/" className="text-lg font-bold text-primary">
        Dozu
      </Link>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
