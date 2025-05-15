import ErrorBoundary from '@/core/ErrorBoundary';
import DefaultLayout from '@/layouts/DefaultLayout';
import { Toaster } from '@/components/ui/toaster';
import '../styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <DefaultLayout>{children}</DefaultLayout>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
