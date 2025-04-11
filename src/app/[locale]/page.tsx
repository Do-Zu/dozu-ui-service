'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAppSelector, useAppDispatch } from '@/stores/hooks';
import { incrementFloor, decrementFloor } from '@/stores/features/book/bookSlice';

export default function HomePage() {
  const t = useTranslations('HomePage');
  const floor = useAppSelector((state) => state.book.floor);
  const dispatch = useAppDispatch();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>

      <p className="text-lg">Current floor: {floor}</p>

      <div className="flex gap-4">
        <button
          onClick={() => dispatch(incrementFloor())}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          +
        </button>
        <button
          onClick={() => dispatch(decrementFloor())}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          -
        </button>
      </div>

      <Link href="/about" className="text-blue-600 underline">
        {t('about')}
      </Link>
    </div>
  );
}
