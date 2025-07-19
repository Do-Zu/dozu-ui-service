'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Trash2, Save } from 'lucide-react';
import { ProfileData } from '../../../../types/profile';
import { getProfileDisplayName, getProfileInitials } from '../utils/profileUtils';

interface AvatarManagerProps {
  profileData: ProfileData;
  onAvatarUpdate: (file: File) => void;
  onAvatarRemove: () => void;
}

const AvatarManager: React.FC<AvatarManagerProps> = ({ profileData, onAvatarUpdate, onAvatarRemove }) => {
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setShowAvatarOptions(false);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    
    setAvatarUploading(true);
    try {
      // Call the parent handler with the file
      onAvatarUpdate(avatarFile);
      
      // Clear preview state
      setAvatarPreview(null);
      setAvatarFile(null);
      
    } catch (error) {
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (window.confirm('Are you sure you want to remove your avatar?')) {
      try {
        // Call the parent handler
        onAvatarRemove();
        
        setAvatarPreview(null);
        setAvatarFile(null);
        setShowAvatarOptions(false);
        
      } catch (error) {
        alert('Failed to remove avatar. Please try again.');
      }
    }
  };

  const cancelAvatarChange = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setShowAvatarOptions(false);
  };

  return (
    <div className="relative">
      <Avatar className="h-24 w-24">
        <AvatarImage 
          src={avatarPreview || profileData.avatar} 
          alt={getProfileDisplayName(profileData)}
        />
        <AvatarFallback className="text-lg">
          {getProfileInitials(profileData)}
        </AvatarFallback>
      </Avatar>
      
      {/* Avatar Change Button */}
      <Button
        size="sm"
        variant="outline"
        className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
        onClick={() => setShowAvatarOptions(!showAvatarOptions)}
      >
        <Camera className="h-4 w-4" />
      </Button>
      
      {/* Avatar Options Dropdown */}
      {showAvatarOptions && (
        <div className="absolute top-full mt-2 bg-white border rounded-lg shadow-lg p-2 z-10 min-w-[180px]">
          <div className="space-y-1">
            <label className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
              <Upload className="h-4 w-4" />
              <span className="text-sm">Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </label>
            
            {profileData.avatar && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleRemoveAvatar}
              >
                <Trash2 className="h-4 w-4" />
                Remove Photo
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Avatar Preview Actions */}
      {avatarPreview && (
        <div className="absolute top-full mt-2 flex gap-2">
          <Button
            size="sm"
            onClick={handleUploadAvatar}
            disabled={avatarUploading}
            className="gap-2"
          >
            {avatarUploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {avatarUploading ? 'Uploading...' : 'Save'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={cancelAvatarChange}
            disabled={avatarUploading}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default AvatarManager;
