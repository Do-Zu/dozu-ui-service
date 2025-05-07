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
      {isDisplayHeader && <Header className="h-[var(--header-height)] min-h-16 flex-shrink-0" />}
      <main className={`flex-grow h-[var(--main-height)] ${className}`}>{children}</main>
      {isDisplayFooter && <Footer className="h-[var(--footer-height)] flex-shrink-0" />}
    </div>
  );
};

export default DefaultLayout;
