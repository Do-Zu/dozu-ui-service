'use client';

import { Card, CardContent } from '@/components/ui/card';

import { useTranslations } from 'next-intl';

export default function VerifyEmailPage() {
  const t = useTranslations('VerifyEmailPage');

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted px-4">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">{t('title')}</h1>
              <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
