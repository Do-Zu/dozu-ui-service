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
import { toast } from '@/hooks/use-toast';

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
      toast({ title: 'Failed to load profile data', description: err.message || 'An error occurred while fetching profile data', variant: 'destructive' });
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
      toast({ title: 'Profile updated successfully' });
    } catch (error: any) {
      toast({ title: 'Failed to update profile', description: error.message || 'An error occurred while updating profile', variant: 'destructive' });
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // const handleAvatarUpdate = async (file: File) => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     toast({ title: 'Uploading avatar...' });
      
  //     const result = await ProfileService.uploadAvatar(file);
     
  //     if (result.avatarUrl) {
  //       setProfileData(prev => ({
  //         ...prev,
  //         avatar: result.avatarUrl
  //       }));
  //       toast({ title: 'Avatar updated successfully' });
  //     } else {
  //       throw new Error('No avatar URL returned from upload');
  //     }
  //   } catch (error: any) {
  //     toast({ description: 'Failed to update avatar', variant: 'destructive' });
  //     setError('Failed to update avatar');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleAvatarRemove = async () => {
    try {
      setLoading(true);
      setError(null);
      await ProfileService.removeAvatar();
      setProfileData(prev => ({
        ...prev,
        avatar: ''
      }));
      toast({ title: 'Avatar removed successfully' });
    } catch (error: any) {
      toast({ title: 'Failed to remove avatar', description: error.message || 'An error occurred while removing avatar', variant: 'destructive' });
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
      toast({ title: 'Password changed successfully' });
    } catch (error: any) {
      toast({ title: 'Failed to change password', description: error.message || 'An error occurred while changing password', variant: 'destructive' });
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
          profileData={profileData}
          onProfileUpdate={handleProfileUpdate}
          // onAvatarUpdate={handleAvatarUpdate} // Disabled avatar update functionality
          // onAvatarRemove={handleAvatarRemove} // Disabled avatar remove functionality
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
