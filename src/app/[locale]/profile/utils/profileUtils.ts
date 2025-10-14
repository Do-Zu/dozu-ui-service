// Utility functions for safe profile data access

import { ProfileData } from '../../../../types/profile';

/**
 * Get safe profile display name
 */
export const getProfileDisplayName = (profileData: ProfileData | null | undefined): string => {
  if (!profileData) return 'Unknown User';
  return profileData.username || 'Unknown User';
};

/**
 * Get safe profile initials for avatar fallback
 */
export const getProfileInitials = (profileData: ProfileData | null | undefined): string => {
  if (!profileData || !profileData.username) return 'UU';
  const username = profileData.username;
  if (username.length >= 2) {
    return username.slice(0, 2).toUpperCase();
  }
  return username.charAt(0).toUpperCase() + 'U';
};

/**
 * Ensure profile data has all required fields
 */
export const sanitizeProfileData = (profileData: Partial<ProfileData>): ProfileData => {
  return {
    id: profileData.id || '',
    username: profileData.username || 'Unknown User',
    email: profileData.email || '',
    location: profileData.location || '',
    bio: profileData.bio || '',
    joinDate: profileData.joinDate || new Date().toISOString(),
    avatar: profileData.avatar || 'https://via.placeholder.com/150x150?text=No+Avatar',
    university: profileData.university || '',
    major: profileData.major || ''
  };
};

/**
 * Check if profile data is valid
 */
export const isValidProfileData = (profileData: any): profileData is ProfileData => {
  return (
    profileData &&
    typeof profileData === 'object' &&
    typeof profileData.firstName === 'string' &&
    typeof profileData.lastName === 'string'
  );
};
