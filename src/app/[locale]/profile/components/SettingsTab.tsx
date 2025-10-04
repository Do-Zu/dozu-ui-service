'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import ChangePassword from './ChangePassword';
import AccountSettings from './AccountSettings';
import { PasswordData, NotificationSettings, PrivacySettings } from '../../../../types/profile';

interface SettingsTabProps {
  onPasswordChange?: (data: PasswordData) => Promise<void>;
  onSettingsChange?: (notifications: NotificationSettings, privacy: PrivacySettings) => Promise<void>;
  onDeleteAccount?: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  onPasswordChange,
  onSettingsChange,
  onDeleteAccount
}) => {
  return (
    <div className="space-y-6">
      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePassword onPasswordChange={onPasswordChange} />
        </CardContent>
      </Card>

      {/* Account Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences and security</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSettings 
            onSettingsChange={onSettingsChange}
            onDeleteAccount={onDeleteAccount}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
