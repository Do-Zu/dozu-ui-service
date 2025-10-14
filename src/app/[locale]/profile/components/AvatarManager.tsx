'use client';

import React, { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { ProfileData } from '../../../../types/profile';
import { getProfileDisplayName, getProfileInitials } from '../utils/profileUtils';

interface AvatarManagerProps {
  profileData: ProfileData;
  onAvatarUpdate?: (file: File) => void;
  onAvatarRemove?: () => void;
}

const AvatarManager: React.FC<AvatarManagerProps> = ({ 
  profileData, 
  onAvatarUpdate, 
  onAvatarRemove 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onAvatarUpdate) {
      onAvatarUpdate(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="relative">
      <Avatar className="h-24 w-24">
        <AvatarImage 
          src={profileData.avatar} 
          alt={getProfileDisplayName(profileData)}
        />
        <AvatarFallback className="text-lg">
          {getProfileInitials(profileData)}
        </AvatarFallback>
      </Avatar>
      
      {onAvatarUpdate && (
        <Button
          size="sm"
          variant="outline"
          className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
          onClick={handleUploadClick}
          title="Upload new avatar"
        >
          <Camera className="h-4 w-4" />
        </Button>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default AvatarManager;
