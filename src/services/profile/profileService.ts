import { ProfileData } from '../../types/profile';
import { getRequest, postRequest, putRequest, deleteRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';

export class ProfileService {
  // Helper method to convert relative avatar URL to absolute URL
  private static convertAvatarUrl(avatarUrl: string | null | undefined): string {
    if (!avatarUrl) {
      return 'https://via.placeholder.com/150x150?text=No+Avatar';
    }
    
    // If it's already an absolute URL (starts with http), return as is
    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    
    // If it's a relative URL starting with /uploads/, convert to absolute
    if (avatarUrl.startsWith('/uploads/')) {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      return `${API_BASE_URL}${avatarUrl}`;
    }
    
    // Return as is for other cases
    return avatarUrl;
  }

  // Get user profile
  static async getProfile(): Promise<ProfileData> {
    try {
      const response = await getRequest<any, any>('/profile');
      const backendData = response.data;
      
      console.log('🔍 Backend profile data:', backendData);
      
      // Map backend data to frontend ProfileData format
      const mappedProfile: ProfileData = {
        id: backendData.profileId?.toString() || backendData.userId?.toString() || '',
        username: backendData.username || 'Unknown User',
        email: backendData.email || '',
        location: backendData.location || '',
        bio: backendData.bio || backendData.hobbiesTopic || '',
        joinDate: backendData.createdAt || new Date().toISOString(),
        avatar: this.convertAvatarUrl(backendData.avatarUrl) || '/api/placeholder/150/150',
        university: backendData.university || '',
        major: backendData.major || '',
        notificationSettings: backendData.notificationSettings || undefined,
        privacySettings: backendData.privacySettings || undefined
      };
      
      console.log('✅ Mapped profile data:', mappedProfile);
      return mappedProfile;
    } catch (error) {
      console.error('❌ Failed to get profile:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(profileData: Partial<ProfileData>): Promise<ProfileData> {
    try {
      // Map frontend data to backend format before sending
      const backendUpdateData = {
        fullName: profileData.username || '',
        email: profileData.email,
        location: profileData.location,
        bio: profileData.bio,
        university: profileData.university,
        major: profileData.major
      };
      
      console.log('🔄 Updating profile with backend data:', backendUpdateData);
      
      const response = await putRequest<any, any>('/profile', backendUpdateData);
      const backendData = response.data;
      
      // Map response back to frontend format
      const mappedProfile: ProfileData = {
        id: backendData.profileId?.toString() || backendData.userId?.toString() || '',
        username: backendData.username || backendData.fullName || 'Unknown User',
        email: backendData.email || '',
        location: backendData.location || '',
        bio: backendData.bio || backendData.hobbiesTopic || '',
        joinDate: backendData.createdAt || new Date().toISOString(),
        avatar: this.convertAvatarUrl(backendData.avatarUrl) || 'https://via.placeholder.com/150x150?text=No+Avatar',
        university: backendData.university || '',
        major: backendData.major || ''
      };
      
      return mappedProfile;
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      throw error;
    }
  }

  // Upload avatar
  static async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    // Get auth token from localStorage
    const userString = localStorage.getItem('user');
    const token = userString ? JSON.parse(userString)?.accessToken : null;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    console.log('🔄 Uploading to:', `${API_BASE_URL}/api/profile/avatar`);
    console.log('🔑 Using token:', token ? 'Present' : 'Missing');
    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload failed response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Upload failed! status: ${response.status}`);
        } catch {
          throw new Error(`Upload failed! status: ${response.status}, response: ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('🔍 Avatar upload response:', result);
      
      // Handle different response formats
      let avatarUrl = '';
      if (result.data && result.data.avatarUrl) {
        avatarUrl = result.data.avatarUrl;
      } else if (result.avatarUrl) {
        avatarUrl = result.avatarUrl;
      } else if (result.data && typeof result.data === 'string') {
        avatarUrl = result.data;
      } else if (typeof result === 'string') {
        avatarUrl = result;
      } else {
        console.error('❌ Unexpected avatar upload response format:', result);
        throw new Error('Invalid response format from avatar upload');
      }
      
      // Convert relative URL to absolute URL for backend server
      if (avatarUrl.startsWith('/uploads/')) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
        avatarUrl = `${API_BASE_URL}${avatarUrl}`;
      }
      
      console.log('✅ Extracted avatar URL:', avatarUrl);
      return { avatarUrl };
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw error;
    }
  }

  // Remove avatar
  static async removeAvatar(): Promise<void> {
    await deleteRequest<void, void>('/profile/avatar');
  }

  // Change password
  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await putRequest<typeof data, void>('/profile/password', data);
  }

  // Update notification settings
  static async updateNotificationSettings(settings: {
    dailyReminders: boolean;
    weeklyReports: boolean;
    achievementNotifications: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  }): Promise<{
    dailyReminders: boolean;
    weeklyReports: boolean;
    achievementNotifications: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  }> {
    const response = await putRequest<typeof settings, typeof settings>('/profile/notifications', settings);
    return response.data;
  }

  // Update privacy settings
  static async updatePrivacySettings(settings: {
    showProfile: boolean;
    showProgress: boolean;
    showAchievements: boolean;
    allowMessages: boolean;
  }): Promise<{
    showProfile: boolean;
    showProgress: boolean;
    showAchievements: boolean;
    allowMessages: boolean;
  }> {
    const response = await putRequest<typeof settings, typeof settings>('/profile/privacy', settings);
    return response.data;
  }

  // Update combined settings
  static async updateSettings(settings: {
    notifications?: {
      dailyReminders: boolean;
      weeklyReports: boolean;
      achievementNotifications: boolean;
      emailNotifications: boolean;
      pushNotifications: boolean;
    };
    privacy?: {
      showProfile: boolean;
      showProgress: boolean;
      showAchievements: boolean;
      allowMessages: boolean;
    };
  }): Promise<any> {
    const response = await putRequest<typeof settings, any>('/profile/settings', settings);
    return response.data;
  }

  // Get activity statistics
  static async getActivityStats(): Promise<{
    totalTopics: number;
    totalFlashcards: number;
    studyStreak: number;
    lastActivity: Date | null;
  }> {
    const response = await getRequest<any, {
      totalTopics: number;
      totalFlashcards: number;
      studyStreak: number;
      lastActivity: Date | null;
    }>('/profile/activity');
    return response.data;
  }

  // Get achievements
  static async getAchievements(): Promise<Array<{
    id: string;
    title: string;
    description: string;
    earnedAt: Date;
    icon: string;
  }>> {
    const response = await getRequest<any, Array<{
      id: string;
      title: string;
      description: string;
      earnedAt: Date;
      icon: string;
    }>>('/profile/achievements');
    return response.data;
  }

  // Delete account
  static async deleteAccount(): Promise<void> {
    await deleteRequest<void, void>('/profile');
  }
}
