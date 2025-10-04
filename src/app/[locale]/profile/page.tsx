'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { 
  ProfileHeader, 
  SettingsTab,
  LoadingState
} from './components';
import { 
  ProfileData, 
  PasswordData,
  NotificationSettings,
  PrivacySettings
} from '../../../types/profile';
import { ProfileService } from '../../../services/profile/profileService';
import { useProfile } from '../../../hooks/useProfile';
import { toast } from '@/hooks/use-toast';

const ProfilePage: React.FC = () => {
  const { 
    profile, 
    loading, 
    error, 
    updateProfile, 
    uploadAvatar, 
    removeAvatar, 
    changePassword 
  } = useProfile();
  
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  // Set API loaded status when profile loads
  useEffect(() => {
    if (profile) {
      setIsApiLoaded(true);
    }
  }, [profile]);

  // Handlers
  const handleProfileUpdate = async (updatedProfile: ProfileData) => {
    try {
      await updateProfile(updatedProfile);
    } catch (error: any) {
      // Error handling is done in the hook
      throw error;
    }
  };

  const handleAvatarUpdate = async (file: File) => {
    try {
      await uploadAvatar(file);
    } catch (error: any) {
      // Error handling is done in the hook
      throw error;
    }
  };

  const handleAvatarRemove = async () => {
    try {
      await removeAvatar();
    } catch (error: any) {
      // Error handling is done in the hook
      throw error;
    }
  };

  const handlePasswordChange = async (data: PasswordData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    } catch (error: any) {
      // Error handling is done in the hook
      throw error;
    }
  };

  const handleSettingsChange = async (notifications: NotificationSettings, privacy: PrivacySettings) => {
    try {
      await Promise.all([
        ProfileService.updateNotificationSettings(notifications),
        ProfileService.updatePrivacySettings(privacy)
      ]);
      toast({ title: 'Settings updated successfully' });
    } catch (error: any) {
      toast({ title: 'Failed to update settings', description: error.message || 'An error occurred while updating settings', variant: 'destructive' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await ProfileService.deleteAccount();
      toast({ title: 'Account deleted successfully' });
      // Redirect to login or logout
    } catch (error: any) {
      toast({ title: 'Failed to delete account', description: error.message || 'An error occurred while deleting account', variant: 'destructive' });
    }
  };

  return (
    <LoadingState loading={loading} error={error}>
      <div className="container mx-auto py-8 space-y-6">
        {/* Show API connection status */}
        {!isApiLoaded && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Using demo data - API connection failed. {error && `Error: ${error}`}
            </p>
          </div>
        )}

        {/* Profile Header */}
        <ProfileHeader
          profileData={profile || {
            id: '1',
            username: 'demo',
            email: 'nguyen.van.an@example.com',
            location: 'Hồ Chí Minh, Việt Nam',
            bio: 'Sinh viên năm 3 chuyên ngành Công nghệ thông tin, đam mê học tập và phát triển bản thân.',
            joinDate: '2024-01-15',
            avatar: 'https://via.placeholder.com/150x150?text=Demo+User',
            university: 'Đại học Bách Khoa TP.HCM',
            major: 'Công nghệ thông tin'
          }}
          onProfileUpdate={handleProfileUpdate}
          onAvatarUpdate={handleAvatarUpdate}
          onAvatarRemove={handleAvatarRemove}
        />

        {/* Settings Section */}
        <div className="space-y-6">
          <SettingsTab
            onPasswordChange={handlePasswordChange}
            onSettingsChange={handleSettingsChange}
            onDeleteAccount={handleDeleteAccount}
          />
        </div>
      </div>
    </LoadingState>
  );
};

export default withAuth(ProfilePage);
