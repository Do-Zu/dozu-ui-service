'use client';

import { useTranslations } from 'next-intl';
import { useAppSelector, useAppDispatch } from '@/stores/hooks';
import ImportDialog from './_components/ImportDialog';

export default function HomePage() {
  const t = useTranslations('HomePage');
  const floor = useAppSelector((state) => state.book.floor);
  const dispatch = useAppDispatch();

  return (
    <div className="space-y-4">
      <ImportDialog />
    </div>
  );
}
