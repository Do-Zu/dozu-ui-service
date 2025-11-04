'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, MapPin, Edit3, Save, X, GraduationCap, Building2 } from 'lucide-react';
import { ProfileData } from '../../../../types/profile';
import AvatarManager from './AvatarManager';

interface ProfileHeaderProps {
  profileData: ProfileData;
  onProfileUpdate: (updatedProfile: ProfileData) => void;
  onAvatarUpdate?: (file: File) => void;
  onAvatarRemove?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  onProfileUpdate,
  onAvatarUpdate,
  onAvatarRemove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileData>(profileData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = () => {
    onProfileUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update editData when profileData changes
  React.useEffect(() => {
    setEditData(profileData);
  }, [profileData]);

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-white to-gray-50/50">
      <CardContent className="pt-8 pb-8 px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center lg:items-start space-y-4 flex-shrink-0">
            <div className="relative group">
              <div className="p-1 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg">
                <div className="rounded-full bg-white p-0.5">
                  <AvatarManager 
                    profileData={profileData}
                    onAvatarUpdate={onAvatarUpdate}
                    onAvatarRemove={onAvatarRemove}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="flex-1 space-y-6 min-w-0">
            {!isEditing ? (
              <div className="space-y-5">
                {/* Name and Username with Member since */}
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {profileData?.fullName || profileData?.username || 'Unknown User'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    {(profileData?.fullName || profileData?.username) && (
                      <p className="text-lg text-gray-500 font-medium">
                        @{profileData?.username}
                      </p>
                    )}
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-3 py-1 font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200"
                    >
                      Member since {new Date(profileData.joinDate).getFullYear()}
                    </Badge>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 group/item hover:text-gray-900 transition-colors">
                    <Mail className="h-5 w-5 text-gray-400 group-hover/item:text-gray-600 transition-colors" />
                    <span className="text-base font-medium">{profileData?.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 group/item hover:text-gray-900 transition-colors">
                    <MapPin className="h-5 w-5 text-gray-400 group-hover/item:text-gray-600 transition-colors" />
                    <span className="text-base font-medium">{profileData?.location || 'No location'}</span>
                  </div>
                  {profileData?.university && (
                    <div className="flex items-center gap-3 text-gray-600 group/item hover:text-gray-900 transition-colors">
                      <Building2 className="h-5 w-5 text-gray-400 group-hover/item:text-gray-600 transition-colors" />
                      <span className="text-base font-medium">{profileData.university}</span>
                    </div>
                  )}
                  {profileData?.major && (
                    <div className="flex items-center gap-3 text-gray-600 group/item hover:text-gray-900 transition-colors">
                      <GraduationCap className="h-5 w-5 text-gray-400 group-hover/item:text-gray-600 transition-colors" />
                      <span className="text-base font-medium">{profileData.major}</span>
                    </div>
                  )}
                </div>

                {/* Bio - Inline editable */}
                <div className="pt-2 border-t border-gray-100">
                  {profileData?.bio ? (
                    <p 
                      className="text-base text-gray-600 leading-relaxed cursor-text hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors"
                      onClick={() => !isEditing && setIsEditing(true)}
                    >
                      {profileData.bio}
                    </p>
                  ) : (
                    <p 
                      className="text-base text-gray-400 italic cursor-text hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors"
                      onClick={() => !isEditing && setIsEditing(true)}
                    >
                      Click to add a bio...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in-50 duration-300">
                <div className="grid gap-5">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-semibold mb-2 block">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      value={editData.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className="h-11"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="username" className="text-sm font-semibold mb-2 block">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={editData.username}
                      readOnly
                      disabled
                      className="bg-gray-50 cursor-not-allowed h-11"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Username cannot be changed
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold mb-2 block">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      readOnly
                      disabled
                      className="bg-gray-50 cursor-not-allowed h-11"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Email cannot be changed
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="location" className="text-sm font-semibold mb-2 block">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={editData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter your location"
                      className="h-11"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio" className="text-sm font-semibold mb-2 block">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={editData.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself"
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex lg:flex-col lg:items-end lg:justify-start gap-3 lg:pt-0 pt-4 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-8">
            {!isEditing ? (
              <Button 
                onClick={handleEdit} 
                variant="gradient"
                size="lg"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-3 w-full lg:w-auto items-center">
                <Button 
                  onClick={handleSave} 
                  variant="gradient"
                  className="flex-1 lg:flex-none"
                  size="lg"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleCancel} 
                  className="h-11 w-11 p-0 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all duration-200 border border-gray-200 hover:border-red-300 bg-white"
                  size="lg"
                  title="Cancel"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
