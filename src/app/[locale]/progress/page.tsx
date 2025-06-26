'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressDashboard } from '@/app/[locale]/progress/components';
import { withAuth } from '@/hoc/withAuth';

function ProgressPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const t = useTranslations('progress');

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">{t('dashboard')}</TabsTrigger>
            <TabsTrigger value="manage">{t('manage')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <ProgressDashboard />
          </TabsContent>
          
          <TabsContent value="manage" className="space-y-4">
            <ProgressManager />
          </TabsContent>
        </Tabs> */}
        <ProgressDashboard/>
      </div>
    </div>
  );
}

export default withAuth(ProgressPage); 