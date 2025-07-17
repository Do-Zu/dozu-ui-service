import { useState, useEffect, useCallback } from 'react';
import { ProfileService } from '../services/profile/profileService';
import { ProfileData } from '../types/profile';
import { handleApiError } from '../app/[locale]/profile/utils/errorHandling';

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await ProfileService.getProfile();
      setProfile(profileData);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<ProfileData>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await ProfileService.updateProfile(data);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to update profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ProfileService.uploadAvatar(file);
      
      // Update profile with new avatar URL
      if (profile) {
        setProfile({
          ...profile,
          avatar: result.avatarUrl,
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to upload avatar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const removeAvatar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await ProfileService.removeAvatar();
      
      // Update profile by removing avatar
      if (profile) {
        setProfile({
          ...profile,
          avatar: '',
        });
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to remove avatar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const changePassword = useCallback(async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      await ProfileService.changePassword(data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to change password:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await ProfileService.deleteAccount();
      setProfile(null);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to delete account:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    changePassword,
    deleteAccount,
  };
};
