'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { NotificationSettings, PrivacySettings } from '../../../../types/profile';
import { ProfileService } from '../../../../services/profile/profileService';

interface AccountSettingsProps {
  onSettingsChange?: (notifications: NotificationSettings, privacy: PrivacySettings) => Promise<void>;
  onDeleteAccount?: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ 
  onSettingsChange, 
  onDeleteAccount 
}) => {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    dailyReminders: true,
    weeklyReports: true,
    achievementNotifications: false,
    emailNotifications: true,
    pushNotifications: false
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showProfile: true,
    showProgress: true,
    showAchievements: true,
    allowMessages: true
  });

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Load current settings from profile data
  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      setLoading(true);
      const profile = await ProfileService.getProfile();
      
      // If backend has settings, use them
      if (profile.notificationSettings) {
        setNotifications(profile.notificationSettings);
      }
      if (profile.privacySettings) {
        setPrivacy(profile.privacySettings);
      }
    } catch (error) {
      console.log('Using default settings - backend settings not available');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: boolean) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaveLoading(true);
      
      if (onSettingsChange) {
        await onSettingsChange(notifications, privacy);
        console.log('✅ Settings saved successfully');
        alert('Settings saved successfully!');
      } else {
        // Fallback: save directly to backend
        await Promise.all([
          ProfileService.updateNotificationSettings(notifications),
          ProfileService.updatePrivacySettings(privacy)
        ]);
        console.log('✅ Settings saved to backend');
        alert('Settings saved successfully!');
      }
    } catch (error: any) {
      console.error('❌ Failed to save settings:', error);
      alert(`Failed to save settings: ${error.message || 'Unknown error'}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleResetToDefault = () => {
    setNotifications({
      dailyReminders: true,
      weeklyReports: true,
      achievementNotifications: false,
      emailNotifications: true,
      pushNotifications: false
    });
    setPrivacy({
      showProfile: true,
      showProgress: true,
      showAchievements: true,
      allowMessages: true
    });
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        if (onDeleteAccount) {
          onDeleteAccount();
        } else {
          // Fallback: delete via backend
          await ProfileService.deleteAccount();
          alert('Account deleted successfully. You will be redirected to login.');
          window.location.href = '/login';
        }
      } catch (error: any) {
        console.error('❌ Failed to delete account:', error);
        alert(`Failed to delete account: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading settings...</span>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
          <Label className="text-base font-medium">Email Notifications</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Choose what notifications you want to receive
          </p>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.dailyReminders}
                onChange={(e) => handleNotificationChange('dailyReminders', e.target.checked)}
                className="rounded" 
              />
              <span className="text-sm">Daily learning reminders</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.weeklyReports}
                onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                className="rounded" 
              />
              <span className="text-sm">Weekly progress reports</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.achievementNotifications}
                onChange={(e) => handleNotificationChange('achievementNotifications', e.target.checked)}
                className="rounded" 
              />
              <span className="text-sm">Achievement notifications</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.emailNotifications}
                onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                className="rounded" 
              />
              <span className="text-sm">Email notifications</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.pushNotifications}
                onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                className="rounded" 
              />
              <span className="text-sm">Push notifications</span>
            </label>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Privacy Settings</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Control your profile visibility
          </p>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={privacy.showProfile}
                onChange={(e) => handlePrivacyChange('showProfile', e.target.checked)}
                className="rounded" 
              />
              <span className="text-sm">Show profile to other users</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={privacy.showProgress}
                onChange={(e) => handlePrivacyChange('showProgress', e.target.checked)}
                className="rounded" 
              />
              <span className="text-sm">Show learning progress</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={privacy.showAchievements}
                onChange={(e) => handlePrivacyChange('showAchievements', e.target.checked)}
                className="rounded" 
              />
              <span className="text-sm">Show achievements</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={privacy.allowMessages}
                onChange={(e) => handlePrivacyChange('allowMessages', e.target.checked)}
                className="rounded" 
              />
              <span className="text-sm">Allow messages from other users</span>
            </label>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSaveSettings} 
            className="mr-4"
            disabled={saveLoading}
          >
            {saveLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
          <Button variant="outline" onClick={handleResetToDefault}>
            Reset to Default
          </Button>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-red-600">Danger Zone</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Irreversible and destructive actions
            </p>
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
              <Button variant="destructive" className="mt-2" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default AccountSettings;
