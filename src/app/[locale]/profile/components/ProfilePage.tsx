'use client';

import React, { useState } from 'react';
import { useProfile } from '../../../../hooks/useProfile';
import { ProfileService } from '../../../../services/profile/profileService';
import { handleApiError } from '../utils/errorHandling';
import ChangePassword from './ChangePassword';

const ProfilePage: React.FC = () => {
  const { 
    profile, 
    loading, 
    error, 
    updateProfile, 
    // uploadAvatar, 
    removeAvatar, 
    changePassword 
  } = useProfile();

  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    location: '',
    bio: '',
    university: '',
    major: '',
  });

 
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    weeklyReports: true,
    achievementNotifications: true,
    emailNotifications: true,
    pushNotifications: false,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showProgress: true,
    showAchievements: true,
    allowMessages: true,
  });

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        location: profile.location || '',
        bio: profile.bio || '',
        university: profile.university || '',
        major: profile.major || '',
      });
    }
  }, [profile]);


  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(`Failed to update profile: ${handleApiError(err)}`);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // await uploadAvatar(file);
        alert('Avatar uploaded successfully!');
      } catch (err) {
        alert(`Failed to upload avatar: ${handleApiError(err)}`);
      }
    }
  };

  // Handle password change
  const handlePasswordChange = async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setShowPasswordForm(false);
      alert('Password changed successfully!');
    } catch (err) {
      alert(`Failed to change password: ${handleApiError(err)}`);
      throw err;
    }
  };

  // Handle settings update
  const handleSettingsUpdate = async () => {
    try {
      await ProfileService.updateSettings({
        notifications,
        privacy,
      });
      alert('Settings updated successfully!');
    } catch (err) {
      alert(`Failed to update settings: ${handleApiError(err)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">No profile data available</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={profile.avatar || '/default-avatar.png'}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600"
              >
                📷
              </label>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {profile.username}
            </h1>
            <p className="text-gray-600">{profile.email}</p>
            <p className="text-gray-500">
              Joined: {new Date(profile.joinDate).toLocaleDateString()}
            </p>
          </div>

          {/* Actions */}
          <div className="space-x-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
            <button
              onClick={removeAvatar}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Remove Avatar
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      {editMode && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  University
                </label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Major
                </label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Change */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Change Password</h2>
            <p className="text-sm text-gray-500 mt-1">
              Update your password to keep your account secure
            </p>
          </div>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Change Password
            </button>
          )}
        </div>
        {showPasswordForm && (
          <div className="mt-4">
            <ChangePassword onPasswordChange={handlePasswordChange} />
            <div className="mt-4">
              <button
                onClick={() => setShowPasswordForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        
        {/* Notification Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Notifications</h3>
          <div className="space-y-2">
            {Object.entries(notifications).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Privacy</h3>
          <div className="space-y-2">
            {Object.entries(privacy).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setPrivacy({ ...privacy, [key]: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSettingsUpdate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Settings
        </button>
      </div>

            

    </div>
  );
};

export default ProfilePage;
