import { ReactNode } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

interface LayoutProps {
  children: ReactNode;
}

const DefaultLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-muted transition-colors">
      <Header />
      <main className="flex-grow py-8 px-4 md:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  );
};

export default DefaultLayout;
