'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { ProfileHeader, SettingsTab, LoadingState } from './components';
import { ProfileData, PasswordData, NotificationSettings, PrivacySettings } from '../../../types/profile';
import { ProfileService } from '../../../services/profile/profileService';
import { useProfile } from '../../../hooks/useProfile';
import { toast } from '@/hooks/use-toast';
import { isEmpty } from '@/utils';
import DataStatus from '@/components/errors/DataStatus';

const ProfilePage: React.FC = () => {
    const { profile, loading, error, updateProfile, uploadAvatar, removeAvatar, changePassword } = useProfile();

    const [isApiLoaded, setIsApiLoaded] = useState(false);

    // Set API loaded status when profile loads
    useEffect(() => {
        if (profile) {
            setIsApiLoaded(true);
        }
    }, [profile]);

    // Handlers
    const handleProfileUpdate = async (updatedProfile: ProfileData) => {
        await updateProfile(updatedProfile);
    };

    const handleAvatarUpdate = async (file: File) => {
        await uploadAvatar(file);
    };

    const handleAvatarRemove = async () => {
        await removeAvatar();
    };

    const handlePasswordChange = async (data: PasswordData) => {
        await changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });
    };

    const handleSettingsChange = async (notifications: NotificationSettings, privacy: PrivacySettings) => {
        try {
            await Promise.all([
                ProfileService.updateNotificationSettings(notifications),
                ProfileService.updatePrivacySettings(privacy),
            ]);
            toast({ title: 'Settings updated successfully' });
        } catch (error) {
            toast({
                title: 'Failed to update settings',
                description: 'An error occurred while updating settings',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await ProfileService.deleteAccount();
            toast({ title: 'Account deleted successfully' });
            // Redirect to login or logout
        } catch (error) {
            toast({
                title: 'Failed to delete account',
                description: 'An error occurred while deleting account',
                variant: 'destructive',
            });
        }
    };
    if (isEmpty(profile)) return <DataStatus variant="empty" />;

    return (
        <LoadingState loading={loading} error={error}>
            <div className="container mx-auto space-y-6 py-8">
                {!isApiLoaded && !loading && (
                    <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            ⚠️ Using demo data - API connection failed. {error && `Error: ${error}`}
                        </p>
                    </div>
                )}

                <ProfileHeader
                    profileData={profile!}
                    onProfileUpdate={handleProfileUpdate}
                    onAvatarUpdate={handleAvatarUpdate}
                    onAvatarRemove={handleAvatarRemove}
                />

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
