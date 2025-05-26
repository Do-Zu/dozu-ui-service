'use client';

import { ReactNode } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { usePathname } from 'next/navigation'; // Correct hook for client components with next-intl
import { getLayoutSettings } from '@/configs/layoutConfig';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  isDisplayHeader?: boolean;
  isDisplayFooter?: boolean;
}

const DefaultLayout: React.FC<LayoutProps> = ({
  children,
  className = '',
  isDisplayHeader: explicitHeader,
  isDisplayFooter: explicitFooter,
}) => {
  // Gets current path without locale segment
  const pathname = usePathname();
  const configSettings = getLayoutSettings(pathname);

  const displayHeader =
    explicitHeader !== undefined ? explicitHeader : configSettings.isDisplayHeader;
  const displayFooter =
    explicitFooter !== undefined ? explicitFooter : configSettings.isDisplayFooter;

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-muted transition-colors">
      {displayHeader && <Header />}
      <main
        className={`flex-1 overflow-auto ${className}`}
        style={
          displayHeader
            ? {
                minHeight: 'calc(100vh - var(--header-height))',
                height: 'calc(100vh - var(--header-height))',
              }
            : {
                minHeight: '100vh',
                height: '100vh',
              }
        }
      >
        {children}
      </main>
      {displayFooter && <Footer />}
    </div>
  );
};

export default DefaultLayout;
