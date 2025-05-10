'use client';

import { ReactNode } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  isDisplayHeader?: boolean;
  isDisplayFooter?: boolean;
}

const DefaultLayout: React.FC<LayoutProps> = ({
  children,
  className = '',
  isDisplayHeader = true,
  isDisplayFooter = true,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-muted transition-colors">
      {isDisplayHeader && <Header />}
      <main
        className={`${className}`}
        style={{
          minHeight: 'var(--main-height)',
          height: 'var(--main-height)',
        }}
      >
        {children}
      </main>
      {isDisplayFooter && <Footer />}
    </div>
  );
};

export default DefaultLayout;
