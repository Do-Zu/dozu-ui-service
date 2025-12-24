'use client';

import React from 'react';
import { withAuth } from '@/hoc/withAuth';
import ProfilePage from '@/app/[locale]/profile/page';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Use the main ProfilePage component in setting context
function SettingProfilePage() {
  const router = useRouter();

  function handleTeacherRequestClick() {
    router.push('/request-teacher');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your profile information and preferences</p>
      </div>
      
      {/* Render the main ProfilePage component */}
      <ProfilePage />
    </div>
  );
}

export default withAuth(SettingProfilePage);
