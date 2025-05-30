import { Suspense } from 'react';
import NotFoundView from '@/components/errors/NotFoundView';
import LoadingPage from './loading';

export default function NotFoundPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <NotFoundView />
    </Suspense>
  );
}
