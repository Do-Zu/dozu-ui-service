'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileData } from '../../../../types/profile';
import { getProfileDisplayName, getProfileInitials } from '../utils/profileUtils';

interface AvatarManagerProps {
  profileData: ProfileData;
  onAvatarUpdate?: (file: File) => void;
  onAvatarRemove?: () => void;
}

const AvatarManager: React.FC<AvatarManagerProps> = ({ profileData }) => {
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
      
      {/* Avatar upload functionality disabled */}
      {/* <Button
        size="sm"
        variant="outline"
        className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
        disabled
        title="Avatar upload temporarily disabled"
      >
        <Camera className="h-4 w-4" />
      </Button> */}
    </div>
  );
};

export default AvatarManager;
