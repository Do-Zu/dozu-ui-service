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

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    id: '1',
    username: 'demo',
    email: 'nguyen.van.an@example.com',
    location: 'Hồ Chí Minh, Việt Nam',
    bio: 'Sinh viên năm 3 chuyên ngành Công nghệ thông tin, đam mê học tập và phát triển bản thân.',
    joinDate: '2024-01-15',
    avatar: 'https://via.placeholder.com/150x150?text=Demo+User',
    university: 'Đại học Bách Khoa TP.HCM',
    major: 'Công nghệ thông tin'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profile = await ProfileService.getProfile();
      
      // Ensure all required fields have values
      const safeProfile = {
        ...profile,
        username: profile.username || 'Unknown User',
        email: profile.email || '',
        location: profile.location || '',
        bio: profile.bio || '',
        avatar: profile.avatar || 'https://via.placeholder.com/150x150?text=No+Avatar',
        university: profile.university || '',
        major: profile.major || ''
      };
      
      setProfileData(safeProfile);
      setIsApiLoaded(true);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Failed to load profile data');
      
      // Keep default mock data if API fails
      setIsApiLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleProfileUpdate = async (updatedProfile: ProfileData) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await ProfileService.updateProfile(updatedProfile);
      setProfileData(updated);
      console.log('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Uploading avatar file:', file.name, 'Size:', file.size);
      
      const result = await ProfileService.uploadAvatar(file);
      console.log('✅ Avatar upload result:', result);
      
      if (result.avatarUrl) {
        setProfileData(prev => ({
          ...prev,
          avatar: result.avatarUrl
        }));
        console.log('Avatar updated successfully');
      } else {
        throw new Error('No avatar URL returned from upload');
      }
    } catch (error: any) {
      console.error('Failed to update avatar:', error);
      setError(error.message || 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarRemove = async () => {
    try {
      setLoading(true);
      setError(null);
      await ProfileService.removeAvatar();
      setProfileData(prev => ({
        ...prev,
        avatar: ''
      }));
      console.log('Avatar removed successfully');
    } catch (error: any) {
      console.error('Failed to remove avatar:', error);
      setError(error.message || 'Failed to remove avatar');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (data: PasswordData) => {
    try {
      await ProfileService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      console.log('Password changed successfully');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  };

  const handleSettingsChange = async (notifications: NotificationSettings, privacy: PrivacySettings) => {
    try {
      setError(null);
      await Promise.all([
        ProfileService.updateNotificationSettings(notifications),
        ProfileService.updatePrivacySettings(privacy)
      ]);
      console.log('Settings updated successfully');
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      setError(error.message || 'Failed to update settings');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await ProfileService.deleteAccount();
      console.log('Account deleted successfully');
      // Redirect to login or logout
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      setError(error.message || 'Failed to delete account');
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
          profileData={profileData}
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
