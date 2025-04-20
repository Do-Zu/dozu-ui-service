'use client';

import { useTranslations } from 'next-intl';
import { useAppSelector, useAppDispatch } from '@/stores/hooks';
import CardImport from './_components/CardImport';

export default function HomePage() {
  return <CardImport />;
}
